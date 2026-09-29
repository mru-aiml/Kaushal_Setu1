import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { authService } from '../auth/authService';
import { AuthShell } from './Login';

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e?.preventDefault();
    setError('');
    setBusy(true);
    try {
      await authService.signUp({ name, email, password });
      navigate('/onboarding');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Get started with KaushalSetu in under a minute.">
      <form onSubmit={submit} className="card p-6 mt-6" noValidate>
        {error && <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[13px] font-semibold px-3.5 py-2.5 mb-4" role="alert">{error}</div>}
        <label htmlFor="su-name" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Full name</label>
        <input id="su-name" className="inp mt-1 mb-4" type="text" autoComplete="name" placeholder="Aarav Sharma" value={name} onChange={(e) => setName(e.target.value)} required />
        <label htmlFor="su-email" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Email</label>
        <input id="su-email" className="inp mt-1 mb-4" type="email" autoComplete="email" placeholder="you@organisation.in" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label htmlFor="su-password" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Password</label>
        <input id="su-password" className="inp mt-1" type="password" autoComplete="new-password" placeholder="Minimum 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" disabled={busy} className="btn-p w-full justify-center mt-5 !py-3 disabled:opacity-60">
          {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
        </button>
        <p className="text-center text-[13px] font-medium text-slate-500 mt-4">Already have an account? <Link to="/login" className="font-bold text-blue-700 hover:underline">Sign in</Link></p>
      </form>
    </AuthShell>
  );
}

