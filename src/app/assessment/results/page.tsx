import { AssessmentProvider } from '@/contexts/AssessmentContext';
import { AssessmentResults } from '@/components/assessment/AssessmentResults';

export default function AssessmentResultsPage() {
  return (
    <AssessmentProvider>
      <div className="min-h-screen bg-gray-50">
        <AssessmentResults />
      </div>
    </AssessmentProvider>
  );
}