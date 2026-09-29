import { useEffect, useState } from 'react';
import { X, Wand2, Download, Send, Loader2 } from 'lucide-react';
import { Modal } from './ui';
import { prototypeExport } from '../services/exportService';
import { aiService } from '../services/aiService';

export function CourseDetailModal({ course, onClose, onRecommend, notify }) {
  return (
    <Modal onClose={onClose}>
      <div className="p-6 bg-[#0F172A] text-white rounded-t-2xl">
        <div className="flex items-start gap-3">
          <div className="flex-1"><div className="text-[11px] font-bold uppercase tracking-widest text-teal-300">Course Alignment · Prototype</div><h2 className="text-xl font-extrabold mt-1">{course.c} — {course.align}% aligned</h2><p className="text-[12px] text-slate-300">Status: {course.st} · Priority: HIGH</p></div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
      </div>
      <div className="p-6 space-y-4 text-[13.5px]">
        <div><b>Current curriculum</b>{course.cur.map((m) => <div key={m} className="flex gap-2 mt-1.5 text-slate-700 font-medium"><span className="text-emerald-600 font-bold">✓</span>{m}</div>)}</div>
        <div><b>Missing industry skills</b>{course.miss.split(',').map((m) => <div key={m} className="flex gap-2 mt-1.5 font-semibold text-rose-700"><span>⚠</span>{m.trim()}</div>)}</div>
        <div className="rec-box"><div className="text-[12px] font-bold uppercase tracking-wider text-teal-700">AI curriculum recommendation · Priority HIGH</div>
          <div className="mt-2"><b>ADD:</b> {course.add.map((a) => <span key={a} className="chip bg-teal-600 text-white ml-1">+ {a}</span>)}</div>
          <div className="mt-2"><b>UPDATE:</b> {course.upd}</div>
          <button className="btn-p mt-3 w-full justify-center" onClick={() => onRecommend(course)}><Wand2 className="w-4 h-4" />Generate Curriculum Recommendation</button>
        </div>
      </div>
    </Modal>
  );
}

export function CurriculumRecommendationModal({ course, onClose, notify }) {
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);

  // Recommendation is generated through the centralized AI service so Phase 2
  // can swap the demo implementation for a real backend call with zero UI changes.
  useEffect(() => {
    let live = true;
    setLoading(true);
    aiService.recommendCurriculum(course).then((res) => {
      if (live) { setRec(res); setLoading(false); }
    });
    return () => { live = false; };
  }, [course]);

  const d = rec?.data;

  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center gap-2"><h2 className="font-extrabold text-lg flex-1">AI Curriculum Recommendation</h2><button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button></div>
        <p className="text-[13px] text-slate-500"><b>{course.c}</b> · {course.align}% → projected {d ? `${d.projectedAlignment}%` : '…'} alignment</p>
        <p className="demo-note mt-1">Demo AI response — illustrative output, not a production analysis.</p>
        {loading || !d ? (
          <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 border p-5 mt-3 text-[13.5px] font-bold text-slate-600" role="status">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> Generating recommendation…
          </div>
        ) : (
          <div className="mt-3 space-y-2 text-[13.5px]">
            <div className="rounded-xl bg-teal-50 border border-teal-200 p-3"><b>+ Add ({d.addHours}):</b> {d.add.join(', ')} incl. 60% practical + HV safety</div>
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-3"><b>⟳ Update:</b> {d.update}</div>
            <div className="rounded-xl bg-slate-50 border p-3"><b>Capacity link:</b> {d.capacityLink}</div>
          </div>
        )}
        <div className="flex gap-2 mt-4">
          <button className="btn-p flex-1 justify-center" disabled={loading} onClick={() => { onClose(); notify('Curriculum recommendation sent to NCVET Board for approval', 'ok'); }}><Send className="w-4 h-4" />Send to NCVET Board</button>
          <button className="btn-g" onClick={() => prototypeExport(`${course.c}-recommendation.pdf`, notify)}><Download className="w-4 h-4" />Export PDF</button>
        </div>
      </div>
    </Modal>
  );
}

export function DistrictPlanModal({ d, onClose, notify }) {
  const isPune = d.n === 'Pune';
  return (
    <Modal onClose={onClose} wide>
      <div className="p-6 bg-[#0F172A] text-white rounded-t-2xl">
        <div className="flex items-start gap-3">
          <div className="flex-1"><div className="text-[11px] font-bold uppercase tracking-widest text-teal-300">District Skill Training Plan · 2026–27 · Prototype</div><h2 className="text-xl font-extrabold mt-1">{d.n}, {d.s} — District Training Plan</h2><p className="text-[12px] text-slate-300 mt-1">Auto-generated · NSQF-aligned · Ref DSP/{d.n.slice(0, 3).toUpperCase()}/2026/114</p></div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
      </div>
      <div className="p-6 space-y-4 text-[13.5px]">
        <div><b>Priority Sectors</b><p className="text-slate-600 mt-1">{isPune ? 'EV & Automotive · Advanced Manufacturing · AI / Data' : d.ind.join(' · ')}</p></div>
        <div><b>Priority Skills</b><p className="text-slate-600 mt-1">{isPune ? 'EV Diagnostics · Battery Management · Industrial Automation · Data Analytics' : 'Mapped from live demand index'}</p></div>
        <div><b>Recommended Actions</b>
          <div className="mt-2 grid grid-cols-2 gap-2 text-center">{[['Courses to update', isPune ? '4' : Object.keys(d.quota).length], ['New courses', isPune ? '2' : '1'], ['Trainer upskilling', isPune ? '6' : '4'], ['Additional seats', isPune ? '180' : '+' + Object.values(d.quota)[0]]].map(([l, v]) => <div key={l} className="rounded-xl bg-slate-50 border p-3"><div className="font-extrabold text-lg">{v}</div><div className="text-[11px] text-slate-500 font-bold uppercase">{l}</div></div>)}
          </div>
          <div className="rounded-xl bg-teal-50 border border-teal-100 p-3 mt-2 font-medium">Equipment priority: <b>{isPune ? 'EV diagnostic systems' : d.equip[0]}</b>{isPune ? ' · +180 seats · +6 trainers · +8 equipment units' : ''}</div>
        </div>
        <div><b>Course quotas</b><div className="mt-2 space-y-1.5">{Object.entries(d.quota).map(([k, v]) => <div key={k} className="flex justify-between bg-slate-50 border rounded-lg px-3 py-2 font-semibold"><span>{k}</span><b className="text-blue-700">+{v} seats</b></div>)}</div></div>
        <div className="rounded-xl bg-[#0F172A] text-white p-4 text-center font-bold">Industry Demand → Skill Intelligence → Training Alignment<br /><span className="text-teal-300 text-[13px]">JOB-READY TALENT FOR A STRONGER MAHARASHTRA</span></div>
        <p className="demo-note">Prototype / demo output — not official statistics.</p>
        <div className="flex gap-2 pt-1">
          <button className="btn-p flex-1 justify-center" onClick={() => { prototypeExport(`District-Plan-${d.n}-2026.pdf`, notify); onClose(); }}><Download className="w-4 h-4" />Export Plan (PDF)</button>
          <button className="btn-g flex-1 justify-center" onClick={() => { prototypeExport(`District-Plan-${d.n}-2026.xlsx`, notify); onClose(); }}>Excel</button>
          <button className="btn-g flex-1 justify-center" onClick={() => { onClose(); notify(`Plan sent to District Skill Committee, ${d.n} for approval`, 'ok'); }}>Send for Approval</button>
        </div>
      </div>
    </Modal>
  );
}

import * as Icons from 'lucide-react';
function requireIcon(n) { return Icons[n] || Icons.File; }
