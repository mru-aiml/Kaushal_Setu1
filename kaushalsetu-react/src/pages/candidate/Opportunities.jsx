import { useMemo, useState } from 'react';
import { useApiList, PageHeader, StatCards, FilterBar, DataTable, PageState, DemoNote } from '../../components/datapage';
import { useApp } from '../../hooks/AppContext';
import { api } from '../../services/api';

// Dedicated page: live PostgreSQL job openings with location/role/sector/skill filters.
export default function Opportunities() {
  const { toast } = useApp();
  const { rows, loading, error, reload } = useApiList('jobs', { limit: 200 });
  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');
  const [sector, setSector] = useState('');
  const [skill, setSkill] = useState('');
  const [applying, setApplying] = useState(null);

  const locs = useMemo(() => [...new Set(rows.map((j) => j.location).filter(Boolean))], [rows]);
  const sectors = useMemo(() => [...new Set(rows.map((j) => j.industry).filter(Boolean))], [rows]);

  const filtered = rows.filter((j) =>
    j.status === 'Open' &&
    (!q || `${j.title} ${j.role} ${j.skills}`.toLowerCase().includes(q.toLowerCase())) &&
    (!location || j.location === location) &&
    (!sector || j.industry === sector) &&
    (!skill || (j.skills || '').toLowerCase().includes(skill.toLowerCase())));

  const apply = async (job) => {
    setApplying(job.id);
    try {
      await api.post('/api/data/applications', { job_title: job.title, company: job.title, status: 'Applied', applied_on: new Date().toISOString().slice(0, 10) });
      toast(`<b>Application recorded</b> for ${job.title} — saved to your profile.`, 'ok');
    } catch (e) {
      toast(e.message, 'alert');
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="fade-in">
      <PageHeader title="Opportunities" sub="Live openings from PostgreSQL — filter and apply in one click" badge={<DemoNote />} />
      <PageState loading={loading} error={error} empty={!loading && rows.length === 0} onRetry={reload}>
        <StatCards items={[
          { l: 'Open Positions', v: filtered.reduce((a, j) => a + (j.openings || 0), 0), d: `${filtered.length} postings` },
          { l: 'Locations', v: locs.length, d: 'Hiring geographies' },
          { l: 'Sectors', v: sectors.length, d: 'Industries' },
        ]} />
        <div className="card p-4 mb-4">
          <div className="flex flex-wrap gap-2.5 items-end">
            <div className="flex-1 min-w-[160px]"><input className="inp" placeholder="Search role, skill…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
            <select className="inp !w-auto" value={location} onChange={(e) => setLocation(e.target.value)} aria-label="Location"><option value="">Location: All</option>{locs.map((l) => <option key={l}>{l}</option>)}</select>
            <select className="inp !w-auto" value={sector} onChange={(e) => setSector(e.target.value)} aria-label="Sector"><option value="">Sector: All</option>{sectors.map((s) => <option key={s}>{s}</option>)}</select>
            <input className="inp !w-40" placeholder="Skill…" value={skill} onChange={(e) => setSkill(e.target.value)} aria-label="Skill" />
            <button className="btn-g !py-2" onClick={() => { setQ(''); setLocation(''); setSector(''); setSkill(''); }}>Reset</button>
          </div>
        </div>
        <DataTable
          columns={[
            { key: 'title', label: 'Opening', bold: true },
            { key: 'role', label: 'Role' },
            { key: 'industry', label: 'Sector' },
            { key: 'location', label: 'Location' },
            { key: 'openings', label: 'Openings' },
            { key: 'salary', label: 'Salary', render: (r) => `${r.salary_min || '—'}–${r.salary_max || '—'}` },
            { key: 'skills', label: 'Skills' },
            { key: 'apply', label: 'Apply', render: (r) => <button className="btn-p !py-1.5 !text-[12px]" disabled={applying === r.id} onClick={() => apply(r)}>{applying === r.id ? 'Saving…' : 'Apply'}</button> },
          ]}
          rows={filtered}
          emptyTitle="No openings match"
          emptyDesc="Try widening the filters."
        />
      </PageState>
    </div>
  );
}
