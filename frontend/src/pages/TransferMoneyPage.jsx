import React from "react";
import TransferMoney from "../components/TransferMoney.jsx";
import { useNavigate, useOutletContext } from "react-router-dom";

export default function TransferMoneyPage({
  loading,
  busy,
  setBusy,
  users,
  config,
  reload,
}) {
  const { showToast } = useOutletContext();
  const navigate = useNavigate();

  return (
    <TransferMoney
      loading={loading}
      busy={busy}
      setBusy={setBusy}
      users={users}
      config={config}
      onDone={() => {
        showToast("success", "Transfer completed.");
        reload();
        navigate("/");
      }}
      onError={(msg) => showToast("error", msg)}
    />
  );
}
