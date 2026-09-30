import { useMemo } from 'react';
import { useApiList, PageHeader, StatCards, DataTable, PageState, DemoNote } from '../../components/datapage';

// Dedicated page: emerging skills with growth, sector and relevance.
export default function EmergingSkills() {
  const { rows, loading, error, reload } = useApiList('skill_demand');

  const pct = (t) => {
    const m = String(t || '').match(/\+(\d+)%/);
    return m ? Number(m[1]) : 0;
  };
  const emerging = useMemo(() => [...rows].sort((a, b) => pct(b.trend) - pct(a.trend)).slice(0, 10), [rows]);

  return (
    <div className="fade-in">
      <PageHeader title="Emerging Skills" sub="Fastest-growing skills by YoY demand change" badge={<DemoNote />} />
      <PageState loading={loading} error={error} empty={!loading && emerging.length === 0} onRetry={reload}>
        <StatCards items={[
          { l: 'Tracked Skills', v: rows.length, d: 'Demand catalogue' },
          { l: 'Fastest Growth', v: emerging[0]?.trend || '—', d: emerging[0]?.skill || '' },
          { l: 'High-Gap Emerging', v: emerging.filter((e) => e.gap === 'High').length, d: 'Top 10 watchlist' },
          { l: 'Sectors', v: new Set(emerging.map((e) => e.sector)).size, d: 'Represented' },
        ]} />
        <div className="card p-5 mb-4">
          <h3 className="font-extrabold text-[15px] mb-3">Growth Ranking</h3>
          <div className="space-y-2.5">
            {emerging.map((e) => (
              <div key={e.id}><div className="flex justify-between text-[12.5px] font-bold mb-1"><span>{e.skill} · {e.sector}</span><span className="text-emerald-600">{e.trend}</span></div>
                <div className="progress"><div style={{ width: Math.min(100, pct(e.trend) * 1.8) + '%', background: 'linear-gradient(90deg,#7C3AED,#0D9488)' }} /></div></div>
            ))}
          </div>
        </div>
        <DataTable
          columns={[
            { key: 'skill', label: 'Skill', bold: true },
            { key: 'sector', label: 'Sector' },
            { key: 'trend', label: 'Growth (YoY)', render: (r) => <b className="text-emerald-600">{r.trend}</b> },
            { key: 'demand_index', label: 'Demand Index' },
            { key: 'relevance', label: 'Relevance', render: (r) => <span className="text-slate-600">{r.gap === 'High' ? 'Hire now — supply constrained' : 'Build pipeline for next cycle'}</span> },
          ]}
          rows={emerging}
        />
      </PageState>
    </div>
  );
}
