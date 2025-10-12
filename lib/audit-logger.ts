import { createClient } from '@supabase/supabase-js';

// Supabase client with service role key (bypasses RLS for admin operations)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export type AuditEventType =
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.invited'
  | 'invitation.revoked'
  | 'record.created'
  | 'record.updated'
  | 'record.deleted';

interface AuditLogEntry {
  eventType: AuditEventType;
  actorId: string;
  actorEmail?: string;
  actorRole?: string;
  targetId?: string;
  action: string;
  details?: Record<string, any>;
}

/**
 * Log an audit event to the admin_audit_log table
 * This allows admins to view a changelog of all important events
 * PII is stored in the database (secure, RLS-protected) but NOT in console logs
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const { error } = await supabaseAdmin.from('admin_audit_log').insert({
      event_type: entry.eventType,
      actor_id: entry.actorId,
      actor_email: entry.actorEmail,
      actor_role: entry.actorRole,
      target_id: entry.targetId,
      action: entry.action,
      details: entry.details,
    });

    if (error) {
      // Only log error to console, not the full entry (which may contain PII)
      console.error('Failed to log audit event:', error.message);
    }
  } catch (error) {
    // Fail silently - don't break application flow if audit logging fails
    console.error('Audit logging error:', error instanceof Error ? error.message : 'Unknown error');
  }
}
