import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

// App-wide UI state: selected district + toast notifications.
// NOTE: user role is NOT stored here. Role lives in the auth session
// (src/auth/AuthContext.jsx) and is enforced by route guards — it is never
// freely switchable at runtime.

const AppCtx = createContext(null);

export function AppProvider({ children }) {
  const [selDist, setSelDist] = useState('Pune');
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const toast = useCallback((msg, type = 'ok') => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const value = useMemo(
    () => ({ selDist, setSelDist, toasts, toast, dismiss }),
    [selDist, toasts, toast, dismiss]
  );
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export const useApp = () => useContext(AppCtx);
