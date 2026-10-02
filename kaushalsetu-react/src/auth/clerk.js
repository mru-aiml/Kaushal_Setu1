// Clerk helpers (env-gated). When VITE_CLERK_PUBLISHABLE_KEY is unset, Clerk
// is completely inert: no provider, no UI, no network calls. When set, Clerk
// acts as an identity provider INTO the single backend session system
// (see ClerkBridge + authService.signInWithClerk).

export const CLERK_KEY = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '').trim();

export const clerkAvailable = () => CLERK_KEY.length > 0;

// The Clerk signOut registered by ClerkBridge (avoids conditional-hook issues
// in components that render with or without a ClerkProvider).
let clerkSignOut = null;
export const registerClerkSignOut = (fn) => {
  clerkSignOut = fn;
};
export const signOutClerk = async () => {
  if (clerkSignOut) {
    try {
      await clerkSignOut();
    } catch {
      /* already signed out */
    }
  }
};
