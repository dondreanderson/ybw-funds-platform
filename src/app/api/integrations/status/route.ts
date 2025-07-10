import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check bank connections
    const { data: bankConnections } = await supabase
      .from('user_bank_connections')
      .select('*')
      .eq('user_id', user.id)

    // Check credit reports
    const { data: creditReports } = await supabase
      .from('user_credit_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)

    const integrationStatus = [
      {
        id: 'plaid',
        name: 'Bank Connection',
        status: bankConnections && bankConnections.length > 0 ? 'connected' : 'disconnected',
        lastSync: bankConnections && bankConnections.length > 0 ? 
          bankConnections[0].updated_at : null,
        dataPoints: bankConnections ? bankConnections.length : 0
      },
      {
        id: 'experian',
        name: 'Credit Reports',
        status: creditReports && creditReports.length > 0 ? 'connected' : 'disconnected',
        lastSync: creditReports && creditReports.length > 0 ? 
          creditReports[0].created_at : null,
        dataPoints: creditReports ? creditReports.length : 0
      }
    ]

    return NextResponse.json({
      success: true,
      data: integrationStatus
    })

  } catch (error) {
    console.error('Integration status error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
