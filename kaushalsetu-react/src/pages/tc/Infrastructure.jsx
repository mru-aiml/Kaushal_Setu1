import { useApiList, PageHeader, StatCards, DataTable, PageState, DemoNote } from '../../components/datapage';

// Dedicated page: equipment availability vs requirement, gaps, priority.
export default function TCInfrastructure() {
  const { rows, loading, error, reload } = useApiList('equipment');
  const gapUnits = rows.reduce((a, e) => a + Math.max(0, (e.required || 0) - (e.available || 0)), 0);
  const critical = rows.filter((e) => e.priority === 'High' && (e.available || 0) < (e.required || 0));

  return (
    <div className="fade-in">
      <PageHeader title="Infrastructure" sub="Equipment availability, utilization, gaps and procurement priority" badge={<DemoNote />} />
      <PageState loading={loading} error={error} empty={!loading && rows.length === 0} onRetry={reload}>
        <StatCards items={[
          { l: 'Equipment Lines', v: rows.length, d: 'Tracked assets' },
          { l: 'Gap Units', v: gapUnits, d: 'Required − available' },
          { l: 'High Priority Gaps', v: critical.length, d: 'Procure first' },
          { l: 'Avg Utilization', v: rows.length ? Math.round(rows.reduce((a, e) => a + (e.utilization || 0), 0) / rows.length) + '%' : '—', d: 'In-use share' },
        ]} />
        <DataTable
          columns={[
            { key: 'name', label: 'Equipment', bold: true },
            { key: 'category', label: 'Category' },
            { key: 'available', label: 'Available' },
            { key: 'required', label: 'Required' },
            { key: 'gap', label: 'Gap', render: (r) => { const g = Math.max(0, (r.required || 0) - (r.available || 0)); return <b className={g > 0 ? 'text-rose-600' : 'text-emerald-600'}>+{g}</b>; } },
            { key: 'utilization', label: 'Utilization', render: (r) => `${r.utilization || 0}%` },
            { key: 'condition', label: 'Condition' },
            { key: 'priority', label: 'Priority', render: (r) => <span className={`chip ${r.priority === 'High' ? 'bg-rose-600 text-white' : r.priority === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>{r.priority}</span> },
          ]}
          rows={rows}
        />
      </PageState>
    </div>
  );
}
