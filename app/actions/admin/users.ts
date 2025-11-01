'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { logAuditEvent } from '@/lib/audit-logger';
import { UserProfile } from '@/lib/supabase';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type AdminUserListItem = UserProfile & {
  campus_name?: string;
};

/**
 * Get all users for admin view
 * Only accessible by master_admin
 */
export async function getUsersForAdmin(): Promise<AdminUserListItem[]> {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Verify master_admin permission
    const { data: adminProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('role, tenant_id')
      .eq('id', userId)
      .single();

    if (!adminProfile || adminProfile.role !== 'master_admin') {
      throw new Error('Unauthorized: Master admin access required');
    }

    // Get all users for the tenant (including soft-deleted)
    const { data: users, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('tenant_id', adminProfile.tenant_id)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('[getUsersForAdmin] Error fetching users', error);
      throw new Error('Failed to fetch users');
    }

    // Get all campuses for lookup
    const { data: campuses } = await supabaseAdmin
      .from('campuses')
      .select('id, name')
      .eq('tenant_id', adminProfile.tenant_id);

    const campusMap = new Map(campuses?.map(c => [c.id, c.name]) || []);

    // Transform the data to include campus name
    const transformedUsers: AdminUserListItem[] = (users || []).map(user => ({
      ...user,
      campus_name: user.campus_id ? campusMap.get(user.campus_id) || null : null,
    }));

    return transformedUsers;
  } catch (error: any) {
    logger.error('[getUsersForAdmin] Error', { error: error.message });
    throw error;
  }
}

/**
 * Update user role via Clerk API
 * Only accessible by master_admin
 */
export async function updateUserRole(
  targetUserId: string,
  newRole: 'viewer' | 'campus_admin' | 'district_admin' | 'master_admin',
  campusId?: string | null
): Promise<{ success: boolean; message: string }> {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Verify master_admin permission
    const { data: adminProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('role, tenant_id, email')
      .eq('id', userId)
      .single();

    if (!adminProfile || adminProfile.role !== 'master_admin') {
      throw new Error('Unauthorized: Master admin access required');
    }

    // Get target user's current data
    const { data: targetUser } = await supabaseAdmin
      .from('user_profiles')
      .select('email, role, campus_id')
      .eq('id', targetUserId)
      .single();

    if (!targetUser) {
      throw new Error('User not found');
    }

    // Validate campus_id for campus_admin role
    if (newRole === 'campus_admin' && !campusId) {
      throw new Error('Campus ID is required for campus_admin role');
    }

    // Update Clerk user metadata
    const client = await clerkClient();
    await client.users.updateUser(targetUserId, {
      publicMetadata: {
        role: newRole,
        campus_id: campusId || null,
        tenant_id: adminProfile.tenant_id,
      },
    });

    // Update Supabase user_profiles
    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update({
        role: newRole,
        campus_id: campusId || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetUserId);

    if (error) {
      logger.error('[updateUserRole] Error updating user profile', error);
      throw new Error('Failed to update user profile');
    }

    // Log to audit log
    await logAuditEvent({
      eventType: 'user.updated',
      actorId: userId,
      actorEmail: adminProfile.email,
      actorRole: adminProfile.role,
      targetId: targetUserId,
      action: `Updated user role from ${targetUser.role} to ${newRole}`,
      details: {
        oldRole: targetUser.role,
        newRole,
        oldCampusId: targetUser.campus_id,
        newCampusId: campusId,
        userEmail: targetUser.email,
      },
    });

    logger.info('[updateUserRole] User role updated successfully', {
      targetUserId,
      newRole,
    });

    return {
      success: true,
      message: `User role updated to ${newRole}`,
    };
  } catch (error: any) {
    logger.error('[updateUserRole] Error', { error: error.message });
    throw new Error(error.message || 'Failed to update user role');
  }
}

/**
 * Soft delete a user
 * Only accessible by master_admin
 */
export async function deleteUser(
  targetUserId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Verify master_admin permission
    const { data: adminProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('role, tenant_id, email')
      .eq('id', userId)
      .single();

    if (!adminProfile || adminProfile.role !== 'master_admin') {
      throw new Error('Unauthorized: Master admin access required');
    }

    // Get target user's data
    const { data: targetUser } = await supabaseAdmin
      .from('user_profiles')
      .select('email, role')
      .eq('id', targetUserId)
      .single();

    if (!targetUser) {
      throw new Error('User not found');
    }

    // Prevent deleting yourself
    if (targetUserId === userId) {
      throw new Error('Cannot delete your own account');
    }

    // Soft delete in Supabase
    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update({
        deleted_at: new Date().toISOString(),
        status: 'inactive',
      })
      .eq('id', targetUserId);

    if (error) {
      logger.error('[deleteUser] Error soft-deleting user', error);
      throw new Error('Failed to delete user');
    }

    // Delete from Clerk
    const client = await clerkClient();
    await client.users.deleteUser(targetUserId);

    // Log to audit log
    await logAuditEvent({
      eventType: 'user.deleted',
      actorId: userId,
      actorEmail: adminProfile.email,
      actorRole: adminProfile.role,
      targetId: targetUserId,
      action: `Deleted user account`,
      details: {
        userEmail: targetUser.email,
        userRole: targetUser.role,
      },
    });

    logger.info('[deleteUser] User deleted successfully', { targetUserId });

    return {
      success: true,
      message: 'User deleted successfully',
    };
  } catch (error: any) {
    logger.error('[deleteUser] Error', { error: error.message });
    throw new Error(error.message || 'Failed to delete user');
  }
}
