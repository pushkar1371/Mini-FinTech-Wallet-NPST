import React from "react";
import AddMoney from "../components/AddMoney.jsx";
import { useNavigate, useOutletContext } from "react-router-dom";

export default function AddMoneyPage({ loading, busy, setBusy, config, reload }) {
  const { showToast } = useOutletContext();
  const navigate = useNavigate();

  return (
    <AddMoney
      loading={loading}
      busy={busy}
      setBusy={setBusy}
      config={config}
      onDone={() => {
        showToast("success", "Money added successfully.");
        reload();
        navigate("/");
      }}
      onError={(msg) => showToast("error", msg)}
    />
  );
}
