import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth/next';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Check if user is admin
async function checkAdminAccess() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return { isAdmin: false, error: 'Unauthorized' };
  }

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
        industries_served: lenderData.industries_served,
        states_served: lenderData.states_served,
        processing_time: lenderData.processing_time,
        approval_rate: lenderData.approval_rate,
        rating: lenderData.rating,
        reviews_count: lenderData.reviews_count,
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

    // Insert loan products
    if (lenderData.loan_products && lenderData.loan_products.length > 0) {
      const products = lenderData.loan_products.map((product: any) => ({
        lender_id: lender.id,
        name: product.name,
        product_type: product.product_type,
        min_amount: product.min_amount,
        max_amount: product.max_amount,
        min_term_months: product.min_term_months,
        max_term_months: product.max_term_months,
        interest_rate_min: product.interest_rate_min,
        interest_rate_max: product.interest_rate_max,
        origination_fee: product.origination_fee || 0,
        collateral_required: product.collateral_required,
        personal_guarantee_required: product.personal_guarantee_required,
      }));

      const { error: productsError } = await supabase
        .from('loan_products')
        .insert(products);

      if (productsError) {
        console.error('Products creation error:', productsError);
        // Note: Lender was created successfully, but products failed
      }
    }

    return NextResponse.json({ lender });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}