import express from "express";
import cors from "cors";
import morgan from "morgan";
import { nanoid } from "nanoid";
import { readDb, writeDb, computeBalance, loadConfig } from "./storage.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const PORT = process.env.PORT || 4000;

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/config", async (_req, res) => {
  const cfg = await loadConfig();
  res.json(cfg);
});

app.get("/users", async (_req, res) => {
  const db = await readDb();
  res.json(db.users);
});

app.get("/transactions", async (req, res) => {
  const db = await readDb();
  const { status, from, to, includeDeleted } = req.query;

  let tx = [...db.transactions];

  if (!includeDeleted) {
    tx = tx.filter(t => !t.deleted);
  }

  if (status) {
    tx = tx.filter(t => t.status === status);
  }

  if (from) {
    const fromDate = new Date(from);
    if (!Number.isNaN(fromDate.getTime())) {
      tx = tx.filter(t => new Date(t.createdAt) >= fromDate);
    }
  }

  if (to) {
    const toDate = new Date(to);
    if (!Number.isNaN(toDate.getTime())) {
      tx = tx.filter(t => new Date(t.createdAt) <= toDate);
    }
  }

  // newest first
  tx.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(tx);
});

/**
 * POST /transactions
 * body: { type: "credit"|"debit", amount: number, recipientId?: string, note?: string }
 * creates tx with status "pending" then server-side validation can mark it failed.
 */
app.post("/transactions", async (req, res) => {
  const { type, amount, recipientId, note } = req.body ?? {};
  const cfg = await loadConfig();

  if (!type || !["credit", "debit"].includes(type)) {
    return res.status(400).json({ message: "Invalid type. Use 'credit' or 'debit'." });
  }

  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0) {
    return res.status(400).json({ message: "Amount must be a positive number." });
  }

  const db = await readDb();

  const fee = type === "debit" ? Number(((amt * cfg.feePercent) / 100).toFixed(2)) : 0;

  const tx = {
    id: nanoid(10),
    type,
    amount: amt,
    fee,
    recipientId: type === "debit" ? (recipientId || null) : null,
    status: "pending",
    failureReason: null,
    note: note || null,
    deleted: false,
    createdAt: new Date().toISOString()
  };

  db.transactions.push(tx);
  await writeDb(db);

  // Validation after creation (keeps initial "pending" as required)
  let failure = null;

  if (type === "debit") {
    if (!recipientId) {
      failure = "Recipient is required.";
    } else if (!db.users.find(u => u.id === recipientId)) {
      failure = "Recipient does not exist.";
    } else if (amt > cfg.maxLimit) {
      failure = `Amount exceeds per-transaction limit (${cfg.maxLimit}).`;
    } else {
      const bal = computeBalance(db.transactions);
      const totalDebit = amt + fee;
      if (bal < totalDebit) {
        failure = "Insufficient balance.";
      }
    }
  }

  if (failure) {
    // update to failed
    const updated = await patchTransactionInternal(tx.id, { status: "failed", failureReason: failure });
    return res.status(200).json(updated);
  }

  // For credits we allow success transition to be done by frontend via PATCH (or you can do it here)
  return res.status(201).json(tx);
});

/**
 * PATCH /transactions/:id
 * body: partial fields, typically { status: "success"|"failed", failureReason?: string }
 */
app.patch("/transactions/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body ?? {};

  if (updates.status && !["pending", "success", "failed"].includes(updates.status)) {
    return res.status(400).json({ message: "Invalid status." });
  }

  const updated = await patchTransactionInternal(id, updates);
  if (!updated) return res.status(404).json({ message: "Transaction not found." });

  res.json(updated);
});

/**
 * DELETE /transactions/:id
 * soft delete
 */
app.delete("/transactions/:id", async (req, res) => {
  const { id } = req.params;
  const updated = await patchTransactionInternal(id, { deleted: true });
  if (!updated) return res.status(404).json({ message: "Transaction not found." });
  res.status(204).send();
});

async function patchTransactionInternal(id, updates) {
  const db = await readDb();
  const idx = db.transactions.findIndex(t => t.id === id);
  if (idx === -1) return null;

  const current = db.transactions[idx];
  const next = {
    ...current,
    ...updates,
    // don't allow changing core type/amount via patch in this simple app
    type: current.type,
    amount: current.amount,
    fee: current.fee,
    recipientId: current.recipientId
  };

  // If marking success for a debit, ensure balance is still enough (race-safe-ish)
  if (next.status === "success" && next.type === "debit") {
    const cfg = await loadConfig();
    const bal = computeBalance(db.transactions); // based on existing success txns
    const totalDebit = next.amount + next.fee;
    if (next.amount > cfg.maxLimit) {
      next.status = "failed";
      next.failureReason = `Amount exceeds per-transaction limit (${cfg.maxLimit}).`;
    } else if (bal < totalDebit) {
      next.status = "failed";
      next.failureReason = "Insufficient balance.";
    }
  }

  db.transactions[idx] = next;
  await writeDb(db);
  return next;
}

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
