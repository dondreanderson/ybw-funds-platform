import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface BenchmarkData {
  avg_total_score: number;
  percentile_25: number;
  percentile_50: number;
  percentile_75: number;
  percentile_90: number;
}

interface IndustryComparison {
  percentile: number;
  industryAverage: number;
  comparison: 'above' | 'below';
}

// Helper function to calculate percentile
const calculatePercentile = (userScore: number, benchmark: BenchmarkData): number => {
  if (userScore >= benchmark.percentile_90) return 90;
  if (userScore >= benchmark.percentile_75) return 75;
  if (userScore >= benchmark.percentile_50) return 50;
  if (userScore >= benchmark.percentile_25) return 25;
  return 10;
};

export class AIScoringEngine {
  static async calculateAdvancedScore(responses: Record<string, any>): Promise<{
    overallScore: number;
    categoryScores: Record<string, number>;
    recommendations: string[];
    strengths: string[];
    improvements: string[];
  }> {
    try {
      let overallScore = 0;
      const categoryScores: Record<string, number> = {};
      const recommendations: string[] = [];
      const strengths: string[] = [];
      const improvements: string[] = [];

      // Calculate scores based on responses
      // This is a simplified scoring algorithm - enhance as needed
      Object.entries(responses).forEach(([key, value]) => {
        if (typeof value === 'boolean') {
          const score = value ? 20 : 0;
          categoryScores[key] = score;
          overallScore += score;
          
          if (value) {
            strengths.push(`Strong ${key.replace('_', ' ')}`);
          } else {
            improvements.push(`Improve ${key.replace('_', ' ')}`);
            recommendations.push(`Focus on improving ${key.replace('_', ' ')}`);
          }
        } else if (typeof value === 'string') {
          // Score based on string responses
          const score = value.length > 0 ? 15 : 0;
          categoryScores[key] = score;
          overallScore += score;
        }
      });

      // Normalize score to 0-100 range
      const maxPossibleScore = Object.keys(responses).length * 20;
      overallScore = Math.min(100, Math.round((overallScore / maxPossibleScore) * 100));

      return {
        overallScore,
        categoryScores,
        recommendations,
        strengths,
        improvements
      };
    } catch (error) {
      console.error('AI Scoring error:', error);
      throw new Error('Failed to calculate advanced score');
    }
  }

  static async getIndustryComparison(
    userScore: number,
    industry: string
  ): Promise<IndustryComparison | null> {
    try {
      const { data: benchmark, error } = await supabase
        .from('industry_benchmarks')
        .select('*')
        .eq('industry_name', industry)
        .single();

      if (error || !benchmark) {
        console.log('No industry benchmark found for:', industry);
        return null;
      }

      return {
        percentile: calculatePercentile(userScore, benchmark),
        industryAverage: benchmark.avg_total_score,
        comparison: userScore > benchmark.avg_total_score ? 'above' : 'below'
      };
    } catch (error) {
      console.error('Industry comparison error:', error);
      return null;
    }
  }

  static async generateRecommendations(
    categoryScores: Record<string, number>,
    industry?: string
  ): Promise<string[]> {
    try {
      const recommendations: string[] = [];

      // Generate recommendations based on low scoring categories
      Object.entries(categoryScores).forEach(([category, score]) => {
        if (score < 50) {
          switch (category) {
            case 'business_registration':
              recommendations.push('Complete business registration and obtain necessary licenses');
              break;
            case 'credit_profile':
              recommendations.push('Improve business credit score and establish credit history');
              break;
            case 'financial_documentation':
              recommendations.push('Organize financial statements and maintain accurate records');
              break;
            case 'operational_infrastructure':
              recommendations.push('Establish professional business operations and systems');
              break;
            case 'online_presence':
              recommendations.push('Build strong online presence and digital marketing');
              break;
            case 'risk_compliance':
              recommendations.push('Ensure compliance with industry regulations and reduce risk factors');
              break;
            default:
              recommendations.push(`Improve ${category.replace('_', ' ')} to enhance fundability`);
          }
        }
      });

      // Add industry-specific recommendations if available
      if (industry) {
        recommendations.push(`Consider industry-specific funding opportunities for ${industry}`);
      }

      return recommendations.slice(0, 10); // Limit to top 10 recommendations
    } catch (error) {
      console.error('Recommendation generation error:', error);
      return ['Review your assessment results and focus on areas with lower scores'];
    }
  }
}
//export { AIScoringEngine };
export default AIScoringEngine;

// If any files are importing with different names, add these aliases:
export { AIScoringEngine as aiScoringEngine };
export { calculatePercentile };
