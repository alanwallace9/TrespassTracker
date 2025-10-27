'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { logAuditEvent } from '@/lib/audit-logger';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type InviteUserParams = {
  email: string;
  role: 'viewer' | 'campus_admin' | 'district_admin';
  campusId?: string | null;
};

/**
 * Invite a new user by creating them in Clerk with proper metadata
 * The user will receive an email to set their password
 */
export async function inviteUser({ email, role, campusId }: InviteUserParams) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Not authenticated');
  }

  // Get current user's profile to inherit tenant_id
  const { data: adminProfile } = await supabaseAdmin
    .from('user_profiles')
    .select('tenant_id, role')
    .eq('id', userId)
    .single();

  if (!adminProfile) {
    throw new Error('Admin profile not found');
  }

  // Validate permissions
  if (!['district_admin', 'master_admin'].includes(adminProfile.role)) {
    throw new Error('Only district and master admins can invite users');
  }

  // Validate campus_id for campus_admin role
  if (role === 'campus_admin' && !campusId) {
    throw new Error('Campus admin users must have a campus assigned');
  }

  // Prepare metadata
  const metadata: {
    role: string;
    tenant_id: string;
    campus_id?: string;
  } = {
    role,
    tenant_id: adminProfile.tenant_id,
  };

  if (campusId) {
    metadata.campus_id = campusId;
  }

  try {
    // Create user in Clerk with metadata
    const client = await clerkClient();
    const clerkUser = await client.users.createUser({
      emailAddress: [email],
      publicMetadata: metadata,
      skipPasswordChecks: true, // Allow Clerk to send invitation email
    });

    // Send invitation email
    await client.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: metadata,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
    });

    logger.info('User invited successfully', { invitedUserId: clerkUser.id, invitedBy: userId });

    // Log to admin audit log
    await logAuditEvent({
      eventType: 'user.invited',
      actorId: userId,
      actorRole: adminProfile.role,
      targetId: clerkUser.id,
      action: `Invited user as ${role}`,
      details: {
        email,
        role,
        campusId,
        tenantId: adminProfile.tenant_id,
      },
    });

    return {
      success: true,
      userId: clerkUser.id,
      message: `Invitation sent to ${email}`,
    };
  } catch (error: any) {
    logger.error('Error inviting user', { error: error.message });

    // Handle specific Clerk errors
    if (error.errors?.[0]?.code === 'form_identifier_exists') {
      throw new Error('A user with this email already exists');
    }

    throw new Error(error.message || 'Failed to invite user');
  }
}
