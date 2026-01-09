import React, { useMemo, useState } from "react";
import { deleteTransaction } from "../api.js";
import { formatINR, toDateInputValue } from "../utils.js";
import { StatusBadge } from "./Dashboard.jsx";

export default function Transactions({ loading, users, transactions, onDeleted, onError }) {
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const userMap = useMemo(() => {
    const m = new Map();
    (users || []).forEach(u => m.set(u.id, u.name));
    return m;
  }, [users]);

  const filtered = useMemo(() => {
    let tx = (transactions || []).filter(t => !t.deleted);

    if (status) tx = tx.filter(t => t.status === status);

    if (from) {
      const d1 = new Date(from);
      tx = tx.filter(t => new Date(t.createdAt) >= d1);
    }
    if (to) {
      const d2 = new Date(to);
      d2.setHours(23, 59, 59, 999);
      tx = tx.filter(t => new Date(t.createdAt) <= d2);
    }

    return tx;
  }, [transactions, status, from, to]);

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
      onDeleted();
    } catch (e) {
      onError(e?.response?.data?.message || e.message || "Delete failed.");
    }
  };

  return (
    <div className="card">
      <div className="row between">
        <h2 style={{ margin: 0 }}>Transaction History</h2>
        <span className="badge">{filtered.length} items</span>
      </div>

      <div className="row" style={{ marginTop: 12 }}>
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </label>

        <label>
          From
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>

        <label>
          To
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>

        <button onClick={() => { setStatus(""); setFrom(""); setTo(""); }}>
          Clear
        </button>
      </div>

      {loading ? (
        <p className="muted" style={{ marginTop: 12 }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="muted" style={{ marginTop: 12 }}>
          No transactions match your filters.
        </p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>When</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Recipient</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id}>
                <td className="muted">{new Date(t.createdAt).toLocaleString()}</td>
                <td><b>{t.type}</b></td>
                <td>
                  {formatINR(t.amount)}
                  {t.type === "debit" && t.fee ? <div className="muted">Fee: {formatINR(t.fee)}</div> : null}
                  {t.failureReason ? <div style={{ color: "#d92d20" }}>{t.failureReason}</div> : null}
                </td>
                <td><StatusBadge status={t.status} /></td>
                <td className="muted">
                  {t.type === "debit" ? (userMap.get(t.recipientId) || t.recipientId || "-") : "-"}
                </td>
                <td>
                  <button onClick={() => handleDelete(t.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
