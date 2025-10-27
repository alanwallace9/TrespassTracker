'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { logger } from '@/lib/logger';
import { logAuditEvent } from '@/lib/audit-logger';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Get tenant_id from subdomain
 * Examples:
 * - birdville.districttracker.com → birdville
 * - localhost:3000 → birdville (default for local dev)
 */
async function getTenantIdFromSubdomain(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get('host') || '';

  // For local development, default to 'birdville'
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return 'birdville';
  }

  // Extract subdomain from host
  // birdville.districttracker.com → birdville
  const subdomain = host.split('.')[0];

  if (!subdomain) {
    throw new Error('Could not determine tenant from subdomain');
  }

  // Verify tenant exists in database
  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('id')
    .eq('subdomain', subdomain)
    .single();

  if (!tenant) {
    throw new Error(`Invalid tenant: ${subdomain}`);
  }

  return tenant.id;
}

type InviteUserParams = {
  email: string;
  role: 'viewer' | 'campus_admin' | 'district_admin';
  campusId?: string | null;
};

/**
 * Invite a new user by creating them in Clerk with proper metadata
 * The user will receive an email to set their password
 *
 * Security: tenant_id is derived from the subdomain, ensuring admins
 * can only invite users to their own tenant.
 */
export async function inviteUser({ email, role, campusId }: InviteUserParams) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Not authenticated');
  }

  // Get tenant_id from subdomain (this is the source of truth)
  const subdomainTenantId = await getTenantIdFromSubdomain();

  // Get current user's profile to verify permissions
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

  // SECURITY: Verify admin's tenant matches the subdomain tenant
  // This prevents cross-tenant invitation attacks
  if (adminProfile.tenant_id !== subdomainTenantId) {
    logger.error('Tenant mismatch during user invitation', {
      adminTenant: adminProfile.tenant_id,
      subdomainTenant: subdomainTenantId,
      adminId: userId,
    });
    throw new Error('You can only invite users to your own organization');
  }

  // Validate campus_id for campus_admin role
  if (role === 'campus_admin' && !campusId) {
    throw new Error('Campus admin users must have a campus assigned');
  }

  // Prepare metadata using subdomain-derived tenant_id
  const metadata: {
    role: string;
    tenant_id: string;
    campus_id?: string;
  } = {
    role,
    tenant_id: subdomainTenantId, // Use subdomain tenant, not admin's profile
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
        tenantId: subdomainTenantId,
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
