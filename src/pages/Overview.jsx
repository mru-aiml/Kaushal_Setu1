import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, FileDown, SlidersHorizontal, RefreshCw, BrainCircuit, Sheet, FileText } from 'lucide-react';
import { KPI_CARDS, SKILLS, JOBS } from '../data/demoData';
import { KPICard, DemoBadge } from '../components/ui';
import { DemandSupplyChart, SectorChart } from '../components/charts';
import { ExportButtons } from '../components/domain';
import { useApp } from '../hooks/AppContext';
import { prototypeExport as mockDownload } from '../services/exportService';
import { api, saveBlob } from '../services/api';
import { useStats, DemoOrLiveChip } from '../hooks/useStats.jsx';

const SECTORS = ['All Sectors', 'Electric Vehicles', 'IT & AI/ML', 'Healthcare', 'Renewable Energy', 'Precision Manufacturing', 'Logistics', 'Green Hydrogen'];

export default function Overview() {
  const { toast } = useApp();
  const navigate = useNavigate();
  const [fState, setFState] = useState('All India');
  const [fDistrict, setFDistrict] = useState('All Districts');
  const [fSector, setFSector] = useState('all');
  const [fLevel, setFLevel] = useState('all');
  const [fTime, setFTime] = useState('Last 30 days');
  const [q, setQ] = useState('');
  const [jobQ, setJobQ] = useState('');
  const [tab, setTab] = useState('all');
  const [jobs, setJobs] = useState(JOBS);
  const [exporting, setExporting] = useState(false);
  const { data: live, local: statsLocal } = useStats('government');

  const rows = useMemo(() => SKILLS.filter((s) => (fSector === 'all' || s.sector === fSector) && (fLevel === 'all' || s.level === fLevel) && (!q || s.skill.toLowerCase().includes(q.toLowerCase()))), [fSector, fLevel, q]);
  const shown = rows.length ? rows : SKILLS;
  const feed = jobs.filter((j) => !jobQ || (j.co + j.role + j.skills.join(' ')).toLowerCase().includes(jobQ.toLowerCase()));
  const activeN = [fState, fDistrict, fSector, fLevel].filter((v) => v !== 'all' && v !== 'All India' && v !== 'All Districts').length + 1;

  const switchTab = (k) => { setTab(k); setFSector(k === 'all' ? 'all' : k === 'EV' ? 'Electric Vehicles' : k === 'AI' ? 'IT & AI/ML' : 'Healthcare'); };
  const crawl = () => { toast('Crawling 12 job portals + Apprenticeship portal…', 'info'); setTimeout(() => { setJobs((j) => [{ co: 'Ather Energy · Hosur', role: 'HV Systems Associate', skills: ['BMS', 'HV wiring', 'Testing'], seats: 90, type: 'Full-time', time: 'just now', surge: '+44% YoY' }, ...j]); toast('<b>312 new job signals</b> indexed — EV Battery Diagnostics +2.1 pts.', 'ok'); }, 1200); };
  const badge = (s) => s === 'Critical' ? <span className="chip bg-rose-50 text-rose-700 border border-rose-100">● Critical</span> : s === 'High' ? <span className="chip bg-amber-50 text-amber-700 border border-amber-100">● High</span> : s === 'Emerging' ? <span className="chip bg-violet-50 text-violet-700 border border-violet-100">● Emerging</span> : <span className="chip bg-slate-100 text-slate-600">● Watch</span>;
  const quickReport = async () => {
    if (statsLocal) {
      toast('Connect the backend API to generate live reports. Use top-bar Reports when connected.', 'info');
      return;
    }
    setExporting(true);
    try {
      const out = await api.post('/api/reports/generate', { type: 'skill-demand', filters: {}, format: 'pdf' });
      const file = await api.download(`/api/reports/${out.id}/download`, out.filename);
      saveBlob(file);
      toast(`<b>${file.filename}</b> downloaded — real PDF from ${out.rows} stored records.`, 'ok');
    } catch (e) {
      toast(e.message, 'alert');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="card p-5 lg:p-6 mb-5 border-t-4" style={{ borderTopColor: '#2563EB' }}>
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex-1 min-w-[240px]">
            <div className="flex items-center gap-2 flex-wrap"><span className="chip bg-slate-900 text-white">KAUSHALSETU</span><span className="chip bg-teal-50 text-teal-700 border border-teal-100">Labour-Market Intelligence &amp; Curriculum Alignment Platform</span><DemoBadge /></div>
            <h1 className="text-2xl lg:text-[28px] font-extrabold tracking-tight mt-2">Aligning Maharashtra&apos;s Skills with Tomorrow&apos;s Jobs</h1>
            <p className="text-[13px] text-slate-500 font-medium mt-1">AI-powered labour-market intelligence for demand-driven courses, capacity planning and career pathways. Demo: <b>Pune · Automotive / EV · EV Service Technician</b></p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
              {[['Job Postings', '48,210 signals'], ['Employer Demand', '2,314 employers'], ['Sector Trends', 'EV +42% YoY'], ['Emerging Tech', 'BMS · CAN · HV']].map(([l, v]) => <div key={l} className="rounded-xl bg-slate-50 border px-3 py-2"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{l}</div><div className="font-extrabold text-[14px]">{v}</div></div>)}
            </div>
          </div>
          <div className="w-full lg:w-[300px] rounded-2xl bg-[#0F172A] text-white p-4">
            <div className="text-[11px] font-bold uppercase tracking-widest text-teal-300">KaushalSetu pipeline</div>
            <div className="mt-2 text-[12.5px] font-semibold leading-loose">Industry Signals → Skill Intelligence → Skill Gaps → Course Alignment → District Training Plans</div>
            <div className="mt-1 text-[12px] text-slate-300">Industry Demand → Skill Gap → Curriculum → Capacity → <b className="text-white">Job-Ready Talent</b></div>
            <button className="mt-3 w-full text-[13px] font-bold bg-white text-navy rounded-xl py-2 hover:bg-teal-100 transition" onClick={() => navigate('/government/districts/pune')}>Start demo: open Pune →</button>
            <div className="demo-note !text-slate-400 mt-2">Illustrative prototype scenario. Not official statistics.</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 mb-5">
        <div><h2 className="text-xl font-extrabold tracking-tight">Government Dashboard</h2><p className="text-[13px] text-slate-500 font-medium mt-1">Demand–supply intelligence · Maharashtra focus · <DemoBadge /></p></div>
        <div className="flex-1" />
        <button className="btn-g" onClick={() => { setFState('All India'); setFDistrict('All Districts'); setFSector('all'); setFLevel('all'); setQ(''); toast('Dashboard filters reset to national view', 'ok'); }}><RotateCcw className="w-4 h-4" />Reset</button>
        <button className="btn-p" disabled={exporting} onClick={quickReport}><FileDown className="w-4 h-4" />{exporting ? 'Generating…' : 'Export Report'}</button>
      </div>

      {!statsLocal && live ? (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2"><span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Live platform metrics</span><DemoOrLiveChip demo={live.demo} /></div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
            <KPICard l="Skills Tracked" v={String(live.skills.total)} d={`${live.skills.real} live records`} c="#2563EB" bg="#EFF6FF" i="DatabaseZap" />
            <KPICard l="Critical Skill Gaps" v={String(live.criticalGaps.total)} d="High-gap records" c="#E11D48" bg="#FFF1F2" i="TrendingUp" />
            <KPICard l="Training Centres" v={String(live.centres.total)} d="Registered centres" c="#0D9488" bg="#F0FDFA" i="Map" />
            <KPICard l="Placement Rate" v={`${live.placementRate}%`} d={`${live.employerDemand.total} demand records`} c="#D97706" bg="#FFFBEB" i="AlertTriangle" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4 mb-5">{KPI_CARDS.map((k) => <KPICard key={k.l} {...k} />)}</div>
      )}

      <div className="card p-4 mb-5">
        <div className="flex items-center gap-2 mb-3 text-[13px] font-bold"><SlidersHorizontal className="w-4 h-4 text-slateblue" />Interactive Filters <span className="chip bg-blue-50 text-blue-700">{activeN} active</span></div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">State</label><select className="inp mt-1" value={fState} onChange={(e) => setFState(e.target.value)}>{['All India', 'Maharashtra', 'Tamil Nadu', 'Karnataka', 'Gujarat', 'Uttar Pradesh', 'Telangana', 'Madhya Pradesh'].map((o) => <option key={o}>{o}</option>)}</select></div>
          <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">District</label><select className="inp mt-1" value={fDistrict} onChange={(e) => setFDistrict(e.target.value)}>{['All Districts', 'Pune', 'Coimbatore', 'Bengaluru Urban', 'Indore', 'Ahmedabad', 'Hyderabad', 'Lucknow', 'Nashik'].map((o) => <option key={o}>{o}</option>)}</select></div>
          <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Sector</label><select className="inp mt-1" value={fSector} onChange={(e) => setFSector(e.target.value)}><option value="all">All Sectors</option>{SECTORS.slice(1).map((o) => <option key={o}>{o}</option>)}</select></div>
          <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Proficiency</label><select className="inp mt-1" value={fLevel} onChange={(e) => setFLevel(e.target.value)}><option value="all">All Levels</option><option>Entry</option><option>Mid</option><option>Senior</option></select></div>
          <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Time Horizon</label><select className="inp mt-1" value={fTime} onChange={(e) => setFTime(e.target.value)}>{['Last 30 days', 'Last 90 days', '12-month forecast', '3-year outlook'].map((o) => <option key={o}>{o}</option>)}</select></div>
          <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Search skills</label><input className="inp mt-1" placeholder="e.g. EV battery, PLC…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        </div>
      </div>

      <div className="grid xl:grid-cols-3 gap-4 mb-4">
        <div className="card p-5 xl:col-span-2">
          <div className="flex flex-wrap items-center gap-2 mb-1"><h3 className="font-extrabold text-[15px]">Real-Time Skill Demand vs. Institute Supply</h3><span className="chip bg-emerald-50 text-emerald-700">● Live crawl</span><div className="flex-1" />
            <div className="flex gap-1 bg-slate-100 rounded-full p-1">{[['all', 'All'], ['EV', 'EV'], ['AI', 'AI/ML'], ['Health', 'Health']].map(([k, l]) => <button key={k} className={`tab-b ${tab === k ? 'active' : ''}`} onClick={() => switchTab(k)}>{l}</button>)}</div></div>
          <p className="text-[12px] text-slate-500 mb-3">Indexed from 48,210 job postings + 1,204 ITI/Polytechnic outputs · <span className="font-bold text-slate-700">{shown.length} high-demand skills</span></p>
          <div className="h-[290px]"><DemandSupplyChart rows={shown} /></div>
        </div>
        <div className="card p-5">
          <h3 className="font-extrabold text-[15px]">Sector Demand Share</h3><p className="text-[12px] text-slate-500 mb-2">YoY growth in job signals</p>
          <div className="h-[220px]"><SectorChart /></div>
          <div className="mt-3 space-y-2 text-[12px] font-semibold">{[['Electric Vehicles', '+42%', '#2563EB'], ['IT & AI/ML', '+38%', '#0D9488'], ['Precision Mfg', '+27%', '#059669'], ['Healthcare', '+24%', '#E11D48'], ['Renewable + H2', '+51%', '#F59E0B']].map(([l, g, c]) => <div key={l} className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} /><span className="flex-1">{l}</span><b className="text-emerald-600">{g}</b></div>)}</div>
        </div>
      </div>

      <div className="grid xl:grid-cols-3 gap-4">
        <div className="card p-5 xl:col-span-2">
          <div className="flex flex-wrap items-center gap-2 mb-3"><h3 className="font-extrabold text-[15px] flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />Live Crawled Job Signals Feed</h3><div className="flex-1" />
            <input className="inp !w-56" placeholder="Search feed…" value={jobQ} onChange={(e) => setJobQ(e.target.value)} /><button className="btn-g !py-2" onClick={crawl}><RefreshCw className="w-4 h-4" />Crawl now</button></div>
          <div className="space-y-2.5 max-h-[430px] overflow-y-auto pr-1">
            {feed.map((j, i) => (
              <div key={i} className="border rounded-xl p-3 hover:border-blue-400 hover:shadow transition bg-white">
                <div className="flex items-start gap-2"><div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-extrabold text-[13px] shrink-0">{j.co[0]}</div>
                  <div className="flex-1 min-w-0"><div className="text-[13px] font-bold truncate">{j.role}</div><div className="text-[12px] text-slate-500 font-medium">{j.co} · {j.seats} openings · {j.type}</div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">{j.skills.map((s) => <span key={s} className="chip bg-blue-50 text-blue-700 border border-blue-100">{s}</span>)}<span className="chip bg-emerald-50 text-emerald-700 border border-emerald-100">{j.surge}</span></div></div>
                  <span className="text-[11px] text-slate-400 font-semibold whitespace-nowrap">{j.time}</span></div>
              </div>
            )) || <p className="text-[13px] text-slate-500 font-medium">No signals match.</p>}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-extrabold text-[15px]">Top Surging Skills</h3><p className="text-[12px] text-slate-500 mb-3">Demand surge · YoY</p>
          <div className="space-y-3">{[...SKILLS].sort((a, b) => parseInt(b.yoy) - parseInt(a.yoy)).slice(0, 5).map((s) => <div key={s.skill}><div className="flex justify-between text-[12.5px] font-bold mb-1"><span>{s.skill}</span><span className="text-emerald-600">{s.yoy}</span></div><div className="progress"><div style={{ width: s.demand + '%', background: 'linear-gradient(90deg,#2563EB,#0D9488)' }} /></div></div>)}</div>
          <div className="mt-4 rounded-xl bg-navy text-white p-4 bg-[#0F172A]">
            <div className="text-[13px] font-bold flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-teal-300" />AI Insight</div>
            <p className="text-[12px] text-slate-300 mt-1 leading-relaxed">EV Battery Diagnostics demand (+42% YoY) outpaces supply 4.1× in Pune–Nashik belt. Recommend +1,200 seats &amp; 2 new labs.</p>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">Demo AI response — illustrative.</p>
            <button className="mt-2 text-[12px] font-bold text-teal-300 hover:text-teal-200" onClick={() => toast('AI insight forwarded to NCVET board for review', 'ok')}>Forward to NCVET Board →</button>
          </div>
        </div>
      </div>

      <div className="card p-5 mt-4 overflow-x-auto">
        <div className="flex flex-wrap items-center gap-2 mb-2"><h3 className="font-extrabold text-[15px]">Skill-Level Demand Table</h3><div className="flex-1" /><ExportButtons onExport={(n) => mockDownload(n, toast)} /></div>
        <table className="data min-w-[760px]"><thead><tr><th>Skill Cluster</th><th>Sector</th><th>Demand Index</th><th>Supply</th><th>Gap</th><th>Trend</th><th>Status</th></tr></thead>
          <tbody>{shown.map((s) => <tr key={s.skill}><td className="font-bold">{s.skill}</td><td>{s.sector}</td><td><b>{s.demand}</b><div className="progress w-20 mt-1"><div style={{ width: s.demand + '%', background: '#2563EB' }} /></div></td><td>{s.supply}</td><td className="font-extrabold text-rose-600">−{s.gap}</td><td className="font-bold text-emerald-600">{s.yoy}</td><td>{badge(s.status)}</td></tr>)}</tbody></table>
      </div>
    </div>
  );
}


