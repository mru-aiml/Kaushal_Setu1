import { useState } from 'react';
import { Plus, Send, BadgeCheck } from 'lucide-react';
import { CLUSTERS, ENDORSEMENTS } from '../data/demoData';
import { KPICard, DemoBadge } from '../components/ui';
import { ValidatedMsg } from '../components/domain';
import { useApp } from '../hooks/AppContext';

export default function EmployerValidation() {
  const { toast } = useApp();
  const [count, setCount] = useState(12);
  const [validated, setValidated] = useState(false);
  const [feed, setFeed] = useState(ENDORSEMENTS);
  const [company, setCompany] = useState('');
  const [sector, setSector] = useState('Electric Vehicles');
  const [horizon, setHorizon] = useState('Next 3 months');
  const [skills, setSkills] = useState('');
  const [seats, setSeats] = useState(40);
  const [level, setLevel] = useState('Entry');
  const [cq, setCq] = useState('');

  const validate = () => { setCount((c) => c + 1); setValidated(true); toast('Industry requirement validated — <b>EV Service Technician</b> endorsed.', 'ok'); };
  const suggest = () => { const s = window.prompt('Suggest a skill for EV Service Technician (demo):', 'ADAS Calibration'); if (s) toast(`Skill suggestion <b>“${s}”</b> recorded for employer review (demo).`, 'info'); };
  const submit = () => { setFeed((f) => [{ co: (company || 'Your Company') + ' · HR', txt: `Validated “${skills || 'EV diagnostics, HV safety'}” — ${seats} openings (${horizon}). Mapped to demand index.`, t: 'just now', k: 'endorse' }, ...f]); toast(`Survey submitted — <b>${company || 'Your Company'}</b> skill validation added to live index.`, 'ok'); setCompany(''); setSkills(''); };
  const clusters = CLUSTERS.filter((c) => !cq || (c.c + c.co + c.skills).toLowerCase().includes(cq.toLowerCase()));

  return (
    <div className="fade-in">
      <div className="flex flex-wrap items-end gap-3 mb-5"><div><h1 className="text-2xl font-extrabold tracking-tight">Employer Validation &amp; Skill Co-Creation Portal</h1><p className="text-[13px] text-slate-500 mt-1"><b>2,314 verified employers</b> validating skill needs · endorsing modules · pledging seats</p></div><div className="flex-1" /><button className="btn-p" onClick={() => toast('Demand cluster composer opened (demo)', 'info')}><Plus className="w-4 h-4" />Post Skill Demand</button></div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">{[['Verified Employers', '2,314', '#7C3AED', 'Factory'], ['Skills Validated (Q)', '486', '#2563EB', 'BadgeCheck'], ['Placement Seats Pledged', '18,420', '#059669', 'Armchair'], ['Co-created Modules', '63', '#0D9488', 'Blocks']].map(([l, v, c, i]) => <KPICard key={l} l={l} v={v} d={l} c={c} bg={c + '15'} i={i} />)}</div>

      <div className="card p-5 mb-4 border-t-4" style={{ borderTopColor: '#7C3AED' }}>
        <div className="flex flex-wrap items-center gap-2"><h3 className="font-extrabold text-[15px]">Employer Skill Validation — EV Service Technician · Automotive / EV</h3><DemoBadge label="Prototype employer validation" /></div>
        <div className="flex flex-wrap gap-1.5 mt-3">{['EV Diagnostics', 'Battery Management', 'CAN Protocol', 'EV Safety'].map((s) => <span key={s} className="chip bg-emerald-50 text-emerald-700 border border-emerald-100">✓ {s}</span>)}</div>
        <div className="flex flex-wrap items-center gap-2 mt-4"><button className="btn-p" onClick={validate}><BadgeCheck className="w-4 h-4" />Validate Requirements</button><button className="btn-g" onClick={suggest}><Plus className="w-4 h-4" />Suggest Skill</button><span className="demo-note ml-1">Employer validation count: <b>{count} employers</b> · demo only</span></div>
        <ValidatedMsg show={validated} />
      </div>

      <div className="grid xl:grid-cols-2 gap-4">
        <div className="card p-5"><h3 className="font-extrabold text-[15px] mb-1">Employer Skill-Need Survey</h3><p className="text-[12px] text-slate-500 mb-4">Responses feed the live demand index within 24 hrs</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Company</label><input className="inp mt-1" placeholder="e.g. Tata Motors, Pune" value={company} onChange={(e) => setCompany(e.target.value)} /></div>
            <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Sector</label><select className="inp mt-1" value={sector} onChange={(e) => setSector(e.target.value)}>{['Electric Vehicles', 'IT & AI/ML', 'Healthcare', 'Renewable Energy', 'Precision Manufacturing', 'Logistics'].map((o) => <option key={o}>{o}</option>)}</select></div>
            <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Hiring horizon</label><select className="inp mt-1" value={horizon} onChange={(e) => setHorizon(e.target.value)}>{['Next 3 months', 'Next 6 months', 'Next 12 months'].map((o) => <option key={o}>{o}</option>)}</select></div>
            <div className="col-span-2"><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Critical skills needed (comma separated)</label><input className="inp mt-1" placeholder="e.g. BMS calibration, HV safety, CAN diagnostics" value={skills} onChange={(e) => setSkills(e.target.value)} /></div>
            <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Openings</label><input type="number" value={seats} onChange={(e) => setSeats(e.target.value)} className="inp mt-1" /></div>
            <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Min. proficiency</label><select className="inp mt-1" value={level} onChange={(e) => setLevel(e.target.value)}><option>Entry</option><option>Mid</option><option>Senior</option></select></div>
          </div>
          <div className="flex gap-2 mt-4"><button className="btn-p flex-1 justify-center" onClick={submit}><Send className="w-4 h-4" />Submit Validation</button><button className="btn-g" onClick={() => toast('Draft saved', 'ok')}>Save draft</button></div></div>
        <div className="card p-5"><div className="flex items-center gap-2 mb-3"><h3 className="font-extrabold text-[15px]">Endorsement Feed &amp; Placement Pledges</h3><div className="flex-1" /><span className="chip bg-emerald-50 text-emerald-700">Live</span></div><div className="space-y-3 max-h-[430px] overflow-y-auto pr-1">{feed.map((e, i) => <div key={i} className="border rounded-xl p-3 flex gap-3"><span className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: e.k === 'pledge' ? '#059669' : '#2563EB' }}><BadgeCheck className="w-4 h-4" /></span><div className="flex-1"><div className="text-[12.5px] font-bold">{e.co} <span className="text-slate-400 font-medium">· {e.t}</span></div><p className="text-[13px] text-slate-600 leading-snug mt-0.5">{e.txt}</p><div className="flex gap-2 mt-2"><button className="text-[12px] font-bold text-blue-700 hover:underline" onClick={() => toast('Endorsement recorded — thank you!', 'ok')}>👍 Endorse</button><button className="text-[12px] font-bold text-teal-700 hover:underline" onClick={() => toast('Pledge request sent to employer', 'info')}>Pledge seats</button></div></div></div>)}</div></div>
      </div>
      <div className="card p-5 mt-4 overflow-x-auto"><div className="flex items-center gap-2 mb-2"><h3 className="font-extrabold text-[15px]">Live Skill-Demand Clusters → ITI Mapping</h3><div className="flex-1" /><input className="inp !w-56" placeholder="Search clusters…" value={cq} onChange={(e) => setCq(e.target.value)} /></div>
        <table className="data min-w-[820px]"><thead><tr><th>Demand Cluster</th><th>Employer</th><th>Skills</th><th>Seats</th><th>Mapped ITIs</th><th>Match</th><th>Action</th></tr></thead><tbody>{clusters.map((c) => <tr key={c.c}><td className="font-bold">{c.c}</td><td>{c.co}</td><td className="text-slate-600">{c.skills}</td><td><b>{c.seats}</b></td><td className="text-slate-600">{c.itis}</td><td><b className="text-emerald-600">{c.match}%</b><div className="progress w-16 mt-1"><div style={{ width: c.match + '%', background: '#059669' }} /></div></td><td><button className="btn-p !py-1.5 !text-[12px]" onClick={() => toast(`Demand cluster mapped — ITIs notified, ${c.seats} seats linked`, 'ok')}>Map ITIs</button></td></tr>)}</tbody></table></div>
    </div>
  );
}

