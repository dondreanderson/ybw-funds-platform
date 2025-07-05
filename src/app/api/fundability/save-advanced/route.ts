import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const assessmentData = await request.json();
    
    // Validate required fields
    if (!assessmentData.user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Insert into existing advanced_fundability_assessments table
    const { data: assessment, error } = await supabase
      .from('advanced_fundability_assessments')
      .insert([{
        user_id: assessmentData.user_id,
        overall_score: assessmentData.overall_score || 0,
        category_scores: assessmentData.category_scores || {},
        completion_percentage: assessmentData.completion_percentage || 100,
        time_to_complete: assessmentData.time_to_complete,
        recommendations: assessmentData.recommendations || [],
        improvement_areas: assessmentData.improvement_areas || [],
        strengths: assessmentData.strengths || [],
        industry_comparison: assessmentData.industry_comparison,
        assessment_date: new Date().toISOString(),
        assessment_version: '2.0',
        completion_time_minutes: assessmentData.completion_time_minutes,
        status: 'completed',
        metadata: assessmentData.metadata || {}
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save assessment' },
        { status: 500 }
      );
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('advanced_fundability_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve assessments' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
