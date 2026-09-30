import AICareer from '../../components/AICareer';
import { PageHeader, DemoNote } from '../../components/datapage';

// Dedicated page: AI recommendations, suitable roles, reasoning, gaps, next actions.
export default function CareerNavigator() {
  return (
    <div className="fade-in">
      <PageHeader title="Career Navigator" sub="AI-matched roles, skill gaps and your next actions" badge={<DemoNote />} />
      <AICareer />
    </div>
  );
}
