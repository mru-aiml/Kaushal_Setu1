import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown, Award, GraduationCap, MapPin, Star, Clock, IndianRupee, Briefcase } from 'lucide-react';
import { PUNE_SCENARIO, CAREER_PATH, TOP_SKILLS, GAP_ROWS, JOBS } from '../data/demoData';
import { DemoBadge, SectionHeader } from '../components/ui';
import { SkillGapTable } from '../components/domain';
import AICareer from '../components/AICareer';
import { useApp } from '../hooks/AppContext';
import { useStats } from '../hooks/useStats.jsx';

const COURSES = [
  { t: 'EV Fundamentals (80h)', c: 'ITI Bhosari, Pune · NSDC 4.8★', s: 'Beginner friendly · Weekend batch', tag: 'START HERE' },
  { t: 'Battery Management & BMS (120h)', c: 'ARAI Kothrud · Co-certified', s: '₹18–24k → ₹32–40k outlook', tag: 'HIGH DEMAND' },
  { t: 'EV Diagnostics Lab (100h)', c: 'Pune Skill Development Centre', s: 'Hands-on rigs · Placement linked', tag: 'PLACEMENT LINKED' },
];

export default function Candidate({ section }) {
  const s = PUNE_SCENARIO;
  const navigate = useNavigate();
  const { toast } = useApp();
  const { data: live, local: statsLocal } = useStats('candidate');

  useEffect(() => {
    if (section) {
      const el = document.getElementById(`ca-${section}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [section]);

  return (
    <div className="fade-in">
      <SectionHeader
        title="Career Navigator"
        sub="Find your path to an industry-relevant career."
        right={!statsLocal && live && !live.empty ? <span className="chip bg-emerald-50 text-emerald-700 border border-emerald-100">● LIVE: {live.skills} SKILLS · {live.education} EDUCATION · {live.certifications} CERTS</span> : <DemoBadge />}
      />

      {!statsLocal && live?.empty && (
        <div className="card p-5 mb-4 text-center border-t-4" style={{ borderTopColor: '#059669' }}>
          <p className="text-[14px] font-extrabold">Complete your profile to receive career recommendations</p>
          <p className="text-[12.5px] text-slate-500 font-medium mt-1">No skills, education or experience records yet. Add them in My Profile and Manage Data, then generate AI recommendations below.</p>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            <button className="btn-p !text-[12px]" onClick={() => navigate('/candidate/profile')}>Complete My Profile</button>
            <button className="btn-g !text-[12px]" onClick={() => navigate('/candidate/data')}>Add My Data</button>
          </div>
        </div>
      )}

      <div className="grid xl:grid-cols-3 gap-4 mb-4">
        {/* Current skills + profile */}
        <div id="ca-dashboard" className="card p-5 scroll-mt-24">
          <div id="ca-profile" className="scroll-mt-24">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center font-extrabold text-lg">AS</div>
              <div><div className="font-extrabold text-[15px]">Aarav Sharma</div><div className="text-[12px] text-slate-500 font-medium flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {s.district}, Maharashtra · Fresher</div></div>
            </div>
          </div>
          <div id="ca-skills" className="mt-4 scroll-mt-24">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><Award className="w-4 h-4" /> My Current Skills</div>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="chip bg-slate-900 text-white">Basic Automotive</span>
              <span className="chip bg-slate-100 text-slate-600 border">Two-wheeler repair</span>
              <span className="chip bg-slate-100 text-slate-600 border">Basic electricals</span>
            </div>
            <div className="mt-3 rounded-xl bg-slate-50 border p-3 text-[12.5px] font-semibold text-slate-600">Readiness for {s.role}: <b>42%</b><div className="progress mt-2"><div style={{ width: '42%', background: 'linear-gradient(90deg,#059669,#0D9488)' }} /></div></div>
          </div>
        </div>

        {/* Career path */}
        <div id="ca-navigator" className="card p-5 border-t-4 scroll-mt-24" style={{ borderTopColor: '#059669' }}>
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Recommended Career Path</div>
          <div className="flex flex-col items-stretch gap-1 mt-3">
            {CAREER_PATH.map((p, i) => (
              <div key={p}>
                <div className={`rounded-xl px-3 py-2 text-[12.5px] font-bold text-center ${i === 0 ? 'bg-slate-900 text-white' : i === CAREER_PATH.length - 1 ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 border border-emerald-100'}`}>{p}</div>
                {i < CAREER_PATH.length - 1 && <div className="flex justify-center py-0.5"><ArrowDown className="w-4 h-4 text-slate-300" /></div>}
              </div>
            ))}
          </div>
          <div id="ca-path" className="scroll-mt-24" />
        </div>

        {/* Top skills */}
        <div id="ca-gaps" className="card p-5 scroll-mt-24">
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Top Skills to Develop</div>
          <div className="space-y-2.5 mt-3">
            {TOP_SKILLS.map((t, i) => (
              <div key={t} className="flex items-center gap-3 border rounded-xl px-3 py-2.5">
                <span className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-extrabold text-[13px]">{i + 1}</span>
                <b className="text-[13.5px]">{t}</b>
                <span className="ml-auto chip bg-rose-50 text-rose-700 border border-rose-100">HIGH GAP</span>
              </div>
            ))}
          </div>
          <button className="btn-p w-full justify-center mt-4 !text-[12px]" onClick={() => toast('Enrolled interest — centre will contact you for the next batch', 'ok')}>Enquire at {s.district} Centre</button>
        </div>
      </div>

      {/* Real AI recommendations (backend LLM) */}
      <div className="mt-4"><AICareer /></div>

      <div className="grid xl:grid-cols-2 gap-4 mt-4">
        <div id="ca-courses" className="card p-5 scroll-mt-24">
          <h3 className="font-extrabold text-[15px] flex items-center gap-2"><GraduationCap className="w-4 h-4 text-emerald-600" /> Recommended Courses</h3>
          <p className="text-[12px] text-slate-500 mb-3">Aligned to {s.role} demand in {s.district}</p>
          <div className="space-y-2.5">
            {COURSES.map((c) => (
              <div key={c.t} className="border rounded-xl p-3.5 hover:border-emerald-400 transition">
                <div className="flex items-center gap-2"><b className="text-[13.5px]">{c.t}</b><span className="ml-auto chip bg-emerald-600 text-white shrink-0">{c.tag}</span></div>
                <div className="text-[12px] text-slate-500 font-medium mt-0.5 flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500" />{c.c}</div>
                <div className="text-[12px] text-slate-500 font-medium flex items-center gap-1 mt-0.5"><Clock className="w-3.5 h-3.5" />{c.s}</div>
                <button className="btn-g mt-2 !py-1.5 !text-[12px]" onClick={() => toast(`<b>${c.t}</b> — demo enrolment noted.`, 'ok')}>View &amp; Enrol</button>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5 overflow-x-auto">
          <h3 className="font-extrabold text-[15px] mb-1">Skills Employers Want</h3>
          <p className="text-[12px] text-slate-500 mb-3 flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" /> {s.role} · salary outlook ₹32–40k after certification</p>
          <SkillGapTable rows={GAP_ROWS} />
          <button className="btn-g mt-3 !text-[12px]" onClick={() => navigate('/candidate/navigator')}>Open Full Navigator <ArrowDown className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Opportunities */}
      <div id="ca-opportunities" className="card p-5 mt-4 scroll-mt-24">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="font-extrabold text-[15px] flex items-center gap-2"><Briefcase className="w-4 h-4 text-emerald-600" /> Opportunities For You</h3>
          <DemoBadge label="Demonstration data" />
        </div>
        <p className="text-[12px] text-slate-500 mb-3">Entry-level openings matching your pathway in {s.district} · Automotive / EV</p>
        <div className="grid md:grid-cols-2 gap-2.5">
          {JOBS.filter((j) => /EV|Battery|Technician|Engineer/i.test(j.role + j.co)).slice(0, 4).map((j, i) => (
            <div key={i} className="border rounded-xl p-3.5 hover:border-emerald-400 transition">
              <div className="text-[13.5px] font-bold">{j.role}</div>
              <div className="text-[12px] text-slate-500 font-medium">{j.co} · {j.seats} openings · {j.type}</div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">{j.skills.map((sk) => <span key={sk} className="chip bg-emerald-50 text-emerald-700 border border-emerald-100">{sk}</span>)}</div>
              <button className="btn-g mt-2.5 !py-1.5 !text-[12px]" onClick={() => toast(`<b>${j.role}</b> at ${j.co} — demo application noted.`, 'ok')}>Apply (Demo)</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


