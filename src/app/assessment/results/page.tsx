'use client';

import { AssessmentResults } from '@/components/assessment/AssessmentResults';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AssessmentData {
  currentScore: number;
  categoryScores: Record<string, number>;
  completedAt: string;
}

export default function AssessmentResultsPage() {
  const router = useRouter();
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get assessment data from localStorage
    const storedData = localStorage.getItem('lastAssessmentResults');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setAssessmentData({
          currentScore: parsed.currentScore || 0,
          categoryScores: parsed.categoryScores || {},
          completedAt: parsed.completedAt || new Date().toISOString()
        });
      } catch (error) {
        console.error('Error parsing assessment data:', error);
        router.push('/assessment');
        return;
      }
    } else {
      router.push('/assessment');
      return;
    }
    setLoading(false);
  }, [router]);

  const handleSaveAndExit = async () => {
    router.push('/dashboard');
  };

  const handleClose = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!assessmentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Assessment Data Found</h2>
          <p className="text-gray-600 mb-6">Please take an assessment first to see your results.</p>
          <button
            onClick={() => router.push('/assessment')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Take Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AssessmentResults
        score={assessmentData.currentScore}
        categoryScores={assessmentData.categoryScores}
        recommendations={[]}
        onClose={handleClose}
        onSaveAndExit={handleSaveAndExit}
      />
    </div>
  );
}
