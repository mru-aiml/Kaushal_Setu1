import { useMemo, useState } from 'react';
import { useApiList, PageHeader, StatCards, FilterBar, DataTable, PageState, DemoNote } from '../../components/datapage';

// Dedicated page: occupations, openings, locations, trends, required skills.
export default function IndustryDemand() {
  const jobs = useApiList('jobs');
  const demand = useApiList('skill_demand');
  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');

  const locs = useMemo(() => [...new Set(jobs.rows.map((j) => j.location).filter(Boolean))], [jobs.rows]);
  const filtered = jobs.rows.filter((j) =>
    (!q || `${j.title} ${j.role} ${j.skills} ${j.industry}`.toLowerCase().includes(q.toLowerCase())) &&
    (!location || j.location === location));
  const open = filtered.filter((j) => j.status === 'Open');
  const openings = open.reduce((a, j) => a + (j.openings || 0), 0);

  return (
    <div className="fade-in">
      <PageHeader title="Industry Demand" sub="Occupations, openings, locations and skill trends from live postings" badge={<DemoNote />} />
      <PageState loading={jobs.loading} error={jobs.error} empty={!jobs.loading && jobs.rows.length === 0} onRetry={jobs.reload}>
        <StatCards items={[
          { l: 'Postings', v: filtered.length, d: `${open.length} open` },
          { l: 'Open Positions', v: openings, d: 'Headcount' },
          { l: 'Locations', v: locs.length, d: 'Hiring geographies' },
          { l: 'Tracked Demand Skills', v: demand.rows.length, d: 'Platform catalogue' },
        ]} />
        <FilterBar q={q} setQ={setQ} onSearch={() => {}} selects={[{ key: 'loc', label: 'Location', value: location, set: setLocation, options: locs }]} onReset={() => { setQ(''); setLocation(''); }} />
        <DataTable
          columns={[
            { key: 'title', label: 'Occupation', bold: true },
            { key: 'role', label: 'Role' },
            { key: 'location', label: 'Location' },
            { key: 'openings', label: 'Openings' },
            { key: 'experience', label: 'Experience' },
            { key: 'salary', label: 'Salary Range', render: (r) => `${r.salary_min || '—'} – ${r.salary_max || '—'}` },
            { key: 'skills', label: 'Required Skills' },
            { key: 'status', label: 'Status', render: (r) => <span className={`chip ${r.status === 'Open' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600'}`}>{r.status}</span> },
          ]}
          rows={filtered}
        />
      </PageState>
    </div>
  );
}
