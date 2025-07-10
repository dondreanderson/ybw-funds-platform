import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { createClient } from '@supabase/supabase-js';
import { calculatePreviewScore } from '@/lib/assessment/logic';

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const assessmentData = await request.json();
    
    // Calculate final score
    const finalScore = calculatePreviewScore(assessmentData);
    
    // Generate recommendations based on score and data
    const recommendations = generateRecommendations(assessmentData, finalScore);
    
    // Save assessment to database
    const { data: assessment, error } = await supabase
      .from('assessments')
      .insert({
        user_email: session.user.email,
        assessment_data: assessmentData,
        final_score: finalScore,
        recommendations: recommendations,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to save assessment' }, { status: 500 });
    }

    return NextResponse.json({
      id: assessment.id,
      score: finalScore,
      recommendations: recommendations,
      message: 'Assessment completed successfully',
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateRecommendations(data: any, score: number): string[] {
  const recommendations = [];
  
  // Business Foundation recommendations
  if (!data.businessFoundation?.website) {
    recommendations.push('Create a professional business website to improve credibility');
  }
  
  // Financial Health recommendations
  if (data.financialHealth?.creditScore && data.financialHealth.creditScore < 700) {
    recommendations.push('Work on improving your personal credit score to 700+');
  }
  
  if (data.financialHealth?.cashFlow === 'negative') {
    recommendations.push('Focus on improving cash flow management');
  }
  
  // Banking recommendations
  if (!data.bankingRelationships?.hasBusinessChecking) {
    recommendations.push('Open a dedicated business checking account');
  }
  
  if (!data.bankingRelationships?.hasBusinessCreditCard) {
    recommendations.push('Consider getting a business credit card to build business credit');
  }
  
  // Digital Presence recommendations
  if (!data.digitalPresence?.hasGoogleBusiness) {
    recommendations.push('Set up a Google Business Profile to improve online visibility');
  }
  
  if (!data.digitalPresence?.hasSocialMedia) {
    recommendations.push('Establish social media presence on relevant platforms');
  }
  
  // Industry recommendations
  if (!data.industryOperations?.hasInsurance) {
    recommendations.push('Obtain appropriate business insurance coverage');
  }
  
  return recommendations;
}