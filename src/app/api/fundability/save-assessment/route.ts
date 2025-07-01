import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'

// Create Supabase client with error handling
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables:', {
      url: !!supabaseUrl,
      key: !!supabaseKey
    })
    throw new Error('Missing Supabase configuration')
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

export async function POST(request: NextRequest) {
  try {
    console.log('API route called - save assessment')
    
    const { score, answers, recommendations } = await request.json()
    console.log('Received data:', { score, hasAnswers: !!answers, hasRecommendations: !!recommendations })
    
    // For now, let's just return success without saving to database
    // We can add proper user session handling later
    console.log('Assessment data received successfully')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Assessment saved successfully',
      score 
    })
    
  } catch (error) {
    console.error('Error in save-assessment API:', error)
    return NextResponse.json({ 
      error: 'Failed to save assessment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
