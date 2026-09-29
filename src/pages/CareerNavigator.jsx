import { useMemo, useState } from 'react';
import { IdCard, Download } from 'lucide-react';
import { CAREER_PATH, TOP_SKILLS } from '../data/demoData';
import { CareerPath } from '../components/domain';
import { TraineeRadar } from '../components/charts';
import { useApp } from '../hooks/AppContext';
import { prototypeExport as mockDownload } from '../services/exportService';

const TPROFILES = {
  'EV Service Technician': { axes: ['BMS Diagnostics', 'HV Safety', 'CAN Bus', 'Mechanical', 'Customer Handling'], you: [45, 30, 35, 75, 60], dem: [90, 88, 82, 65, 55], skills: ['IC Engine basics', 'Two-wheeler repair', 'Basic electricals', 'Customer handling'], path: [{ m: 'EV Battery Diagnostics & BMS (120h)', c: 'ITI Bhosari, Pune · NSDC 4.8★', s: '₹18–24k → ₹32–40k' }, { m: 'HV Safety Level-2 + CAN Diagnostics (60h)', c: 'ARAI Kothrud · Weekend batch', s: '+₹6–8k premium' }] },
  'AI/ML Associate': { axes: ['Python', 'ML Basics', 'MLOps', 'SQL', 'Communication'], you: [60, 45, 20, 55, 70], dem: [88, 82, 85, 75, 60], skills: ['Python basics', 'Excel/SQL', 'Git', 'Communication'], path: [{ m: 'MLOps & Deployment (140h)', c: 'Polytechnic Bengaluru · Hybrid', s: '₹25k → ₹55–70k' }] },
  'Solar PV Installer': { axes: ['PV Mounting', 'Electrical Safety', 'Net-metering', 'Surveying', 'Sales'], you: [40, 55, 25, 50, 60], dem: [85, 90, 78, 70, 55], skills: ['House wiring', 'Roof work', 'Basic tools', 'Customer handling'], path: [{ m: 'Solar PV + PM Surya Ghar cert (100h)', c: 'ITI Ahmedabad · Day batch', s: '₹15k → ₹26–32k' }] },
  'Healthcare Logistics Assistant': { axes: ['Cold Chain', 'WMS', 'Pharma GDP', 'Documentation', 'Driving'], you: [30, 40, 25, 60, 70], dem: [82, 78, 80, 72, 50], skills: ['Inventory', 'Driving (LMV)', 'Documentation'], path: [{ m: 'Cold-Chain GDP + HMIS (80h)', c: 'ITI Hyderabad · Apollo co-cert', s: '₹16k → ₹28–34k' }] },
  'CNC Operator — Precision': { axes: ['Manual Machining', 'CNC Basics', 'GD&T', 'CAD-CAM', 'Quality'], you: [75, 35, 30, 20, 55], dem: [70, 85, 82, 80, 78], skills: ['Manual lathe', 'Filing', 'Measurement'], path: [{ m: '5-Axis CNC + Mastercam (180h)', c: 'ITI Coimbatore · Siemens lab', s: '₹17k → ₹35–45k' }] },
};

export default function CareerNavigator() {
  const { toast } = useApp();
  const [tRole, setTRole] = useState('EV Service Technician');
  const [selected, setSelected] = useState(['IC Engine basics', 'Basic electricals']);
  const [exp, setExp] = useState('Fresher');
  const [dist, setDist] = useState('Pune');
  const p = TPROFILES[tRole];
  const toggles = useMemo(() => [...new Set([...p.skills, 'Python basics', 'Excel/SQL', 'Git', 'Communication', 'Two-wheeler repair', 'Customer handling', 'House wiring', 'Driving (LMV)', 'Measurement'])].slice(0, 9), [p]);
  const score = Math.max(18, Math.min(94, Math.round(42 + selected.length * 5 + (exp !== 'Fresher' ? 10 : 0))));
  const toggle = (s) => setSelected((sel) => (sel.includes(s) ? sel.filter((x) => x !== s) : [...sel, s]));

  return (
    <div className="fade-in">
      <div className="flex flex-wrap items-end gap-3 mb-5"><div><h1 className="text-2xl font-extrabold tracking-tight">Trainee Career Navigator &amp; Skill-Gap Analyzer</h1><p className="text-[13px] text-slate-500 mt-1">Personalised gap radar · up-skilling pathways · local centres · salary outlook</p></div><div className="flex-1" /><button className="btn-g" onClick={() => toast('Profile exported as PDF resume + skill passport', 'ok')}><IdCard className="w-4 h-4" />My Skill Passport</button></div>
      <CareerPath path={CAREER_PATH} topSkills={TOP_SKILLS} />
      <div className="grid xl:grid-cols-5 gap-4">
        <div className="card p-5 xl:col-span-2"><h3 className="font-extrabold text-[15px]">Candidate Skill Matcher</h3><p className="text-[12px] text-slate-500 mb-4">Enter your profile to compare against live employer demand</p>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Target role</label><select className="inp mt-1 mb-3" value={tRole} onChange={(e) => setTRole(e.target.value)}>{Object.keys(TPROFILES).map((k) => <option key={k}>{k}</option>)}</select>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Your current skills (tap to toggle)</label><div className="flex flex-wrap gap-2 mt-2 mb-3">{toggles.map((s) => <button key={s} onClick={() => toggle(s)} className={`chip border transition ${selected.includes(s) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-900'}`}>{selected.includes(s) ? '✓ ' : ''}{s}</button>)}</div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Experience</label><select className="inp mt-1 mb-3" value={exp} onChange={(e) => setExp(e.target.value)}><option>Fresher</option><option>1–2 years</option><option>3–5 years</option></select>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Preferred district</label><select className="inp mt-1" value={dist} onChange={(e) => setDist(e.target.value)}>{['Pune', 'Coimbatore', 'Bengaluru Urban', 'Indore', 'Hyderabad'].map((o) => <option key={o}>{o}</option>)}</select>
          <div className="mt-4 rounded-xl bg-slate-900 text-white p-4 flex items-center gap-4"><div><div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Readiness score</div><div className="text-3xl font-extrabold">{score}%</div></div><div className="flex-1"><div className="progress !bg-white/15"><div style={{ width: score + '%', background: 'linear-gradient(90deg,#2563EB,#0D9488)' }} /></div><p className="text-[12px] text-slate-300 mt-2">{score >= 75 ? `Strong fit — apply to ${dist} employers now.` : score >= 55 ? `Close — ${p.path.length} modules will make you placement-ready.` : 'Foundations present — start with module 1 this month.'}</p></div></div>
        </div>
        <div className="card p-5 xl:col-span-3"><div className="flex items-center gap-2"><h3 className="font-extrabold text-[15px]">Your Profile vs Employer Demand</h3><div className="flex-1" /><div className="flex gap-4"><span className="inline-flex items-center gap-1.5 text-[12px] font-semibold"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />You</span><span className="inline-flex items-center gap-1.5 text-[12px] font-semibold"><span className="w-3 h-3 rounded-full bg-teal-500 inline-block" />Demand</span></div></div>
          <div className="h-[300px]"><TraineeRadar axes={p.axes} you={p.you} dem={p.dem} /></div>
          <h4 className="font-extrabold text-[14px] mt-2 mb-2">Recommended Up-skilling Pathway</h4>
          <div className="space-y-2.5">{p.path.map((mm, i) => <div key={mm.m} className="border rounded-xl p-3 flex gap-3 items-start hover:border-teal-500 hover:shadow transition"><span className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-extrabold shrink-0">{i + 1}</span><div className="flex-1"><div className="text-[13.5px] font-bold">{mm.m}</div><div className="text-[12px] text-slate-500 font-medium">{mm.c} · {dist}</div><div className="text-[12px] font-bold text-emerald-600 mt-0.5">Expected: {mm.s}</div></div><button className="btn-p !py-1.5 !text-[12px]" onClick={() => toast(`Enrolment noted (demo) — seat request recorded at ${dist} centre.`, 'ok')}>Enroll</button></div>)}<button className="w-full btn-g justify-center" onClick={() => mockDownload('upskilling-pathway.pdf', toast)}><Download className="w-4 h-4" />Download full pathway (PDF)</button></div></div>
          <p className="demo-note mt-2">Demo enrolment — illustrative pathway, no real seat is reserved.</p>
      </div>
    </div>
  );
}

