import React, { useMemo, useState } from "react";
import { createTransaction, patchTransaction } from "../api.js";
import { formatINR } from "../utils.js";
import Modal from "./Modal.jsx";

export default function TransferMoney({ loading, busy, setBusy, users, config, onDone, onError }) {
  const [recipientId, setRecipientId] = useState("");
  const [amount, setAmount] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const amt = Number(amount);
  const fee = useMemo(() => {
    if (!Number.isFinite(amt) || amt <= 0) return 0;
    return Number(((amt * config.feePercent) / 100).toFixed(2));
  }, [amt, config.feePercent]);

  const total = amt + fee;

  const validate = () => {
    if (!recipientId) return "Recipient is required.";
    if (!amount) return "Amount is required.";
    if (!Number.isFinite(amt) || amt <= 0) return "Enter a valid positive amount.";
    if (amt > config.maxLimit) return `Limit exceeded. Max per transaction is ${config.maxLimit}.`;
    return null;
  };

  const openConfirm = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return onError(err);
    setConfirmOpen(true);
  };

  const submit = async () => {
    setConfirmOpen(false);
    setBusy(true);

    try {
      const created = await createTransaction({
        type: "debit",
        amount: amt,
        recipientId,
        note: "Transfer money"
      });

      // If backend already failed it, stop.
      if (created.status === "failed") {
        onError(created.failureReason || "Transfer failed.");
        return;
      }

      await new Promise(r => setTimeout(r, 650));

      const updated = await patchTransaction(created.id, { status: "success" });
      if (updated.status === "failed") {
        onError(updated.failureReason || "Transfer failed.");
        return;
      }

      setRecipientId("");
      setAmount("");
      onDone();
    } catch (e2) {
      onError(e2?.response?.data?.message || e2.message || "Transfer failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Transfer Money</h2>
      {loading ? <p className="muted">Loading...</p> : null}

      <form onSubmit={openConfirm} className="grid">
        <label>
          Recipient
          <select value={recipientId} onChange={(e) => setRecipientId(e.target.value)} disabled={busy}>
            <option value="">Select user</option>
            {(users || []).map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.id})
              </option>
            ))}
          </select>
        </label>

        <label>
          Amount
          <input
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 1200"
            disabled={busy}
          />
        </label>

        <div className="card" style={{ marginTop: 0 }}>
          <div className="row between">
            <span className="muted">Fee ({config.feePercent}%)</span>
            <b>{formatINR(fee)}</b>
          </div>
          <div className="row between" style={{ marginTop: 8 }}>
            <span className="muted">Total debit</span>
            <b>{Number.isFinite(total) ? formatINR(total) : "-"}</b>
          </div>
          <div className="muted" style={{ marginTop: 8 }}>
            Limit per transfer: <b>{config.maxLimit}</b>
          </div>
        </div>

        <div className="row" style={{ alignItems: "flex-end" }}>
          <button type="submit" disabled={busy}>
            {busy ? "Processing..." : "Continue"}
          </button>
        </div>
      </form>

      {confirmOpen && (
        <Modal title="Confirm Transfer" onClose={() => setConfirmOpen(false)}>
          <p className="muted" style={{ marginTop: 0 }}>
            Please confirm the transfer details.
          </p>
          <div className="card" style={{ marginTop: 10 }}>
            <div className="row between">
              <span className="muted">Recipient</span>
              <b>{recipientId}</b>
            </div>
            <div className="row between" style={{ marginTop: 8 }}>
              <span className="muted">Amount</span>
              <b>{formatINR(amt)}</b>
            </div>
            <div className="row between" style={{ marginTop: 8 }}>
              <span className="muted">Fee</span>
              <b>{formatINR(fee)}</b>
            </div>
            <div className="row between" style={{ marginTop: 8 }}>
              <span className="muted">Total</span>
              <b>{formatINR(total)}</b>
            </div>
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <button onClick={submit}>Confirm</button>
            <button onClick={() => setConfirmOpen(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
