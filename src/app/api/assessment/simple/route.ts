import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Get user ID from request body instead of auth (since we're using service role)
    const body = await request.json();
    const { userId, assessmentData } = body;

    if (!userId || !assessmentData) {
      return NextResponse.json(
        { error: 'User ID and assessment data are required' },
        { status: 400 }
      );
    }

    // Save simple assessment to database
    const { data, error } = await supabase
      .from('fundability_assessments')
      .insert([
        {
          user_id: userId,
          business_name: assessmentData.businessName || 'Unknown Business',
          criteria_scores: assessmentData.criteriaScores || {},
          score: assessmentData.score || 0,
          recommendations: assessmentData.recommendations || 'No recommendations available',
          status: 'completed',
          assessment_data: assessmentData
        }
      ])
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
      data: data
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
      .from('fundability_assessments')
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
      data: data
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
