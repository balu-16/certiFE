import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://ekrrfkgrycqfqokrxjxe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrcnJma2dyeWNxZnFva3J4anhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjQzNzgsImV4cCI6MjA2ODAwMDM3OH0.S52dbzM-zSvs5gLZYEveluYpmMnCHgJ1y3q957ge00I';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'certificate-hub@1.0.0',
    },
  },
});

export default supabase;