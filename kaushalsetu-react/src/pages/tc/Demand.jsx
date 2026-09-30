import { useMemo, useState } from 'react';
import { useApiList, PageHeader, StatCards, FilterBar, DataTable, PageState, DemoNote } from '../../components/datapage';

// Dedicated page: labour-market demand relevant to the training centre.
export default function TCDemand() {
  const { rows, loading, error, reload } = useApiList('skill_demand');
  const jobs = useApiList('jobs');
  const [q, setQ] = useState('');
  const [district, setDistrict] = useState('');
  const [sector, setSector] = useState('');

  const districts = useMemo(() => [...new Set(rows.map((r) => r.district).filter(Boolean))], [rows]);
  const sectors = useMemo(() => [...new Set(rows.map((r) => r.sector).filter(Boolean))], [rows]);
  const filtered = rows.filter((r) =>
    (!q || `${r.skill} ${r.sector} ${r.district}`.toLowerCase().includes(q.toLowerCase())) &&
    (!district || r.district === district) && (!sector || r.sector === sector));
  const jrows = jobs.rows;
  const topJobs = [...jrows].sort((a, b) => (b.openings || 0) - (a.openings || 0)).slice(0, 5);
  const openTotal = jrows.reduce((a, j) => a + (j.openings || 0), 0);

  return (
    <div className="fade-in">
      <PageHeader title="Labour-Market Demand" sub="Top demanded occupations, districts and industries — live platform data" badge={<DemoNote />} />
      <PageState loading={loading || jobs.loading} error={error || jobs.error} empty={!loading && rows.length === 0} onRetry={() => { reload(); jobs.reload(); }}>
        <StatCards items={[
          { l: 'Tracked Skills', v: rows.length, d: `${sectors.length} sectors` },
          { l: 'Open Positions (visible)', v: openTotal, d: `${jrows.length} postings` },
          { l: 'High-Gap Skills', v: rows.filter((r) => r.gap === 'High').length, d: 'Priority for courses' },
          { l: 'Districts Covered', v: districts.length, d: 'Maharashtra focus' },
        ]} />
        <FilterBar q={q} setQ={setQ} onSearch={() => {}} selects={[
          { key: 'district', label: 'District', value: district, set: setDistrict, options: districts },
          { key: 'sector', label: 'Sector', value: sector, set: setSector, options: sectors },
        ]} onReset={() => { setQ(''); setDistrict(''); setSector(''); }} />
        <div className="card p-5 mb-4">
          <h3 className="font-extrabold text-[15px] mb-2">Top Occupations by Openings</h3>
          <div className="space-y-2.5">
            {topJobs.map((j) => (
              <div key={j.id}><div className="flex justify-between text-[12.5px] font-bold mb-1"><span>{j.role} · {j.location}</span><span>{j.openings} openings</span></div>
                <div className="progress"><div style={{ width: Math.min(100, (j.openings / Math.max(1, topJobs[0]?.openings || 1)) * 100) + '%', background: 'linear-gradient(90deg,#2563EB,#0D9488)' }} /></div></div>
            ))}
          </div>
        </div>
        <DataTable
          columns={[
            { key: 'skill', label: 'Occupation / Skill', bold: true },
            { key: 'sector', label: 'Industry' },
            { key: 'district', label: 'District' },
            { key: 'demand_index', label: 'Demand' },
            { key: 'trend', label: 'YoY Change', render: (r) => <b className="text-emerald-600">{r.trend}</b> },
            { key: 'gap', label: 'Gap', render: (r) => <span className={`chip ${r.gap === 'High' ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-800'}`}>{r.gap}</span> },
          ]}
          rows={filtered}
        />
      </PageState>
    </div>
  );
}
