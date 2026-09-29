import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { authService } from '../auth/authService';
import { ROLE_CONFIG } from '../data/roles';

// OAuth landing page: Google redirected back here with a one-time grant code.
// Existing users (role already stored) go straight to their dashboard;
// new users go to onboarding. No role picker is shown to existing users.
export default function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');

  useEffect(() => {
    const code = new URLSearchParams(location.search).get('code');
    if (!code) {
      setError('Missing sign-in grant. Please try again.');
      return;
    }
    authService.consumeOAuthGrant(code)
      .then(({ user }) => {
        if (user.onboarded && user.role && ROLE_CONFIG[user.role]) {
          navigate(ROLE_CONFIG[user.role].dashboardRoute, { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      })
      .catch((e) => setError(e.message || 'Sign-in failed. Please try again.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="card p-10 max-w-[440px] w-full flex flex-col items-center text-center">
        {!error ? (
          <><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /><p className="text-[15px] font-extrabold mt-3">Completing Google sign-in…</p><p className="text-[12.5px] text-slate-500 font-medium mt-1">Verifying your account.</p></>
        ) : (
          <><p className="text-[15px] font-extrabold">Sign-in failed</p><p className="text-[13px] text-slate-500 font-medium mt-1" role="alert">{error}</p><button className="btn-p mt-4" onClick={() => navigate('/login')}>Back to login</button></>
        )}
      </div>
    </div>
  );
}
