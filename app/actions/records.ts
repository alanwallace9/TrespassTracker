'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { TrespassRecord } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { logAuditEvent } from '@/lib/audit-logger';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Create a new trespass record
 */
export async function createRecord(data: Omit<TrespassRecord, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createServerClient();
  const { userId } = await auth();

  // Remove any fields that shouldn't be in the insert
  const { id, created_at, updated_at, ...insertData } = data as any;

  const { data: record, error } = await supabase
    .from('trespass_records')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Error creating record:', error);
    throw new Error(error.message);
  }

  // Get user profile for audit log
  if (userId) {
    const { data: userProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('email, role, tenant_id')
      .eq('id', userId)
      .single();

    // Log to audit trail
    await logAuditEvent({
      eventType: 'record.created',
      actorId: userId,
      actorEmail: userProfile?.email || undefined,
      actorRole: userProfile?.role || undefined,
      targetId: record.id,
      action: `Created trespass record for ${data.first_name} ${data.last_name}`,
      recordSubjectName: `${data.first_name} ${data.last_name}`,
      tenantId: userProfile?.tenant_id || undefined,
      details: {
        incident_date: data.incident_date,
        trespassed_from: data.trespassed_from,
        location: data.location,
      },
    });
  }

  revalidatePath('/dashboard');
  return record;
}

/**
 * Update an existing trespass record
 */
export async function updateRecord(id: string, data: Partial<TrespassRecord>) {
  const supabase = await createServerClient();
  const { userId } = await auth();

  // Get the record before update to capture changes
  const { data: beforeRecord } = await supabase
    .from('trespass_records')
    .select('*')
    .eq('id', id)
    .single();

  // Remove fields that shouldn't be updated
  const { id: _id, created_at, updated_at, user_id, status, ...updateData } = data as any;

  const { data: record, error } = await supabase
    .from('trespass_records')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating record:', error);
    throw new Error(error.message);
  }

  // Get user profile for audit log
  if (userId && beforeRecord) {
    const { data: userProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('email, role, tenant_id')
      .eq('id', userId)
      .single();

    // Determine what changed
    const changes: Record<string, { from: any; to: any }> = {};
    Object.keys(updateData).forEach((key) => {
      if (beforeRecord[key] !== updateData[key]) {
        changes[key] = {
          from: beforeRecord[key],
          to: updateData[key],
        };
      }
    });

    // Log to audit trail
    await logAuditEvent({
      eventType: 'record.updated',
      actorId: userId,
      actorEmail: userProfile?.email || undefined,
      actorRole: userProfile?.role || undefined,
      targetId: record.id,
      action: `Updated trespass record for ${record.first_name} ${record.last_name}`,
      recordSubjectName: `${record.first_name} ${record.last_name}`,
      tenantId: userProfile?.tenant_id || undefined,
      details: {
        changes,
        fieldsUpdated: Object.keys(changes),
      },
    });
  }

  revalidatePath('/dashboard');
  return record;
}

/**
 * Delete a trespass record
 */
export async function deleteRecord(id: string) {
  const supabase = await createServerClient();
  const { userId } = await auth();

  // Get the record before deletion for audit log
  const { data: record } = await supabase
    .from('trespass_records')
    .select('*')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('trespass_records')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting record:', error);
    throw new Error(error.message);
  }

  // Get user profile for audit log
  if (userId && record) {
    const { data: userProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('email, role, tenant_id')
      .eq('id', userId)
      .single();

    // Log to audit trail
    await logAuditEvent({
      eventType: 'record.deleted',
      actorId: userId,
      actorEmail: userProfile?.email || undefined,
      actorRole: userProfile?.role || undefined,
      targetId: record.id,
      action: `Deleted trespass record for ${record.first_name} ${record.last_name}`,
      recordSubjectName: `${record.first_name} ${record.last_name}`,
      tenantId: userProfile?.tenant_id || undefined,
      details: {
        deletedRecord: {
          first_name: record.first_name,
          last_name: record.last_name,
          incident_type: record.incident_type,
          incident_date: record.incident_date,
        },
      },
    });
  }

  revalidatePath('/dashboard');
}

/**
 * Get a single record by ID
 * Logs a record.viewed event for FERPA compliance
 */
export async function getRecord(id: string) {
  const supabase = await createServerClient();
  const { userId } = await auth();

  const { data: record, error } = await supabase
    .from('trespass_records')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching record:', error);
    throw new Error(error.message);
  }

  // Get user profile for audit log
  if (userId && record) {
    const { data: userProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('email, role, tenant_id')
      .eq('id', userId)
      .single();

    // Log view event for FERPA compliance
    await logAuditEvent({
      eventType: 'record.viewed',
      actorId: userId,
      actorEmail: userProfile?.email || undefined,
      actorRole: userProfile?.role || undefined,
      targetId: record.id,
      action: `Viewed trespass record for ${record.first_name} ${record.last_name}`,
      recordSubjectName: `${record.first_name} ${record.last_name}`,
      tenantId: userProfile?.tenant_id || undefined,
      details: {
        access_method: 'direct_view',
      },
    });
  }

  return record;
}
