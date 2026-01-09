import React, { useState } from "react";
import { createTransaction, patchTransaction } from "../api.js";
import { formatINR } from "../utils.js";

export default function AddMoney({ loading, busy, setBusy, onDone, onError }) {
  const [amount, setAmount] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!amount) return onError("Amount is required.");
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return onError("Enter a valid positive amount.");

    setBusy(true);
    try {
      const created = await createTransaction({ type: "credit", amount: amt, note: "Add money" });

      // simulate processing: mark success after short delay
      await new Promise(r => setTimeout(r, 450));
      await patchTransaction(created.id, { status: "success" });

      setAmount("");
      onDone();
    } catch (e2) {
      onError(e2?.response?.data?.message || e2.message || "Failed to add money.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Add Money</h2>
      {loading ? <p className="muted">Loading...</p> : null}

      <form onSubmit={submit} className="row">
        <label>
          Amount
          <input
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 500"
            disabled={busy}
          />
        </label>

        <button type="submit" disabled={busy}>
          {busy ? "Processing..." : "Add"}
        </button>
      </form>

      <p className="muted" style={{ marginTop: 10 }}>
        Tip: this creates a <b>pending</b> credit transaction then updates it to <b>success</b>.
      </p>
    </div>
  );
}
