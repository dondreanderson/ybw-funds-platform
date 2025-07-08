import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId, assessmentData } = await request.json();

    if (!userId || !assessmentData) {
      return NextResponse.json(
        { error: 'User ID and assessment data are required' },
        { status: 400 }
      );
    }

    // Save to advanced_fundability_assessments table (matches schema)
    const { data: assessment, error: assessmentError } = await supabase
      .from('advanced_fundability_assessments')
      .insert([{
        user_id: userId,
        overall_score: assessmentData.score || 0,
        category_scores: assessmentData.categoryScores || {},
        completion_percentage: 100,
        recommendations: assessmentData.recommendations || [],
        improvement_areas: [],
        strengths: [],
        status: 'completed',
        assessment_version: '2.0',
        metadata: {
          assessment_type: 'simple',
          business_name: assessmentData.business_name || 'Unknown Business',
          responses: assessmentData.responses || {}
        }
      }])
      .select()
      .single();

    if (assessmentError) {
      console.error('Assessment save error:', assessmentError);
      return NextResponse.json(
        { error: 'Failed to save assessment' },
        { status: 500 }
      );
    }

    // Update user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        fundability_score: assessmentData.score,
        last_assessment_date: new Date().toISOString(),
        assessment_count: 1
      }, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });

    if (profileError) {
      console.error('Profile update error:', profileError);
    }

    return NextResponse.json({
      success: true,
      data: assessment
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}