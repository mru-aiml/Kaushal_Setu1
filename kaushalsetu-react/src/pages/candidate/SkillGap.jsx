import { useMemo, useState } from 'react';
import { useApiList, PageHeader, StatCards, DataTable, PageState, DemoNote } from '../../components/datapage';

// Dedicated page: target role vs current skills — missing skills, severity, learning.
export default function SkillGap() {
  const skills = useApiList('candidate_skills');
  const demand = useApiList('skill_demand');
  const [target, setTarget] = useState('');

  const roles = useMemo(() => [...new Set(demand.rows.map((d) => d.skill))].slice(0, 24), [demand.rows]);
  const have = useMemo(() => new Set(skills.rows.map((s) => s.skill.toLowerCase())), [skills.rows]);

  const analyse = useMemo(() => {
    if (!target) return [];
    const key = target.toLowerCase().split(' ')[0];
    return demand.rows
      .filter((d) => d.skill.toLowerCase().includes(key) || d.sector.toLowerCase().includes(key))
      .slice(0, 8)
      .map((d) => {
        const owned = [...have].some((h) => d.skill.toLowerCase().includes(h) || h.includes(d.skill.toLowerCase().split(' ')[0]));
        return { id: d.id, skill: d.skill, demand: d.demand_index, status: owned ? 'Have it' : 'Missing', severity: owned ? 'None' : d.gap === 'High' ? 'Critical' : 'Medium', learn: owned ? '—' : `Train: ${d.skill} module (60–120h)` };
      });
  }, [target, demand.rows, have]);

  return (
    <div className="fade-in">
      <PageHeader title="Skill Gap" sub="Pick a target role — see exactly what is missing and how severe it is" badge={<DemoNote />} />
      <PageState loading={skills.loading || demand.loading} error={skills.error || demand.error} empty={false} onRetry={() => { skills.reload(); demand.reload(); }}>
        <div className="card p-4 mb-4">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500" htmlFor="gap-target">Target role</label>
          <select id="gap-target" className="inp mt-1 max-w-[420px]" value={target} onChange={(e) => setTarget(e.target.value)}>
            <option value="">Select a target role…</option>
            {['EV Service Technician', 'Battery Technician', 'CNC Programmer', 'PLC Automation Engineer', 'Solar O&M Technician', 'Data Analyst', 'MLOps Associate', 'Full Stack Developer', ...roles].filter((v, i, a) => v && a.indexOf(v) === i).map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        {!target ? (
          <div className="card p-8 text-center text-[13.5px] font-semibold text-slate-500">Select a target role above to compute your gap from live platform demand.</div>
        ) : (
          <>
            <StatCards items={[
              { l: 'Skills Required', v: analyse.length, d: `For ${target}` },
              { l: 'You Have', v: analyse.filter((a) => a.status === 'Have it').length, d: 'Covered' },
              { l: 'Missing', v: analyse.filter((a) => a.status === 'Missing').length, d: 'To learn' },
              { l: 'Critical', v: analyse.filter((a) => a.severity === 'Critical').length, d: 'Learn first' },
            ]} />
            <DataTable
              columns={[
                { key: 'skill', label: 'Skill', bold: true },
                { key: 'demand', label: 'Demand Index' },
                { key: 'status', label: 'Your Status', render: (r) => <span className={`chip ${r.status === 'Have it' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>{r.status.toUpperCase()}</span> },
                { key: 'severity', label: 'Gap Severity', render: (r) => <span className={`chip ${r.severity === 'Critical' ? 'bg-rose-600 text-white' : r.severity === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>{r.severity.toUpperCase()}</span> },
                { key: 'learn', label: 'Recommended Learning' },
              ]}
              rows={analyse}
            />
          </>
        )}
      </PageState>
    </div>
  );
}
