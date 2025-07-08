
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json({
        connected: false,
        error: error.message,
        details: error
      });
    }

    // Test table access
    const tables = ['user_profiles', 'advanced_fundability_assessments'];
    const tableResults: Record<string, string> = {}; // ✅ Fixed: Added proper type annotation

    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('id')
          .limit(1);
        
        tableResults[table] = tableError ? `Error: ${tableError.message}` : 'OK';
      } catch (e) {
        tableResults[table] = `Exception: ${e instanceof Error ? e.message : 'Unknown error'}`;
      }
    }

    return NextResponse.json({
      connected: true,
      message: 'Database connection successful',
      tables: tableResults,
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing'
      }
    });

  } catch (error) {
    return NextResponse.json({
      connected: false,
      error: 'Connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
