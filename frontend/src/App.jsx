import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { getConfig, getTransactions, getUsers } from "./api.js";
import Layout from "./components/Layout.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import AddMoneyPage from "./pages/AddMoneyPage.jsx";
import TransferMoneyPage from "./pages/TransferMoneyPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const [config, setConfig] = useState({ feePercent: 2, maxLimit: 10000 });
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const reload = async () => {
    setError(null);
    setLoading(true);
    try {
      const [cfg, u, tx] = await Promise.all([getConfig(), getUsers(), getTransactions()]);
      setConfig(cfg);
      setUsers(u);
      setTransactions(tx);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const balance = useMemo(() => {
    return transactions
      .filter((t) => !t.deleted && t.status === "success")
      .reduce((sum, t) => {
        if (t.type === "credit") return sum + t.amount;
        if (t.type === "debit") return sum - (t.amount + (t.fee || 0));
        return sum;
      }, 0);
  }, [transactions]);

  return (
    <BrowserRouter>
      {error && (
        <div className="container">
          <div className="card error">
            <div className="row between">
              <div>
                <b>Something went wrong</b>
                <div className="muted">{error}</div>
              </div>
              <button onClick={reload}>Retry</button>
            </div>
          </div>
        </div>
      )}

      <Routes>
        <Route element={<Layout config={config} balance={balance} />}>
          <Route index element={<DashboardPage loading={loading} transactions={transactions} />} />
          <Route path="/add" element={<AddMoneyPage loading={loading} busy={busy} setBusy={setBusy} config={config} reload={reload} />} />
          <Route path="/transfer" element={<TransferMoneyPage loading={loading} busy={busy} setBusy={setBusy} users={users} config={config} reload={reload} />} />
          <Route path="/history" element={<HistoryPage loading={loading} users={users} transactions={transactions} reload={reload} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
