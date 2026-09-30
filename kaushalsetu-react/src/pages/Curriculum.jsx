import { useState } from 'react';
import { Radar, AlertTriangle, Wand2, Send } from 'lucide-react';
import { COURSES, OBSOLETE, MAPPER } from '../data/demoData';
import { DemoBadge, KPICard } from '../components/ui';
import { CourseTable } from '../components/domain';
import { CourseDetailModal, CurriculumRecommendationModal } from '../components/modals';
import CurriculumGenerator from '../components/CurriculumGenerator';
import { useApp } from '../hooks/AppContext';

export default function Curriculum() {
  const { toast } = useApp();
  const [mapperCourse, setMapperCourse] = useState('Auto-Mechanic (Motor Vehicle)');
  const [detailIdx, setDetailIdx] = useState(null);
  const [recCourse, setRecCourse] = useState(null);
  const m = MAPPER[mapperCourse];
  const top = m.kw[0];

  return (
    <div className="fade-in">
      <div className="flex flex-wrap items-end gap-3 mb-5"><div><h1 className="text-2xl font-extrabold tracking-tight">Curriculum Alignment &amp; Obsolescence Radar</h1><p className="text-[13px] text-slate-500 mt-1">NSQF-aligned obsolescence detection · compares <b>1,842 QP-NOS packets</b> vs live industry keywords · <DemoBadge label="Demo data" /></p></div><div className="flex-1" /><button className="btn-g" onClick={() => toast('Re-ran obsolescence scan across 1,842 courses — 14 flags updated', 'ok')}><Radar className="w-4 h-4" />Re-run Scan</button></div>
      <div className="grid md:grid-cols-4 gap-3 mb-4">{[['Courses Scanned', '1,842', '#2563EB', 'ScanLine'], ['Flagged Obsolete', '14', '#E11D48', 'AlertOctagon'], ['Avg Placement Drop', '−23 pts', '#D97706', 'TrendingDown'], ['Modules Injected (Q)', '47', '#059669', 'Syringe']].map(([l, v, c, i]) => <KPICard key={l} l={l} v={v} d={l} c={c} bg={c + '15'} i={i} />)}</div>

      <div className="card p-5 mb-4 overflow-x-auto">
        <div className="flex flex-wrap items-center gap-2 mb-2"><h3 className="font-extrabold text-[15px]">Course · Industry Alignment · Status</h3><DemoBadge /><div className="flex-1" /><span className="demo-note">Click a course for detail + AI recommendation</span></div>
        <CourseTable courses={COURSES} onView={setDetailIdx} />
      </div>

      <div className="mb-4"><CurriculumGenerator /></div>

      <div className="card p-4 mb-6"><div className="flex flex-wrap items-center gap-2"><h3 className="font-extrabold text-[14px]">Course Health</h3><span className="chip bg-emerald-50 text-emerald-700">Aligned</span><span className="chip bg-amber-50 text-amber-700">Review Required</span><span className="chip bg-rose-50 text-rose-700">At Risk</span><span className="chip bg-violet-50 text-violet-700">Oversupplied</span><div className="flex-1" /><span className="demo-note">Demo labels — not official obsolescence findings</span></div>
        <div className="grid md:grid-cols-3 gap-2 mt-3 text-[12.5px] font-semibold"><div className="border rounded-xl p-3"><b>Legacy Data Entry Operator</b> — <span className="text-violet-700 font-bold">Oversupplied</span></div><div className="border rounded-xl p-3"><b>Traditional Machine Operator</b> — <span className="text-amber-700 font-bold">Review Required</span></div><div className="border rounded-xl p-3"><b>EV Technician</b> — <span className="text-blue-700 font-bold">High Demand / Low Supply</span></div></div></div>

      <h3 className="font-extrabold text-[15px] mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-600" />Obsolete &amp; Oversupplied Course Alert Board</h3>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
        {OBSOLETE.map((o) => {
          const col = o.risk > 80 ? '#E11D48' : o.risk > 65 ? '#D97706' : '#64748B';
          return (
            <div key={o.course} className="card p-4 border-t-4" style={{ borderTopColor: col }}>
              <div className="flex items-start gap-2"><div className="flex-1"><div className="font-extrabold text-[13.5px] leading-snug">{o.course}</div><div className="text-[11.5px] text-slate-500 font-semibold mt-0.5">{o.trade} · Placement {o.place}</div></div><span className="chip text-white" style={{ background: col }}>{o.risk}% risk</span></div>
              <p className="text-[12.5px] text-slate-600 mt-2 leading-relaxed">{o.issue}</p>
              <div className="rounded-xl bg-slate-50 border p-2.5 mt-2 text-[12.5px]"><b className="text-teal-700">✦ Recommendation:</b> {o.rec}</div>
              <div className="flex gap-1.5 mt-3">{['Deprecate', 'Overhaul', 'Merge'].map((a) => <button key={a} onClick={() => toast(`<b>“${a}”</b> recommended for <b>${o.course}</b> — sent to NCVET Board for approval.`, 'alert')} className={`flex-1 text-[12px] font-bold py-2 rounded-lg border transition ${o.action === a ? 'bg-slate-900 text-white border-slate-900' : 'bg-white hover:border-slate-900 text-slate-700'}`}>{a}</button>)}</div>
              <button className="btn-p w-full justify-center mt-2 !text-[12px]" onClick={() => toast(`<b>“${o.action}”</b> recommended for <b>${o.course}</b> — sent to NCVET Board for approval.`, 'alert')}><Send className="w-3.5 h-3.5" />Recommend: {o.action}</button>
            </div>
          );
        })}
      </div>

      <div className="card p-5">
        <div className="flex flex-wrap items-center gap-3 mb-1"><h3 className="font-extrabold text-[15px]">Dynamic Curriculum Recommender — Module Mapper</h3><div className="flex-1" />
          <select className="inp !w-64" value={mapperCourse} onChange={(e) => setMapperCourse(e.target.value)}>{Object.keys(MAPPER).map((k) => <option key={k}>{k}</option>)}</select></div>
        <p className="text-[12px] text-slate-500 mb-4">Current syllabus topics vs real-time industry keywords · injection suggestions with NSQF level mapping</p>
        <div className="grid lg:grid-cols-2 gap-4">
          <div><h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-2">Current syllabus coverage</h4><div className="space-y-2">{m.syll.map(([t, c]) => <div key={t} className="border rounded-xl p-2.5"><div className="flex justify-between text-[12.5px] font-bold mb-1"><span>{t}</span><span style={{ color: c < 40 ? '#E11D48' : '#059669' }}>{c}%</span></div><div className="progress"><div style={{ width: c + '%', background: c < 40 ? '#E11D48' : '#059669' }} /></div></div>)}</div></div>
          <div><h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-2">Industry keyword demand (live)</h4><div className="space-y-2">{m.kw.map(([t, c]) => <div key={t} className="border rounded-xl p-2.5 flex items-center gap-2"><div className="flex-1"><div className="flex justify-between text-[12.5px] font-bold mb-1"><span>{t}</span><span className="text-blue-700">idx {c}</span></div><div className="progress"><div style={{ width: c + '%', background: '#2563EB' }} /></div></div><button className="btn-g !py-1.5 !px-2.5 !text-[11px]" onClick={() => toast(`“${t}” queued for NSQF injection proposal`, 'ok')}>+ Inject</button></div>)}</div></div>
        </div>
        <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50 p-4">
          <div className="flex flex-wrap items-center gap-2"><span className="chip bg-teal-600 text-white">✦ SUGGESTED INJECTION</span><b className="text-[13.5px]">Add “{top[0]}” ({top[1]} demand) → {mapperCourse}</b><div className="flex-1" /><button className="btn-p !text-[12px]" onClick={() => toast(`Curriculum update recommended to NCVET Board — ${top[0]} (120 hrs, NSQF L4)`, 'ok')}><Wand2 className="w-3.5 h-3.5" />Recommend to NCVET</button></div>
          <p className="text-[12.5px] text-teal-900 mt-1.5">Replaces lowest-coverage topic · +18% projected placement lift · co-certification available from 3 employers.</p>
        </div>
      </div>

      {detailIdx !== null && <CourseDetailModal course={COURSES[detailIdx]} onClose={() => setDetailIdx(null)} onRecommend={(c) => { setDetailIdx(null); setRecCourse(c); }} notify={toast} />}
      {recCourse && <CurriculumRecommendationModal course={recCourse} onClose={() => setRecCourse(null)} notify={toast} />}
    </div>
  );
}

