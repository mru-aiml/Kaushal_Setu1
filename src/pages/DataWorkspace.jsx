import { useEffect, useState } from 'react';
import { Plus, Upload, Download, Pencil, Trash2, Search, Loader2, Database } from 'lucide-react';
import { api, saveBlob, ApiError } from '../services/api';
import { SectionHeader, DemoBadge } from '../components/ui';
import { LoadingState, ErrorState, EmptyState } from '../components/states';
import { useApp } from '../hooks/AppContext';
import { useSession } from '../auth/AuthContext';
import ImportModal from './ImportModal';

function RecordModal({ entity, fields, initial, onClose, onSaved }) {
  const { toast } = useApp();
  const [draft, setDraft] = useState(() => {
    const o = {};
    for (const f of fields) o[f.name] = initial?.[f.name] ?? '';
    return o;
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    setErrors({});
    try {
      const payload = {};
      for (const f of fields) {
        const v = draft[f.name];
        payload[f.name] = v === '' ? null : v;
      }
      if (initial?.id) await api.put(`/api/data/${entity}/${initial.id}`, payload);
      else await api.post(`/api/data/${entity}`, payload);
      toast(`<b>Record saved</b> — ${initial?.id ? 'updated' : 'added'} to the database.`, 'ok');
      onSaved();
      onClose();
    } catch (e) {
      if (e instanceof ApiError && e.fields) {
        const fe = {};
        for (const msg of (Array.isArray(e.fields) ? e.fields : [])) {
          const k = msg.split(':')[0];
          fe[k] = msg;
        }
        setErrors(fe);
        toast('Please fix the highlighted fields.', 'alert');
      } else toast(e.message, 'alert');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] modal-bg flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto fade-in p-6">
        <h3 className="font-extrabold text-[17px]">{initial?.id ? 'Edit record' : 'Add record'}</h3>
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          {fields.map((f) => (
            <div key={f.name} className={f.type === 'text' && fields.length > 4 ? '' : ''}>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{f.name.replace(/_/g, ' ')}{f.required && <span className="text-rose-600"> *</span>}</label>
              {f.type === 'select' ? (
                <select className="inp mt-1" value={draft[f.name] || ''} onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })}>
                  <option value="">Select…</option>{(f.options || []).map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input className="inp mt-1" type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'} value={draft[f.name] || ''} onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })} />
              )}
              {errors[f.name] && <p className="text-[12px] font-bold text-rose-600 mt-1">{errors[f.name]}</p>}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-5">
          <button className="btn-p flex-1 justify-center" disabled={saving} onClick={save}>{saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save Record'}</button>
          <button className="btn-g" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// Role-specific entry points (same engine, scoped datasets + copy).
export function GovernmentData() {
  return <DataWorkspace title="Data Management" sub="Skill demand, districts, centres, outcomes and programmes — stored in the platform database" />;
}
export function TrainingCentreData() {
  return <DataWorkspace title="My Training Data" sub="Courses, batches, trainers, enrolments and placements for your centre" />;
}
export function EmployerData() {
  return <DataWorkspace title="My Hiring Data" sub="Job openings and requirements posted by your company" />;
}
export function CandidateData() {
  return <DataWorkspace title="My Data" sub="Skills, education, certifications, experience, applications and training history" />;
}

// Generic role data workspace: entity tabs, search, add/edit/delete,
// CSV/XLSX import with preview+mapping, real CSV/XLSX export.
export default function DataWorkspace({ title, subtitle }) {
  const { toast } = useApp();
  const { authMode } = useSession();
  const [registry, setRegistry] = useState(null);
  const [entity, setEntity] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // {mode:'add'|'edit', row?}
  const [importOpen, setImportOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const loadRegistry = async () => {
    try {
      const r = await api.get('/api/entities');
      setRegistry(r);
      if (!entity && r.mine?.length) setEntity(r.mine[0]);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  const loadRows = async (ent = entity, pg = page, query = q) => {
    if (!ent) return;
    setLoading(true);
    setError('');
    try {
      const r = await api.get(`/api/data/${ent}?q=${encodeURIComponent(query)}&page=${pg}&limit=20`);
      setRows(r.data);
      setTotal(r.total);
      setRegistry((reg) => reg ? { ...reg, entities: { ...reg.entities, [ent]: { ...reg.entities[ent], writable: r.writable } } } : reg);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRegistry(); }, []);
  useEffect(() => { if (entity) { setPage(1); loadRows(entity, 1, ''); } }, [entity]);

  if (authMode !== 'backend') {
    return (
      <div className="fade-in">
        <SectionHeader title={title} sub={subtitle} right={<DemoBadge label="Local auth" />} />
        <EmptyState title="Data management needs the backend API" desc="Connect the KaushalSetu server (VITE_API_BASE_URL) to add, import and manage live records." />
      </div>
    );
  }

  const def = entity ? registry?.entities?.[entity] : null;
  const pages = Math.max(1, Math.ceil(total / 20));

  const doDelete = async () => {
    try {
      await api.del(`/api/data/${entity}/${confirmDel.id}`);
      toast('<b>Record deleted.</b>', 'ok');
      setConfirmDel(null);
      loadRows();
    } catch (e) {
      toast(e.message, 'alert');
    }
  };

  const doExport = async (format) => {
    try {
      const file = await api.download(`/api/data/${entity}/export?format=${format}`, `${entity}-export.${format}`);
      saveBlob(file);
      toast(`<b>${file.filename}</b> downloaded — real export of ${total} stored records.`, 'ok');
    } catch (e) {
      toast(e.message, 'alert');
    }
  };

  return (
    <div className="fade-in">
      <SectionHeader
        title={title}
        sub={subtitle}
        right={<div className="flex flex-wrap gap-2">
          {def?.writable && <button className="btn-p" onClick={() => setModal({ mode: 'add' })}><Plus className="w-4 h-4" /> Add Data</button>}
          {def?.writable && <button className="btn-g" onClick={() => setImportOpen(true)}><Upload className="w-4 h-4" /> Import CSV / XLSX</button>}
          <button className="btn-g" onClick={() => doExport('csv')}><Download className="w-4 h-4" /> Export CSV</button>
          <button className="btn-g" onClick={() => doExport('xlsx')}><Download className="w-4 h-4" /> Export XLSX</button>
        </div>}
      />

      {error && !registry ? (
        <ErrorState title="Could not load datasets" desc={error} onRetry={loadRegistry} />
      ) : (
        <div className="card p-5">
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(registry?.mine || []).map((e) => (
              <button key={e} onClick={() => setEntity(e)} className={`tab-b ${entity === e ? 'active' : ''}`}>
                <Database className="w-3.5 h-3.5 inline mr-1" />{registry.entities[e]?.label || e}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="inp !pl-9" placeholder="Search records…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); loadRows(entity, 1, q); } }} />
            </div>
            <button className="btn-g !py-2" onClick={() => { setPage(1); loadRows(entity, 1, q); }}>Search</button>
            <span className="text-[12px] font-bold text-slate-500">{total} records</span>
          </div>

          {loading ? <LoadingState label="Loading records…" /> :
            error ? <ErrorState title="Could not load records" desc={error} onRetry={() => loadRows()} /> :
              rows.length === 0 ? <EmptyState title="No data available yet" desc={def?.writable ? 'Add your first record or import a CSV/XLSX file to get started.' : 'No records have been added to this dataset yet.'} action={def?.writable ? <button className="btn-p mt-4" onClick={() => setModal({ mode: 'add' })}><Plus className="w-4 h-4" /> Add Data</button> : null} /> : (
                <div className="overflow-x-auto">
                  <table className="data min-w-[720px]">
                    <thead><tr>
                      {def.fields.map((f) => <th key={f.name}>{f.name.replace(/_/g, ' ')}</th>)}
                      {def.writable && <th><span className="sr-only">Actions</span></th>}
                    </tr></thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.id}>
                          {def.fields.map((f) => <td key={f.name} className="max-w-[220px] truncate" title={String(r[f.name] ?? '')}>{r[f.name] ?? '—'}</td>)}
                          {def.writable && (
                            <td className="whitespace-nowrap">
                              <button className="p-1.5 hover:bg-slate-100 rounded-lg" title="Edit" onClick={() => setModal({ mode: 'edit', row: r })}><Pencil className="w-4 h-4 text-slate-600" /></button>
                              <button className="p-1.5 hover:bg-rose-50 rounded-lg" title="Delete" onClick={() => setConfirmDel(r)}><Trash2 className="w-4 h-4 text-rose-600" /></button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex items-center gap-2 mt-3 text-[12.5px] font-bold">
                    <button className="btn-g !py-1.5" disabled={page <= 1} onClick={() => { const p = page - 1; setPage(p); loadRows(entity, p, q); }}>← Prev</button>
                    <span className="text-slate-500">Page {page} of {pages}</span>
                    <button className="btn-g !py-1.5" disabled={page >= pages} onClick={() => { const p = page + 1; setPage(p); loadRows(entity, p, q); }}>Next →</button>
                  </div>
                </div>
              )}
        </div>
      )}

      {modal && <RecordModal entity={entity} fields={def.fields} initial={modal.row} onClose={() => setModal(null)} onSaved={() => loadRows()} />}
      {importOpen && <ImportModal entity={entity} fields={def.fields} onClose={() => setImportOpen(false)} onDone={() => loadRows()} />}
      {confirmDel && (
        <div className="fixed inset-0 z-[90] modal-bg flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setConfirmDel(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 fade-in">
            <h3 className="font-extrabold text-[16px]">Delete this record?</h3>
            <p className="text-[13px] text-slate-500 font-medium mt-1">This permanently removes the record from the database. This cannot be undone.</p>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 justify-center inline-flex items-center gap-2 bg-rose-600 text-white font-bold text-[13px] px-4 py-2.5 rounded-[10px] hover:bg-rose-700" onClick={doDelete}><Trash2 className="w-4 h-4" /> Delete</button>
              <button className="btn-g" onClick={() => setConfirmDel(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
