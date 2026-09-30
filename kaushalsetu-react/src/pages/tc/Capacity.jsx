import { useApiList, PageHeader, StatCards, DataTable, PageState, DemoNote } from '../../components/datapage';

// Dedicated page: centre capacity, batches, seats, utilization.
export default function TCCapacity() {
  const batches = useApiList('batches');
  const trainers = useApiList('trainers');

  const seats = batches.rows.reduce((a, b) => a + (b.seats || 0), 0);
  const enrolled = batches.rows.reduce((a, b) => a + (b.enrolled || 0), 0);
  const util = seats ? Math.round((enrolled / seats) * 100) : 0;

  return (
    <div className="fade-in">
      <PageHeader title="Training Capacity" sub="Batches, seats, utilization and trainer availability" badge={<DemoNote />} />
      <PageState loading={batches.loading} error={batches.error} empty={!batches.loading && batches.rows.length === 0} onRetry={batches.reload}>
        <StatCards items={[
          { l: 'Total Seats', v: seats, d: `${batches.rows.length} batches` },
          { l: 'Enrolled', v: enrolled, d: `${util}% utilization` },
          { l: 'Available Seats', v: Math.max(0, seats - enrolled), d: 'Open for admission' },
          { l: 'Trainers', v: trainers.rows.length, d: 'On rolls' },
        ]} />
        <div className="card p-5 mb-4">
          <div className="flex justify-between text-[13px] font-bold mb-1.5"><span>Overall seat utilization</span><span>{enrolled} / {seats} ({util}%)</span></div>
          <div className="progress !h-3"><div style={{ width: util + '%', background: 'linear-gradient(90deg,#2563EB,#0D9488)' }} /></div>
        </div>
        <DataTable
          columns={[
            { key: 'batch_code', label: 'Batch', bold: true },
            { key: 'course', label: 'Course' },
            { key: 'seats', label: 'Seats' },
            { key: 'enrolled', label: 'Enrolled' },
            { key: 'fill', label: 'Fill %', render: (r) => <b>{r.seats ? Math.round(((r.enrolled || 0) / r.seats) * 100) + '%' : '—'}</b> },
            { key: 'start_date', label: 'Start Date' },
            { key: 'status', label: 'Status', render: (r) => <span className="chip bg-slate-100 text-slate-600">{r.status}</span> },
          ]}
          rows={batches.rows}
        />
      </PageState>
    </div>
  );
}
