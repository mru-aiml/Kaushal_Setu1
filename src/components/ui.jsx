import * as Icons from 'lucide-react';

export function icon(name, cls = 'w-4 h-4') {
  const C = Icons[name] || Icons.Circle;
  return <C className={cls} />;
}

export function KPICard({ l, v, d, c, bg, i }) {
  return (
    <div className="card p-4 flex gap-3 items-start">
      <div className="kpi-ico" style={{ background: bg, color: c }}>{icon(i, 'w-5 h-5')}</div>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{l}</div>
        <div className="text-[22px] font-extrabold tracking-tight">{v}</div>
        <div className="text-[11.5px] font-semibold" style={{ color: c }}>{d}</div>
      </div>
    </div>
  );
}

export function SectionHeader({ title, sub, right }) {
  return (
    <div className="flex flex-wrap items-end gap-3 mb-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {sub && <p className="text-[13px] text-slate-500 mt-1">{sub}</p>}
      </div>
      <div className="flex-1" />
      {right}
    </div>
  );
}

export function DemoBadge({ label = 'Prototype • Demonstration Data' }) {
  return <span className="chip bg-amber-50 text-amber-700 border border-amber-100">{label}</span>;
}

export function StatusBadge({ status }) {
  if (status === 'Aligned') return <span className="chip bg-emerald-50 text-emerald-700 border border-emerald-100">ALIGNED</span>;
  if (status === 'Review') return <span className="chip bg-amber-50 text-amber-700 border border-amber-100">REVIEW</span>;
  if (status === 'Needs Update') return <span className="chip bg-rose-50 text-rose-700 border border-rose-100">NEEDS UPDATE</span>;
  return <span className="chip bg-violet-50 text-violet-700 border border-violet-100">OVERSUPPLIED</span>;
}

export function PriorityBadge({ p }) {
  return p === 'Critical'
    ? <span className="chip bg-rose-600 text-white">CRITICAL</span>
    : <span className="chip bg-amber-100 text-amber-800">HIGH</span>;
}

export function Modal({ onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-[90] modal-bg flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`bg-white rounded-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-xl'} max-h-[90vh] overflow-y-auto fade-in`}>
        {children}
      </div>
    </div>
  );
}

export function Toasts({ toasts, dismiss }) {
  const colors = { ok: ['#059669', 'CheckCircle2'], alert: ['#E11D48', 'AlertTriangle'], info: ['#2563EB', 'Info'] };
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-[340px] max-w-[calc(100vw-40px)]">
      {toasts.map((t) => {
        const [c, ic] = colors[t.type] || colors.ok;
        const Ic = Icons[ic];
        return (
          <div key={t.id} className="bg-[#0F172A] text-white rounded-2xl p-3.5 shadow-2xl border border-white/10 flex gap-3 items-start fade-in">
            <span className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: c }}><Ic className="w-4 h-4" /></span>
            <div className="text-[13px] font-medium leading-snug flex-1" dangerouslySetInnerHTML={{ __html: t.msg }} />
            <button className="text-slate-400 hover:text-white" onClick={() => dismiss(t.id)}><Icons.X className="w-4 h-4" /></button>
          </div>
        );
      })}
    </div>
  );
}
