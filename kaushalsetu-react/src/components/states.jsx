import { Loader2, Inbox, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="card p-10 flex flex-col items-center justify-center text-center" role="status" aria-live="polite">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      <p className="text-[13.5px] font-bold mt-3">{label}</p>
      <p className="text-[12px] text-slate-500 font-medium mt-1">Fetching your workspace…</p>
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet', desc = 'Data will appear here once it is available.', action }) {
  return (
    <div className="card p-10 flex flex-col items-center justify-center text-center">
      <span className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center"><Inbox className="w-6 h-6 text-slate-400" /></span>
      <p className="text-[15px] font-extrabold mt-3">{title}</p>
      <p className="text-[12.5px] text-slate-500 font-medium mt-1 max-w-[380px]">{desc}</p>
      {action}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', desc = 'Please try again. If the problem persists, contact support.', onRetry }) {
  return (
    <div className="card p-10 flex flex-col items-center justify-center text-center">
      <span className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-rose-600" /></span>
      <p className="text-[15px] font-extrabold mt-3">{title}</p>
      <p className="text-[12.5px] text-slate-500 font-medium mt-1 max-w-[380px]">{desc}</p>
      {onRetry && <button className="btn-p mt-4" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function Unauthorized({ requiredRoleLabel, homeRoute }) {
  const navigate = useNavigate();
  return (
    <div className="fade-in max-w-[560px] mx-auto mt-10">
      <div className="card p-10 flex flex-col items-center justify-center text-center border-t-4" style={{ borderTopColor: '#E11D48' }}>
        <span className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center"><ShieldAlert className="w-6 h-6 text-rose-600" /></span>
        <p className="text-[20px] font-extrabold mt-3">Access restricted</p>
        <p className="text-[13.5px] text-slate-500 font-medium mt-2">
          {requiredRoleLabel ? `This workspace is available only to ${requiredRoleLabel} users.` : 'This workspace is not part of your role.'}
        </p>
        <button className="btn-p mt-5" onClick={() => navigate(homeRoute || '/app')}>Return to my dashboard</button>
      </div>
    </div>
  );
}
