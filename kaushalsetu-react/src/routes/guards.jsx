import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '../auth/AuthContext';
import { ROLE_CONFIG } from '../data/roles';
import { LoadingState, Unauthorized } from '../components/states';

// Blocks unauthenticated access. Remembers the target for post-login redirect.
// New accounts without a role are sent to onboarding first.
export function RequireAuth({ children }) {
  const { isAuthenticated, needsOnboarding, initializing } = useSession();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] p-6 max-w-[720px] mx-auto pt-16">
        <LoadingState label="Checking your session…" />
      </div>
    );
  }
  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
}

// Enforces role isolation: a session may render ONLY its own role's routes.
// Anything else shows the Unauthorized screen (with a way back home).
export function RequireRole({ role, children }) {
  const { role: myRole, dashboardRoute } = useSession();
  if (myRole !== role) {
    return <Unauthorized requiredRoleLabel={ROLE_CONFIG[role]?.label} homeRoute={dashboardRoute} />;
  }
  return children;
}

// Keeps signed-in users out of login/signup (unless they explicitly sign out).
export function PublicOnly({ children }) {
  const { isAuthenticated, needsOnboarding, dashboardRoute, initializing } = useSession();
  if (initializing) return null;
  if (isAuthenticated) {
    return <Navigate to={needsOnboarding ? '/onboarding' : dashboardRoute} replace />;
  }
  return children;
}
