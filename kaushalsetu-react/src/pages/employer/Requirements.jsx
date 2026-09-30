import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../hooks/AppContext';
import { useApiList, PageHeader, StatCards, DataTable, PageState, DemoNote } from '../../components/datapage';

// Dedicated page: submitted requirements with status and skills.
export default function Requirements() {
  const navigate = useNavigate();
  const { toast } = useApp();
  const { rows, loading, error, reload } = useApiList('jobs');
  const [closing, setClosing] = useState(null);

  const cycle = async (job) => {
    const next = job.status === 'Open' ? 'Paused' : job.status === 'Paused' ? 'Closed' : 'Open';
    try {
      await api.put(`/api/data/jobs/${job.id}`, { ...job, status: next });
      toast(`<b>${job.title}</b> → ${next}.`, 'ok');
      reload();
    } catch (e) {
      toast(e.message, 'alert');
    } finally {
      setClosing(null);
    }
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="My Requirements"
        sub="Submitted hiring requirements, status and required skills"
        badge={<DemoNote />}
        actions={<button className="btn-p !text-[12px]" onClick={() => navigate('/employer/submit-requirement')}><Plus className="w-4 h-4" /> New Requirement</button>}
      />
      <PageState loading={loading} error={error} empty={!loading && rows.length === 0} onRetry={reload}>
        <StatCards items={[
          { l: 'Submitted', v: rows.length, d: 'Total requirements' },
          { l: 'Open', v: rows.filter((r) => r.status === 'Open').length, d: 'Hiring now' },
          { l: 'Paused', v: rows.filter((r) => r.status === 'Paused').length, d: 'On hold' },
          { l: 'Closed', v: rows.filter((r) => r.status === 'Closed').length, d: 'Fulfilled / closed' },
        ]} />
        <DataTable
          columns={[
            { key: 'title', label: 'Requirement', bold: true },
            { key: 'role', label: 'Role' },
            { key: 'skills', label: 'Required Skills' },
            { key: 'openings', label: 'Openings' },
            { key: 'location', label: 'Location' },
            { key: 'status', label: 'Status', render: (r) => <span className={`chip ${r.status === 'Open' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : r.status === 'Paused' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-100 text-slate-600'}`}>{r.status}</span> },
            { key: 'actions', label: 'Actions', render: (r) => <button className="btn-g !py-1.5 !text-[12px]" disabled={closing === r.id} onClick={() => { setClosing(r.id); cycle(r); }}>Move to {r.status === 'Open' ? 'Paused' : r.status === 'Paused' ? 'Closed' : 'Open'}</button> },
          ]}
          rows={rows}
        />
      </PageState>
    </div>
  );
}
