import { useMemo } from 'react';
import { useApiList, PageHeader, StatCards, DataTable, PageState, DemoNote } from '../../components/datapage';

// Dedicated page: openings, demand changes, skill requirements, hiring activity.
export default function HiringSignals() {
  const jobs = useApiList('jobs');
  const validations = useApiList('skill_validations');

  const validatedSkills = useMemo(() => new Set(validations.rows.filter((v) => v.status === 'Validated').map((v) => v.skill.toLowerCase())), [validations.rows]);
  const open = jobs.rows.filter((j) => j.status === 'Open');

  return (
    <div className="fade-in">
      <PageHeader title="Placement / Hiring Signals" sub="Live hiring activity from your postings and validated demand" badge={<DemoNote />} />
      <PageState loading={jobs.loading} error={jobs.error} empty={!jobs.loading && jobs.rows.length === 0} onRetry={jobs.reload}>
        <StatCards items={[
          { l: 'Open Positions', v: open.reduce((a, j) => a + (j.openings || 0), 0), d: `${open.length} open postings` },
          { l: 'Validated Skills', v: validatedSkills.size, d: 'Confirmed demand' },
          { l: 'Hiring Locations', v: new Set(open.map((j) => j.location)).size, d: 'Active geographies' },
          { l: 'Avg Openings / Posting', v: open.length ? (open.reduce((a, j) => a + (j.openings || 0), 0) / open.length).toFixed(1) : 0, d: 'Batch size' },
        ]} />
        <DataTable
          columns={[
            { key: 'title', label: 'Opening', bold: true },
            { key: 'location', label: 'Location' },
            { key: 'openings', label: 'Openings' },
            { key: 'status', label: 'Hiring Status', render: (r) => <span className={`chip ${r.status === 'Open' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600'}`}>{r.status}</span> },
            { key: 'skills', label: 'Skill Requirements', render: (r) => (
              <span className="flex flex-wrap gap-1">{String(r.skills || '').split(',').map((s) => s.trim()).filter(Boolean).map((s) => (
                <span key={s} className={`chip border ${validatedSkills.has(s.toLowerCase()) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-100 text-slate-600'}`} title={validatedSkills.has(s.toLowerCase()) ? 'Validated' : 'Unvalidated'}>{validatedSkills.has(s.toLowerCase()) ? '✓ ' : ''}{s}</span>
              ))}</span>
            ) },
          ]}
          rows={jobs.rows}
        />
      </PageState>
    </div>
  );
}
