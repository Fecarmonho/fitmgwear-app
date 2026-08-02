import { useState, useEffect } from "react";

// O toast é disparado de qualquer lugar do app (inclusive de funções que não
// são componentes), então o setter do container fica guardado aqui no módulo.
let toastCount = 0;
let setToastsGlobal = null;

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => { setToastsGlobal = setToasts; }, []);
  return toasts;
}

export function toast(msg, type = "success") {
  if (!setToastsGlobal) return;
  const id = ++toastCount;
  setToastsGlobal(p => [...p, { id, msg, type }]);
  setTimeout(() => setToastsGlobal(p => p.filter(t => t.id !== id)), 3500);
}
