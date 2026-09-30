import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Loader2 } from 'lucide-react';
import { api, ApiError } from '../../services/api';
import { useApp } from '../../hooks/AppContext';
import { PageHeader, DemoNote } from '../../components/datapage';

// Dedicated page: functional requirement form, saved to PostgreSQL (jobs table).
export default function SubmitRequirement() {
  const navigate = useNavigate();
  const { toast } = useApp();
  const [form, setForm] = useState({ title: '', role: '', industry: 'Automotive / EV', skills: '', experience: '0–2 yrs', location: '', salary_min: '', salary_max: '', openings: '', employmentType: 'Full-time' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);

  const set = (k, v) => {
    setForm({ ...form, [k]: v });
    setErrors({ ...errors, [k]: undefined });
  };

  const submit = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const payload = {
        title: form.title.trim(), role: form.role.trim(), industry: form.industry,
        skills: form.skills.trim(), experience: form.experience, location: form.location.trim(),
        salary_min: form.salary_min === '' ? null : Number(form.salary_min),
        salary_max: form.salary_max === '' ? null : Number(form.salary_max),
        openings: form.openings === '' ? null : Number(form.openings),
        status: 'Open',
      };
      const out = await api.post('/api/data/jobs', payload);
      setSavedId(out.record.id);
      toast('<b>Requirement submitted</b> — saved to PostgreSQL and visible in hiring signals.', 'ok');
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        const fe = {};
        (Array.isArray(err.fields) ? err.fields : []).forEach((m) => { fe[m.split(':')[0]] = m; });
        setErrors(fe);
        toast('Please fix the highlighted fields.', 'alert');
      } else toast(err.message, 'alert');
    } finally {
      setSaving(false);
    }
  };

  const F = (k, label, props = {}) => (
    <div>
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500" htmlFor={`sr-${k}`}>{label}{props.required && <span className="text-rose-600"> *</span>}</label>
      <input id={`sr-${k}`} className={`inp mt-1 ${errors[k] ? '!border-rose-500' : ''}`} value={form[k]} onChange={(e) => set(k, e.target.value)} {...props} />
      {errors[k] && <p className="text-[12px] font-bold text-rose-600 mt-1">{errors[k]}</p>}
    </div>
  );

  return (
    <div className="fade-in max-w-[860px]">
      <PageHeader title="Submit Requirement" sub="Post a hiring requirement — stored in PostgreSQL and routed to demand analytics" badge={<DemoNote />} />
      <form onSubmit={submit} className="card p-6">
        <div className="grid sm:grid-cols-2 gap-4">
          {F('title', 'Job title', { required: true, placeholder: 'e.g. EV Service Technician' })}
          {F('role', 'Occupation / role', { required: true, placeholder: 'e.g. EV Service Technician' })}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500" htmlFor="sr-industry">Industry</label>
            <select id="sr-industry" className="inp mt-1" value={form.industry} onChange={(e) => set('industry', e.target.value)}>
              {['Automotive / EV', 'IT & AI/ML', 'Manufacturing', 'Healthcare', 'Renewable Energy', 'Logistics', 'Construction', 'Other'].map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          {F('location', 'Location', { placeholder: 'e.g. Pune' })}
          <div className="sm:col-span-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500" htmlFor="sr-skills">Required skills (comma-separated)</label>
            <textarea id="sr-skills" className="inp mt-1" rows={2} value={form.skills} onChange={(e) => set('skills', e.target.value)} placeholder="EV Diagnostics, Battery Management, CAN Protocol" />
          </div>
          {F('experience', 'Experience', { placeholder: 'e.g. 0–2 yrs' })}
          {F('openings', 'Number of openings', { type: 'number', required: true, min: 1 })}
          {F('salary_min', 'Salary min (₹/month)', { type: 'number', min: 0 })}
          {F('salary_max', 'Salary max (₹/month)', { type: 'number', min: 0 })}
        </div>
        {savedId && <p className="text-[13px] font-bold text-emerald-700 mt-4" role="status">Saved ✓ — view it under <button type="button" className="underline" onClick={() => navigate('/employer/requirements')}>My Requirements</button> or <button type="button" className="underline" onClick={() => navigate('/employer/hiring-signals')}>Hiring Signals</button>.</p>}
        <div className="flex gap-2 mt-5">
          <button type="submit" disabled={saving} className="btn-p flex-1 justify-center disabled:opacity-60">{saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><Send className="w-4 h-4" /> Submit Requirement</>}</button>
          <button type="button" className="btn-g" onClick={() => navigate('/employer/requirements')}>My Requirements</button>
        </div>
      </form>
    </div>
  );
}
