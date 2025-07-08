import { AssessmentProvider } from '@/contexts/AssessmentContext';
import { AssessmentWizard } from '@/components/assessment/AssessmentWizard';

export default function AssessmentPage() {
  return (
    <AssessmentProvider>
      <div className="min-h-screen bg-gray-50">
        <AssessmentWizard />
      </div>
    </AssessmentProvider>
  );
}