import { useState } from 'react';
import { Sheet, GraduationCap, PackageCheck } from 'lucide-react';
import { TRAINERS, EQUIPMENT } from '../data/demoData';
import { KPICard } from '../components/ui';
import { CapacityPlanner } from '../components/domain';
import { useApp } from '../hooks/AppContext';
import { prototypeExport as mockDownload } from '../services/exportService';

export default function TrainingCapacity() {
  const { toast } = useApp();
  const [q, setQ] = useState('');
  const [inst, setInst] = useState('Govt. ITI Pune (Bhosari)');
  const [equip, setEquip] = useState(EQUIPMENT);
  const toggle = (i) => { const n = [...equip]; n[i] = { ...n[i], st: n[i].st === 'ready' ? 'gap' : 'ready' }; setEquip(n); toast(n[i].st === 'ready' ? 'Marked procured — readiness updated.' : 'Marked as gap — added to CAPEX list.', n[i].st === 'ready' ? 'ok' : 'alert'); };
  const ready = equip.filter((e) => e.st === 'ready').length + equip.filter((e) => e.st === 'partial').length * 0.5;
  const pct = Math.round((ready / equip.length) * 100);
  const dot = { gap: '#E11D48', critical: '#7C3AED', partial: '#F59E0B', ready: '#059669' };
  const rows = TRAINERS.filter((t) => !q || (t.n + t.trade).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="fade-in">
      <div className="flex flex-wrap items-end gap-3 mb-5"><div><h1 className="text-2xl font-extrabold tracking-tight">Trainer Capacity &amp; Infrastructure Matrix</h1><p className="text-[13px] text-slate-500 mt-1">Trainer competencies vs new tech standards · lab &amp; equipment readiness</p></div><div className="flex-1" /><button className="btn-g" onClick={() => mockDownload('trainer-matrix.xlsx', toast)}><Sheet className="w-4 h-4" />Matrix (.xlsx)</button><button className="btn-p" onClick={() => toast('ToT scheduled — invites sent to 24 trainers', 'ok')}><GraduationCap className="w-4 h-4" />Schedule ToT</button></div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">{[['Total Trainers', '1,284', '#2563EB', 'Users'], ['NSQF L4+ Certified', '58%', '#059669', 'BadgeCheck'], ['Needs Re-skilling', '312', '#E11D48', 'UserX'], ['Lab Readiness', '55%', '#0D9488', 'FlaskConical']].map(([l, v, c, i]) => <KPICard key={l} l={l} v={v} d={l} c={c} bg={c + '15'} i={i} />)}</div>
      <CapacityPlanner />
      <div className="grid xl:grid-cols-2 gap-4">
        <div className="card p-5 overflow-x-auto"><div className="flex items-center gap-2 mb-2"><h3 className="font-extrabold text-[15px]">Trainer Proficiency Matrix</h3><div className="flex-1" /><input className="inp !w-48" placeholder="Search trainers…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <table className="data min-w-[560px]"><thead><tr><th>Trainer</th><th>Trade</th><th>New-tech score</th><th>Cert.</th><th>Action</th></tr></thead>
            <tbody>{rows.map((t) => <tr key={t.n}><td className="font-bold">{t.n}</td><td className="text-slate-600">{t.trade}</td><td><div className="flex items-center gap-2"><div className="progress w-20"><div style={{ width: t.score + '%', background: t.score >= 70 ? '#059669' : t.score >= 55 ? '#F59E0B' : '#E11D48' }} /></div><b>{t.score}</b></div></td><td>{t.ok ? <span className="chip bg-emerald-50 text-emerald-700">✓ {t.cert}</span> : <span className="chip bg-rose-50 text-rose-700">Pending</span>}</td><td>{t.ok ? <span className="text-[12px] font-bold text-slate-400">Current</span> : <button className="btn-p !py-1.5 !text-[11px]" onClick={() => toast(`ToT seat reserved for <b>${t.n}</b> — 2-week bootcamp`, 'ok')}>Assign ToT</button>}</td></tr>)}</tbody></table></div>
        <div className="card p-5"><div className="flex items-center gap-2 mb-1"><h3 className="font-extrabold text-[15px]">Equipment Readiness Checklist</h3><div className="flex-1" /><select className="inp !w-56" value={inst} onChange={(e) => setInst(e.target.value)}>{['Govt. ITI Pune (Bhosari)', 'Govt. Polytechnic Coimbatore', 'ITI Indore (Sukhliya)', 'ITI Hyderabad (Mallepally)'].map((o) => <option key={o}>{o}</option>)}</select></div>
          <p className="text-[12px] text-slate-500 mb-3">Alignment to 2026 revised equipment norms · tick items as procured</p>
          <div className="flex items-center gap-3 mb-3"><div className="flex-1 progress"><div style={{ width: pct + '%', background: 'linear-gradient(90deg,#0D9488,#059669)' }} /></div><b className="text-[13px]">{pct}%</b></div>
          <div className="space-y-2.5">{equip.map((e, i) => <label key={e.item} className={`flex items-start gap-3 border rounded-xl p-3 cursor-pointer hover:border-teal-500 transition ${e.st === 'ready' ? 'bg-emerald-50/50 border-emerald-100' : ''}`}><input type="checkbox" checked={e.st === 'ready'} onChange={() => toggle(i)} className="mt-1 w-4 h-4 accent-teal-600" /><span className="flex-1"><span className="block text-[13px] font-bold">{e.item}</span><span className="text-[12px] text-slate-500 font-medium">Have {e.have} / Need {e.need} · {e.cost}</span></span><span className="chip" style={{ background: dot[e.st] + '15', color: dot[e.st] }}>{e.st.toUpperCase()}</span></label>)}</div>
          <button className="btn-p w-full justify-center mt-4" onClick={() => toast('Equipment gap report sent to State Directorate for CAPEX approval', 'ok')}><PackageCheck className="w-4 h-4" />Request CAPEX Approval</button></div>
      </div>
    </div>
  );
}

