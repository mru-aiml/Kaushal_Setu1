import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/react';
import { authService } from './authService';
import { useSession } from './AuthContext';
import { useApp } from '../hooks/AppContext';
import { registerClerkSignOut } from './clerk';

// Rendered ONLY when a ClerkProvider exists (see App.jsx). Syncs a Clerk
// session into the single backend session exactly once per Clerk sign-in:
// new Clerk users land on /onboarding, existing users go to their dashboard
// via the normal RequireAuth routing. No second session system.
export default function ClerkBridge() {
  const { isSignedIn, getToken, signOut } = useAuth();
  const { isAuthenticated } = useSession();
  const { toast } = useApp();
  const syncedRef = useRef(null);

  useEffect(() => {
    registerClerkSignOut(() => signOut());
    return () => registerClerkSignOut(null);
  }, [signOut]);

  useEffect(() => {
    if (!isSignedIn) {
      // Clerk session ended externally → end the backend session it created.
      if (syncedRef.current && isAuthenticated) {
        syncedRef.current = null;
        authService.signOut();
      }
      return;
    }
    if (isAuthenticated || syncedRef.current) return;
    syncedRef.current = 'pending';
    (async () => {
      try {
        const jwt = await getToken();
        if (!jwt) throw new Error('Could not read the Clerk session. Please try again.');
        await authService.signInWithClerk(jwt);
        syncedRef.current = 'done';
      } catch (e) {
        syncedRef.current = null;
        toast(e.message || 'Clerk sign-in failed.', 'alert');
        try {
          await signOut();
        } catch {
          /* ignore */
        }
      }
    })();
  }, [isSignedIn, isAuthenticated, getToken, signOut, toast]);

  return null;
}
