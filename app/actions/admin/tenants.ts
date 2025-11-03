'use server';

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type Tenant = {
  id: string;
  subdomain: string;
  display_name: string;
  status: string;
  created_at: string;
  updated_at: string;
};

/**
 * Get all tenants - only accessible by master_admin
 */
export async function getTenants(): Promise<Tenant[]> {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Verify master_admin permission
    const { data: adminProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!adminProfile || adminProfile.role !== 'master_admin') {
      throw new Error('Unauthorized: Master admin access required');
    }

    // Get all tenants
    const { data: tenants, error } = await supabaseAdmin
      .from('tenants')
      .select('*')
      .order('display_name', { ascending: true });

    if (error) {
      logger.error('[getTenants] Error fetching tenants', error);
      throw new Error('Failed to fetch tenants');
    }

    return tenants || [];
  } catch (error: any) {
    logger.error('[getTenants] Error', { error: error.message });
    throw error;
  }
}

/**
 * Get tenant by ID
 */
export async function getTenantById(tenantId: string): Promise<Tenant | null> {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Verify master_admin permission
    const { data: adminProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!adminProfile || adminProfile.role !== 'master_admin') {
      throw new Error('Unauthorized: Master admin access required');
    }

    const { data: tenant, error } = await supabaseAdmin
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();

    if (error) {
      logger.error('[getTenantById] Error fetching tenant', error);
      return null;
    }

    return tenant;
  } catch (error: any) {
    logger.error('[getTenantById] Error', { error: error.message });
    throw error;
  }
}
