import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - List available tradelines
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const tradelineType = searchParams.get('type')
    const maxPrice = searchParams.get('max_price')
    const minCreditLimit = searchParams.get('min_credit_limit')
    
    let query = supabase
      .from('tradelines')
      .select(`
        *,
        tradeline_providers (
          company_name,
          rating,
          success_rate
        )
      `)
      .eq('status', 'available')
      .gt('available_spots', 0)
      .order('featured', { ascending: false })
      .order('account_age_years', { ascending: false })

    // Apply filters
    if (tradelineType) {
      query = query.eq('tradeline_type', tradelineType)
    }
    
    if (maxPrice) {
      query = query.lte('spot_price', parseFloat(maxPrice))
    }
    
    if (minCreditLimit) {
      query = query.gte('credit_limit', parseFloat(minCreditLimit))
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: tradelines, error } = await query

    if (error) {
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch tradelines' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return NextResponse.json({
      success: true,
      data: tradelines,
      pagination: {
        page,
        limit,
        total: tradelines?.length || 0
      }
    })

  } catch (error) {
    console.error('Tradelines API error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// POST - Add new tradeline (Admin only)
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const isAdmin = user.user_metadata?.role === 'admin'
    if (!isAdmin) {
      return new NextResponse(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const tradelineData = await req.json()
    
    const { data: tradeline, error } = await supabase
      .from('tradelines')
      .insert(tradelineData)
      .select()
      .single()

    if (error) {
      return new NextResponse(
        JSON.stringify({ error: 'Failed to create tradeline' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return NextResponse.json({
      success: true,
      data: tradeline
    })

  } catch (error) {
    console.error('Create tradeline error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}