import { useEffect, useState } from 'react';
import { CheckCircle2, BadgeCheck, PlusCircle, Send, TrendingUp, Building2, Briefcase } from 'lucide-react';
import { PUNE_SCENARIO, JOBS } from '../data/demoData';
import { DemoBadge, SectionHeader } from '../components/ui';
import { Modal } from '../components/ui';
import { useApp } from '../hooks/AppContext';
import { useStats, DemoOrLiveChip } from '../hooks/useStats.jsx';

const EMERGING = [
  { skill: 'Solid-State Battery Handling', growth: '+58% YoY', note: 'Next-gen EV packs entering pilot lines' },
  { skill: 'ADAS Calibration', growth: '+44% YoY', note: 'Level-2 autonomy in new launches' },
  { skill: 'EV Charging Infra (EVSE)', growth: '+39% YoY', note: 'PM e-Drive charger rollout' },
];

export default function Employer({ section }) {
  const s = PUNE_SCENARIO;
  const { toast } = useApp();
  const { data: live, local: statsLocal } = useStats('employer');
  const [validated, setValidated] = useState(false);
  const [modal, setModal] = useState(null); // 'suggest' | 'submit' | null
  const [skillName, setSkillName] = useState('');
  const [detail, setDetail] = useState('');
  const [myReqs, setMyReqs] = useState([
    { t: 'EV Service Technician — 120 seats, Pune plant', st: 'Validated' },
    { t: 'HV Safety L3 certification for service network', st: 'Under review' },
  ]);

  useEffect(() => {
    if (section) {
      const el = document.getElementById(`em-${section}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [section]);

  const validate = () => {
    setValidated(true);
    toast('<b>Industry requirements validated</b> — shared with training providers.', 'ok');
  };

  const submitForm = (e) => {
    e.preventDefault();
    if (!skillName.trim()) { toast('Please enter a skill / requirement title', 'alert'); return; }
    setMyReqs((r) => [{ t: skillName.trim(), st: 'Submitted' }, ...r]);
    setSkillName(''); setDetail(''); setModal(null);
    toast('<b>Requirement submitted</b> — visible to Government & training centres.', 'ok');
  };

  return (
    <div className="fade-in">
      <SectionHeader
        title="Employer Portal"
        sub="ABC Automotive Pvt. Ltd. · Pune · Automotive / EV"
        right={!statsLocal && live ? <DemoOrLiveChip demo={live.demo} empty={live.empty} /> : <DemoBadge />}
      />

      {!statsLocal && live && !live.empty && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4 mb-4">
          {[['Job Postings', String(live.postings)], ['Open Postings', String(live.openPostings)], ['Open Positions', String(live.openPositions)], ['Requirements Sent', String(myReqs.length)]].map(([l, v]) => (
            <div key={l} className="card p-4"><div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{l}</div><div className="text-[22px] font-extrabold tracking-tight">{v}</div><div className="text-[11.5px] font-semibold text-violet-700">Live records</div></div>
          ))}
        </div>
      )}
      {!statsLocal && live?.empty && (
        <div className="card p-5 mb-4 text-center">
          <p className="text-[14px] font-extrabold">No data available yet</p>
          <p className="text-[12.5px] text-slate-500 font-medium mt-1">Post your first opening in Manage Data to populate hiring signals.</p>
        </div>
      )}

      <div className="grid xl:grid-cols-3 gap-4 mb-4">
        {/* Industry demand */}
        <div id="em-dashboard" className="card p-5 scroll-mt-24">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500"><Building2 className="w-4 h-4" /> Industry Demand</div>
          <h3 className="text-xl font-extrabold mt-2">EV Service Technician</h3>
          <div className="mt-2 flex items-center gap-2"><span className="text-[12px] font-bold text-slate-500">Demand:</span><span className="chip bg-rose-600 text-white">HIGH</span><span className="chip bg-emerald-50 text-emerald-700 border border-emerald-100">+42% YoY</span></div>
          <div className="mt-3 rounded-xl bg-slate-50 border p-3 text-[12.5px] font-medium text-slate-600">Openings: <b>120</b> · Location: <b>{s.district}</b> · Type: <b>Full-time</b></div>
        </div>

        {/* Required skills */}
        <div id="em-demand" className="card p-5 scroll-mt-24">
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Required Skills</div>
          <div className="mt-2 space-y-2">
            {s.skills.map((sk) => (
              <div key={sk} className="flex items-center gap-2 text-[13.5px] font-bold"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />{sk}</div>
            ))}
          </div>
        </div>

        {/* Actions / validation */}
        <div id="em-validation" className="card p-5 border-t-4 scroll-mt-24" style={{ borderTopColor: '#7C3AED' }}>
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Actions</div>
          <div className="flex flex-col gap-2 mt-3">
            {!validated ? (
              <button className="btn-p justify-center" onClick={validate}><BadgeCheck className="w-4 h-4" /> Validate Skills</button>
            ) : (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                <div className="flex items-center gap-2 font-extrabold text-[14px] text-emerald-800"><CheckCircle2 className="w-5 h-5" /> Industry requirements validated.</div>
                <p className="text-[12.5px] text-emerald-700 font-medium mt-1">Your validated requirements help training providers align their courses with industry demand.</p>
              </div>
            )}
            <button className="btn-g justify-center" onClick={() => setModal('suggest')}><PlusCircle className="w-4 h-4" /> Suggest New Skill</button>
            <button className="btn-g justify-center" onClick={() => setModal('submit')}><Send className="w-4 h-4" /> Submit Industry Requirement</button>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-2 gap-4">
        <div id="em-requirements" className="card p-5 scroll-mt-24">
          <h3 className="font-extrabold text-[15px]">My Requirements</h3>
          <p className="text-[12px] text-slate-500 mb-3">Submitted by ABC Automotive Pvt. Ltd.</p>
          <div className="space-y-2">
            {myReqs.map((r, i) => (
              <div key={i} className="flex items-center gap-2 border rounded-xl px-3 py-2.5 text-[13px] font-bold">
                <span className="flex-1">{r.t}</span>
                <span className={`chip ${r.st === 'Validated' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : r.st === 'Submitted' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>{r.st.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
        <div id="em-emerging" className="card p-5 scroll-mt-24">
          <h3 className="font-extrabold text-[15px] flex items-center gap-2"><TrendingUp className="w-4 h-4 text-violet-600" /> Emerging Skills</h3>
          <p className="text-[12px] text-slate-500 mb-3">Watchlist for Automotive / EV · Maharashtra</p>
          <div className="space-y-2">
            {EMERGING.map((e) => (
              <div key={e.skill} className="border rounded-xl p-3">
                <div className="flex items-center gap-2"><b className="text-[13.5px]">{e.skill}</b><span className="ml-auto chip bg-emerald-50 text-emerald-700 border border-emerald-100">{e.growth}</span></div>
                <div className="text-[12px] text-slate-500 font-medium mt-0.5">{e.note}</div>
              </div>
            ))}
          </div>
          <div id="em-submit" className="scroll-mt-24" />
        </div>
      </div>

      {/* Placement / hiring signals */}
      <div id="em-hiring" className="card p-5 mt-4 scroll-mt-24">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="font-extrabold text-[15px] flex items-center gap-2"><Briefcase className="w-4 h-4 text-violet-600" /> Placement / Hiring Signals</h3>
          <DemoBadge label="Demonstration data" />
          <div className="flex-1" />
          <button className="btn-g !text-[12px]" onClick={() => toast('Hiring signal feed refreshed — 312 new signals indexed (demo).', 'ok')}>Refresh Feed</button>
        </div>
        <p className="text-[12px] text-slate-500 mb-3">Live openings aligned to {s.role} demand · {s.district}</p>
        <div className="grid md:grid-cols-2 gap-2.5">
          {JOBS.slice(0, 4).map((j, i) => (
            <div key={i} className="border rounded-xl p-3 hover:border-violet-400 transition">
              <div className="text-[13px] font-bold">{j.role}</div>
              <div className="text-[12px] text-slate-500 font-medium">{j.co} · {j.seats} openings · {j.type}</div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">{j.skills.map((sk) => <span key={sk} className="chip bg-violet-50 text-violet-700 border border-violet-100">{sk}</span>)}<span className="chip bg-emerald-50 text-emerald-700 border border-emerald-100">{j.surge}</span></div>
            </div>
          ))}
        </div>
      </div>

      {modal && (
        <Modal onClose={() => setModal(null)}>
          <div className="p-6">
            <h3 className="font-extrabold text-[17px]">{modal === 'suggest' ? 'Suggest a New Skill' : 'Submit Industry Requirement'}</h3>
            <p className="text-[12.5px] text-slate-500 font-medium mt-1">Shared with Government &amp; training centres in {s.district}.</p>
            <form onSubmit={submitForm} className="mt-4">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{modal === 'suggest' ? 'Skill name' : 'Requirement title'}</label>
              <input className="inp mt-1 mb-3" placeholder={modal === 'suggest' ? 'e.g. Solid-state battery diagnostics' : 'e.g. 60 EV charger installers, Q2 2027'} value={skillName} onChange={(e) => setSkillName(e.target.value)} />
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Details</label>
              <textarea className="inp mt-1" rows={3} placeholder="Proficiency level, headcount, timeline…" value={detail} onChange={(e) => setDetail(e.target.value)} />
              <div className="flex gap-2 mt-4">
                <button type="submit" className="btn-p flex-1 justify-center">Submit</button>
                <button type="button" className="btn-g" onClick={() => setModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}


