import { useNavigate } from 'react-router-dom';
import { Package, CheckCircle2, BrainCircuit, GraduationCap } from 'lucide-react';
import { PUNE_SCENARIO } from '../data/demoData';
import { PriorityBadge, StatusBadge } from './ui';

export function Ticker({ jobs }) {
  const items = jobs.map((j, i) => (
    <span key={i} className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-3 py-1 text-[11.5px] font-semibold whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{j.co} · {j.role} <b className="text-emerald-300">{j.surge}</b>
    </span>
  ));
  return <div className="ticker-track">{[...items, ...items]}</div>;
}

export function DistrictCard({ d, selected, onSelect }) {
  const col = { critical: '#E11D48', moderate: '#F59E0B', balanced: '#059669' }[d.st];
  return (
    <div className={`dist-cell ${selected ? 'selected' : ''}`} onClick={() => onSelect(d.n)}>
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: col }} />
      <div className="flex items-center justify-between mb-1"><b className="text-[14px]">{d.n}</b><span className="chip" style={{ background: col + '15', color: col }}>{d.gap}% gap</span></div>
      <div className="text-[11.5px] text-slate-500 font-medium">{d.s} · pop {d.pop}</div>
      <div className="flex flex-wrap gap-1 mt-2">{d.ind.map((x) => <span key={x} className="chip bg-slate-100 text-slate-600">{x}</span>)}</div>
      <div className="flex items-center gap-2 mt-2 text-[11.5px] font-bold text-slate-600">{d.supply} supply/yr <span className="flex-1" /><span style={{ color: col }}>Score {d.score}</span></div>
    </div>
  );
}

export function SkillGapTable({ rows }) {
  return (
    <table className="data min-w-[720px]">
      <thead><tr><th>Skill</th><th>Industry Demand</th><th>Training Supply</th><th>Gap</th><th>Priority</th></tr></thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.skill}>
            <td className="font-bold">{r.skill}</td>
            <td><b>{r.dem}</b></td>
            <td>{r.sup}</td>
            <td className={`font-extrabold ${r.gap === 'High' ? 'text-rose-600' : 'text-amber-600'}`}>{r.gap}</td>
            <td><PriorityBadge p={r.pr} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function CourseTable({ courses, onView }) {
  const color = (a) => (a < 60 ? '#E11D48' : a < 80 ? '#F59E0B' : '#059669');
  return (
    <table className="data min-w-[760px]">
      <thead><tr><th>Course</th><th>Industry Alignment</th><th>Status</th><th>Missing Skills</th><th /></tr></thead>
      <tbody>
        {courses.map((x, i) => (
          <tr key={x.c} className="cursor-pointer" onClick={() => onView(i)}>
            <td className="font-bold text-blue-700 underline decoration-dotted">{x.c}</td>
            <td><div className="flex items-center gap-2"><div className="progress w-24"><div style={{ width: x.align + '%', background: color(x.align) }} /></div><b>{x.align}%</b></div></td>
            <td><StatusBadge status={x.st} /></td>
            <td className="text-slate-600">{x.miss}</td>
            <td><button className="btn-g !py-1.5 !text-[12px]" onClick={(e) => { e.stopPropagation(); onView(i); }}>View Course</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function CapacityPlanner({ compact }) {
  const s = PUNE_SCENARIO;
  const navigate = useNavigate();
  return (
    <div className="card p-5 mb-4 border-t-4" style={{ borderTopColor: '#0D9488' }}>
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <h3 className="font-extrabold text-[15px]">Capacity Planner — {s.district} · {s.course}</h3>
        <span className="chip bg-amber-50 text-amber-700 border border-amber-100">Illustrative prototype scenario</span>
        <div className="flex-1" />
        {!compact && <button className="btn-p !text-[12px]" onClick={() => navigate('/government/training-plans')}><GraduationCap className="w-4 h-4" />Use in Training Plan</button>}
      </div>
      <div className="grid md:grid-cols-3 gap-3 mt-3 text-center">
        <div className="rounded-xl bg-slate-50 border p-4"><div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Current capacity</div><div className="mt-1 text-[13px] font-semibold">Seats <b>{s.seats.current}</b> · Trainers <b>{s.trainers.current}</b> · Equipment <b>{s.equipment.current}</b></div></div>
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4"><div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Estimated requirement</div><div className="mt-1 text-[13px] font-semibold">Seats <b>{s.seats.required}</b> · Trainers <b>{s.trainers.required}</b> · Equipment <b>{s.equipment.required}</b></div></div>
        <div className="rounded-xl bg-rose-50 border border-rose-100 p-4"><div className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Capacity gap</div><div className="mt-1 text-[13px] font-extrabold text-rose-700">+{s.seats.gap} seats · +{s.trainers.gap} trainers · +{s.equipment.gap} equipment</div></div>
      </div>
      <div className="rec-box mt-3"><b className="text-[13px]">KAUSHALSETU RECOMMENDATION:</b><p className="text-[13px] mt-1">Increase EV training capacity by ~{s.seats.gap} seats, upskill {s.trainers.gap} trainers and prioritize {s.equipment.gap} additional diagnostic equipment units.</p></div>
    </div>
  );
}

export function CareerPath({ path, topSkills }) {
  return (
    <div className="card p-5 mb-4 border-t-4" style={{ borderTopColor: '#059669' }}>
      <div className="flex flex-wrap items-center gap-2"><h3 className="font-extrabold text-[15px]">Recommended Career Path — Automotive / EV · Pune</h3><span className="chip bg-amber-50 text-amber-700 border border-amber-100">Demo pathway</span></div>
      <div className="path-step mt-3 text-[12.5px] font-bold">
        {path.map((p, i) => (
          <span key={p} className="flex items-center gap-2">
            {i > 0 && <span className="pipe-arrow">↓</span>}
            <span className={`chip ${i === 0 ? 'bg-slate-900 text-white' : i === path.length - 1 ? 'bg-emerald-600 text-white' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>{p}</span>
          </span>
        ))}
      </div>
      <div className="mt-3 text-[13px]"><b>Top skills to develop:</b> {topSkills.map((s, i) => `${i + 1}. ${s}`).join(' · ')} &nbsp;|&nbsp; <b>Recommended courses (demo):</b> EV Fundamentals (80h) · Battery &amp; BMS (120h) · EV Diagnostics Lab (100h)</div>
    </div>
  );
}

export function AIInsightBox() {
  const navigate = useNavigate();
  return (
    <div className="space-y-3">
      <div className="card p-5"><div className="text-[12px] font-bold uppercase tracking-wider text-rose-600">Critical gap · EV Diagnostics</div><p className="text-[13.5px] mt-1"><b>Industry Demand:</b> HIGH · <b>Training Supply:</b> LOW · <b>Gap:</b> <b className="text-rose-600">CRITICAL</b></p></div>
      <div className="rounded-xl bg-[#0F172A] text-white p-5"><div className="text-[13px] font-bold flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-teal-300" />AI INSIGHT</div><p className="text-[13px] text-slate-200 mt-1">Industry demand for EV diagnostics is currently higher than available training supply in this prototype scenario.</p><p className="text-[11px] text-slate-400 font-semibold mt-1.5">Demo AI response — illustrative, not a production analysis.</p></div>
      <div className="rec-box"><div className="text-[12px] font-bold uppercase tracking-wider text-teal-700">Recommended action</div><p className="text-[13.5px] font-semibold mt-1">Update relevant automotive courses with EV diagnostics and practical training. Priority: HIGH.</p><div className="flex gap-2 mt-3"><button className="btn-p" onClick={() => navigate('/government/curriculum')}>Open EV Technician (54%)</button><button className="btn-g" onClick={() => navigate('/government/training-capacity')}>Capacity needs</button></div></div>
    </div>
  );
}

export function DistrictEquip({ equip }) {
  return equip.map((e) => <div key={e} className="text-[13px] font-medium flex gap-2 py-1"><Package className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />{e}</div>);
}

export function ValidatedMsg({ show }) {
  if (!show) return null;
  return <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-[13px] font-semibold text-emerald-800">Industry requirement validated. Employer → Skill Demand → KAUSHALSETU → Curriculum Update.</div>;
}

export function DistrictPlanCard({ d, onExport, onSend }) {
  const isPune = d.n === 'Pune';
  return (
    <div className="card overflow-hidden">
      <div className="bg-[#0F172A] text-white p-6"><div className="text-[11px] font-bold uppercase tracking-widest text-teal-300">{d.n} — District Training Plan · 2026–27</div><h2 className="text-xl font-extrabold mt-1">Job-Ready Talent for a Stronger Maharashtra</h2><p className="text-[12px] text-slate-300 mt-1">Industry Demand → Skill Intelligence → Training Alignment</p></div>
      <div className="p-6 grid md:grid-cols-2 gap-4 text-[13.5px]">
        <div><b>Priority Sectors</b><ul className="list-disc ml-5 mt-1 text-slate-700 font-medium"><li>EV &amp; Automotive</li><li>Advanced Manufacturing</li><li>AI / Data</li></ul></div>
        <div><b>Priority Skills</b><ul className="list-disc ml-5 mt-1 text-slate-700 font-medium"><li>EV Diagnostics</li><li>Battery Management</li><li>Industrial Automation</li><li>Data Analytics</li></ul></div>
        <div className="md:col-span-2"><b>Recommended Actions</b>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2 text-center">
            <div className="rounded-xl bg-slate-50 border p-3"><div className="font-extrabold text-lg">4</div><div className="text-[11px] font-bold uppercase text-slate-500">Courses to update</div></div>
            <div className="rounded-xl bg-slate-50 border p-3"><div className="font-extrabold text-lg">2</div><div className="text-[11px] font-bold uppercase text-slate-500">New courses</div></div>
            <div className="rounded-xl bg-slate-50 border p-3"><div className="font-extrabold text-lg">6</div><div className="text-[11px] font-bold uppercase text-slate-500">Trainer upskilling</div></div>
            <div className="rounded-xl bg-slate-50 border p-3"><div className="font-extrabold text-lg">180</div><div className="text-[11px] font-bold uppercase text-slate-500">Additional seats</div></div>
            <div className="rounded-xl bg-slate-50 border p-3"><div className="font-extrabold text-[13px] mt-1">EV diagnostic systems</div><div className="text-[11px] font-bold uppercase text-slate-500">Equipment priority</div></div>
          </div></div>
        <div className="md:col-span-2 flex flex-wrap gap-2">
          <button className="btn-p" onClick={() => onExport(`${d.n}-District-Training-Plan.pdf`)}>Export Plan (PDF)</button>
          <button className="btn-g" onClick={() => onExport(`${d.n}-District-Training-Plan.xlsx`)}>Export (Excel)</button>
          <button className="btn-g" onClick={onSend}>Send for Approval</button>
          <span className="demo-note self-center">Prototype / demo exports — not official statistics.</span>
        </div>
      </div>
      <div className="hidden">{isPune ? '' : ''}</div>
    </div>
  );
}

export function ExportButtons({ onExport }) {
  return (
    <>
      <button className="btn-g !py-2 !text-[12px]" onClick={() => onExport('skill-demand.csv')}>Excel</button>
      <button className="btn-g !py-2 !text-[12px]" onClick={() => onExport('skill-demand.pdf')}>PDF</button>
    </>
  );
}

export function CheckIcon() {
  return <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5" />;
}
