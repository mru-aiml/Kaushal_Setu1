import { useState } from 'react';
import { Upload, Loader2, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { api, ApiError } from '../services/api';
import { useApp } from '../hooks/AppContext';

const ACCEPT = '.csv,.xlsx,.xls';

// CSV/XLSX import: pick file → backend parse → preview → column mapping →
// confirm → commit. Invalid rows are reported with reasons, never dropped silently.
export default function ImportModal({ entity, fields, onClose, onDone }) {
  const { toast } = useApp();
  const [step, setStep] = useState(1);
  const [fileName, setFileName] = useState('');
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [truncated, setTruncated] = useState(false);
  const [mapping, setMapping] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const pick = async (file) => {
    setError('');
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      let b64 = '';
      const bytes = new Uint8Array(buf);
      for (let i = 0; i < bytes.length; i += 8192) b64 += String.fromCharCode(...bytes.slice(i, i + 8192));
      const out = await api.post('/api/import/parse', { filename: file.name, content: btoa(b64) });
      if (!out.columns.length) {
        setError('No columns found in this file. Check the header row.');
        return;
      }
      setFileName(file.name);
      setColumns(out.columns);
      setRows(out.rows);
      setTotal(out.total);
      setTruncated(out.truncated);
      // auto-map by case-insensitive name match
      const auto = {};
      for (const col of out.columns) {
        const hit = fields.find((f) => f.name.toLowerCase() === col.toLowerCase().replace(/\s+/g, '_'));
        auto[col] = hit ? hit.name : '';
      }
      setMapping(auto);
      setStep(2);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const mappedCount = Object.values(mapping).filter(Boolean).length;

  const commit = async () => {
    setBusy(true);
    setError('');
    try {
      const out = await api.post('/api/import/commit', { entity, rows, mapping });
      setResult(out);
      setStep(4);
      toast(`<b>Import finished:</b> ${out.imported} imported, ${out.failed} failed.`, out.failed ? 'alert' : 'ok');
      onDone?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] modal-bg flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto fade-in p-6">
        <h3 className="font-extrabold text-[17px]">Import CSV / XLSX</h3>
        <p className="text-[12.5px] text-slate-500 font-medium mt-0.5">Step {Math.min(step, 3)} of 3 · {fileName || 'choose a file'} · max 5 MB, 1000 rows/batch</p>

        {step === 1 && (
          <div className="mt-4">
            <label className="block rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center cursor-pointer hover:border-blue-500 transition">
              <Upload className="w-8 h-8 mx-auto text-slate-400" />
              <div className="text-[14px] font-extrabold mt-2">{busy ? 'Parsing…' : 'Choose a CSV or XLSX file'}</div>
              <div className="text-[12px] text-slate-500 font-medium">First row must be the header row</div>
              <input type="file" accept={ACCEPT} className="hidden" disabled={busy} onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])} />
            </label>
            {busy && <Loader2 className="w-5 h-5 animate-spin mx-auto mt-3 text-blue-600" />}
            {error && <p className="text-[13px] font-bold text-rose-600 mt-3" role="alert">{error}</p>}
          </div>
        )}

        {step === 2 && (
          <div className="mt-4">
            <div className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-2">Map file columns → record fields ({mappedCount} mapped)</div>
            <div className="grid sm:grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1">
              {columns.map((col) => (
                <div key={col} className="flex items-center gap-2 border rounded-xl px-3 py-2">
                  <span className="text-[12.5px] font-bold truncate flex-1" title={col}>{col}</span>
                  <select className="inp !w-auto !py-1.5 !text-[12px]" value={mapping[col] || ''} onChange={(e) => setMapping({ ...mapping, [col]: e.target.value })}>
                    <option value="">— ignore —</option>
                    {fields.map((f) => <option key={f.name} value={f.name}>{f.name}{f.required ? ' *' : ''}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mt-4 mb-2">Preview (first 8 of {total} rows{truncated ? ', capped at 1000' : ''})</div>
            <div className="overflow-x-auto border rounded-xl">
              <table className="data min-w-[560px]"><thead><tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
                <tbody>{rows.slice(0, 8).map((r, i) => <tr key={i}>{columns.map((c) => <td key={c} className="max-w-[160px] truncate" title={r[c]}>{r[c]}</td>)}</tr>)}</tbody></table>
            </div>
            {error && <p className="text-[13px] font-bold text-rose-600 mt-3" role="alert">{error}</p>}
            <div className="flex gap-2 mt-4">
              <button className="btn-g" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4" /> Back</button>
              <button className="btn-p flex-1 justify-center" disabled={mappedCount === 0} onClick={() => setStep(3)}>Review & Confirm <ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-4">
            <div className="rounded-2xl bg-slate-50 border p-4 text-[13.5px] font-medium">
              Ready to import <b>{total} rows</b> from <b>{fileName}</b> with <b>{mappedCount} mapped fields</b>.
              Rows that fail validation will be listed with reasons — valid rows are still imported.
            </div>
            {error && <p className="text-[13px] font-bold text-rose-600 mt-3" role="alert">{error}</p>}
            <div className="flex gap-2 mt-4">
              <button className="btn-g" onClick={() => setStep(2)}><ArrowLeft className="w-4 h-4" /> Back</button>
              <button className="btn-p flex-1 justify-center" disabled={busy} onClick={commit}>{busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing…</> : <>Confirm Import ({total} rows)</>}</button>
            </div>
          </div>
        )}

        {step === 4 && result && (
          <div className="mt-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-slate-50 border p-3"><div className="font-extrabold text-lg">{result.total}</div><div className="text-[11px] font-bold uppercase text-slate-500">Uploaded</div></div>
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3"><div className="font-extrabold text-lg text-emerald-700">{result.imported}</div><div className="text-[11px] font-bold uppercase text-emerald-600">Valid · imported</div></div>
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3"><div className="font-extrabold text-lg text-rose-700">{result.failed}</div><div className="text-[11px] font-bold uppercase text-rose-600">Invalid</div></div>
            </div>
            <p className="text-[13px] font-semibold mt-3">{result.message}</p>
            {result.errors?.length > 0 && (
              <div className="mt-3">
                <div className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-600" /> Error rows (showing {result.errors.length})</div>
                <div className="border rounded-xl overflow-x-auto max-h-[200px] overflow-y-auto">
                  <table className="data min-w-[560px]"><thead><tr><th>Row</th><th>Reason</th></tr></thead>
                    <tbody>{result.errors.map((e, i) => <tr key={i}><td className="font-bold">{e.index}</td><td className="text-rose-700 font-semibold">{e.errors.join('; ')}</td></tr>)}</tbody></table>
                </div>
              </div>
            )}
            {result.failed === 0 && <p className="flex items-center gap-2 text-[13px] font-bold text-emerald-700 mt-3"><CheckCircle2 className="w-4 h-4" /> All rows imported cleanly.</p>}
            <button className="btn-p w-full justify-center mt-4" onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
