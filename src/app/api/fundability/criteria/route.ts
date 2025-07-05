import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/fundability/criteria
export async function GET() {
  try {
    const { data: criteria, error } = await supabase
      .from('fundability_criteria')
      .select('*')
      .order('category', { ascending: true })
      .order('weight', { ascending: false })

    if (error) {
      console.error('Error fetching criteria:', error)
      return NextResponse.json(
        { error: 'Failed to fetch criteria' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      criteria: criteria || [],
      total: criteria?.length || 0
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/fundability/criteria
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { criteria } = body

    if (!criteria || !Array.isArray(criteria)) {
      return NextResponse.json(
        { error: 'Invalid criteria data' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('fundability_criteria')
      .insert(criteria)
      .select()

    if (error) {
      console.error('Error creating criteria:', error)
      return NextResponse.json(
        { error: 'Failed to create criteria' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      criteria: data,
      created: data?.length || 0
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}