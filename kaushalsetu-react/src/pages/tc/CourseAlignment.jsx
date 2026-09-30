import { useMemo } from 'react';
import { useApiList, PageHeader, StatCards, DataTable, PageState, DemoNote } from '../../components/datapage';

// Dedicated page: course alignment vs industry demand.
const alignColor = (a) => (a < 60 ? '#E11D48' : a < 80 ? '#F59E0B' : '#059669');

export default function TCCourseAlignment() {
  const courses = useApiList('courses');
  const demand = useApiList('skill_demand');

  const missingFor = (courseTitle) => {
    const t = courseTitle.toLowerCase();
    const pool = t.includes('ev') ? demand.rows.filter((d) => /ev|battery|can|diagnostic/i.test(d.skill))
      : t.includes('cnc') ? demand.rows.filter((d) => /cnc|autocad|quality/i.test(d.skill))
      : t.includes('data') || t.includes('python') || t.includes('machine') ? demand.rows.filter((d) => /data|python|machine|sql|power/i.test(d.skill))
      : t.includes('solar') ? demand.rows.filter((d) => /solar/i.test(d.skill))
      : t.includes('plc') || t.includes('automation') ? demand.rows.filter((d) => /plc|automation|electrical/i.test(d.skill))
      : [];
    return pool.filter((d) => d.gap === 'High').slice(0, 3).map((d) => d.skill);
  };

  const needUpdate = useMemo(() => courses.rows.filter((c) => c.status !== 'Aligned'), [courses.rows]);
  const avg = courses.rows.length ? Math.round(courses.rows.reduce((a, c) => a + (c.alignment || 0), 0) / courses.rows.length) : 0;

  return (
    <div className="fade-in">
      <PageHeader title="Course Alignment" sub="Industry alignment per course, missing skills and update requirements" badge={<DemoNote />} />
      <PageState loading={courses.loading || demand.loading} error={courses.error || demand.error} empty={!courses.loading && courses.rows.length === 0} onRetry={() => { courses.reload(); demand.reload(); }}>
        <StatCards items={[
          { l: 'Courses', v: courses.rows.length, d: `Avg alignment ${avg}%` },
          { l: 'Aligned', v: courses.rows.filter((c) => c.status === 'Aligned').length, d: 'No action needed' },
          { l: 'Needs Update', v: needUpdate.filter((c) => c.status === 'Needs Update').length, d: 'Priority queue' },
          { l: 'In Review', v: needUpdate.filter((c) => c.status === 'Review').length, d: 'Watchlist' },
        ]} />
        <DataTable
          columns={[
            { key: 'title', label: 'Course', bold: true },
            { key: 'code', label: 'Code' },
            { key: 'alignment', label: 'Alignment %', render: (r) => (
              <span className="flex items-center gap-2"><span className="progress w-24"><span style={{ display: 'block', width: (r.alignment || 0) + '%', background: alignColor(r.alignment || 0), height: '100%', borderRadius: 999 }} /></span><b style={{ color: alignColor(r.alignment || 0) }}>{r.alignment}%</b></span>
            ) },
            { key: 'status', label: 'Status', render: (r) => <span className={`chip ${r.status === 'Aligned' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : r.status === 'Needs Update' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>{r.status}</span> },
            { key: 'missing', label: 'Missing High-Gap Skills', render: (r) => <span className="text-slate-600">{missingFor(r.title).join(', ') || '—'}</span> },
          ]}
          rows={courses.rows}
        />
      </PageState>
    </div>
  );
}
