import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { plaidService } from '@/lib/integrations/plaid'
import { experianService } from '@/lib/integrations/experian'

// Authentication middleware (reuse from previous)
async function authenticateUser(req: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return {
      user: null,
      error: new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }
  
  return { user }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error: authError } = await authenticateUser(req)
    if (authError) return authError

    const { action, ...data } = await req.json()

    switch (action) {
      case 'create_plaid_link_token':
        return await handlePlaidLinkToken(user.id)
      
      case 'exchange_plaid_token':
        return await handlePlaidTokenExchange(user.id, data.publicToken)
      
      case 'get_bank_data':
        return await handleBankDataFetch(user.id, data.accessToken)
      
      case 'get_credit_report':
        return await handleCreditReport(user.id, data)
      
      default:
        return new NextResponse(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Integration API error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

async function handlePlaidLinkToken(userId: string) {
  try {
    const linkToken = await plaidService.createLinkToken(userId)
    return NextResponse.json({ success: true, data: linkToken })
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create bank connection token' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

async function handlePlaidTokenExchange(userId: string, publicToken: string) {
  try {
    const accessToken = await plaidService.exchangePublicToken(publicToken)
    
    // Save access token to database (encrypted)
    const supabase = createClient()
    await supabase
      .from('user_bank_connections')
      .insert({
        user_id: userId,
        access_token: accessToken, // In production, encrypt this
        provider: 'plaid',
        status: 'active'
      })

    return NextResponse.json({ success: true, message: 'Bank connected successfully' })
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Failed to connect bank account' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

async function handleBankDataFetch(userId: string, accessToken: string) {
  try {
    const accounts = await plaidService.getAccounts(accessToken)
    const metrics = await plaidService.calculateBusinessMetrics(accessToken)
    
    // Save to database
    const supabase = createClient()
    await supabase
      .from('user_bank_data')
      .upsert({
        user_id: userId,
        accounts: accounts,
        metrics: metrics,
        last_updated: new Date().toISOString()
      })

    return NextResponse.json({ 
      success: true, 
      data: { accounts, metrics } 
    })
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch bank data' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

async function handleCreditReport(userId: string, data: any) {
  try {
    const creditReport = await experianService.getBusinessCreditReport(
      data.businessName,
      data.ein,
      data.address
    )
    
    // Save to database
    const supabase = createClient()
    await supabase
      .from('user_credit_reports')
      .insert({
        user_id: userId,
        provider: 'experian',
        report_data: creditReport,
        credit_score: creditReport.creditScore,
        report_date: new Date().toISOString()
      })

    return NextResponse.json({ 
      success: true, 
      data: creditReport 
    })
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch credit report' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
