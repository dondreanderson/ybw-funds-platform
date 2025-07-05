import { BatchResponseService } from '@/lib/batchResponseService'
import { ScoringCalculationService } from '@/lib/scoringCalculationService'
import { ResponseRetrievalService } from '@/lib/responseRetrievalService'

// Add this method to your existing component
const handleCategoryCompletion = async (category: string, categoryResponses: any[]) => {
  try {
    // Save category responses in batch
    await BatchResponseService.saveBatchResponses({
      assessmentId: currentAssessmentId,
      userId: user.id,
      responses: categoryResponses,
      category
    })

    // Recalculate scores
    const scoringResult = await ScoringCalculationService.calculateAssessmentScore(currentAssessmentId)
    
    // Update real-time score display
    setCurrentScore(scoringResult.overallScore)
    setCategoryScores(scoringResult.categoryScores)
    
    // Update progress
    setCompletionPercentage(scoringResult.completionPercentage)
    
  } catch (error) {
    console.error('Category completion error:', error)
    setError(`Failed to save ${category} responses`)
  }
}

const loadExistingResponses = async () => {
  try {
    const responses = await ResponseRetrievalService.getAssessmentResponses(currentAssessmentId)
    
    // Group responses by category
    const responsesByCategory = responses.reduce((acc, response) => {
      if (!acc[response.category]) acc[response.category] = []
      acc[response.category].push(response)
      return acc
    }, {} as Record<string, any[]>)
    
    setExistingResponses(responsesByCategory)
    
  } catch (error) {
    console.error('Load existing responses error:', error)
  }
}