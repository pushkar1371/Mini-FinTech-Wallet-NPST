import React from "react";
import Dashboard from "../components/Dashboard.jsx";

export default function DashboardPage({ loading, transactions }) {
  return <Dashboard loading={loading} transactions={transactions} />;
}

// export default function DashboardPage() {
//   throw new Error("Test crash for ErrorBoundary");
// }
