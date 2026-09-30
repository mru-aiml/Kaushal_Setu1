import { useApiList, PageHeader, StatCards, DataTable, PageState, DemoNote } from '../../components/datapage';

// Dedicated page: programme portfolio with seats and status.
export default function ProgrammeImpact() {
  const { rows, loading, error, reload } = useApiList('programmes');
  const outcomes = useApiList('employment_outcomes');

  const seats = rows.reduce((a, p) => a + (p.seats || 0), 0);
  const placed = outcomes.rows.reduce((a, o) => a + (o.placed || 0), 0);

  return (
    <div className="fade-in">
      <PageHeader title="Programme Impact" sub="Scheme portfolio, seats and employment linkage" badge={<DemoNote />} />
      <PageState loading={loading} error={error} empty={!loading && rows.length === 0} onRetry={reload}>
        <StatCards items={[
          { l: 'Programmes', v: rows.length, d: `${rows.filter((p) => p.status === 'Active').length} active` },
          { l: 'Total Seats', v: seats, d: 'Sanctioned' },
          { l: 'Placed (linked outcomes)', v: placed, d: 'Across districts' },
          { l: 'Sectors', v: new Set(rows.map((p) => p.sector)).size, d: 'Covered' },
        ]} />
        <DataTable
          columns={[
            { key: 'name', label: 'Programme', bold: true },
            { key: 'sector', label: 'Sector' },
            { key: 'seats', label: 'Seats' },
            { key: 'status', label: 'Status', render: (r) => <span className={`chip ${r.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600'}`}>{r.status}</span> },
            { key: 'start_year', label: 'Start Year' },
          ]}
          rows={rows}
        />
      </PageState>
    </div>
  );
}
