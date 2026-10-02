import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { SignInButton, SignUpButton } from '@clerk/react';
import { authService } from '../auth/authService';
import { useSession } from '../auth/AuthContext';
import { clerkAvailable } from '../auth/clerk';
import { ROLE_CONFIG } from '../data/roles';

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.1.1 3.5 2.7.2.1c2.2-2 3.8-5 3.8-8.9z" /><path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-5l-.1.1-3.6 2.8v.1C3.5 21.4 7.5 24 12 24z" /><path fill="#FBBC05" d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-.1-.1-3.5-2.7-.1.1C.6 8.7 0 10.2 0 12s.6 3.3 1.6 4.8l3.6-2.4z" /><path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.5 0 3.5 2.6 1.6 6.8l3.6 2.9c1-2.9 3.7-5 6.8-5z" /></svg>
  );
}

export function AuthShell({ children, title, subtitle }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#F8FAFC]">
      <div className="bg-[#0F172A] text-white p-8 lg:p-14 flex flex-col justify-between min-h-[280px]">
        <div>
          <button className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-400 hover:text-white transition mb-8" onClick={() => navigate('/')}><ArrowLeft className="w-4 h-4" /> Back to home</button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-xl" style={{ background: 'linear-gradient(135deg,#2563EB,#0D9488)' }}>K</div>
            <div className="font-extrabold text-[22px] tracking-tight">KAUSHALSETU</div>
          </div>
          <p className="text-[13px] text-teal-300 font-semibold mt-2">Labour-Market Intelligence &amp; Curriculum Alignment Platform</p>
          <h1 className="text-3xl lg:text-[40px] font-extrabold tracking-tight leading-tight mt-8">From industry demand<br />to job-ready talent.</h1>
          <p className="text-[14px] text-slate-400 mt-4 max-w-[420px] leading-relaxed">One workspace for governments, training centres, employers and candidates — each with exactly the tools it needs.</p>
        </div>
        <div className="text-[12px] text-slate-500 font-medium mt-10">Workforce intelligence · Curriculum alignment · Skills ecosystem coordination</div>
      </div>
      <div className="p-6 sm:p-8 lg:p-14 flex items-center">
        <div className="w-full max-w-[480px] mx-auto">
          <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
          {subtitle && <p className="text-[13px] text-slate-500 font-medium mt-1">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dashboardRoute, isAuthenticated, authMode, googleConfigured } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  const next = new URLSearchParams(location.search).get('next') || '';
  const oauthError = new URLSearchParams(location.search).get('error') || '';
  const googleDisabled = authMode !== 'backend' || !googleConfigured;

  const afterAuth = (user) => {
    if (!user.onboarded) navigate('/onboarding' + (next ? `?next=${encodeURIComponent(next)}` : ''));
    else if (next && next.startsWith('/')) navigate(next);
    else navigate(ROLE_CONFIG[user.role]?.dashboardRoute || '/app');
  };

  const signIn = async (e) => {
    e?.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { user } = await authService.signIn({ email, password });
      afterAuth(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError('');
    setGoogleBusy(true);
    try {
      // Real OAuth: the browser leaves for Google and returns to /auth/callback.
      await authService.signInWithGoogle();
    } catch (err) {
      setError(err.message);
      setGoogleBusy(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your KaushalSetu workspace.">
      <form onSubmit={signIn} className="card p-6 mt-6" noValidate>
        {authMode === 'local' && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[12.5px] font-semibold px-3.5 py-2.5 mb-4">
            Local development auth — accounts live in this browser only. Start the backend API for shared accounts.
          </div>
        )}
        {oauthError === 'google_failed' && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[13px] font-semibold px-3.5 py-2.5 mb-4" role="alert">Google sign-in failed. Please try again or use email sign-in.</div>
        )}
        {error && <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[13px] font-semibold px-3.5 py-2.5 mb-4" role="alert">{error}</div>}
        <label htmlFor="login-email" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Email</label>
        <input id="login-email" className="inp mt-1 mb-4" type="email" autoComplete="email" placeholder="you@organisation.in" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label htmlFor="login-password" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Password</label>
        <input id="login-password" className="inp mt-1" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" disabled={busy} className="btn-p w-full justify-center mt-5 !py-3 disabled:opacity-60">
          {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
        </button>
        <div className="flex items-center gap-3 my-4"><span className="flex-1 h-px bg-slate-200" /><span className="text-[11px] font-bold text-slate-400 uppercase">or</span><span className="flex-1 h-px bg-slate-200" /></div>
        {clerkAvailable() && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <SignInButton mode="modal">
                <button type="button" className="btn-p w-full justify-center !py-3">Sign In with Clerk</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button type="button" className="btn-g w-full justify-center !py-3">Sign Up with Clerk</button>
              </SignUpButton>
            </div>
            <div className="flex items-center gap-3 my-4"><span className="flex-1 h-px bg-slate-200" /><span className="text-[11px] font-bold text-slate-400 uppercase">or</span><span className="flex-1 h-px bg-slate-200" /></div>
          </>
        )}
        <button type="button" onClick={google} disabled={googleBusy || googleDisabled} title={googleDisabled ? 'Google sign-in needs the backend API with Google credentials configured' : 'Sign in with your Google account'} className="btn-g w-full justify-center !py-3 disabled:opacity-60">
          {googleBusy ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting to Google…</> : <><GoogleIcon /> Continue with Google</>}
        </button>
        {googleDisabled && (
          <p className="text-center text-[11.5px] font-semibold text-slate-400 mt-2">Google sign-in is unavailable — {authMode !== 'backend' ? 'backend API not connected' : 'Google credentials not configured on the server'}. Email sign-in works fully.</p>
        )}
        <p className="text-center text-[13px] font-medium text-slate-500 mt-4">Don&apos;t have an account? <Link to="/signup" className="font-bold text-blue-700 hover:underline">Sign up</Link></p>
      </form>

      <div className="card p-6 mt-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Just exploring?</div>
        <p className="text-[12.5px] text-slate-500 font-medium mt-1 mb-3">Try a guided demo workspace — no account needed. Demo sessions are sandboxed and clearly labeled.</p>
        <button className="btn-g w-full justify-center !text-[13px]" onClick={() => navigate('/demo')}>Explore Demo Workspaces <ArrowRight className="w-4 h-4" /></button>
        {isAuthenticated && <button className="w-full text-center text-[12px] font-bold text-blue-700 mt-2 hover:underline" onClick={() => navigate(dashboardRoute)}>Go to my dashboard →</button>}
      </div>
    </AuthShell>
  );
}

