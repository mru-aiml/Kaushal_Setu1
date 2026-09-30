import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '../services/api';
import { LoadingState, ErrorState, EmptyState } from './states';
import { DemoBadge } from './ui';

// Shared kit for dedicated workspace pages (Goal 3): every sidebar item gets
// a real page with its own data, filters, tables and actions — never a scroll
// anchor into the dashboard.

export function useApiList(entity, { limit = 100 } = {}) {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (q = '') => {
    setLoading(true);
    setError('');
    try {
      const r = await api.get(`/api/data/${entity}?q=${encodeURIComponent(q)}&limit=${limit}`);
      setRows(r.data || []);
      setTotal(r.total ?? (r.data || []).length);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [entity]);
  return { rows, total, loading, error, reload: load };
}

export function PageHeader({ title, sub, badge, actions }) {
  return (
    <div className="flex flex-wrap items-end gap-3 mb-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {sub && <p className="text-[13px] text-slate-500 mt-1">{sub}</p>}
      </div>
      <div className="flex-1" />
      {badge}
      {actions}
    </div>
  );
}

export function StatCards({ items }) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4 mb-4">
      {items.map((s) => (
        <div key={s.l} className="card p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{s.l}</div>
          <div className="text-[22px] font-extrabold tracking-tight">{s.v}</div>
          {s.d && <div className="text-[11.5px] font-semibold text-slate-500">{s.d}</div>}
        </div>
      ))}
    </div>
  );
}

export function FilterBar({ q, setQ, onSearch, selects = [], onReset }) {
  return (
    <div className="card p-4 mb-4">
      <div className="flex flex-wrap gap-2.5 items-end">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="inp !pl-9" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onSearch(); }} />
        </div>
        {selects.map((s) => (
          <div key={s.key}>
            <select className="inp" value={s.value} onChange={(e) => s.set(e.target.value)} aria-label={s.label}>
              <option value="">{s.label}: All</option>
              {s.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <button className="btn-g !py-2" onClick={onSearch}>Apply</button>
        {onReset && <button className="btn-g !py-2" onClick={onReset}>Reset</button>}
      </div>
    </div>
  );
}

export function DataTable({ columns, rows, rowKey = 'id', emptyTitle = 'No data available yet', emptyDesc = 'No records match the current filters.' }) {
  if (!rows.length) return <div className="card p-5"><EmptyState title={emptyTitle} desc={emptyDesc} /></div>;
  return (
    <div className="card p-5 overflow-x-auto">
      <table className="data min-w-[720px]">
        <thead><tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[rowKey]}>
              {columns.map((c) => (
                <td key={c.key} className="max-w-[240px]">
                  {c.render ? c.render(r) : <span className={c.bold ? 'font-bold' : ''} title={String(r[c.key] ?? '')}>{r[c.key] ?? '—'}</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PageState({ loading, error, empty, onRetry, children, loadingLabel = 'Loading…' }) {
  if (loading) return <LoadingState label={loadingLabel} />;
  if (error) return <ErrorState title="Could not load data" desc={error} onRetry={onRetry} />;
  if (empty) return <EmptyState title="No data available yet" desc="No records match the current filters." />;
  return children;
}

export function DemoNote() {
  return <DemoBadge label="Demonstration data" />;
}
