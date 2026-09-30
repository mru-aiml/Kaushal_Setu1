import { useApiList, PageHeader, StatCards, DataTable, PageState, DemoNote } from '../../components/datapage';

// Dedicated page: skills with proficiency, experience and verification state.
export default function Skills() {
  const { rows, loading, error, reload } = useApiList('candidate_skills');
  const certs = useApiList('certifications');

  const certified = new Set((certs.rows || []).flatMap((c) => `${c.name} ${c.issuer}`.toLowerCase().split(/[^a-z+/#]+/)));
  const verified = (skill) => skill.toLowerCase().split(/[^a-z+/#]+/).some((w) => w.length > 3 && certified.has(w));

  return (
    <div className="fade-in">
      <PageHeader title="My Skills" sub="Proficiency, experience and verification state per skill" badge={<DemoNote />} />
      <PageState loading={loading} error={error} empty={!loading && rows.length === 0} onRetry={reload}>
        <StatCards items={[
          { l: 'Skills', v: rows.length, d: 'Recorded' },
          { l: 'Advanced+', v: rows.filter((r) => ['Advanced', 'Expert'].includes(r.proficiency)).length, d: 'Strong areas' },
          { l: 'Certified', v: certs.rows.length, d: 'Certificates' },
          { l: 'Total Experience', v: rows.reduce((a, r) => a + (Number(r.years) || 0), 0).toFixed(1) + ' yrs', d: 'Summed' },
        ]} />
        <DataTable
          columns={[
            { key: 'skill', label: 'Skill', bold: true },
            { key: 'proficiency', label: 'Proficiency', render: (r) => <span className={`chip ${r.proficiency === 'Expert' || r.proficiency === 'Advanced' ? 'bg-emerald-600 text-white' : r.proficiency === 'Intermediate' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-slate-100 text-slate-600'}`}>{r.proficiency}</span> },
            { key: 'years', label: 'Experience (yrs)' },
            { key: 'verified', label: 'Evidence', render: (r) => <span className={`chip ${verified(r.skill) ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>{verified(r.skill) ? '✓ CERTIFIED' : 'SELF-DECLARED'}</span> },
          ]}
          rows={rows}
        />
      </PageState>
    </div>
  );
}
