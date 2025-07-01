import { FundabilityScore } from '@/types/fundability';

interface ScoreDisplayProps {
  score: FundabilityScore;
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  const getGradeColor = (grade: string) => {
    const colors = {
      'A+': 'text-green-600',
      'A': 'text-green-500',
      'B+': 'text-blue-600',
      'B': 'text-blue-500',
      'C+': 'text-yellow-600',
      'C': 'text-yellow-500',
      'D': 'text-orange-500',
      'F': 'text-red-500'
    };
    return colors[grade as keyof typeof colors] || 'text-gray-500';
  };

  return (
    
      Your Fundability Score
      
      {/* Main Score Circle */}
      
        
          
            
            
          
          
            
              
                {score.percentage}
              
              
                {score.grade}
              
            
          
        
      

      {/* Category Breakdown */}
      
        {Object.entries(score.categoryScores).map(([category, categoryScore]) => (
          
            
              {category.replace(/([A-Z])/g, ' $1').trim()}
            
            
              
                
              
              
                {categoryScore}
              
            
          
        ))}
      
    
  );
}