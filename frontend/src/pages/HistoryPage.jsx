import React from "react";
import Transactions from "../components/Transactions.jsx";
import { useOutletContext } from "react-router-dom";

export default function HistoryPage({ loading, users, transactions, reload }) {
  const { showToast } = useOutletContext();

  return (
    <Transactions
      loading={loading}
      users={users}
      transactions={transactions}
      onDeleted={() => {
        showToast("success", "Transaction deleted.");
        reload();
      }}
      onError={(msg) => showToast("error", msg)}
    />
  );
}
