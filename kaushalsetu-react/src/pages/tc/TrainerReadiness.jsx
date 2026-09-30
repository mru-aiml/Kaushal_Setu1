import { useApiList, PageHeader, StatCards, DataTable, PageState, DemoNote } from '../../components/datapage';

// Dedicated page: trainer expertise, readiness, certifications, gaps, upskilling.
export default function TCTrainerReadiness() {
  const { rows, loading, error, reload } = useApiList('trainers');
  const ready = rows.filter((t) => (t.score || 0) >= 70);
  const gap = rows.filter((t) => (t.score || 0) < 60);

  return (
    <div className="fade-in">
      <PageHeader title="Trainer Readiness" sub="Expertise, readiness scores, certifications and upskilling needs" badge={<DemoNote />} />
      <PageState loading={loading} error={error} empty={!loading && rows.length === 0} onRetry={reload}>
        <StatCards items={[
          { l: 'Trainers', v: rows.length, d: 'On rolls' },
          { l: 'Ready (70+)', v: ready.length, d: 'Deployable now' },
          { l: 'Upskilling Needed', v: gap.length, d: 'Score below 60' },
          { l: 'Avg Readiness', v: rows.length ? Math.round(rows.reduce((a, t) => a + (t.score || 0), 0) / rows.length) : 0, d: 'Score / 100' },
        ]} />
        <DataTable
          columns={[
            { key: 'name', label: 'Trainer', bold: true },
            { key: 'trade', label: 'Specialization' },
            { key: 'certification', label: 'Certifications' },
            { key: 'score', label: 'Readiness', render: (r) => (
              <span className="flex items-center gap-2"><span className="progress w-20"><span style={{ display: 'block', width: (r.score || 0) + '%', background: (r.score || 0) >= 70 ? '#059669' : (r.score || 0) >= 60 ? '#F59E0B' : '#E11D48', height: '100%', borderRadius: 999 }} /></span><b>{r.score}</b></span>
            ) },
            { key: 'status', label: 'Status', render: (r) => <span className={`chip ${r.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>{r.status}</span> },
            { key: 'upskill', label: 'Recommended Upskilling', render: (r) => <span className="text-slate-600">{(r.score || 0) < 60 ? `Bridge ${r.trade} → industry standard (60h)` : '—'}</span> },
          ]}
          rows={rows}
        />
      </PageState>
    </div>
  );
}
