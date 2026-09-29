import { useState } from 'react';
import { Pencil, X, Check, Loader2, Camera, Upload, Download } from 'lucide-react';
import { api, ApiError } from '../services/api';
import { useApp } from '../hooks/AppContext';

// Generic role profile form: view ↔ edit, validation errors from backend,
// photo/logo upload, candidate resume upload + extraction assist, completion %.
export default function ProfileForm({ role, schema, profile, supportsPhoto, supportsResume, onSaved }) {
  const { toast } = useApp();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile?.data || {});
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(profile?.photo || null);
  const [photoData, setPhotoData] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [extracting, setExtracting] = useState(false);

  const data = editing ? draft : profile?.data || {};
  const completion = profile?.completion ?? 0;

  const set = (name, value) => {
    setDraft((d) => ({ ...d, [name]: value }));
    setFieldErrors((e) => ({ ...e, [name]: undefined }));
  };

  const onPhoto = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      toast('Please choose an image file for the photo.', 'alert');
      return;
    }
    if (file.size > 500 * 1024) {
      toast('Photo too large — max 500 KB.', 'alert');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result);
      setPhotoData(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const onResume = async (file) => {
    if (!file || !/pdf$/i.test(file.name)) {
      toast('Only PDF resumes are accepted.', 'alert');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast('Resume too large — max 2 MB.', 'alert');
      return;
    }
    setResumeFile({ file, name: file.name });
    // Offer extraction assist: backend parses the PDF and suggests fields.
    setExtracting(true);
    try {
      const buf = await file.arrayBuffer();
      let b64 = '';
      const bytes = new Uint8Array(buf);
      for (let i = 0; i < bytes.length; i += 8192) b64 += String.fromCharCode(...bytes.slice(i, i + 8192));
      const out = await api.post('/api/import/resume', { filename: file.name, content: btoa(b64) });
      const filled = { ...draft };
      let n = 0;
      for (const [k, v] of Object.entries(out.fields || {})) {
        if (v && !filled[k]) { filled[k] = v; n++; }
      }
      if (n) {
        setDraft(filled);
        toast(`Resume scanned — ${n} profile fields suggested from “${file.name}”. Review before saving.`, 'ok');
      } else {
        toast('Resume scanned, but no new fields could be identified. Fill the form manually.', 'info');
      }
    } catch (e) {
      toast(e instanceof ApiError ? e.message : 'Resume scan failed. You can still save it with the profile.', 'alert');
    } finally {
      setExtracting(false);
    }
  };

  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

  const save = async () => {
    setSaving(true);
    setFieldErrors({});
    try {
      const payload = { data: draft };
      if (photoData) payload.photo = photoData;
      if (resumeFile) {
        payload.resume = await fileToDataUrl(resumeFile.file);
        payload.resumeName = resumeFile.name;
      }
      const out = await api.put('/api/me/profile', payload);
      toast('<b>Profile saved</b> — changes are live on your account.', 'ok');
      setEditing(false);
      setPhotoData(null);
      setResumeFile(null);
      onSaved?.(out.profile);
    } catch (e) {
      if (e instanceof ApiError && e.fields) {
        setFieldErrors(e.fields);
        toast('Please fix the highlighted fields.', 'alert');
      } else {
        toast(e.message || 'Could not save the profile.', 'alert');
      }
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setDraft(profile?.data || {});
    setFieldErrors({});
    setPhotoPreview(profile?.photo || null);
    setPhotoData(null);
    setResumeFile(null);
    setEditing(false);
  };

  const downloadResume = async () => {
    try {
      const file = await api.download('/api/me/resume', profile?.resumeName || 'resume.pdf');
      const url = URL.createObjectURL(file.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    } catch (e) {
      toast(e.message, 'alert');
    }
  };

  const renderField = (f) => {
    const err = fieldErrors[f.name];
    const val = data[f.name] ?? (f.type === 'multiselect' ? [] : '');
    const cls = `inp mt-1 ${err ? '!border-rose-500' : ''}`;
    if (!editing) {
      return (
        <div key={f.name}>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{f.label}</div>
          <div className="text-[13.5px] font-semibold mt-0.5 break-words">
            {Array.isArray(val) ? (val.join(', ') || '—') : (val === '' || val === null ? '—' : f.type === 'textarea' ? <span className="whitespace-pre-line font-medium">{val}</span> : val)}
          </div>
        </div>
      );
    }
    const common = { id: `pf-${f.name}`, className: cls, value: val || '', onChange: (e) => set(f.name, e.target.value) };
    let input;
    if (f.type === 'textarea') input = <textarea {...common} rows={3} placeholder={f.hint || ''} />;
    else if (f.type === 'select') input = <select {...common}><option value="">Select…</option>{(f.options || []).map((o) => <option key={o}>{o}</option>)}</select>;
    else if (f.type === 'multiselect') {
      input = (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {(f.options || []).map((o) => {
            const on = (val || []).includes(o);
            return (
              <button type="button" key={o} onClick={() => set(f.name, on ? val.filter((x) => x !== o) : [...(val || []), o])}
                className={`chip border cursor-pointer ${on ? '!bg-slate-900 !text-white !border-slate-900' : '!bg-white text-slate-600 border-slate-200'}`}>{on ? '✓ ' : ''}{o}</button>
            );
          })}
        </div>
      );
    }
    else if (f.type === 'date') input = <input {...common} type="date" />;
    else if (f.type === 'number') input = <input {...common} type="number" />;
    else if (f.type === 'year') input = <input {...common} type="number" min="1950" max="2100" placeholder="e.g. 2024" />;
    else if (f.type === 'email') input = <input {...common} type="email" />;
    else if (f.type === 'phone') input = <input {...common} type="tel" placeholder="+91…" />;
    else input = <input {...common} type="text" placeholder={f.hint || ''} />;
    return (
      <div key={f.name}>
        <label htmlFor={`pf-${f.name}`} className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{f.label}{f.required && <span className="text-rose-600"> *</span>}</label>
        {input}
        {err && <p className="text-[12px] font-bold text-rose-600 mt-1" role="alert">{err}</p>}
      </div>
    );
  };

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-center gap-4">
        {supportsPhoto && (
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border flex items-center justify-center">
              {photoPreview ? <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" /> : <Camera className="w-7 h-7 text-slate-300" />}
            </div>
            {editing && (
              <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full btn-p !p-0 items-center justify-center cursor-pointer" title="Upload photo (max 500 KB)">
                <Upload className="w-4 h-4 mx-auto" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onPhoto(e.target.files[0])} />
              </label>
            )}
          </div>
        )}
        <div className="flex-1 min-w-[200px]">
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Profile completion</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="progress flex-1"><div style={{ width: `${completion}%`, background: completion >= 80 ? '#059669' : completion >= 40 ? '#F59E0B' : '#E11D48' }} /></div>
            <b className="text-[14px]">{completion}%</b>
          </div>
          {profile?.updatedAt && <div className="text-[11.5px] text-slate-400 font-medium mt-1">Last saved {new Date(profile.updatedAt).toLocaleString()}</div>}
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <button className="btn-p" onClick={() => setEditing(true)}><Pencil className="w-4 h-4" /> Edit Profile</button>
          ) : (
            <><button className="btn-g" onClick={cancel} disabled={saving}><X className="w-4 h-4" /> Cancel</button>
              <button className="btn-p" onClick={save} disabled={saving}>{saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Check className="w-4 h-4" /> Save</>}</button></>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5 mt-6">{schema.map(renderField)}</div>

      {supportsResume && (
        <div className="mt-6 rounded-2xl border p-4">
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Resume (PDF, max 2 MB)</div>
          {profile?.hasResume && !editing && (
            <div className="flex items-center gap-2 mt-2 text-[13px] font-semibold">
              <span className="truncate">{profile.resumeName || 'resume.pdf'}</span>
              <button className="btn-g !py-1.5 !text-[12px]" onClick={downloadResume}><Download className="w-4 h-4" /> Download</button>
            </div>
          )}
          {editing && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <label className="btn-g cursor-pointer !text-[12px]">
                <Upload className="w-4 h-4" /> {resumeFile ? resumeFile.name : profile?.hasResume ? 'Replace resume' : 'Upload resume'}
                <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && onResume(e.target.files[0])} />
              </label>
              {extracting && <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> Scanning resume…</span>}
              {profile?.hasResume && <button className="btn-g !py-1.5 !text-[12px]" onClick={downloadResume}><Download className="w-4 h-4" /> Current file</button>}
            </div>
          )}
          {!profile?.hasResume && !editing && <p className="text-[12.5px] text-slate-500 font-medium mt-1.5">No resume uploaded yet — edit your profile to add one.</p>}
        </div>
      )}
    </div>
  );
}
