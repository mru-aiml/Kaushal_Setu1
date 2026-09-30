import { useMemo, useState } from 'react';
import { useApiList, PageHeader, StatCards, FilterBar, DataTable, PageState, DemoNote } from '../../components/datapage';

// Dedicated page: training centre registry with capacity and accreditation.
export default function TrainingCentres() {
  const { rows, loading, error, reload } = useApiList('training_centres');
  const [q, setQ] = useState('');
  const [district, setDistrict] = useState('');

  const districts = useMemo(() => [...new Set(rows.map((r) => r.district).filter(Boolean))], [rows]);
  const filtered = rows.filter((r) =>
    (!q || `${r.name} ${r.centre_id} ${r.domains}`.toLowerCase().includes(q.toLowerCase())) &&
    (!district || r.district === district));

  return (
    <div className="fade-in">
      <PageHeader title="Training Centres" sub="Registered centre network, capacity and accreditation" badge={<DemoNote />} />
      <PageState loading={loading} error={error} empty={!loading && rows.length === 0} onRetry={reload}>
        <StatCards items={[
          { l: 'Centres', v: filtered.length, d: `${districts.length} districts` },
          { l: 'Combined Capacity', v: filtered.reduce((a, c) => a + (c.capacity || 0), 0), d: 'Seats' },
          { l: 'NSQF Aligned', v: filtered.filter((c) => /nsqf/i.test(c.accreditation || '')).length, d: 'Centres' },
          { l: 'Affiliated', v: filtered.filter((c) => !/nsqf/i.test(c.accreditation || '')).length, d: 'Centres' },
        ]} />
        <FilterBar q={q} setQ={setQ} onSearch={() => {}} selects={[{ key: 'd', label: 'District', value: district, set: setDistrict, options: districts }]} onReset={() => { setQ(''); setDistrict(''); }} />
        <DataTable
          columns={[
            { key: 'name', label: 'Centre', bold: true },
            { key: 'centre_id', label: 'Centre ID' },
            { key: 'district', label: 'District' },
            { key: 'domains', label: 'Domains' },
            { key: 'capacity', label: 'Capacity' },
            { key: 'accreditation', label: 'Accreditation', render: (r) => <span className={`chip ${/nsqf/i.test(r.accreditation || '') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600'}`}>{r.accreditation}</span> },
          ]}
          rows={filtered}
        />
      </PageState>
    </div>
  );
}
