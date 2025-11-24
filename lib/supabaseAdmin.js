import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client with service role key
export const supabaseAdmin = createClient(
  'https://eaqifsfjoykjhcfcnibk.supabase.co', // Supabase URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhcWlmc2Zqb3lramhjZmNuaWJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODc1MjQwNywiZXhwIjoyMDc0MzI4NDA3fQ.Sx0m5kqSSGWUzPOTkbBFd5xBvJXV_159sjpZHtQSzvI' // Service Role Key
)

console.log('Supabase Admin client created:', !!supabaseAdmin)
