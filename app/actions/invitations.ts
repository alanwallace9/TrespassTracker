'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';

export type InviteUserData = {
  email: string;
  role: 'viewer' | 'campus_admin' | 'district_admin' | 'master_admin';
  campus_id?: string | null; // Required for campus_admin role
};

/**
 * Invite a new user via email
 * district_admin and master_admin can invite users
 */
export async function inviteUser(data: InviteUserData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Check if current user has permission to invite
  const client = await clerkClient();
  const currentUser = await client.users.getUser(userId);
  const currentUserRole = (currentUser.publicMetadata.role as string) || 'viewer';

  if (!['district_admin', 'master_admin'].includes(currentUserRole)) {
    throw new Error('Only district and master admins can invite users');
  }

  // Validate campus_id for campus_admin role
  if (data.role === 'campus_admin' && !data.campus_id) {
    throw new Error('Campus ID is required when inviting a campus admin');
  }

  try {
    // Create invitation with role and campus_id in publicMetadata
    const metadata: Record<string, any> = {
      role: data.role,
    };

    if (data.campus_id) {
      metadata.campus_id = data.campus_id;
    }

    console.log('Creating invitation with:', {
      email: data.email,
      metadata,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/sign-up`,
    });

    const invitation = await client.invitations.createInvitation({
      emailAddress: data.email,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/sign-up`,
      publicMetadata: metadata,
    });

    console.log('Invitation created successfully:', invitation.id);
    return { success: true, invitation };
  } catch (error: any) {
    console.error('Error inviting user - Full error:', {
      message: error.message,
      errors: error.errors,
      status: error.status,
      clerkError: error.clerkError,
    });

    // Return more detailed error message
    const errorMessage = error.errors?.[0]?.message || error.message || 'Failed to invite user';
    throw new Error(errorMessage);
  }
}

/**
 * Get all pending invitations
 */
export async function getPendingInvitations() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const client = await clerkClient();
  const currentUser = await client.users.getUser(userId);
  const currentUserRole = (currentUser.publicMetadata.role as string) || 'viewer';

  if (!['district_admin', 'master_admin'].includes(currentUserRole)) {
    throw new Error('Only district and master admins can view invitations');
  }

  const invitations = await client.invitations.getInvitationList({
    status: 'pending',
  });

  return invitations;
}

/**
 * Revoke an invitation
 */
export async function revokeInvitation(invitationId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const client = await clerkClient();
  const currentUser = await client.users.getUser(userId);
  const currentUserRole = (currentUser.publicMetadata.role as string) || 'viewer';

  if (!['district_admin', 'master_admin'].includes(currentUserRole)) {
    throw new Error('Only district and master admins can revoke invitations');
  }

  await client.invitations.revokeInvitation(invitationId);
  return { success: true };
}
