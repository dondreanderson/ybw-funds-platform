import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { FUNDABILITY_CRITERIA_DATA } from '@/utils/criteriaData';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: criteria, error } = await supabase
      .from('fundability_criteria')
      .select('*')
      .order('category', { ascending: true })
      .order('weight', { ascending: false });

    if (error) {
      // If no criteria in database, return default criteria
      if (error.code === 'PGRST116') {
        return NextResponse.json({ criteria: FUNDABILITY_CRITERIA_DATA });
      }
      throw error;
    }

    return NextResponse.json({ criteria });
  } catch (error) {
    console.error('Error fetching criteria:', error);
    return NextResponse.json(
      { error: 'Failed to fetch criteria' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { criteria } = await request.json();

    // Bulk insert criteria
    const { data, error } = await supabase
      .from('fundability_criteria')
      .insert(criteria)
      .select();

    if (error) throw error;

    return NextResponse.json({ criteria: data });
  } catch (error) {
    console.error('Error creating criteria:', error);
    return NextResponse.json(
      { error: 'Failed to create criteria' },
      { status: 500 }
    );
  }
}