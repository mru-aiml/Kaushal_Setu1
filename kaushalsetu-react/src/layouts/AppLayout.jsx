import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { JOBS } from '../data/demoData';
import { ROLE_CONFIG, ROLE_LIST } from '../data/roles';
import { useApp } from '../hooks/AppContext';
import { useSession } from '../auth/AuthContext';
import { authService } from '../auth/authService';
import { Ticker } from '../components/domain';
import { Toasts } from '../components/ui';
import ReportModal from '../components/ReportModal';

const iconMap = (n) => Icons[n] || Icons.Circle;

export default function AppLayout({ children }) {
  const { toasts, dismiss, toast } = useApp();
  const { user, role, roleConfig, isDemo } = useSession();
  const [userMenu, setUserMenu] = useState(false);
  const [demoMenu, setDemoMenu] = useState(false);
  const [side, setSide] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const navigate = useNavigate();

  const cur = roleConfig || ROLE_CONFIG.government;
  const nav = cur.navigationItems;
  const RoleIcon = iconMap(cur.icon);
  const initials = (user?.name || 'U').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  const signOut = () => {
    authService.signOut();
    navigate('/login');
  };

  const switchDemoWorkspace = async (id) => {
    setDemoMenu(false);
    setSide(false);
    await authService.demoSignIn(id);
    navigate(ROLE_CONFIG[id].dashboardRoute);
    toast(`Demo workspace: <b>${ROLE_CONFIG[id].label}</b> — sandboxed demonstration data.`, 'info');
  };

  return (
    <div className="min-h-screen">
      {/* Demo Mode banner — the ONLY place workspace switching exists, demo sessions only */}
      {isDemo && (
        <div className="bg-amber-400 text-slate-900">
          <div className="max-w-[1400px] mx-auto flex flex-wrap items-center gap-2 px-4 lg:px-6 py-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest"><Icons.FlaskConical className="w-3.5 h-3.5" /> Demo Mode — sandboxed demonstration data</span>
            <span className="flex-1" />
            <div className="relative">
              <button onClick={() => setDemoMenu(!demoMenu)} className="inline-flex items-center gap-1.5 text-[12px] font-bold bg-slate-900 text-white rounded-lg px-3 py-1.5 hover:bg-slate-700 transition">
                <Icons.Repeat className="w-3.5 h-3.5" /> Switch demo workspace <Icons.ChevronDown className="w-3.5 h-3.5" />
              </button>
              {demoMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-slate-900 rounded-2xl shadow-2xl border overflow-hidden z-50">
                  <div className="px-4 py-2.5 bg-slate-50 border-b text-[11px] font-bold uppercase tracking-wider text-slate-500">Demo workspaces (not real accounts)</div>
                  {ROLE_LIST.map((r) => {
                    const Ic = iconMap(r.icon);
                    return (
                      <button key={r.id} onClick={() => switchDemoWorkspace(r.id)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 border-b last:border-0 text-left transition">
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: r.color }}><Ic className="w-4 h-4" /></span>
                        <span className="flex-1 text-[13px] font-bold">{r.label}</span>
                        {r.id === cur.id && <Icons.CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <button onClick={() => navigate('/signup')} className="text-[12px] font-bold underline underline-offset-2 hover:text-slate-700">Create a free account</button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-[#0F172A] text-white border-b border-white/10">
        <div className="flex items-center gap-3 px-4 lg:px-6 h-[64px]">
          <button className="lg:hidden p-2 rounded-lg hover:bg-white/10" onClick={() => setSide(true)} aria-label="Open navigation"><Icons.Menu className="w-5 h-5" /></button>
          <button className="flex items-center gap-3 text-left" onClick={() => navigate(cur.dashboardRoute)} title="Go to my dashboard">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-lg" style={{ background: 'linear-gradient(135deg,#2563EB,#0D9488)' }}>K</div>
            <div className="leading-tight">
              <div className="font-extrabold text-[15px] tracking-tight">KAUSHALSETU <span className="ml-1 text-[10px] font-bold bg-white/10 border border-white/15 text-slate-200 px-2 py-0.5 rounded-full align-middle">DEMO DATA</span></div>
              <div className="text-[11px] text-slate-400 font-medium">Labour-Market Intelligence &amp; Curriculum Alignment Platform</div>
            </div>
          </button>
          <div className="hidden md:flex items-center gap-2 ml-6 text-[12px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />LIVE · 2,84,312 signals indexed
          </div>
          <div className="flex-1" />

          {/* Read-only role indicator (no switching for authenticated users) */}
          <div className="hidden sm:flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-3 py-2" title="Your assigned role — locked to your account">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: cur.color }}><RoleIcon className="w-4 h-4" /></span>
            <span className="text-left leading-tight"><span className="block text-[10px] uppercase tracking-wider text-slate-400">Current Role · {cur.label}</span><span className="block text-[12.5px] font-semibold">{cur.org}</span></span>
            <Icons.Lock className="w-3.5 h-3.5 text-slate-500" />
          </div>

          <button onClick={() => setReportOpen(true)} className="hidden sm:inline-flex btn-p !py-2"><Icons.FileText className="w-4 h-4" />Reports</button>
          <button onClick={() => toast('3 new high-priority skill-gap alerts in Pune, Coimbatore & Indore', 'alert')} className="relative p-2.5 rounded-xl hover:bg-white/10" aria-label="Notifications"><Icons.Bell className="w-5 h-5" /><span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#0F172A]" /></button>

          {/* User menu */}
          <div className="relative">
            <button onClick={() => setUserMenu(!userMenu)} className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center font-bold text-sm" title={user?.email || 'Account'}>{initials}</button>
            {userMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white text-slate-900 rounded-2xl shadow-2xl border overflow-hidden z-50">
                <div className="px-4 py-3 bg-slate-50 border-b">
                  <div className="text-[13.5px] font-extrabold truncate">{user?.name}</div>
                  <div className="text-[12px] text-slate-500 font-medium truncate">{user?.email}</div>
                  <div className="mt-1.5 flex items-center gap-1.5"><span className="chip text-white" style={{ background: cur.color }}>{cur.label.toUpperCase()}</span>{isDemo && <span className="chip bg-amber-100 text-amber-800 border border-amber-200">DEMO</span>}</div>
                </div>
                <button onClick={() => { setUserMenu(false); navigate(cur.dashboardRoute); }} className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-slate-50 text-left text-[13px] font-bold transition"><Icons.LayoutDashboard className="w-4 h-4 text-slate-500" /> My dashboard</button>
                <button onClick={() => { setUserMenu(false); navigate(`${cur.dashboardRoute}/profile`); }} className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-slate-50 text-left text-[13px] font-bold transition"><Icons.UserRound className="w-4 h-4 text-slate-500" /> My profile</button>
                <button onClick={signOut} className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-slate-50 text-left text-[13px] font-bold text-rose-700 transition border-t"><Icons.LogOut className="w-4 h-4" /> Sign out</button>
              </div>
            )}
          </div>
        </div>
        <div className="ticker-wrap overflow-hidden border-t border-white/10 bg-white/[.03] py-2 px-2"><Ticker jobs={JOBS} /></div>
      </header>

      <div className="flex min-h-[calc(100vh-64px)]">
        {side && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSide(false)} />}
        <aside id="sidebar" className={`w-[264px] shrink-0 bg-[#0F172A] text-white p-4 flex flex-col gap-1 min-h-[calc(100vh-64px)] ${side ? 'open' : ''}`}>
          <div className="rounded-2xl px-3 py-2.5 mb-2 border border-white/10" style={{ background: 'linear-gradient(135deg,rgba(37,99,235,.25),rgba(13,148,136,.25))' }}>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Role</div>
            <div className="text-[14px] font-extrabold">{cur.label}</div>
            <div className="text-[11.5px] text-slate-400 font-medium">{cur.org}</div>
          </div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-3 pt-2 pb-2">Intelligence Modules</div>
          <nav className="flex flex-col gap-1.5" aria-label="Workspace navigation">
            {nav.map((n) => {
              const Ic = iconMap(n.icon);
              return (
                <NavLink key={n.id} to={n.to} end={n.to === cur.dashboardRoute} onClick={() => setSide(false)} className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>
                  <Ic className="w-[18px] h-[18px]" /><span className="flex-1">{n.label}</span>
                </NavLink>
              );
            })}
          </nav>
          <div className="mt-auto pt-4">
            <div className="rounded-2xl p-4 border border-white/10" style={{ background: 'linear-gradient(135deg,rgba(37,99,235,.25),rgba(13,148,136,.25))' }}>
              <div className="text-[13px] font-bold flex items-center gap-2"><Icons.Sparkles className="w-4 h-4 text-teal-300" />AI District Planner</div>
              <p className="text-[12px] text-slate-300 mt-1 leading-relaxed">Auto-generate NSQF-aligned training quotas for 2026–27.</p>
              <button onClick={() => { setSide(false); navigate(role === 'government' ? '/government/training-plans' : cur.dashboardRoute); }} className="mt-3 w-full text-[13px] font-bold bg-white text-navy rounded-xl py-2 hover:bg-teal-100 transition">Generate Plan</button>
            </div>
            <div className="flex items-center gap-2 mt-3 px-2 text-[11px] text-slate-500 font-medium"><Icons.ShieldCheck className="w-3.5 h-3.5" />GovTech · NSQF · NCVET aligned</div>
          </div>
        </aside>

        <main className="flex-1 p-4 lg:p-7 max-w-[1400px] w-full mx-auto">
          {children}
          <footer className="text-center text-[12px] text-slate-400 font-medium py-8">KAUSHALSETU · Labour-Market Intelligence &amp; Curriculum Alignment Platform · Demonstration data — illustrative, not official statistics · NSQF / NCVET / Skill India aligned methods</footer>
        </main>
      </div>

      <Toasts toasts={toasts} dismiss={dismiss} />
      {reportOpen && <ReportModal onClose={() => setReportOpen(false)} />}
    </div>
  );
}
