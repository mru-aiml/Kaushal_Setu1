import { useEffect, useState } from 'react';
import { api, apiAvailable } from '../services/api';
import { useSession } from '../auth/AuthContext';

// Live aggregates from the backend data layer. When the backend is absent
// (local auth), returns { local: true } so pages keep their demo content.
// Every metric carries demo/empty flags for honest labeling.
export function useStats(role) {
  const { authMode } = useSession();
  const [state, setState] = useState({ data: null, loading: authMode === 'backend', error: '' });

  useEffect(() => {
    if (authMode !== 'backend' || !apiAvailable()) {
      setState({ data: null, loading: false, error: '' });
      return;
    }
    let live = true;
    setState({ data: null, loading: true, error: '' });
    api.get(`/api/stats/${role}`)
      .then((data) => live && setState({ data, loading: false, error: '' }))
      .catch((e) => live && setState({ data: null, loading: false, error: e.message }));
    return () => { live = false; };
  }, [authMode, role]);

  return { ...state, local: authMode !== 'backend' };
}

export function DemoOrLiveChip({ demo, empty }) {
  if (empty) return <span className="chip bg-slate-100 text-slate-600 border">NO DATA YET</span>;
  if (demo) return <span className="chip bg-amber-50 text-amber-700 border border-amber-100">DEMONSTRATION DATA</span>;
  return <span className="chip bg-emerald-50 text-emerald-700 border border-emerald-100">● LIVE DATA</span>;
}
