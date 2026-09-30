import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useApiList, PageHeader, StatCards, DataTable, PageState, DemoNote } from '../../components/datapage';

// Dedicated page: recommended courses with priority, demand, seats, trainer +
// equipment requirements and a proposed schedule.
export default function TCTrainingPlans() {
  const navigate = useNavigate();
  const demand = useApiList('skill_demand');
  const courses = useApiList('courses');
  const trainers = useApiList('trainers');
  const equipment = useApiList('equipment');

  const plans = useMemo(() => {
    const existing = new Set(courses.rows.map((c) => c.title.toLowerCase()));
    return demand.rows.filter((d) => d.gap === 'High').slice(0, 8).map((d, i) => {
      const hasCourse = [...existing].some((t) => d.skill.toLowerCase().split(' ')[0].length > 2 && t.includes(d.skill.toLowerCase().split(' ')[0]));
      const seats = Math.min(120, Math.max(30, Math.round((d.demand_index - (d.supply || 0)) * 1.5)));
      return {
        id: d.id, course: hasCourse ? `Upgrade: ${d.skill} module` : `New: ${d.skill} course`,
        priority: i < 3 ? 'P1' : i < 6 ? 'P2' : 'P3',
        occupation: d.skill, demand: d.demand_index, district: d.district, seats,
        trainers: Math.max(1, Math.round(seats / 30)),
        equipment: (equipment.rows.find((e) => e.category && d.sector.toLowerCase().includes('ev') && e.category === 'EV Lab')?.name) || 'Standard lab kit',
        schedule: `Q${(i % 4) + 1} 2026–27`,
      };
    });
  }, [demand.rows, courses.rows, equipment.rows]);

  return (
    <div className="fade-in">
      <PageHeader
        title="Training Plans"
        sub="Demand-backed course proposals with resourcing and schedule"
        badge={<DemoNote />}
        actions={<button className="btn-g !text-[12px]" onClick={() => navigate('/training-centre/data')}>Manage Data <ArrowRight className="w-4 h-4" /></button>}
      />
      <PageState loading={demand.loading} error={demand.error} empty={!demand.loading && plans.length === 0} onRetry={demand.reload}>
        <StatCards items={[
          { l: 'Proposed Courses', v: plans.length, d: 'High-gap demand' },
          { l: 'P1 Priority', v: plans.filter((p) => p.priority === 'P1').length, d: 'Start first' },
          { l: 'Proposed Seats', v: plans.reduce((a, p) => a + p.seats, 0), d: '2026–27' },
          { l: 'Trainer Requirement', v: plans.reduce((a, p) => a + p.trainers, 0), d: `Across plans (${trainers.rows.length} on rolls)` },
        ]} />
        <DataTable
          columns={[
            { key: 'course', label: 'Recommended Course', bold: true },
            { key: 'priority', label: 'Priority', render: (r) => <span className={`chip ${r.priority === 'P1' ? 'bg-rose-600 text-white' : r.priority === 'P2' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>{r.priority}</span> },
            { key: 'occupation', label: 'Target Occupation' },
            { key: 'demand', label: 'Demand' },
            { key: 'district', label: 'District' },
            { key: 'seats', label: 'Seats' },
            { key: 'trainers', label: 'Trainers' },
            { key: 'equipment', label: 'Equipment' },
            { key: 'schedule', label: 'Schedule' },
          ]}
          rows={plans}
        />
      </PageState>
    </div>
  );
}
