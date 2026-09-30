import { useMemo } from 'react';
import { useApiList, PageHeader, StatCards, DataTable, PageState, DemoNote } from '../../components/datapage';

// Dedicated page: course recommendations matched to skill gaps, with centre,
// duration and alignment.
export default function RecommendedCourses() {
  const skills = useApiList('candidate_skills');
  const courses = useApiList('courses');
  const centres = useApiList('training_centres');

  const have = useMemo(() => new Set(skills.rows.map((s) => s.skill.toLowerCase())), [skills.rows]);
  const centreOf = (sector) => {
    const hit = centres.rows.find((c) => (c.domains || '').toLowerCase().includes(sector.toLowerCase().split(' ')[0]));
    return hit ? hit.name : (centres.rows[0]?.name || '—');
  };

  const recs = useMemo(() => courses.rows.map((c) => {
    const key = c.title.toLowerCase().split(' ')[0];
    const matched = [...have].some((h) => c.title.toLowerCase().includes(h.split(' ')[0]) || h.includes(key));
    const score = (c.alignment || 0) + (matched ? 10 : 0);
    return { ...c, matched, score, centre: centreOf(c.sector || '') };
  }).sort((a, b) => (a.status === 'Needs Update' ? 0 : 1) - (b.status === 'Needs Update' ? 0 : 1) || b.score - a.score).slice(0, 12), [courses.rows, have, centres.rows]);

  return (
    <div className="fade-in">
      <PageHeader title="Recommended Courses" sub="Matched to your missing skills and live demand" badge={<DemoNote />} />
      <PageState loading={courses.loading || skills.loading} error={courses.error || skills.error} empty={!courses.loading && recs.length === 0} onRetry={() => { courses.reload(); skills.reload(); }}>
        <StatCards items={[
          { l: 'Recommended', v: recs.length, d: 'Ranked by fit' },
          { l: 'Builds On Your Skills', v: recs.filter((r) => r.matched).length, d: 'Progression fit' },
          { l: 'High-Demand Tracks', v: recs.filter((r) => r.status === 'Needs Update').length, d: 'Evolving fast' },
          { l: 'Partner Centres', v: centres.rows.length, d: 'Training locations' },
        ]} />
        <DataTable
          columns={[
            { key: 'title', label: 'Course', bold: true },
            { key: 'centre', label: 'Training Centre' },
            { key: 'duration_hours', label: 'Hours' },
            { key: 'level', label: 'Level' },
            { key: 'alignment', label: 'Alignment %', render: (r) => <b>{r.alignment}%</b> },
            { key: 'match', label: 'Why For You', render: (r) => <span className="text-slate-600">{r.matched ? 'Builds on your current skills' : 'Fills a high-gap skill'} · {r.status}</span> },
          ]}
          rows={recs}
        />
      </PageState>
    </div>
  );
}
