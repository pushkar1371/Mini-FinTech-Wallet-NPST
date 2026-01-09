import React, { useMemo } from "react";
import { formatINR } from "../utils.js";

export default function Dashboard({ loading, transactions }) {
  const last10 = useMemo(() => {
    return (transactions || []).filter(t => !t.deleted).slice(0, 10);
  }, [transactions]);

  if (loading) {
    return (
      <div className="card">
        <h2>Dashboard</h2>
        <p className="muted">Loading...</p>
      </div>
    );
  }

  if (!transactions || transactions.filter(t => !t.deleted).length === 0) {
    return (
      <div className="card">
        <h2>Dashboard</h2>
        <p className="muted">No transactions yet. Add money to get started.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="row between">
        <h2 style={{ margin: 0 }}>Dashboard</h2>
        <span className="badge">Last 10</span>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>When</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {last10.map(t => (
            <tr key={t.id}>
              <td className="muted">{new Date(t.createdAt).toLocaleString()}</td>
              <td><b>{t.type}</b></td>
              <td>
                {formatINR(t.amount)}
                {t.type === "debit" && t.fee ? <div className="muted">Fee: {formatINR(t.fee)}</div> : null}
              </td>
              <td><StatusBadge status={t.status} /></td>
              <td className="muted">
                {t.type === "debit" ? `To: ${t.recipientId || "-"}` : "-"}
                {t.failureReason ? <div style={{ color: "#d92d20" }}>{t.failureReason}</div> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatusBadge({ status }) {
  const cls = status === "success" ? "success" : status === "failed" ? "failed" : "pending";
  return <span className={`badge ${cls}`}>{status}</span>;
}
