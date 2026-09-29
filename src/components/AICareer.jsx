import { useEffect, useState } from 'react';
import { Sparkles, Loader2, AlertTriangle, Briefcase, Target, TrendingUp, GraduationCap, Route as RouteIcon, Lightbulb } from 'lucide-react';
import { api, ApiError } from '../services/api';
import { useSession } from '../auth/AuthContext';
import { useApp } from '../hooks/AppContext';

// Real AI career recommendations (POST /api/ai/career-recommendations).
// Renders the structured response; surfaces backend errors honestly —
// including "AI unavailable" (503) and "profile incomplete" (400).
export default function AICareer() {
  const { toast } = useApp();
  const { authMode, aiConfigured } = useSession();
  const [rec, setRec] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authMode !== 'backend') {
      setFetching(false);
      return;
    }
    api.get('/api/ai/career-recommendations/latest')
      .then((r) => {
        setRec(r.result);
        setMeta({ createdAt: r.created_at, saved: true });
      })
      .catch(() => { /* none yet — not an error */ })
      .finally(() => setFetching(false));
  }, [authMode]);

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const out = await api.post('/api/ai/career-recommendations', {});
      setRec(out.result);
      setMeta({ createdAt: new Date().toISOString(), model: out.model, saved: true });
      toast('<b>AI recommendation ready</b> — based on your profile and live platform demand.', 'ok');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (authMode !== 'backend') {
    return (
      <div className="card p-5 border-t-4" style={{ borderTopColor: '#059669' }}>
        <h3 className="font-extrabold text-[15px] flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-600" /> AI Career Recommendations</h3>
        <p className="text-[12.5px] text-slate-500 font-medium mt-1.5">Connect the backend API to generate recommendations from your live profile and platform demand data.</p>
      </div>
    );
  }

  return (
    <div className="card p-5 border-t-4" style={{ borderTopColor: '#059669' }}>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-extrabold text-[15px] flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-600" /> AI Career Recommendations</h3>
        <span className="chip bg-violet-50 text-violet-700 border border-violet-100">AI-GENERATED RECOMMENDATION</span>
        <div className="flex-1" />
        <button className="btn-p !text-[12px]" disabled={loading} onClick={generate}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing…</> : <><Sparkles className="w-4 h-4" /> {rec ? 'Regenerate' : 'Generate My Recommendations'}</>}
        </button>
      </div>
      <p className="text-[12px] text-slate-500 font-medium mt-1">Based on the profile and available platform data. Recommendations guide learning — they do not guarantee employment.</p>

      {fetching && <p className="inline-flex items-center gap-2 text-[13px] font-bold text-slate-500 mt-4"><Loader2 className="w-4 h-4 animate-spin" /> Checking for a saved recommendation…</p>}

      {!fetching && error && (
        <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-3 items-start" role="alert">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-[13.5px] font-extrabold text-amber-800">{error}</div>
            {!aiConfigured && <div className="text-[12.5px] font-medium text-amber-700 mt-1">The AI service is not configured on the server (AI_PROVIDER / AI_API_KEY). Your profile and platform data are ready — recommendations will work once the administrator enables AI.</div>}
            <button className="btn-g mt-2.5 !py-1.5 !text-[12px]" onClick={() => window.location.assign('/candidate/profile')}>Complete My Profile</button>
          </div>
        </div>
      )}

      {!fetching && !error && !rec && (
        <p className="text-[13px] text-slate-500 font-medium mt-4">No recommendation yet. Add your skills (Manage Data) and complete your profile, then generate.</p>
      )}

      {rec && (
        <div className="mt-4 space-y-4 fade-in">
          {meta?.createdAt && <p className="text-[11.5px] text-slate-400 font-semibold">Generated {new Date(meta.createdAt).toLocaleString()}{meta.model ? ` · ${meta.model}` : ''}</p>}
          {(rec.recommended_roles || []).map((r, i) => (
            <div key={i} className="rounded-2xl border p-4 hover:border-emerald-400 transition">
              <div className="flex items-center gap-2 flex-wrap">
                <Briefcase className="w-4 h-4 text-emerald-700" />
                <b className="text-[14.5px]">{i + 1}. {r.role}</b>
                <span className={`chip ${r.match === 'High' ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-800'}`}>{r.match} MATCH</span>
                {r.salary_outlook && <span className="chip bg-slate-100 text-slate-600">{r.salary_outlook}</span>}
              </div>
              {r.why && <p className="text-[13px] font-medium text-slate-600 mt-1.5"><b>Why it matches:</b> {r.why}</p>}
              <div className="grid sm:grid-cols-3 gap-2 mt-2.5 text-[12.5px]">
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-2.5"><b className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> Strengths</b><span className="font-medium text-slate-600">{(r.strengths || []).join(', ') || '—'}</span></div>
                <div className="rounded-xl bg-rose-50 border border-rose-100 p-2.5"><b className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Missing</b><span className="font-medium text-slate-600">{(r.missing_skills || []).join(', ') || '—'}</span></div>
                <div className="rounded-xl bg-blue-50 border border-blue-100 p-2.5"><b className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> Training</b><span className="font-medium text-slate-600">{(r.training || []).join(', ') || '—'}</span></div>
              </div>
            </div>
          ))}
          <div className="grid md:grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 border p-4">
              <b className="text-[13px] flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-rose-600" /> Skill gaps to close</b>
              <ul className="mt-2 space-y-1">{(rec.skill_gaps || []).map((g, i) => <li key={i} className="text-[12.5px] font-medium">· <b>{g.skill}</b> — demand {g.demand}, priority {g.priority}</li>)}</ul>
              <b className="text-[13px] flex items-center gap-1.5 mt-3"><Lightbulb className="w-4 h-4 text-amber-600" /> Recommended skills</b>
              <p className="text-[12.5px] font-medium mt-1">{(rec.recommended_skills || []).join(' · ') || '—'}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 border p-4">
              <b className="text-[13px] flex items-center gap-1.5"><RouteIcon className="w-4 h-4 text-blue-700" /> Expected progression</b>
              <div className="mt-2 flex flex-col gap-1">{(rec.career_path || []).map((s, i) => <span key={i} className={`rounded-lg px-2.5 py-1.5 text-[12px] font-bold ${i === (rec.career_path || []).length - 1 ? 'bg-emerald-600 text-white' : 'bg-white border'}`}>{i + 1}. {s}</span>)}</div>
              {(rec.recommended_courses || []).length > 0 && (
                <><b className="text-[13px] mt-3 block">Recommended courses</b>
                  <ul className="mt-1 space-y-1">{rec.recommended_courses.map((c, i) => <li key={i} className="text-[12.5px] font-medium">· <b>{c.title}</b>{c.hours ? ` (${c.hours})` : ''}{c.provider ? ` — ${c.provider}` : ''}</li>)}</ul></>
              )}
            </div>
          </div>
          {(rec.reasoning || []).length > 0 && (
            <div className="rounded-2xl bg-[#0F172A] text-white p-4">
              <b className="text-[13px] text-teal-300">How this was derived</b>
              <ul className="mt-1.5 space-y-1">{rec.reasoning.map((r, i) => <li key={i} className="text-[12.5px] text-slate-300 font-medium">· {r}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
