import { useMemo } from 'react';
import { useApiList, PageHeader, StatCards, DataTable, PageState, DemoNote } from '../../components/datapage';

// Dedicated page: demanded vs taught skills, missing skills, severity, affected courses.
export default function TCSkillGaps() {
  const demand = useApiList('skill_demand');
  const courses = useApiList('courses');

  const taught = useMemo(() => {
    const set = new Set();
    courses.rows.forEach((c) => `${c.title} ${c.sector}`.toLowerCase().split(/[^a-z+/#]+/).forEach((w) => { if (w.length > 2) set.add(w); }));
    return set;
  }, [courses.rows]);

  const gaps = useMemo(() => demand.rows.map((d) => {
    const words = d.skill.toLowerCase().split(/[^a-z+/#]+/).filter((w) => w.length > 2);
    const covered = words.some((w) => taught.has(w));
    return { ...d, taught: covered, severity: d.gap === 'High' && !covered ? 'Critical' : d.gap === 'High' ? 'High' : 'Medium' };
  }), [demand.rows, taught]);

  const affected = (skill) => {
    const w = skill.toLowerCase().split(/[^a-z+/#]+/).filter((x) => x.length > 2);
    return courses.rows.filter((c) => w.some((x) => `${c.title} ${c.sector}`.toLowerCase().includes(x))).map((c) => c.title).slice(0, 2).join(', ') || 'New course needed';
  };

  return (
    <div className="fade-in">
      <PageHeader title="Skill Gaps" sub="Demanded vs taught skills, severity and affected courses" badge={<DemoNote />} />
      <PageState loading={demand.loading || courses.loading} error={demand.error || courses.error} empty={!demand.loading && demand.rows.length === 0} onRetry={() => { demand.reload(); courses.reload(); }}>
        <StatCards items={[
          { l: 'Demanded Skills', v: demand.rows.length, d: 'Platform demand' },
          { l: 'Critical Gaps', v: gaps.filter((g) => g.severity === 'Critical').length, d: 'Untaught + high demand' },
          { l: 'Covered', v: gaps.filter((g) => g.taught).length, d: 'In current courses' },
          { l: 'Courses Analysed', v: courses.rows.length, d: 'Centre catalogue' },
        ]} />
        <DataTable
          columns={[
            { key: 'skill', label: 'Demanded Skill', bold: true },
            { key: 'sector', label: 'Sector' },
            { key: 'demand_index', label: 'Demand' },
            { key: 'taught', label: 'Taught?', render: (r) => <span className={`chip ${r.taught ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>{r.taught ? 'YES' : 'NO'}</span> },
            { key: 'severity', label: 'Severity', render: (r) => <span className={`chip ${r.severity === 'Critical' ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-800'}`}>{r.severity.toUpperCase()}</span> },
            { key: 'courses', label: 'Affected / Action', render: (r) => <span className="text-slate-600">{affected(r.skill)}</span> },
          ]}
          rows={gaps}
        />
      </PageState>
    </div>
  );
}
