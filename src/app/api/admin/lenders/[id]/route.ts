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

async function checkAdminAccess() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return { isAdmin: false, error: 'Unauthorized' };
  }

  const supabase = getSupabaseClient();

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isAdmin, error } = await checkAdminAccess();
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    const { data: lender, error: dbError } = await supabase
      .from('lenders')
      .select(`
        *,
        loan_products(*),
        lender_requirements(*)
      `)
      .eq('id', params.id)
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Lender not found' }, { status: 404 });
    }

    return NextResponse.json({ lender });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isAdmin, error } = await checkAdminAccess();
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const updateData = await request.json();

    const { data: lender, error: lenderError } = await supabase
      .from('lenders')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (lenderError) {
      console.error('Lender update error:', lenderError);
      return NextResponse.json({ error: 'Failed to update lender' }, { status: 500 });
    }

    return NextResponse.json({ lender });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isAdmin, error } = await checkAdminAccess();
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    const { error: deleteError } = await supabase
      .from('lenders')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      console.error('Lender deletion error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete lender' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Lender deleted successfully' });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}