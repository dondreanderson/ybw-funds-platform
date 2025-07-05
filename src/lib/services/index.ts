import { createClient } from '@supabase/supabase-js';
import { CriteriaResponseService } from './criteriaResponseService';

export function createCriteriaResponseService() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  return new CriteriaResponseService(supabase);
}

// Hook for React components
export function useCriteriaResponseService() {
  const [service] = useState(() => createCriteriaResponseService());
  return service;
}