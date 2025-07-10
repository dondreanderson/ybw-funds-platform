import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth/next';

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Check if user is admin
async function checkAdminAccess() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return { isAdmin: false, error: 'Unauthorized' };
  }

  const supabase = getSupabaseClient();

  // Check if user has admin role - you can customize this logic
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('email', session.user.email)
    .single();

  if (userProfile?.role !== 'admin') {
    return { isAdmin: false, error: 'Admin access required' };
  }

  return { isAdmin: true, error: null };
}

export async function GET(request: NextRequest) {
  try {
    const { isAdmin, error } = await checkAdminAccess();
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    const { data: lenders, error: dbError } = await supabase
      .from('lenders')
      .select(`
        *,
        loan_products(*),
        lender_requirements(*)
      `)
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Failed to fetch lenders' }, { status: 500 });
    }

    return NextResponse.json({ lenders });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isAdmin, error } = await checkAdminAccess();
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const lenderData = await request.json();
    const session = await getServerSession();

    // Create lender slug from name
    const slug = lenderData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Insert lender
    const { data: lender, error: lenderError } = await supabase
      .from('lenders')
      .insert({
        name: lenderData.name,
        slug,
        description: lenderData.description,
        lender_type: lenderData.lender_type,
        min_loan_amount: lenderData.min_loan_amount,
        max_loan_amount: lenderData.max_loan_amount,
        min_credit_score: lenderData.min_credit_score,
        min_time_in_business: lenderData.min_time_in_business,
        interest_rate_min: lenderData.interest_rate_min,
        interest_rate_max: lenderData.interest_rate_max,
        logo_url: lenderData.logo_url,
        industries_served: lenderData.industries_served || ['All'],
        states_served: lenderData.states_served || ['All'],
        processing_time: lenderData.processing_time,
        approval_rate: lenderData.approval_rate,
        rating: lenderData.rating,
        reviews_count: lenderData.reviews_count || 0,
        contact_phone: lenderData.contact_phone,
        contact_email: lenderData.contact_email,
        website_url: lenderData.website_url,
        application_url: lenderData.application_url,
        commission_rate: lenderData.commission_rate,
        partnership_status: 'active',
        created_by: session?.user?.email
      })
      .select()
      .single();

    if (lenderError) {
      console.error('Lender creation error:', lenderError);
      return NextResponse.json({ error: 'Failed to create lender' }, { status: 500 });
    }

    return NextResponse.json({ lender });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
