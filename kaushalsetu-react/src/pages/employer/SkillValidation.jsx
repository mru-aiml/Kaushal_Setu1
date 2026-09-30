import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../hooks/AppContext';
import { useApiList, PageHeader, StatCards, DataTable, PageState, DemoNote } from '../../components/datapage';

// Dedicated page: skill validation records with persisted validation status.
export default function SkillValidation() {
  const { toast } = useApp();
  const { rows, loading, error, reload } = useApiList('skill_validations');
  const [busy, setBusy] = useState(null);

  const setStatus = async (row, status) => {
    setBusy(row.id);
    try {
      await api.put(`/api/data/skill_validations/${row.id}`, { ...row, status, validated_on: status === 'Validated' ? new Date().toISOString().slice(0, 10) : row.validated_on });
      toast(`<b>${row.skill}</b> marked ${status} — persisted.`, 'ok');
      reload();
    } catch (e) {
      toast(e.message, 'alert');
    } finally {
      setBusy(null);
    }
  };

  const validated = rows.filter((r) => r.status === 'Validated');

  return (
    <div className="fade-in">
      <PageHeader title="Skill Validation" sub="Validate the skills your industry actually needs — every decision is saved" badge={<DemoNote />} />
      <PageState loading={loading} error={error} empty={!loading && rows.length === 0} onRetry={reload}>
        <StatCards items={[
          { l: 'Skills Reviewed', v: rows.length, d: 'Validation records' },
          { l: 'Validated', v: validated.length, d: 'Confirmed demand' },
          { l: 'Pending', v: rows.filter((r) => r.status === 'Pending').length, d: 'Awaiting review' },
          { l: 'Rejected', v: rows.filter((r) => r.status === 'Rejected').length, d: 'Not required' },
        ]} />
        <DataTable
          columns={[
            { key: 'skill', label: 'Skill', bold: true },
            { key: 'job_title', label: 'Job Role' },
            { key: 'status', label: 'Validation Status', render: (r) => <span className={`chip ${r.status === 'Validated' ? 'bg-emerald-600 text-white' : r.status === 'Rejected' ? 'bg-slate-200 text-slate-600' : 'bg-amber-100 text-amber-800'}`}>{r.status}</span> },
            { key: 'validated_on', label: 'Validated On' },
            { key: 'notes', label: 'Evidence / Notes' },
            { key: 'actions', label: 'Actions', render: (r) => (
              <span className="flex gap-1.5">
                <button className="btn-p !py-1.5 !text-[11.5px]" disabled={busy === r.id} onClick={() => setStatus(r, 'Validated')}><CheckCircle2 className="w-3.5 h-3.5" /> Validate</button>
                <button className="btn-g !py-1.5 !text-[11.5px]" disabled={busy === r.id} onClick={() => setStatus(r, 'Rejected')}>Reject</button>
              </span>
            ) },
          ]}
          rows={rows}
        />
      </PageState>
    </div>
  );
}
