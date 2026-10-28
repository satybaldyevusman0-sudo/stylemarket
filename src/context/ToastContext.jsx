import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastCtx = createContext(null);
let seq = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const dismiss = useCallback((id) => setToasts((l) => l.filter((x) => x.id !== id)), []);
  const push = useCallback((message, type = 'success', ms = 3500) => {
    const id = ++seq;
    setToasts((l) => [...l.slice(-3), { id, message, type }]);
    setTimeout(() => dismiss(id), ms);
  }, [dismiss]);
  const value = useMemo(() => ({ toasts, push, dismiss }), [toasts, push, dismiss]);
  return <ToastCtx.Provider value={value}>{children}</ToastCtx.Provider>;
}

export const useToast = () => useContext(ToastCtx);
