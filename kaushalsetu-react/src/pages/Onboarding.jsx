import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Landmark, School, Factory, UserRound, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { authService } from '../auth/authService';
import { useSession } from '../auth/AuthContext';
import { ROLE_LIST, ROLE_CONFIG } from '../data/roles';

const ROLE_ICONS = { government: Landmark, trainingCentre: School, employer: Factory, candidate: UserRound };

export function RoleCards({ selected, onSelect, compact }) {
  return (
    <div className={`grid gap-3 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2'}`}>
      {ROLE_LIST.map((r) => {
        const Ic = ROLE_ICONS[r.id];
        const active = selected === r.id;
        return (
          <button type="button" key={r.id} onClick={() => onSelect(r.id)} aria-pressed={active}
            className={`rounded-2xl border p-5 text-left transition hover:shadow-md ${active ? 'border-blue-600 bg-blue-50/60 shadow-[0_0_0_3px_rgba(37,99,235,.12)]' : 'border-slate-200 bg-white hover:border-slate-400'}`}>
            <span className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: r.color }}><Ic className="w-5 h-5" /></span>
              <span className="text-[15px] font-extrabold">{r.label}</span>
              {active && <CheckCircle2 className="w-5 h-5 ml-auto text-blue-700" />}
            </span>
            <p className="text-[12.5px] text-slate-500 font-medium mt-2.5 leading-relaxed">{r.onboarding}</p>
            <ul className="mt-2 space-y-1">
              {r.onboardingPoints.map((p) => <li key={p} className="text-[12px] font-semibold text-slate-600">· {p}</li>)}
            </ul>
          </button>
        );
      })}
    </div>
  );
}

// New accounts pick a role exactly once. The choice is locked to the account.
export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSession();
  const [selected, setSelected] = useState('government');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Role already locked — onboarding is a one-time step.
  if (user?.onboarded && !user?.demo) {
    return <Navigate to={ROLE_CONFIG[user.role]?.dashboardRoute || '/app'} replace />;
  }

  const next = new URLSearchParams(location.search).get('next') || '';

  const confirm = async () => {
    setError('');
    setBusy(true);
    try {
      const { user: u } = await authService.assignRole(selected);
      if (next && next.startsWith('/')) navigate(next);
      else navigate(ROLE_CONFIG[u.role]?.dashboardRoute || '/app');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-[#0F172A] text-white">
        <div className="max-w-[960px] mx-auto px-4 lg:px-6 py-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-lg" style={{ background: 'linear-gradient(135deg,#2563EB,#0D9488)' }}>K</div>
            <div className="font-extrabold text-[16px] tracking-tight">KAUSHALSETU</div>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight mt-6">Choose your workspace{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</h1>
          <p className="text-[14px] text-slate-400 mt-2 font-medium max-w-[640px]">Select the role that describes you. Your workspace — and everything you can access — is tailored to this role. This choice is locked to your account.</p>
        </div>
      </div>
      <div className="max-w-[960px] mx-auto px-4 lg:px-6 py-8">
        {error && <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[13px] font-semibold px-3.5 py-2.5 mb-4" role="alert">{error}</div>}
        <RoleCards selected={selected} onSelect={setSelected} />
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <button className="btn-p !px-6 !py-3 disabled:opacity-60" disabled={busy} onClick={confirm}>
            {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Setting up…</> : <>Continue to my workspace <ArrowRight className="w-4 h-4" /></>}
          </button>
          <p className="text-[12px] text-slate-500 font-medium">Role locked after selection · enforced on every page</p>
        </div>
      </div>
    </div>
  );
}

// Sandboxed demo entry — clearly separated from real accounts.
export function DemoEntry() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(null);

  const enter = async (id) => {
    setBusy(id);
    const { user } = await authService.demoSignIn(id);
    navigate(ROLE_CONFIG[user.role].dashboardRoute);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-[#0F172A] text-white">
        <div className="max-w-[960px] mx-auto px-4 lg:px-6 py-10">
          <button className="text-[13px] font-semibold text-slate-400 hover:text-white transition" onClick={() => navigate('/login')}>← Back to login</button>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight mt-4">Explore demo workspaces</h1>
          <p className="text-[14px] text-slate-400 mt-2 font-medium max-w-[640px]">No account needed. Each demo workspace opens with illustrative demonstration data and is clearly labeled <b className="text-amber-300">DEMO MODE</b>. Demo sessions are sandboxed — they never mix with real accounts.</p>
        </div>
      </div>
      <div className="max-w-[960px] mx-auto px-4 lg:px-6 py-8">
        <RoleCards selected={busy} onSelect={enter} compact />
        <p className="text-[12px] text-slate-500 font-medium mt-6">Tip: create a free account to get a persistent workspace with a locked role.</p>
      </div>
    </div>
  );
}

