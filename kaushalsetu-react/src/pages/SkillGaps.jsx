import { BookOpenCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GAP_ROWS } from '../data/demoData';
import { DemoBadge } from '../components/ui';
import { SkillGapTable, AIInsightBox } from '../components/domain';
import { GapChart } from '../components/charts';

export default function SkillGaps() {
  const navigate = useNavigate();
  return (
    <div className="fade-in">
      <div className="flex flex-wrap items-end gap-3 mb-5"><div><h1 className="text-2xl font-extrabold tracking-tight">Skill Gap Analysis</h1><p className="text-[13px] text-slate-500 mt-1"><b>Pune · Automotive / EV · EV Service Engineer</b> · <DemoBadge label="Prototype scenario" /></p></div><div className="flex-1" /><button className="btn-p" onClick={() => navigate('/government/curriculum')}><BookOpenCheck className="w-4 h-4" />Open Affected Course</button></div>
      <div className="card p-5 mb-4 overflow-x-auto"><SkillGapTable rows={GAP_ROWS} /></div>
      <div className="grid xl:grid-cols-2 gap-4">
        <div className="card p-5"><h3 className="font-extrabold text-[15px] mb-2">Demand vs Supply</h3><div className="h-[260px]"><GapChart /></div><p className="demo-note mt-2">Illustrative scenario — not measured statistics.</p></div>
        <AIInsightBox />
      </div>
    </div>
  );
}

