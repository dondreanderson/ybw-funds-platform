import { FundabilityCriteria, CategoryScore, Recommendation } from '@/types/fundability';

export function calculateFundabilityScore(
  criteria: FundabilityCriteria[],
  completedCriteria: string[]
): {
  totalScore: number;
  maxScore: number;
  percentage: number;
  categoryScores: CategoryScore[];
} {
  const categoryScores: CategoryScore[] = [];
  let totalScore = 0;
  let maxScore = 0;

  // Group criteria by category
  const categorizedCriteria = criteria.reduce((acc, criterion) => {
    if (!acc[criterion.category]) {
      acc[criterion.category] = [];
    }
    acc[criterion.category].push(criterion);
    return acc;
  }, {} as Record);

  // Calculate scores for each category
  Object.entries(categorizedCriteria).forEach(([category, categoryCriteria]) => {
    let categoryScore = 0;
    let categoryMaxScore = 0;
    let criteriaMet = 0;

    categoryCriteria.forEach(criterion => {
      categoryMaxScore += criterion.weight;
      maxScore += criterion.weight;

      if (completedCriteria.includes(criterion.id)) {
        categoryScore += criterion.weight;
        totalScore += criterion.weight;
        criteriaMet++;
      }
    });

    const categoryPercentage = categoryMaxScore > 0 ? (categoryScore / categoryMaxScore) * 100 : 0;

    categoryScores.push({
      category,
      score: categoryScore,
      maxScore: categoryMaxScore,
      percentage: categoryPercentage,
      criteriaMet,
      totalCriteria: categoryCriteria.length
    });
  });

  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

  return {
    totalScore,
    maxScore,
    percentage,
    categoryScores
  };
}

export function generateRecommendations(
  criteria: FundabilityCriteria[],
  completedCriteria: string[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const uncompletedCriteria = criteria.filter(c => !completedCriteria.includes(c.id));

  // Group by category for better recommendations
  const categorizedIncomplete = uncompletedCriteria.reduce((acc, criterion) => {
    if (!acc[criterion.category]) {
      acc[criterion.category] = [];
    }
    acc[criterion.category].push(criterion);
    return acc;
  }, {} as Record);

  // Generate category-based recommendations
  Object.entries(categorizedIncomplete).forEach(([category, categoryCriteria]) => {
    if (categoryCriteria.length === 0) return;

    // Sort by weight (priority)
    const sortedCriteria = categoryCriteria.sort((a, b) => b.weight - a.weight);
    const highPriorityCriteria = sortedCriteria.filter(c => c.weight >= 8);
    const mediumPriorityCriteria = sortedCriteria.filter(c => c.weight >= 5 && c.weight < 8);
    const lowPriorityCriteria = sortedCriteria.filter(c => c.weight < 5);

    // High priority recommendations
    if (highPriorityCriteria.length > 0) {
      const totalImpact = highPriorityCriteria.reduce((sum, c) => sum + c.weight, 0);
      
      recommendations.push({
        id: `high-${category.toLowerCase().replace(/\s+/g, '-')}`,
        priority: 'high',
        category,
        title: `Complete Critical ${category} Requirements`,
        description: `You have ${highPriorityCriteria.length} high-impact criteria remaining in ${category}. Completing these will significantly improve your fundability score.`,
        actionItems: highPriorityCriteria.slice(0, 3).map(c => c.name),
        estimatedImpact: totalImpact,
        timeToComplete: '1-2 weeks'
      });
    }

    // Medium priority recommendations
    if (mediumPriorityCriteria.length > 2) {
      const totalImpact = mediumPriorityCriteria.reduce((sum, c) => sum + c.weight, 0);
      
      recommendations.push({
        id: `medium-${category.toLowerCase().replace(/\s+/g, '-')}`,
        priority: 'medium',
        category,
        title: `Strengthen ${category} Foundation`,
        description: `Focus on completing ${mediumPriorityCriteria.length} medium-priority items to build a stronger foundation.`,
        actionItems: mediumPriorityCriteria.slice(0, 4).map(c => c.name),
        estimatedImpact: totalImpact,
        timeToComplete: '2-4 weeks'
      });
    }

    // Low priority recommendations
    if (lowPriorityCriteria.length > 3) {
      const totalImpact = lowPriorityCriteria.reduce((sum, c) => sum + c.weight, 0);
      
      recommendations.push({
        id: `low-${category.toLowerCase().replace(/\s+/g, '-')}`,
        priority: 'low',
        category,
        title: `Optimize ${category} Details`,
        description: `Complete these additional items when you have extra time to maximize your score.`,
        actionItems: lowPriorityCriteria.slice(0, 5).map(c => c.name),
        estimatedImpact: totalImpact,
        timeToComplete: '1-2 months'
      });
    }
  });

  // Sort recommendations by estimated impact
  return recommendations.sort((a, b) => b.estimatedImpact - a.estimatedImpact);
}