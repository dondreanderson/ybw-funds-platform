import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    return NextResponse.json({ 
      success: true, 
      data,
      id: 'test-assessment-id',
      score: 75 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Assessment processing failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Assessment API endpoint' })
}
