import React, { useMemo, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { formatINR } from "../utils.js";
import Toast from "./Toast.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";

export default function Layout({ config, balance }) {
  const [toast, setToast] = useState(null);
  const showToast = (type, message) => setToast({ type, message, ts: Date.now() });
  const outletContext = useMemo(() => ({ showToast }), []);

  return (
    <ErrorBoundary>
      <div className="container">
        <header className="header">
          <div>
            <h1>Mini FinTech Wallet</h1>
            <p className="sub">
              Balance derived from successful transactions: <b>{formatINR(balance)}</b>
            </p>
          </div>

          <nav className="tabs">
            <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
              Dashboard
            </NavLink>
            <NavLink to="/add" className={({ isActive }) => (isActive ? "active" : "")}>
              Add Money
            </NavLink>
            <NavLink to="/transfer" className={({ isActive }) => (isActive ? "active" : "")}>
              Transfer
            </NavLink>
            <NavLink to="/history" className={({ isActive }) => (isActive ? "active" : "")}>
              History
            </NavLink>
          </nav>
        </header>

        <Outlet context={outletContext} />

        <footer className="footer">
          <span className="muted">
            Fee: {config.feePercent}% • Limit: {config.maxLimit}
          </span>
          <a className="muted" href="http://localhost:4000/health" target="_blank" rel="noreferrer">
            API Health
          </a>
        </footer>

        {toast && <Toast key={toast.ts} toast={toast} onClose={() => setToast(null)} />}
      </div>
    </ErrorBoundary>
  );
}
