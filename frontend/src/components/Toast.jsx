import React, { useEffect } from "react";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2600);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`toast ${toast.type}`}>
      <div className="row between">
        <b>{toast.type === "success" ? "Success" : "Error"}</b>
        <button onClick={onClose}>×</button>
      </div>
      <div className="muted" style={{ marginTop: 6 }}>{toast.message}</div>
    </div>
  );
}
