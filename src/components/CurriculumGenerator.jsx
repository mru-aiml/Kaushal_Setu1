import { useEffect, useState } from 'react';
import { Wand2, Loader2, Save, Download, Trash2, RefreshCw, AlertTriangle, Pencil } from 'lucide-react';
import { api, saveBlob, ApiError } from '../services/api';
import { useSession } from '../auth/AuthContext';
import { useApp } from '../hooks/AppContext';

const emptyForm = { targetRole: '', requiredSkills: '', currentLevel: 'Beginner', targetProficiency: 'NSQF Level 4', duration: '', constraints: '', infrastructure: '', cohort: '' };

// Real AI curriculum workflow: form → backend LLM → structured preview →
// edit → save to database → export as a real PDF report.
export default function CurriculumGenerator() {
  const { toast } = useApp();
  const { authMode, aiConfigured } = useSession();
  const [form, setForm] = useState(emptyForm);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState(null); // {title, objective, duration, modules[], ...}
  const [saved, setSaved] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [exporting, setExporting] = useState(false);

  const loadSaved = async () => {
    if (authMode !== 'backend') return;
    try {
      const r = await api.get('/api/curricula');
      setSaved(r.data || []);
    } catch { /* non-fatal */ }
  };

  useEffect(() => { loadSaved(); }, [authMode]);

  const generate = async () => {
    if (!form.targetRole.trim()) {
      setError('Target job role is required.');
      return;
    }
    setGenerating(true);
    setError('');
    try {
      const out = await api.post('/api/ai/curriculum', {
        targetRole: form.targetRole.trim(),
        requiredSkills: form.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
        currentLevel: form.currentLevel,
        targetProficiency: form.targetProficiency,
        duration: form.duration,
        constraints: form.constraints,
        infrastructure: form.infrastructure,
        cohort: form.cohort,
      });
      setDraft(out.result);
      setSavedId(null);
      toast('<b>AI curriculum generated</b> — review, edit and save it below.', 'ok');
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const setModule = (i, key, value) => {
    setDraft((d) => {
      const modules = d.modules.map((m, j) => (j === i ? { ...m, [key]: value } : m));
      return { ...d, modules };
    });
  };

  const setModuleList = (i, key, text) => {
    setModule(i, key, text.split(',').map((s) => s.trim()).filter(Boolean));
  };

  const save = async () => {
    if (!draft?.title || !draft?.modules?.length) return;
    setSaving(true);
    try {
      const out = await api.post('/api/curricula', {
        title: draft.title, targetRole: form.targetRole || draft.targetRole || '', duration: draft.duration, data: draft,
      });
      setSavedId(out.id);
      loadSaved();
      toast('<b>Curriculum saved</b> to the database.', 'ok');
    } catch (e) {
      toast(e.message, 'alert');
    } finally {
      setSaving(false);
    }
  };

  const exportPdf = async () => {
    if (!savedId) {
      toast('Save the curriculum first, then export it.', 'alert');
      return;
    }
    setExporting(true);
    try {
      const out = await api.post('/api/reports/generate', { type: 'curriculum', filters: { curriculumId: savedId }, format: 'pdf' });
      const file = await api.download(`/api/reports/${out.id}/download`, out.filename);
      saveBlob(file);
      toast(`<b>${file.filename}</b> downloaded — real PDF of the saved curriculum.`, 'ok');
    } catch (e) {
      toast(e.message, 'alert');
    } finally {
      setExporting(false);
    }
  };

  const remove = async (id) => {
    try {
      await api.del(`/api/curricula/${id}`);
      loadSaved();
      if (savedId === id) setSavedId(null);
      toast('Curriculum deleted.', 'ok');
    } catch (e) {
      toast(e.message, 'alert');
    }
  };

  if (authMode !== 'backend') {
    return (
      <div className="card p-5 border-t-4" style={{ borderTopColor: '#7C3AED' }}>
        <h3 className="font-extrabold text-[15px] flex items-center gap-2"><Wand2 className="w-4 h-4 text-violet-600" /> AI Curriculum Generator</h3>
        <p className="text-[12.5px] text-slate-500 font-medium mt-1.5">Connect the backend API to generate structured curricula with the AI service.</p>
      </div>
    );
  }

  return (
    <div className="card p-5 border-t-4" style={{ borderTopColor: '#7C3AED' }}>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-extrabold text-[15px] flex items-center gap-2"><Wand2 className="w-4 h-4 text-violet-600" /> AI Curriculum Generator</h3>
        <span className="chip bg-violet-50 text-violet-700 border border-violet-100">AI-GENERATED CURRICULUM</span>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        <div className="lg:col-span-1"><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Target job role *</label><input className="inp mt-1" placeholder="e.g. EV Service Technician" value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })} /></div>
        <div className="lg:col-span-2"><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Required skills (comma-separated)</label><input className="inp mt-1" placeholder="EV Diagnostics, Battery Management, CAN Protocol" value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} /></div>
        <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Current level</label><select className="inp mt-1" value={form.currentLevel} onChange={(e) => setForm({ ...form, currentLevel: e.target.value })}>{['Beginner', 'Intermediate', 'Advanced'].map((o) => <option key={o}>{o}</option>)}</select></div>
        <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Target proficiency</label><input className="inp mt-1" value={form.targetProficiency} onChange={(e) => setForm({ ...form, targetProficiency: e.target.value })} /></div>
        <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Duration</label><input className="inp mt-1" placeholder="e.g. 200 hours / 10 weeks" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></div>
        <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Learner cohort</label><input className="inp mt-1" placeholder="e.g. ITI graduates, Pune" value={form.cohort} onChange={(e) => setForm({ ...form, cohort: e.target.value })} /></div>
        <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Available infrastructure</label><input className="inp mt-1" placeholder="e.g. 2 EV rigs, HV kits" value={form.infrastructure} onChange={(e) => setForm({ ...form, infrastructure: e.target.value })} /></div>
        <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Constraints</label><input className="inp mt-1" placeholder="e.g. weekend batches only" value={form.constraints} onChange={(e) => setForm({ ...form, constraints: e.target.value })} /></div>
      </div>

      {error && <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3.5 flex gap-2.5 items-start" role="alert"><AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" /><div className="text-[13px] font-bold text-amber-800">{error}{!aiConfigured && <span className="block font-medium mt-0.5">The AI service is not configured on the server (AI_PROVIDER / AI_API_KEY).</span>}</div></div>}

      <div className="flex flex-wrap gap-2 mt-4">
        <button className="btn-p" disabled={generating} onClick={generate}>{generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Wand2 className="w-4 h-4" /> {draft ? 'Regenerate' : 'Generate Curriculum'}</>}</button>
        {draft && <button className="btn-g" disabled={saving} onClick={save}>{saving ? 'Saving…' : <><Save className="w-4 h-4" /> Save Curriculum</>}</button>}
        {savedId && <button className="btn-g" disabled={exporting} onClick={exportPdf}>{exporting ? 'Exporting…' : <><Download className="w-4 h-4" /> Export Curriculum (PDF)</>}</button>}
      </div>

      {draft && (
        <div className="mt-5 fade-in">
          <div className="rounded-2xl bg-[#0F172A] text-white p-4">
            <label className="text-[11px] font-bold uppercase tracking-widest text-teal-300">Course title (editable)</label>
            <input className="mt-1 w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-[15px] font-extrabold outline-none focus:border-teal-300" value={draft.title || ''} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            <label className="text-[11px] font-bold uppercase tracking-widest text-teal-300 mt-3 block">Objective (editable)</label>
            <textarea className="mt-1 w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-[13px] font-medium outline-none focus:border-teal-300" rows={2} value={draft.objective || ''} onChange={(e) => setDraft({ ...draft, objective: e.target.value })} />
            <div className="text-[12.5px] font-semibold mt-2">Duration: <input className="bg-white/10 border border-white/15 rounded-lg px-2 py-1 text-[12.5px] w-40 outline-none focus:border-teal-300" value={draft.duration || ''} onChange={(e) => setDraft({ ...draft, duration: e.target.value })} /></div>
          </div>
          <div className="space-y-2.5 mt-3">
            {(draft.modules || []).map((m, i) => (
              <div key={i} className="border rounded-2xl p-4">
                <div className="grid sm:grid-cols-2 gap-2">
                  <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Module {i + 1} title</label><input className="inp mt-1" value={m.title || ''} onChange={(e) => setModule(i, 'title', e.target.value)} /></div>
                  <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Duration</label><input className="inp mt-1" value={m.duration || ''} onChange={(e) => setModule(i, 'duration', e.target.value)} /></div>
                  <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Skills (comma-separated)</label><input className="inp mt-1" value={(m.skills || []).join(', ')} onChange={(e) => setModuleList(i, 'skills', e.target.value)} /></div>
                  <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Assessment</label><input className="inp mt-1" value={m.assessment || ''} onChange={(e) => setModule(i, 'assessment', e.target.value)} /></div>
                  <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Topics (comma-separated)</label><textarea className="inp mt-1" rows={2} value={(m.topics || []).join(', ')} onChange={(e) => setModuleList(i, 'topics', e.target.value)} /></div>
                  <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Practical activities (comma-separated)</label><textarea className="inp mt-1" rows={2} value={(m.activities || []).join(', ')} onChange={(e) => setModuleList(i, 'activities', e.target.value)} /></div>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-slate-50 border p-4 mt-3 text-[13px]">
            <div><b>Final assessment:</b> <input className="inp mt-1" value={draft.final_assessment || ''} onChange={(e) => setDraft({ ...draft, final_assessment: e.target.value })} /></div>
            <div className="mt-2"><b>Recommended resources (comma-separated):</b> <input className="inp mt-1" value={(draft.recommended_resources || []).join(', ')} onChange={(e) => setDraft({ ...draft, recommended_resources: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} /></div>
          </div>
        </div>
      )}

      {saved.length > 0 && (
        <div className="mt-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5"><Pencil className="w-4 h-4" /> Saved curricula ({saved.length})</div>
          <div className="space-y-1.5">
            {saved.map((c) => (
              <div key={c.id} className="flex items-center gap-2 border rounded-xl px-3 py-2 text-[13px]">
                <span className="flex-1 font-bold truncate">{c.title}</span>
                <span className="chip bg-slate-100 text-slate-600 hidden sm:block">{c.status}</span>
                <button className="btn-g !py-1 !text-[11.5px]" onClick={() => { try { setDraft(JSON.parse(c.data)); } catch { /* ignore */ } setSavedId(c.id); setForm({ ...form, targetRole: c.target_role || form.targetRole }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Load</button>
                <button className="p-1.5 hover:bg-rose-50 rounded-lg" title="Delete" onClick={() => remove(c.id)}><Trash2 className="w-4 h-4 text-rose-600" /></button>
              </div>
            ))}
          </div>
          <button className="btn-g mt-2 !text-[12px]" onClick={() => { setDraft(null); setSavedId(null); }}><RefreshCw className="w-4 h-4" /> Start a new draft</button>
        </div>
      )}
    </div>
  );
}
