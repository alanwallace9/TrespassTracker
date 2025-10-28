'use server';

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type AuditLog = {
  id: string;
  event_type: string;
  actor_id: string;
  actor_email: string | null;
  actor_role: string | null;
  target_id: string | null;
  action: string;
  details: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

/**
 * Get audit logs for admin view
 * Only accessible by master_admin and district_admin
 */
export async function getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Verify admin permission
    const { data: adminProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!adminProfile || !['master_admin', 'district_admin'].includes(adminProfile.role)) {
      throw new Error('Unauthorized: Admin access required');
    }

    // Get audit logs
    const { data: logs, error } = await supabaseAdmin
      .from('admin_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('[getAuditLogs] Error fetching audit logs', error);
      throw new Error('Failed to fetch audit logs');
    }

    return logs || [];
  } catch (error: any) {
    logger.error('[getAuditLogs] Error', { error: error.message });
    throw error;
  }
}
