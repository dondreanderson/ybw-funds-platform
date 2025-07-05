export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { answers, businessData } = body

    // Calculate simple assessment score
    let totalScore = 0
    const maxScore = 100

    // Simple scoring algorithm
    if (answers.hasEIN) totalScore += 15
    if (answers.hasBusinessBank) totalScore += 15
    if (answers.hasBusinessPhone) totalScore += 10
    if (answers.hasWebsite) totalScore += 10
    if (answers.hasBusinessAddress) totalScore += 10
    if (answers.hasBusinessCredit) totalScore += 20

    // Business age scoring
    if (answers.businessAge >= 24) totalScore += 15
    else if (answers.businessAge >= 12) totalScore += 10
    else if (answers.businessAge >= 6) totalScore += 5

    // Additional factors
    if (answers.hasRevenue) totalScore += 3
    if (answers.hasEmployees) totalScore += 2

    // Save to fundability_assessments table
    const { data: assessment, error } = await supabase
      .from('fundability_assessments')
      .insert({
        user_id: user.id,
        business_name: businessData.businessName || 'Not provided',
        criteria_scores: answers,
        score: totalScore,
        recommendations: generateSimpleRecommendations(answers),
        status: 'completed',
        assessment_data: { answers, businessData, calculatedAt: new Date().toISOString() }
      })
      .select()
      .single()

    if (error) throw error

    // Generate recommendations
    const recommendations = generateSimpleRecommendations(answers)

    return NextResponse.json({
      assessment,
      score: totalScore,
      maxScore,
      percentage: Math.round((totalScore / maxScore) * 100),
      recommendations
    })

  } catch (error) {
    console.error('Simple assessment error:', error)
    return NextResponse.json(
      { error: 'Failed to process simple assessment' },
      { status: 500 }
    )
  }
}

function generateSimpleRecommendations(answers: any): string[] {
  const recommendations = []
  
  if (!answers.hasEIN) recommendations.push('Obtain an EIN (Employer Identification Number)')
  if (!answers.hasBusinessBank) recommendations.push('Open a dedicated business bank account')
  if (!answers.hasBusinessPhone) recommendations.push('Set up a business phone line')
  if (!answers.hasWebsite) recommendations.push('Create a professional business website')
  if (!answers.hasBusinessAddress) recommendations.push('Establish a business address')
  if (!answers.hasBusinessCredit) recommendations.push('Start building business credit')
  if (answers.businessAge < 12) recommendations.push('Build business operating history')
  
  return recommendations
}