import { useMemo, useState } from 'react';
import { useApiList, PageHeader, StatCards, FilterBar, DataTable, PageState, DemoNote } from '../../components/datapage';

// Dedicated page: placement/employment outcomes with rates and trends.
export default function EmploymentOutcomes() {
  const { rows, loading, error, reload } = useApiList('employment_outcomes');
  const [q, setQ] = useState('');
  const [district, setDistrict] = useState('');

  const districts = useMemo(() => [...new Set(rows.map((r) => r.district).filter(Boolean))], [rows]);
  const filtered = rows.filter((r) =>
    (!q || `${r.trade} ${r.district}`.toLowerCase().includes(q.toLowerCase())) &&
    (!district || r.district === district));
  const placed = filtered.reduce((a, r) => a + (r.placed || 0), 0);
  const total = filtered.reduce((a, r) => a + (r.total || 0), 0);
  const byYear = useMemo(() => {
    const m = {};
    filtered.forEach((r) => {
      m[r.year] = m[r.year] || { placed: 0, total: 0 };
      m[r.year].placed += r.placed || 0;
      m[r.year].total += r.total || 0;
    });
    return Object.entries(m).sort(([a], [b]) => a - b);
  }, [filtered]);

  return (
    <div className="fade-in">
      <PageHeader title="Employment Outcomes" sub="Placements, rates and year-wise progression" badge={<DemoNote />} />
      <PageState loading={loading} error={error} empty={!loading && rows.length === 0} onRetry={reload}>
        <StatCards items={[
          { l: 'Placed', v: placed, d: `of ${total} trained` },
          { l: 'Placement Rate', v: total ? Math.round((placed / total) * 100) + '%' : '—', d: 'Overall' },
          { l: 'Trades Tracked', v: new Set(filtered.map((r) => r.trade)).size, d: 'Occupations' },
          { l: 'Districts', v: districts.length, d: 'Covered' },
        ]} />
        <FilterBar q={q} setQ={setQ} onSearch={() => {}} selects={[{ key: 'd', label: 'District', value: district, set: setDistrict, options: districts }]} onReset={() => { setQ(''); setDistrict(''); }} />
        {byYear.length > 1 && (
          <div className="card p-5 mb-4">
            <h3 className="font-extrabold text-[15px] mb-2">Placement Rate by Year</h3>
            <div className="space-y-2.5">
              {byYear.map(([y, v]) => (
                <div key={y}><div className="flex justify-between text-[12.5px] font-bold mb-1"><span>{y}</span><span>{v.total ? Math.round((v.placed / v.total) * 100) + `% (${v.placed}/${v.total})` : '—'}</span></div>
                  <div className="progress"><div style={{ width: (v.total ? (v.placed / v.total) * 100 : 0) + '%', background: 'linear-gradient(90deg,#059669,#0D9488)' }} /></div></div>
              ))}
            </div>
          </div>
        )}
        <DataTable
          columns={[
            { key: 'district', label: 'District', bold: true },
            { key: 'trade', label: 'Trade' },
            { key: 'placed', label: 'Placed' },
            { key: 'total', label: 'Trained' },
            { key: 'rate', label: 'Rate', render: (r) => <b className="text-emerald-600">{r.total ? Math.round(((r.placed || 0) / r.total) * 100) + '%' : '—'}</b> },
            { key: 'year', label: 'Year' },
          ]}
          rows={filtered}
        />
      </PageState>
    </div>
  );
}
