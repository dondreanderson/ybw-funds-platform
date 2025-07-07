// src/scripts/migrate-data.ts
import { createClient } from '@/lib/supabase/client';

export async function validateDatabaseSchema() {
  const supabase = createClient();
  
  // Test connection and basic queries
  try {
    const { data, error } = await supabase
      .from('fundability_criteria_responses')
      .select('count(*)')
      .limit(1);
      
    if (error) {
      console.error('Database schema validation failed:', error);
      return false;
    }
    
    console.log('Database schema validation passed');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
