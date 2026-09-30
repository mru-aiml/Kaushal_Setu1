import { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { api, saveBlob } from '../../services/api';
import { useApp } from '../../hooks/AppContext';
import { PageHeader, StatCards, DataTable, DemoNote } from '../../components/datapage';
import { LoadingState, ErrorState } from '../../components/states';
import ReportModal from '../../components/ReportModal';

// Dedicated page: report history, statuses and re-download + new generation.
export default function Reports() {
  const { toast } = useApp();
  const [history, setHistory] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [h, c] = await Promise.all([api.get('/api/reports'), api.get('/api/reports/catalog')]);
      setHistory(h.data || []);
      setCatalog(c.reports || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const download = async (id, name) => {
    try {
      const file = await api.download(`/api/reports/${id}/download`, name);
      saveBlob(file);
      toast(`<b>${file.filename}</b> downloaded.`, 'ok');
    } catch (e) {
      toast(e.message, 'alert');
    }
  };

  if (loading) return <div className="fade-in"><PageHeader title="Reports" sub="Generated intelligence reports" badge={<DemoNote />} /><LoadingState label="Loading reports…" /></div>;
  if (error) return <div className="fade-in"><PageHeader title="Reports" sub="Generated intelligence reports" badge={<DemoNote />} /><ErrorState title="Could not load reports" desc={error} onRetry={load} /></div>;

  return (
    <div className="fade-in">
      <PageHeader
        title="Reports"
        sub="Generate new reports or re-download history — real files from stored data"
        badge={<DemoNote />}
        actions={<button className="btn-p !text-[12px]" onClick={() => setModal(true)}><FileText className="w-4 h-4" /> Generate Report</button>}
      />
      <StatCards items={[
        { l: 'Reports Generated', v: history.length, d: 'This workspace' },
        { l: 'PDF', v: history.filter((h) => h.format === 'pdf').length, d: 'Documents' },
        { l: 'CSV', v: history.filter((h) => h.format === 'csv').length, d: 'Datasets' },
        { l: 'XLSX', v: history.filter((h) => h.format === 'xlsx').length, d: 'Workbooks' },
        { l: 'Available Types', v: catalog.length, d: 'Report catalogue' },
      ].slice(0, 4)} />
      <DataTable
        columns={[
          { key: 'title', label: 'Report', bold: true },
          { key: 'format', label: 'Format', render: (r) => <span className="chip bg-slate-900 text-white">{r.format.toUpperCase()}</span> },
          { key: 'created_at', label: 'Generated', render: (r) => new Date(r.created_at).toLocaleString() },
          { key: 'size', label: 'Size', render: (r) => `${(r.size / 1024).toFixed(1)} KB` },
          { key: 'dl', label: 'Download', render: (r) => <button className="btn-g !py-1.5 !text-[12px]" onClick={() => download(r.id, r.filename)}><Download className="w-4 h-4" /> Get</button> },
        ]}
        rows={history}
        emptyTitle="No reports yet"
        emptyDesc="Generate your first report to see history here."
      />
      {modal && <ReportModal onClose={() => { setModal(false); load(); }} />}
    </div>
  );
}
