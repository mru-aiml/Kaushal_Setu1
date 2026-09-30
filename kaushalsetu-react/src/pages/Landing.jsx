import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowDown, Landmark, School, Factory, UserRound,
  ShieldCheck, RadioTower, ScanSearch, BookOpenCheck, Wrench, MapPin,
  Compass, DatabaseZap, GraduationCap, CheckCircle2,
} from 'lucide-react';
import { PublicNavbar, PublicFooter } from '../components/public';

const PIPELINE = [
  { label: 'Industry Demand', desc: 'Live signals from job postings & employers', icon: RadioTower },
  { label: 'Skill Intelligence', desc: 'AI-mapped demand vs supply', icon: Compass },
  { label: 'Skill Gap Analysis', desc: 'Critical gaps flagged by district', icon: ScanSearch },
  { label: 'Curriculum Alignment', desc: 'NSQF-aligned course updates', icon: BookOpenCheck },
  { label: 'Training Capacity', desc: 'Seats, trainers & equipment', icon: Wrench },
  { label: 'District Action', desc: 'District training plans', icon: MapPin },
  { label: 'Job-Ready Talent', desc: 'Certified, placement-linked workforce', icon: GraduationCap },
];

const FEATURES = [
  { title: 'Labour-Market Intelligence', desc: 'Continuously indexed job signals, employer demand and sector trends — distilled into decision-ready indicators.', icon: DatabaseZap, color: '#2563EB' },
  { title: 'Skill Gap Intelligence', desc: 'Demand-vs-supply analysis that pinpoints which skills are missing, where, and how urgently.', icon: ScanSearch, color: '#E11D48' },
  { title: 'Curriculum Alignment', desc: 'Course-by-course alignment scoring with concrete add/update recommendations mapped to NSQF levels.', icon: BookOpenCheck, color: '#0D9488' },
  { title: 'Training Capacity Intelligence', desc: 'Seat, trainer and equipment planning so capacity grows exactly where demand is heading.', icon: Wrench, color: '#7C3AED' },
];

const ROLES = [
  { title: 'Government', desc: 'Plan skills around real labour-market demand.', points: ['District-level demand intelligence', 'Evidence-based scheme planning', 'Curriculum review & capacity planning'], icon: Landmark, color: '#2563EB' },
  { title: 'Training Centre', desc: 'Know which courses, trainers and infrastructure need to evolve.', points: ['Course demand intelligence', 'Trainer readiness tracking', 'Infrastructure planning'], icon: School, color: '#0D9488' },
  { title: 'Employer', desc: 'Validate the skills your industry actually needs.', points: ['Skill validation workflows', 'Demand submission', 'Curriculum co-creation'], icon: Factory, color: '#7C3AED' },
  { title: 'Candidate', desc: 'Discover the skills and career pathways employers are looking for.', points: ['Skill-gap awareness', 'Career pathways', 'Recommended learning'], icon: UserRound, color: '#059669' },
];

const WORKFLOW = [
  ['Industry signals', 'Job postings, employer inputs & sector reports'],
  ['Skill extraction', 'Demand mapped to standard skill taxonomies'],
  ['Demand vs supply analysis', 'Openings compared with training output'],
  ['Skill gap detection', 'Critical gaps flagged by district & sector'],
  ['Curriculum recommendations', 'Add/update guidance for each course'],
  ['Training capacity planning', 'Seats, trainers & equipment quotas'],
  ['District action', 'Funded, accountable district training plans'],
];

const WHY = [
  { role: 'For Government', points: ['Evidence-based skill planning', 'District-level intelligence', 'Curriculum review', 'Capacity planning'], color: '#2563EB' },
  { role: 'For Training Centres', points: ['Course demand intelligence', 'Trainer readiness', 'Infrastructure planning'], color: '#0D9488' },
  { role: 'For Employers', points: ['Skill validation', 'Demand submission', 'Curriculum co-creation'], color: '#7C3AED' },
  { role: 'For Candidates', points: ['Skill-gap awareness', 'Career pathways', 'Recommended learning'], color: '#059669' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PublicNavbar />

      {/* Hero */}
      <section className="bg-[#0F172A] text-white overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-14 lg:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-teal-300 bg-teal-500/10 border border-teal-500/20 rounded-full px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Workforce Intelligence Platform
            </div>
            <h1 className="text-4xl lg:text-[52px] font-extrabold tracking-tight leading-[1.08] mt-4">From Industry Demand to Job-Ready Talent.</h1>
            <p className="text-[15px] text-slate-300 mt-4 leading-relaxed max-w-[540px]">KaushalSetu connects labour-market signals, emerging skills, training capacity and curriculum intelligence to help governments, training institutions, employers and candidates make better workforce decisions.</p>
            <div className="flex flex-wrap gap-3 mt-7">
              <button className="btn-p !text-[14px] !px-6 !py-3" onClick={() => navigate('/signup')}>Explore KaushalSetu <ArrowRight className="w-4 h-4" /></button>
              <button className="inline-flex items-center gap-2 font-bold text-[14px] px-6 py-3 rounded-[10px] border border-white/20 text-white hover:bg-white/10 transition" onClick={() => navigate('/login')}>Login</button>
            </div>
            <div className="flex items-center gap-2 mt-6 text-[12px] text-slate-400 font-medium"><ShieldCheck className="w-4 h-4 text-teal-300" /> GovTech-grade design · NSQF / NCVET aligned methods</div>
          </div>

          <div className="rounded-3xl bg-white/[.04] border border-white/10 p-6" aria-label="KaushalSetu intelligence pipeline">
            <div className="text-[11px] font-bold uppercase tracking-widest text-teal-300 mb-4">The KaushalSetu intelligence pipeline</div>
            <div className="flex flex-col gap-1">
              {PIPELINE.map((p, i) => {
                const Ic = p.icon;
                const last = i === PIPELINE.length - 1;
                return (
                  <div key={p.label}>
                    <div className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 ${last ? 'text-white' : 'bg-white text-slate-900'}`} style={last ? { background: 'linear-gradient(135deg,#2563EB,#0D9488)' } : undefined}>
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${last ? 'bg-white/20 text-white' : 'text-white'}`} style={last ? undefined : { background: 'linear-gradient(135deg,#2563EB,#0D9488)' }}><Ic className="w-4 h-4" /></span>
                      <div className="leading-tight"><div className="text-[12.5px] font-extrabold tracking-wide">{p.label}</div><div className={`text-[11px] font-medium ${last ? 'text-white/80' : 'text-slate-500'}`}>{p.desc}</div></div>
                    </div>
                    {i < PIPELINE.length - 1 && <div className="flex justify-center py-0.5"><ArrowDown className="w-4 h-4 text-teal-300" /></div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Platform overview */}
      <section id="platform" className="max-w-[1200px] mx-auto px-4 lg:px-6 py-14 scroll-mt-20">
        <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-center">One platform for the entire skills ecosystem</h2>
        <p className="text-[14px] text-slate-500 text-center mt-2 font-medium max-w-[640px] mx-auto">KaushalSetu turns fragmented labour-market data into coordinated action across government, training providers, employers and candidates.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {FEATURES.map((f) => {
            const Ic = f.icon;
            return (
              <div key={f.title} className="card p-6 hover:shadow-lg hover:-translate-y-0.5 transition">
                <span className="w-11 h-11 rounded-2xl flex items-center justify-center text-white" style={{ background: f.color }}><Ic className="w-5 h-5" /></span>
                <div className="font-extrabold text-[15.5px] mt-3">{f.title}</div>
                <p className="text-[13px] text-slate-500 font-medium mt-1.5 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="bg-white border-y border-slate-200 scroll-mt-16">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-14">
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-center">Built for every stakeholder</h2>
          <p className="text-[14px] text-slate-500 text-center mt-2 font-medium">Each role gets a dedicated workspace with exactly the tools it needs.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {ROLES.map((r) => {
              const Ic = r.icon;
              return (
                <div key={r.title} className="card p-6 flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest" style={{ color: r.color }}>{r.title}</span>
                  <p className="text-[14.5px] font-extrabold mt-2 leading-snug">&ldquo;{r.desc}&rdquo;</p>
                  <ul className="mt-3 space-y-1.5 flex-1">
                    {r.points.map((p) => <li key={p} className="flex gap-2 text-[12.5px] font-medium text-slate-600"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: r.color }} />{p}</li>)}
                  </ul>
                  <div className="mt-4 flex items-center gap-2 text-[13px] font-bold" style={{ color: r.color }}><Ic className="w-4 h-4" /> {r.title} workspace</div>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <button className="btn-p !text-[14px] !px-6 !py-3" onClick={() => navigate('/signup')}>Get Started <ArrowRight className="w-4 h-4" /></button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-[1200px] mx-auto px-4 lg:px-6 py-14 scroll-mt-20">
        <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-center">How KaushalSetu works</h2>
        <p className="text-[14px] text-slate-500 text-center mt-2 font-medium">From raw industry signals to funded district action.</p>
        <div className="mt-8 grid gap-2 max-w-[760px] mx-auto">
          {WORKFLOW.map(([t, d], i) => (
            <div key={t} className="card px-5 py-4 flex items-center gap-4">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-[14px] shrink-0" style={{ background: 'linear-gradient(135deg,#2563EB,#0D9488)' }}>{i + 1}</span>
              <div><div className="text-[14px] font-extrabold">{t}</div><div className="text-[12.5px] text-slate-500 font-medium">{d}</div></div>
              {i === 0 && <span className="ml-auto chip bg-blue-50 text-blue-700 border border-blue-100 shrink-0">INPUT</span>}
              {i === WORKFLOW.length - 1 && <span className="ml-auto chip bg-emerald-600 text-white shrink-0">OUTCOME</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section id="why" className="bg-[#0F172A] text-white scroll-mt-16">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-14">
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-center">Why KaushalSetu</h2>
          <p className="text-[14px] text-slate-400 text-center mt-2 font-medium">Concrete outcomes for every role in the ecosystem.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {WHY.map((w) => (
              <div key={w.role} className="rounded-2xl bg-white/[.04] border border-white/10 p-6">
                <div className="text-[13px] font-extrabold" style={{ color: w.color === '#2563EB' ? '#93C5FD' : w.color === '#0D9488' ? '#5EEAD4' : w.color === '#7C3AED' ? '#C4B5FD' : '#6EE7B7' }}>{w.role}</div>
                <ul className="mt-3 space-y-2">
                  {w.points.map((p) => <li key={p} className="flex gap-2 text-[13px] font-medium text-slate-300"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-teal-300" />{p}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="max-w-[1200px] mx-auto px-4 lg:px-6 py-14">
        <div className="card p-8 lg:p-10 text-center border-t-4" style={{ borderTopColor: '#0D9488' }}>
          <ShieldCheck className="w-10 h-10 mx-auto text-teal-600" />
          <h2 className="text-xl lg:text-2xl font-extrabold tracking-tight mt-3">Built for workforce intelligence, curriculum alignment and skills ecosystem coordination.</h2>
          <p className="text-[13.5px] text-slate-500 font-medium mt-2 max-w-[620px] mx-auto">KaushalSetu aligns training supply with verified industry demand — using open methods compatible with NSQF and NCVET frameworks. Figures shown in the live demo are illustrative demonstration data.</p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <button className="btn-p !text-[14px] !px-6 !py-3" onClick={() => navigate('/signup')}>Get Started <ArrowRight className="w-4 h-4" /></button>
            <button className="btn-g !text-[14px] !px-6 !py-3" onClick={() => navigate('/contact')}>Talk to Us</button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

