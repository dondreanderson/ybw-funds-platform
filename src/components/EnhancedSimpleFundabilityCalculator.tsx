import { BatchResponseService } from '@/lib/batchResponseService'
import { ScoringCalculationService } from '@/lib/scoringCalculationService'
import { ResponseRetrievalService } from '@/lib/responseRetrievalService'

// Add this method to your existing component
const handleSubmitAssessment = async () => {
  try {
    setLoading(true)
    
    // Prepare batch responses
    const responses = Object.entries(answers).map(([key, value]) => ({
      criterionId: key,
      responseValue: value,
      responseType: typeof value === 'boolean' ? 'boolean' : 'text',
      pointsEarned: calculatePointsForAnswer(key, value),
      maxPoints: getMaxPointsForCriterion(key)
    }))

    // Save responses in batch
    await BatchResponseService.saveBatchResponses({
      assessmentId: currentAssessmentId,
      userId: user.id,
      responses,
      category: 'Simple Assessment'
    })

    // Calculate final score
    const scoringResult = await ScoringCalculationService.calculateAssessmentScore(currentAssessmentId)
    
    // Update assessment with scores
    await ScoringCalculationService.updateAssessmentScores(currentAssessmentId, scoringResult)
    
    setScore(scoringResult.overallScore)
    setShowResults(true)
    onScoreUpdate?.(scoringResult.overallScore)
    
  } catch (error) {
    console.error('Assessment submission error:', error)
    setError('Failed to save assessment. Please try again.')
  } finally {
    setLoading(false)
  }
}