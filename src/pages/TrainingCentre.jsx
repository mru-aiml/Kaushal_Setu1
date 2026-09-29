import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Wrench, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PUNE_SCENARIO, COURSES, GAP_ROWS } from '../data/demoData';
import { DemoBadge, StatusBadge, SectionHeader } from '../components/ui';
import { SkillGapTable } from '../components/domain';
import CurriculumGenerator from '../components/CurriculumGenerator';
import { useApp } from '../hooks/AppContext';
import { useStats, DemoOrLiveChip } from '../hooks/useStats.jsx';

function Bar({ cur, req, color }) {
  return (
    <div>
      <div className="flex justify-between text-[12.5px] font-bold mb-1"><span>{cur} / {req}</span><span className="text-slate-500">Gap +{req - cur}</span></div>
      <div className="progress"><div style={{ width: Math.round((cur / req) * 100) + '%', background: color }} /></div>
    </div>
  );
}

const alignColor = (a) => (a < 60 ? '#E11D48' : a < 80 ? '#F59E0B' : '#059669');

export default function TrainingCentre({ section }) {
  const s = PUNE_SCENARIO;
  const navigate = useNavigate();
  const { toast } = useApp();
  const { data: live, local: statsLocal } = useStats('trainingCentre');

  const kpis = !statsLocal && live && !live.empty ? [
    { l: 'My Courses', v: String(live.courses.total), d: `${live.courses.real} live records`, c: '#2563EB', bg: '#EFF6FF', i: BookOpen },
    { l: 'Courses Needing Review', v: String(live.needReview), d: 'Status ≠ Aligned', c: '#D97706', bg: '#FFFBEB', i: AlertTriangle },
    { l: 'Trainers Below Bar', v: String(live.lowScoreTrainers), d: `of ${live.trainers} trainers`, c: '#E11D48', bg: '#FFF1F2', i: Users },
    { l: 'Enrolments', v: String(live.enrolments.total), d: `${live.seats ? Math.round((live.enrolled / live.seats) * 100) : 0}% seat fill`, c: '#7C3AED', bg: '#F5F3FF', i: Wrench },
  ] : [
    { l: 'Courses', v: '12', d: 'Active NSQF-aligned', c: '#2563EB', bg: '#EFF6FF', i: BookOpen },
    { l: 'Courses Requiring Update', v: '3', d: 'EV · CNC · Electrical', c: '#D97706', bg: '#FFFBEB', i: AlertTriangle },
    { l: 'Trainer Gaps', v: '2', d: 'HV + diagnostics roles', c: '#E11D48', bg: '#FFF1F2', i: Users },
    { l: 'Equipment Gaps', v: '4', d: 'Rigs · kits · benches', c: '#7C3AED', bg: '#F5F3FF', i: Wrench },
  ];

  useEffect(() => {
    if (section) {
      const el = document.getElementById(`tc-${section}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [section]);

  return (
    <div className="fade-in">
      <SectionHeader
        title="Training Centre Dashboard"
        sub={`${s.district} Skill Development Centre · ${s.sector} · ${s.course}`}
        right={<DemoBadge />}
      />

      {/* KPIs — live centre records when the backend is connected, demo snapshot otherwise */}
      {!statsLocal && live && <div className="flex items-center gap-2 mb-2"><span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Centre metrics</span><DemoOrLiveChip demo={live.demo} empty={live.empty} /></div>}
      {!statsLocal && live?.empty && (
        <div className="card p-5 mb-5 text-center">
          <p className="text-[14px] font-extrabold">No data available yet</p>
          <p className="text-[12.5px] text-slate-500 font-medium mt-1">Add courses, batches and trainers in Manage Data to populate this dashboard.</p>
          <button className="btn-p mt-3 !text-[12px]" onClick={() => navigate('/training-centre/data')}>Open Manage Data <ArrowRight className="w-4 h-4" /></button>
        </div>
      )}
      <div id="tc-dashboard" className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4 mb-5 scroll-mt-24">
        {kpis.map((k) => (
          <div key={k.l} className="card p-4 flex gap-3 items-start">
            <div className="kpi-ico" style={{ background: k.bg, color: k.c }}><k.i className="w-5 h-5" /></div>
            <div><div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{k.l}</div>
              <div className="text-[22px] font-extrabold tracking-tight">{k.v}</div>
              <div className="text-[11.5px] font-semibold" style={{ color: k.c }}>{k.d}</div></div>
          </div>
        ))}
      </div>

      {/* Course alignment */}
      <div id="tc-alignment" className="card p-5 mb-4 scroll-mt-24">
        <div className="flex flex-wrap items-center gap-2 mb-1"><h3 className="font-extrabold text-[15px]">Course Alignment</h3><DemoBadge label="Same data as Government view" /><div className="flex-1" /></div>
        <p className="text-[12px] text-slate-500 mb-3">Industry alignment of active courses · {s.district}</p>
        <div id="tc-courses" className="space-y-3 scroll-mt-24">
          {COURSES.slice(0, 3).map((c) => (
            <div key={c.c} className="border rounded-xl p-4 hover:border-blue-400 transition">
              <div className="flex flex-wrap items-center gap-2">
                <b className="text-[14px]">{c.c === 'EV Technician' ? 'EV Technician' : c.c}</b>
                <StatusBadge status={c.st} />
                <div className="flex-1" />
                <b className="text-[15px]" style={{ color: alignColor(c.align) }}>{c.align}%</b>
              </div>
              <div className="progress mt-2"><div style={{ width: c.align + '%', background: alignColor(c.align) }} /></div>
              <div className="text-[12px] text-slate-500 font-medium mt-1.5">
                {c.c === 'EV Technician' ? <span className="font-bold" style={{ color: alignColor(c.align) }}>Needs Update</span>
                  : c.c === 'Automotive Technician' ? <span className="font-bold text-emerald-600">Aligned</span>
                    : <span className="font-bold text-amber-600">Review</span>}
                {c.miss ? ` · Missing: ${c.miss}` : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid xl:grid-cols-2 gap-4 mb-4">
        {/* Training capacity */}
        <div id="tc-equipment" className="card p-5 scroll-mt-24">
          <h3 className="font-extrabold text-[15px]">Training Capacity</h3>
          <p className="text-[12px] text-slate-500 mb-4">{s.course} · {s.district}</p>
          <div className="space-y-4">
            <div><div className="text-[12px] font-bold mb-1.5">Seats: {s.seats.current} / {s.seats.required}</div><Bar cur={s.seats.current} req={s.seats.required} color="linear-gradient(90deg,#2563EB,#0D9488)" /></div>
            <div id="tc-trainers" className="scroll-mt-24"><div className="text-[12px] font-bold mb-1.5">Trainers: {s.trainers.current} / {s.trainers.required}</div><Bar cur={s.trainers.current} req={s.trainers.required} color="#F59E0B" /></div>
            <div><div className="text-[12px] font-bold mb-1.5">Equipment: {s.equipment.current} / {s.equipment.required}</div><Bar cur={s.equipment.current} req={s.equipment.required} color="#7C3AED" /></div>
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 border p-3 text-[12.5px] font-semibold text-slate-600">Gap: +{s.seats.gap} seats · +{s.trainers.gap} trainers · +{s.equipment.gap} equipment</div>
        </div>

        {/* Recommendations */}
        <div id="tc-recommendations" className="card p-5 border-t-4 scroll-mt-24" style={{ borderTopColor: '#0D9488' }}>
          <h3 className="font-extrabold text-[15px]">KaushalSetu Recommendations</h3>
          <p className="text-[12px] text-slate-500 mb-3">Generated from the Government skill-gap analysis</p>
          <div className="space-y-2.5">
            {[
              ['Update EV curriculum', `Add ${s.skills.slice(0, 3).join(', ')} modules — alignment ${s.alignment}% → 85% target.`],
              ['Upskill trainers', `Certify +${s.trainers.gap} trainers in HV safety & BMS diagnostics (ARAI).`],
              ['Add EV diagnostic equipment', `Procure +${s.equipment.gap} EV diagnostic rigs & HV safety kits.`],
            ].map(([t, d], i) => (
              <div key={t} className="rec-box flex gap-3 items-start">
                <span className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-extrabold text-[13px] shrink-0">{i + 1}</span>
                <div><div className="text-[13.5px] font-extrabold">{t}</div><div className="text-[12.5px] text-slate-600 font-medium">{d}</div></div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <button className="btn-p !text-[12px]" onClick={() => { toast('<b>Implementation plan</b> drafted — EV curriculum update + trainer upskilling queued.', 'ok'); navigate('/training-centre/plans'); }}>Start Implementation <ArrowRight className="w-4 h-4" /></button>
            <button className="btn-g !text-[12px]" onClick={() => toast('Requirement forwarded to Government dashboard for approval', 'info')}>Request Approval</button>
          </div>
        </div>
      </div>

      {/* Skill gaps + industry requirements */}
      <div className="grid xl:grid-cols-2 gap-4">
        <div id="tc-gaps" className="card p-5 overflow-x-auto scroll-mt-24">
          <h3 className="font-extrabold text-[15px] mb-1">Skill Gaps Affecting My Courses</h3>
          <p className="text-[12px] text-slate-500 mb-3">{s.district} · {s.sector}</p>
          <SkillGapTable rows={GAP_ROWS} />
        </div>
        <div id="tc-requirements" className="card p-5 scroll-mt-24">
          <h3 className="font-extrabold text-[15px] mb-1">Industry Requirements</h3>
          <p className="text-[12px] text-slate-500 mb-3">Validated by ABC Automotive Pvt. Ltd.</p>
          <div className="space-y-2">
            {s.skills.map((sk) => (
              <div key={sk} className="flex items-center gap-2 border rounded-xl px-3 py-2.5 text-[13px] font-bold"><CheckCircle2 className="w-4 h-4 text-emerald-600" />{sk}<span className="ml-auto chip bg-emerald-50 text-emerald-700 border border-emerald-100">VALIDATED</span></div>
            ))}
          </div>
          <button className="btn-g mt-4 !text-[12px]" onClick={() => navigate('/training-centre/demand')}>View Labour-Market Demand <ArrowRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Real AI curriculum generation (backend LLM) */}
      <div className="mt-4"><CurriculumGenerator /></div>
    </div>
  );
}


