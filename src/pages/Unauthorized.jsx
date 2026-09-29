import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useSession } from '../auth/AuthContext';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { isAuthenticated, dashboardRoute } = useSession();

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-6">
      <div className="card p-10 max-w-[520px] w-full flex flex-col items-center text-center border-t-4" style={{ borderTopColor: '#E11D48' }}>
        <span className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center"><ShieldAlert className="w-6 h-6 text-rose-600" /></span>
        <h1 className="text-[22px] font-extrabold mt-3">Access restricted</h1>
        <p className="text-[13.5px] text-slate-500 font-medium mt-2">This workspace is not part of your role. KaushalSetu workspaces are strictly separated by role.</p>
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <button className="btn-p" onClick={() => navigate(isAuthenticated ? dashboardRoute : '/login')}>Return to my dashboard</button>
          <button className="btn-g" onClick={() => navigate('/')}>Go to homepage</button>
        </div>
      </div>
    </div>
  );
}

