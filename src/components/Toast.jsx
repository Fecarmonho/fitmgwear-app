import { useToasts } from "../toast.js";

// ─────────────────────────────────────────────
// TOAST — o disparo (toast) fica em ../toast.js
// ─────────────────────────────────────────────
export function ToastContainer() {
  const toasts = useToasts();
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <div className="toast-dot" />
          {t.msg}
        </div>
      ))}
    </div>
  );
}
