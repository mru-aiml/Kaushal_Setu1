import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Map, Wand2, ScanSearch, Package, FileDown } from 'lucide-react';
import { DISTRICTS, PUNE_ROLES } from '../data/demoData';
import { DistrictCard, DistrictEquip } from '../components/domain';
import { DemoBadge } from '../components/ui';
import { DistrictPlanModal } from '../components/modals';
import { useApp } from '../hooks/AppContext';

export default function Districts() {
  const { selDist, setSelDist, toast } = useApp();
  const [planOpen, setPlanOpen] = useState(false);
  const navigate = useNavigate();
  const { name } = useParams();
  const active = DISTRICTS.find((d) => d.n.toLowerCase() === (name || '').toLowerCase()) || DISTRICTS.find((d) => d.n === selDist) || DISTRICTS[0];
  const pick = (n) => { setSelDist(n); navigate(`/government/districts/${n.toLowerCase().replace(/\s+/g, '-')}`); };
  const d = active;
  const isPune = d.n === 'Pune';

  return (
    <div className="fade-in">
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div><h1 className="text-2xl font-extrabold tracking-tight">District Skill Intelligence</h1><p className="text-[13px] text-slate-500 mt-1">Maharashtra Skill Map — click any district for its intelligence · <DemoBadge label="Illustrative prototype data" /></p></div>
        <div className="flex-1" />
        <button className="btn-g" onClick={() => toast('District shapefiles synced from LGD directory', 'ok')}><Map className="w-4 h-4" />Sync LGD Maps</button>
        <button className="btn-p" onClick={() => setPlanOpen(true)}><Wand2 className="w-4 h-4" />Generate District Training Plan</button>
      </div>
      <div className="card p-4 mb-4 text-[13px]"><b>Maharashtra Skill Map (demo):</b> <span className="font-medium text-slate-600">Pune — Automotive / EV · Nashik — Agri &amp; Food Processing · Nagpur — Logistics &amp; Warehousing · Mumbai — IT &amp; Emerging Tech · Kolhapur — Engineering &amp; Manufacturing.</span> <span className="demo-note">Illustrative assignments for demo.</span></div>
      <div className="grid xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <div className="flex items-center gap-2 mb-3 text-[12px] font-bold text-slate-500"><span><span className="badge-dot bg-rose-500" />Critical gap</span><span><span className="badge-dot bg-amber-400" />Moderate</span><span><span className="badge-dot bg-emerald-500" />Balanced</span></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{DISTRICTS.map((x) => <DistrictCard key={x.n} d={x} selected={x.n === d.n} onSelect={pick} />)}</div>
        </div>
        <div className="card p-5 h-fit xl:sticky xl:top-[140px]">
          <div className="flex items-center gap-2 mb-1"><h3 className="font-extrabold text-[16px]">{d.n} — Skill Intelligence</h3><span className="chip bg-blue-50 text-blue-700">{d.s}</span></div>
          <p className="text-[12px] text-slate-500 mb-3">{isPune ? <span>Top sector: <b>Automotive / EV</b> · Focus role: <b>EV Service Technician</b></span> : 'Digital twin · shortages, industries, supply'} · <span className="demo-note">Demo data</span></p>
          <div className="grid grid-cols-3 gap-2 mb-3 text-center">
            <div className="rounded-xl bg-rose-50 border border-rose-100 p-2.5"><div className="text-lg font-extrabold text-rose-600">{d.gap}%</div><div className="text-[10px] font-bold uppercase text-slate-500">Skill gap</div></div>
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-2.5"><div className="text-lg font-extrabold text-blue-700">{d.supply}</div><div className="text-[10px] font-bold uppercase text-slate-500">Supply/yr</div></div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-2.5"><div className="text-lg font-extrabold text-emerald-700">{d.score}</div><div className="text-[10px] font-bold uppercase text-slate-500">Readiness</div></div>
          </div>
          {isPune && (
            <>
              <div className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Top demanded skills</div>
              <div className="flex flex-wrap gap-1.5 mb-3">{['EV Diagnostics', 'Battery Management Systems', 'CAN Protocol', 'EV Safety', 'Vehicle Diagnostics'].map((s) => <span key={s} className="chip bg-blue-50 text-blue-700 border border-blue-100">{s}</span>)}</div>
              <div className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Role · Demand · Supply · Gap · Priority</div>
              <div className="space-y-1.5 mb-3">{PUNE_ROLES.map((x) => <div key={x.r} className="flex items-center gap-2 border rounded-lg px-2.5 py-2 text-[12.5px]"><span className="flex-1 font-bold">{x.r}</span><span className="text-slate-500 font-medium">{x.dem}/{x.sup}</span>{x.pr === 'Critical' ? <span className="chip bg-rose-600 text-white">CRITICAL</span> : <span className="chip bg-amber-100 text-amber-800">HIGH</span>}</div>)}</div>
              <div className="grid grid-cols-2 gap-2 mb-1"><button className="btn-p justify-center" onClick={() => navigate('/government/skill-gaps')}><ScanSearch className="w-4 h-4" />View Skill Gap</button><button className="btn-g justify-center" onClick={() => navigate('/government/curriculum')}>View Courses</button></div>
            </>
          )}
          <div className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 mt-2">Active industries</div>
          <div className="flex flex-wrap gap-1.5 mb-3">{d.ind.map((x) => <span key={x} className="chip bg-slate-900 text-white">{x}</span>)}</div>
          <div className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Recommended 2026–27 quotas</div>
          {Object.entries(d.quota).map(([k, v]) => <div key={k} className="flex justify-between text-[13px] font-semibold py-1.5 border-b border-dashed"><span>{k} seats</span><b className="text-blue-700">+{v.toLocaleString('en-IN')}</b></div>)}
          <div className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mt-3 mb-1.5">Equipment allocation</div>
          <DistrictEquip equip={d.equip} />
          <button className="btn-p w-full justify-center mt-4" onClick={() => setPlanOpen(true)}><FileDown className="w-4 h-4" />Generate District Training Plan</button>
        </div>
      </div>
      {planOpen && <DistrictPlanModal d={d} onClose={() => setPlanOpen(false)} notify={toast} />}
    </div>
  );
}

