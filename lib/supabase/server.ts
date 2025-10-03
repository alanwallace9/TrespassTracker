import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client for use in Server Components and Server Actions
 *
 * TEMPORARY: Using service role key to bypass RLS during testing phase
 * TODO: Replace with Clerk JWT authentication in Phase 3
 */
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // Use service role key to bypass RLS until Clerk auth is implemented
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
