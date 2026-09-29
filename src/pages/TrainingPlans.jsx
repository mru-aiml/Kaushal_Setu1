import { useState } from 'react';
import { Wand2 } from 'lucide-react';
import { DISTRICTS } from '../data/demoData';
import { DemoBadge } from '../components/ui';
import { DistrictPlanCard } from '../components/domain';
import { DistrictPlanModal } from '../components/modals';
import { useApp } from '../hooks/AppContext';
import { prototypeExport as mockDownload } from '../services/exportService';

export default function TrainingPlans() {
  const { selDist, toast } = useApp();
  const [open, setOpen] = useState(false);
  const d = DISTRICTS.find((x) => x.n === selDist) || DISTRICTS[0];

  return (
    <div className="fade-in">
      <div className="flex flex-wrap items-end gap-3 mb-5"><div><h1 className="text-2xl font-extrabold tracking-tight">District Training Plans</h1><p className="text-[13px] text-slate-500 mt-1">Final recommendation pack for government action · <DemoBadge label="Demo output" /></p></div><div className="flex-1" /><button className="btn-p" onClick={() => setOpen(true)}><Wand2 className="w-4 h-4" />Generate District Training Plan</button></div>
      <DistrictPlanCard d={d} onExport={(n) => mockDownload(n, toast)} onSend={() => toast(`Plan sent to District Skill Committee, ${d.n} for approval`, 'ok')} />
      {open && <DistrictPlanModal d={d} onClose={() => setOpen(false)} notify={toast} />}
    </div>
  );
}

