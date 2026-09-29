import { useEffect, useState } from 'react';
import { FileText, Loader2, Download, X, History } from 'lucide-react';
import { api, saveBlob, ApiError } from '../services/api';
import { useApp } from '../hooks/AppContext';

// Real report generation: pick type + filters + format → backend builds the
// file from stored rows → browser downloads the actual file. History lists
// previously generated reports with re-download.
export default function ReportModal({ onClose }) {
  const { toast } = useApp();
  const [catalog, setCatalog] = useState([]);
  const [history, setHistory] = useState([]);
  const [type, setType] = useState('');
  const [format, setFormat] = useState('pdf');
  const [filters, setFilters] = useState({ district: '', sector: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  const load = async () => {
    try {
      const c = await api.get('/api/reports/catalog');
      setCatalog(c.reports || []);
      if (c.reports?.length && !type) setType(c.reports[0].type);
      const h = await api.get('/api/reports');
      setHistory(h.data || []);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => { load(); }, []);

  const generate = async () => {
    if (!type) return;
    setBusy(true);
    setError('');
    setDone(null);
    try {
      const out = await api.post('/api/reports/generate', { type, filters, format });
      setDone(out);
      const h = await api.get('/api/reports');
      setHistory(h.data || []);
      toast(`<b>${out.title}</b> generated from ${out.rows} stored records${out.demo ? ' (demonstration data)' : ''}.`, 'ok');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const download = async (id, name) => {
    try {
      const file = await api.download(`/api/reports/${id}/download`, name);
      saveBlob(file);
      toast(`<b>${file.filename}</b> downloaded.`, 'ok');
    } catch (e) {
      toast(e.message, 'alert');
    }
  };

  return (
    <div className="fixed inset-0 z-[90] modal-bg flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto fade-in p-6">
        <div className="flex items-center gap-2">
          <h2 className="font-extrabold text-lg flex-1">Generate Report</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-[12.5px] text-slate-500 font-medium">Built from live stored records · downloads a real file</p>

        {error && !catalog.length ? (
          <p className="text-[13px] font-bold text-rose-600 mt-4" role="alert">{error}</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Report type</label>
              <select className="inp mt-1" value={type} onChange={(e) => setType(e.target.value)}>
                {catalog.map((r) => <option key={r.type} value={r.type}>{r.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">District filter</label>
              <input className="inp mt-1" placeholder="e.g. Pune (optional)" value={filters.district} onChange={(e) => setFilters({ ...filters, district: e.target.value })} />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Sector filter</label>
              <input className="inp mt-1" placeholder="e.g. Electric Vehicles (optional)" value={filters.sector} onChange={(e) => setFilters({ ...filters, sector: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Format</label>
              <div className="flex gap-2 mt-1.5">
                {[['pdf', 'PDF'], ['csv', 'CSV'], ['xlsx', 'XLSX']].map(([v, l]) => (
                  <button key={v} onClick={() => setFormat(v)} className={`tab-b ${format === v ? 'active' : ''}`}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && catalog.length > 0 && <p className="text-[13px] font-bold text-rose-600 mt-3" role="alert">{error}</p>}

        {done && (
          <div className="mt-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex flex-wrap items-center gap-3">
            <FileText className="w-6 h-6 text-emerald-700" />
            <div className="flex-1 min-w-[180px]">
              <div className="text-[13.5px] font-extrabold">{done.title} ({done.format.toUpperCase()})</div>
              <div className="text-[12px] font-medium text-emerald-700">{done.rows} records · {(done.size / 1024).toFixed(1)} KB{done.demo ? ' · demonstration data' : ' · live records'}</div>
            </div>
            <button className="btn-p !text-[12px]" onClick={() => download(done.id, done.filename)}><Download className="w-4 h-4" /> Download</button>
          </div>
        )}

        <button className="btn-p w-full justify-center mt-4" disabled={busy || !type} onClick={generate}>
          {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating report…</> : 'Generate Report'}
        </button>

        {history.length > 0 && (
          <div className="mt-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5"><History className="w-4 h-4" /> Recent reports</div>
            <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
              {history.slice(0, 10).map((h) => (
                <div key={h.id} className="flex items-center gap-2 border rounded-xl px-3 py-2 text-[12.5px]">
                  <span className="chip bg-slate-900 text-white shrink-0">{h.format.toUpperCase()}</span>
                  <span className="flex-1 font-bold truncate">{h.title}</span>
                  <span className="text-slate-400 font-medium hidden sm:block">{new Date(h.created_at).toLocaleDateString()}</span>
                  <button className="btn-g !py-1 !text-[11.5px]" onClick={() => download(h.id, h.filename)}><Download className="w-3.5 h-3.5" /> Get</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
