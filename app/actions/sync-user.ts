'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Manually sync current user from Clerk to Supabase
 * Use this for development/testing without webhooks
 */
export async function syncCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Not authenticated');
  }

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);

  const primaryEmail = clerkUser.emailAddresses.find(
    (email) => email.id === clerkUser.primaryEmailAddressId
  )?.emailAddress;

  const role = (clerkUser.publicMetadata.role as string) || 'viewer';
  const campusId = clerkUser.publicMetadata.campus_id as string | null;

  console.log('Syncing user:', {
    id: userId,
    email: primaryEmail,
    role,
    campusId,
  });

  // Upsert user profile
  const { error } = await supabaseAdmin.from('user_profiles').upsert({
    id: userId,
    email: primaryEmail,
    role: role,
    campus_id: campusId || null,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error syncing user:', error);
    throw new Error(error.message);
  }

  console.log('User synced successfully');
  return { success: true };
}
