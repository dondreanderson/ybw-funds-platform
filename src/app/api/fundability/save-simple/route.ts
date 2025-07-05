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

    // Save simple assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('fundability_assessments')
      .insert([{
        user_id: userId,
        business_name: assessmentData.business_name || 'Unknown Business',
        criteria_scores: assessmentData.criteria_scores || {},
        score: assessmentData.score || 0,
        recommendations: assessmentData.recommendations || 'No recommendations available',
        status: 'completed',
        assessment_data: assessmentData
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

    // Update user profile - Fix the .raw() issue
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('assessment_count')
      .eq('id', userId)
      .single();

    const newCount = (currentProfile?.assessment_count || 0) + 1;

    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        fundability_score: assessmentData.score,
        last_assessment_date: new Date().toISOString(),
        assessment_count: newCount  // ← Fixed: no more .raw()
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Profile update error:', profileError);
      // Don't fail the entire request for profile update
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
