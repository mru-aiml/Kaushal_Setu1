import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { SIGNAL_POSTING } from '../data/demoData';
import { DemoBadge } from '../components/ui';
import { ForecastChart } from '../components/charts';
import { useApp } from '../hooks/AppContext';

export default function Signals() {
  const { toast } = useApp();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const analyze = () => { setDone(true); toast('Job posting analyzed — 5 skills extracted, demand HIGH.', 'ok'); };

  return (
    <div className="fade-in">
      <div className="flex flex-wrap items-end gap-3 mb-5"><div><h1 className="text-2xl font-extrabold tracking-tight">Labour-Market Signals &amp; Job Signal Analyzer</h1><p className="text-[13px] text-slate-500 mt-1">How KAUSHALSETU extracts skills from job-market signals · <DemoBadge label="Mock AI · demo" /></p></div><div className="flex-1" /><button className="btn-p" onClick={analyze}><Zap className="w-4 h-4" />Analyze Job Posting</button></div>
      <div className="grid xl:grid-cols-2 gap-4">
        <div className="card p-5"><h3 className="font-extrabold text-[15px] mb-1">Sample Job Posting</h3><p className="text-[12px] text-slate-500 mb-3">Role: <b>{SIGNAL_POSTING.role}</b> · Location: <b>{SIGNAL_POSTING.location}</b></p>
          <div className="rounded-xl bg-slate-50 border p-4 text-[13px] leading-relaxed">We are hiring an <b>{SIGNAL_POSTING.role}</b> in {SIGNAL_POSTING.location}. Required: {SIGNAL_POSTING.required.join(', ')}. Experience with HV safety preferred.</div>
          <div className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mt-3 mb-1.5">Required skills (posting)</div>
          <div className="flex flex-wrap gap-1.5">{SIGNAL_POSTING.required.map((s) => <span key={s} className="chip bg-slate-100 text-slate-700">{s}</span>)}</div>
          <button className="btn-p mt-4" onClick={analyze}>Analyze Job Posting</button></div>
        <div className="card p-5">
          <h3 className="font-extrabold text-[15px]">Extracted Demand Signal {done && <span className="chip bg-emerald-50 text-emerald-700 ml-1">High demand</span>}</h3>
          {!done && <><p className="text-[12px] text-slate-500 mb-3">Click “Analyze Job Posting” to run the mock extraction.</p><div className="rounded-xl border border-dashed p-4 text-[13px] text-slate-500">Awaiting analysis…</div></>}
          {done && (
            <div className="fade-in">
              <div className="mt-3 space-y-2 text-[13px]">
                <div className="flex justify-between border-b border-dashed py-1.5"><span className="text-slate-500 font-semibold">Extracted role</span><b>{SIGNAL_POSTING.role}</b></div>
                <div className="flex justify-between border-b border-dashed py-1.5"><span className="text-slate-500 font-semibold">Sector</span><b>{SIGNAL_POSTING.sector}</b></div>
                <div className="flex justify-between border-b border-dashed py-1.5"><span className="text-slate-500 font-semibold">Location</span><b>{SIGNAL_POSTING.location}</b></div>
              </div>
              <div className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mt-3 mb-1.5">Extracted skills</div>
              <div className="flex flex-wrap gap-1.5">{SIGNAL_POSTING.required.map((s) => <span key={s} className="chip bg-emerald-50 text-emerald-700 border border-emerald-100">✓ {s}</span>)}</div>
              <div className="rounded-xl bg-[#0F172A] text-white p-3.5 mt-4 text-[12.5px]"><b>Demand signal: HIGH</b> — routed to Skill Gap Analysis → EV Technician curriculum (54%). <button className="text-teal-300 font-bold" onClick={() => navigate('/government/skill-gaps')}>Open gap →</button></div>
              <p className="demo-note mt-2">Demo AI response — illustrative extraction. No external LLM call in Phase 1.</p>
            </div>
          )}
        </div>
      </div>
      <div className="card p-5 mt-4"><div className="flex flex-wrap items-center gap-2 mb-1"><h3 className="font-extrabold text-[15px]">Skill Demand Trend (illustrative)</h3><DemoBadge label="Illustrative demand trend" /></div><p className="text-[12px] text-slate-500 mb-2">2024–2027 · EV Diagnostics · Industrial Automation · AI/Data</p><div className="h-[240px]"><ForecastChart /></div></div>
    </div>
  );
}

