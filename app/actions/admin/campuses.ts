'use server';

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { Campus } from '@/lib/supabase';
import { AdminUserListItem } from './users';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type CampusWithCounts = Campus & {
  user_count: number;
  record_count: number;
};

/**
 * Get all campuses with user and record counts for admin view
 * Only accessible by master_admin
 */
export async function getCampusesWithCounts(): Promise<CampusWithCounts[]> {
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

    // Get all campuses for the tenant (excluding soft-deleted)
    const { data: campuses, error: campusesError } = await supabaseAdmin
      .from('campuses')
      .select('*')
      .eq('tenant_id', adminProfile.tenant_id)
      .is('deleted_at', null)
      .order('name', { ascending: true });

    if (campusesError) {
      logger.error('[getCampusesWithCounts] Error fetching campuses', campusesError);
      throw new Error('Failed to fetch campuses');
    }

    // Get user counts per campus
    const { data: userCounts } = await supabaseAdmin
      .from('user_profiles')
      .select('campus_id')
      .eq('tenant_id', adminProfile.tenant_id)
      .is('deleted_at', null)
      .not('campus_id', 'is', null);

    // Get record counts per campus
    const { data: recordCounts } = await supabaseAdmin
      .from('trespass_records')
      .select('campus_id')
      .eq('tenant_id', adminProfile.tenant_id)
      .not('campus_id', 'is', null);

    // Create count maps
    const userCountMap = new Map<string, number>();
    userCounts?.forEach((row) => {
      const count = userCountMap.get(row.campus_id) || 0;
      userCountMap.set(row.campus_id, count + 1);
    });

    const recordCountMap = new Map<string, number>();
    recordCounts?.forEach((row) => {
      const count = recordCountMap.get(row.campus_id) || 0;
      recordCountMap.set(row.campus_id, count + 1);
    });

    // Transform campuses with counts
    const campusesWithCounts: CampusWithCounts[] = (campuses || []).map((campus) => ({
      ...campus,
      user_count: userCountMap.get(campus.id) || 0,
      record_count: recordCountMap.get(campus.id) || 0,
    }));

    return campusesWithCounts;
  } catch (error: any) {
    logger.error('[getCampusesWithCounts] Error', { error: error.message });
    throw error;
  }
}

/**
 * Get users for a specific campus
 * Only accessible by master_admin
 */
export async function getUsersForCampus(campusId: string): Promise<AdminUserListItem[]> {
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

    // Get users for this campus
    const { data: users, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('tenant_id', adminProfile.tenant_id)
      .eq('campus_id', campusId)
      .is('deleted_at', null)
      .order('display_name', { ascending: true });

    if (error) {
      logger.error('[getUsersForCampus] Error fetching users', error);
      throw new Error('Failed to fetch users');
    }

    // Get campus name
    const { data: campus } = await supabaseAdmin
      .from('campuses')
      .select('name')
      .eq('id', campusId)
      .single();

    return (users || []).map((user) => ({
      ...user,
      campus_name: campus?.name || null,
    }));
  } catch (error: any) {
    logger.error('[getUsersForCampus] Error', { error: error.message });
    throw error;
  }
}

/**
 * Get records for a specific campus
 * Only accessible by master_admin
 */
export async function getRecordsForCampus(campusId: string) {
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

    // Get records for this campus
    const { data: records, error } = await supabaseAdmin
      .from('trespass_records')
      .select('*')
      .eq('tenant_id', adminProfile.tenant_id)
      .eq('campus_id', campusId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('[getRecordsForCampus] Error fetching records', error);
      throw new Error('Failed to fetch records');
    }

    return records || [];
  } catch (error: any) {
    logger.error('[getRecordsForCampus] Error', { error: error.message });
    throw error;
  }
}
