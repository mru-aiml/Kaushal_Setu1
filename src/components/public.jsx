import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';

const LINKS = [
  { label: 'Platform', to: '/#platform' },
  { label: 'For Government', to: '/#roles' },
  { label: 'For Training Centres', to: '/#roles' },
  { label: 'For Employers', to: '/#roles' },
  { label: 'For Candidates', to: '/#roles' },
  { label: 'How It Works', to: '/#how-it-works' },
];

export function PublicNavbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const go = (to) => {
    setOpen(false);
    if (to.startsWith('/#')) {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(to.slice(2));
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else navigate(to);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A] text-white border-b border-white/10">
      <div className="max-w-[1200px] mx-auto flex items-center gap-3 px-4 lg:px-6 h-[64px]">
        <button className="flex items-center gap-3 text-left" onClick={() => go('/')} aria-label="KaushalSetu home">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-lg" style={{ background: 'linear-gradient(135deg,#2563EB,#0D9488)' }}>K</div>
          <div className="leading-tight">
            <div className="font-extrabold text-[15px] tracking-tight">KAUSHALSETU</div>
            <div className="hidden sm:block text-[11px] text-slate-400 font-medium">Labour-Market Intelligence &amp; Curriculum Alignment Platform</div>
          </div>
        </button>
        <div className="flex-1" />
        <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
          {LINKS.map((l) => (
            <button key={l.label} onClick={() => go(l.to)} className="text-[13px] font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition">{l.label}</button>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-2 ml-2">
          <button className="text-[13px] font-semibold text-slate-300 hover:text-white px-4 py-2" onClick={() => navigate('/login')}>Login</button>
          <button className="btn-p !py-2" onClick={() => navigate('/signup')}>Get Started <ArrowRight className="w-4 h-4" /></button>
        </div>
        <button className="lg:hidden p-2 rounded-lg hover:bg-white/10" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-white/10 px-4 py-3 flex flex-col gap-1 bg-[#0F172A]">
          {LINKS.map((l) => (
            <button key={l.label} onClick={() => go(l.to)} className="text-left text-[14px] font-semibold text-slate-200 px-3 py-2.5 rounded-lg hover:bg-white/5">{l.label}</button>
          ))}
          <div className="flex gap-2 pt-2">
            <button className="btn-g flex-1 justify-center !bg-transparent !text-white !border-white/20" onClick={() => { setOpen(false); navigate('/login'); }}>Login</button>
            <button className="btn-p flex-1 justify-center" onClick={() => { setOpen(false); navigate('/signup'); }}>Get Started</button>
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  const navigate = useNavigate();
  const cols = [
    { h: 'Platform', links: [['Overview', '/#platform'], ['How It Works', '/#how-it-works'], ['Why KaushalSetu', '/#why'], ['Login', '/login'], ['Get Started', '/signup']] },
    { h: 'Roles', links: [['Government', '/signup'], ['Training Centres', '/signup'], ['Employers', '/signup'], ['Candidates', '/signup']] },
    { h: 'Contact', links: [['Contact Us', '/contact'], ['Privacy Policy', '/privacy'], ['Terms of Service', '/terms']] },
  ];
  return (
    <footer className="bg-[#0F172A] text-white border-t border-white/10">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-12 grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-lg" style={{ background: 'linear-gradient(135deg,#2563EB,#0D9488)' }}>K</div>
            <div className="font-extrabold text-[15px] tracking-tight">KAUSHALSETU</div>
          </div>
          <p className="text-[13px] text-slate-400 mt-3 leading-relaxed max-w-[320px]">Labour-Market Intelligence &amp; Curriculum Alignment Platform — connecting industry demand with job-ready talent.</p>
          <p className="text-[12px] text-slate-500 mt-3 font-medium">Demonstration deployment — figures shown are illustrative.</p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3">{c.h}</div>
            <div className="flex flex-col gap-2">
              {c.links.map(([label, to]) => (
                <button key={label} onClick={() => {
                  if (to.startsWith('/#')) { navigate('/'); setTimeout(() => { const el = document.getElementById(to.slice(2)); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 60); }
                  else navigate(to);
                }} className="text-left text-[13.5px] font-medium text-slate-300 hover:text-white transition w-fit">{label}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-5 flex flex-wrap gap-2 items-center text-[12px] text-slate-500 font-medium">
          <span>© 2026 KaushalSetu. All rights reserved.</span>
          <span className="flex-1" />
          <span>Workforce intelligence · Curriculum alignment · Skills ecosystem coordination</span>
        </div>
      </div>
    </footer>
  );
}
