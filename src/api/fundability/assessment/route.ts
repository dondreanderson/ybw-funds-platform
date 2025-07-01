import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    const { data: assessment, error } = await supabase
      .from('fundability_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({ assessment });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const assessmentData = await request.json();

    const { data, error } = await supabase
      .from('fundability_assessments')
      .upsert({
        user_id: assessmentData.userId,
        score: assessmentData.score,
        max_score: assessmentData.maxScore,
        percentage: assessmentData.percentage,
        completed_criteria: assessmentData.completedCriteria,
        recommendations: assessmentData.recommendations,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ assessment: data });
  } catch (error) {
    console.error('Error saving assessment:', error);
    return NextResponse.json(
      { error: 'Failed to save assessment' },
      { status: 500 }
    );
  }
}