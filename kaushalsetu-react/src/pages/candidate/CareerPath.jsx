import { useMemo } from 'react';
import { ArrowDown } from 'lucide-react';
import { useApiList, PageHeader, PageState, DemoNote } from '../../components/datapage';

// Dedicated page: visual progression current → gaps → learning → target → jobs.
export default function CareerPath() {
  const skills = useApiList('candidate_skills');
  const demand = useApiList('skill_demand');
  const jobs = useApiList('jobs');

  const have = useMemo(() => skills.rows.map((s) => s.skill), [skills.rows]);
  const topGaps = useMemo(() => [...demand.rows].sort((a, b) => (b.demand_index || 0) - (a.demand_index || 0)).slice(0, 3).map((d) => d.skill), [demand.rows]);
  const target = topGaps[0]?.replace(/s$/, '') + ' Technician' || 'Target Role';
  const openings = jobs.rows.filter((j) => /technician|engineer|analyst|developer/i.test(j.role || '')).slice(0, 4);

  const stages = [
    { label: 'Current Skills', items: have.length ? have : ['No skills recorded yet — add them in Manage Data'], tone: 'dark' },
    { label: 'Skill Gaps', items: topGaps.length ? topGaps : ['—'], tone: 'rose' },
    { label: 'Recommended Learning', items: topGaps.map((g) => `${g} module (60–120h)`), tone: 'blue' },
    { label: 'Target Role', items: [demand.rows[0] ? `${demand.rows[0].skill} Specialist` : target], tone: 'amber' },
    { label: 'Employment Opportunities', items: openings.length ? openings.map((o) => `${o.title} · ${o.location} (${o.openings} openings)`) : ['Complete skills to unlock matching openings'], tone: 'green' },
  ];
  const toneCls = { dark: 'bg-slate-900 text-white', rose: 'bg-rose-50 text-rose-800 border border-rose-100', blue: 'bg-blue-50 text-blue-800 border border-blue-100', amber: 'bg-amber-50 text-amber-800 border border-amber-100', green: 'bg-emerald-600 text-white' };

  return (
    <div className="fade-in">
      <PageHeader title="Career Path" sub="Your progression from current skills to employment" badge={<DemoNote />} />
      <PageState loading={skills.loading || demand.loading} error={skills.error || demand.error} empty={false} onRetry={() => { skills.reload(); demand.reload(); }}>
        <div className="max-w-[720px] mx-auto">
          {stages.map((s, i) => (
            <div key={s.label}>
              <div className="card p-5">
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Stage {i + 1} · {s.label}</div>
                <div className="flex flex-col gap-1.5 mt-2.5">
                  {s.items.map((it) => <span key={it} className={`rounded-xl px-3 py-2 text-[13px] font-bold ${toneCls[s.tone]}`}>{it}</span>)}
                </div>
              </div>
              {i < stages.length - 1 && <div className="flex justify-center py-1.5"><ArrowDown className="w-5 h-5 text-slate-400" /></div>}
            </div>
          ))}
        </div>
      </PageState>
    </div>
  );
}
