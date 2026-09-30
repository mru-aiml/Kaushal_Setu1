import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from './authService';
import { ROLE_CONFIG, normalizeRole } from '../data/roles';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authService.getSession());
  const [initializing, setInitializing] = useState(true);
  const [mode, setMode] = useState(authService.getMode());
  const [serverInfo, setServerInfo] = useState(authService.serverInfo());

  useEffect(() => {
    let live = true;
    authService.ready.then((m) => {
      if (!live) return;
      setMode(m);
      setServerInfo({ ...authService.serverInfo() });
      // Rehydrate backend sessions (role travels with the account).
      if (m === 'backend' && authService.getSession()?.mode === 'backend') {
        authService.refresh().finally(() => live && setInitializing(false));
      } else {
        setInitializing(false);
      }
    });
    const off = authService.onChange(setSession);
    return () => {
      live = false;
      off();
    };
  }, []);

  const signOut = useCallback(() => authService.signOut(), []);

  const value = useMemo(() => {
    const user = session?.user || null;
    const role = user?.role ? normalizeRole(user.role) : null;
    return {
      session,
      user,
      role,
      roleConfig: role ? ROLE_CONFIG[role] : null,
      isAuthenticated: !!user,
      needsOnboarding: !!user && !user.onboarded,
      isDemo: !!user?.demo,
      initializing,
      signOut,
      dashboardRoute: role ? ROLE_CONFIG[role].dashboardRoute : '/onboarding',
      authMode: mode, // 'backend' | 'local' | 'probing'
      backendLive: mode === 'backend',
      googleConfigured: serverInfo.googleConfigured,
      aiConfigured: !!serverInfo.ai?.configured,
      aiModel: serverInfo.ai?.model || null,
    };
  }, [session, initializing, signOut, mode, serverInfo]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useSession = () => useContext(AuthCtx);
