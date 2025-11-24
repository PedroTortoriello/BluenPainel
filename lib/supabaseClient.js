import { createClient } from '@supabase/supabase-js'

// Supabase client for client-side operations
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
)
