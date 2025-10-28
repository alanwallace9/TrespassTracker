'use server';

import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type CSVRecordInput = {
  // Required fields
  first_name: string;
  last_name: string;
  school_id: string;
  expiration_date: string;
  trespassed_from: string;
  // Optional fields
  aka?: string;
  date_of_birth?: string;
  incident_date?: string;
  location?: string;
  description?: string;
  status?: string;
  is_former_student?: boolean;
  known_associates?: string;
  current_school?: string;
  guardian_first_name?: string;
  guardian_last_name?: string;
  guardian_phone?: string;
  contact_info?: string;
  notes?: string;
  photo_url?: string;
};

/**
 * Upload trespass records via server action
 * This ensures proper authentication and tenant isolation
 */
export async function uploadTrespassRecords(records: CSVRecordInput[]) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Not authenticated');
  }

  const supabase = await createServerClient();

  // Get user's profile to verify role and tenant_id
  const { data: userProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role, tenant_id')
    .eq('id', userId)
    .single();

  if (profileError || !userProfile) {
    throw new Error('User profile not found. Please sign out and sign in again.');
  }

  if (!userProfile.tenant_id) {
    throw new Error('Your profile is missing a tenant ID. Please contact your administrator.');
  }

  // Verify user has permission to create records
  if (!['campus_admin', 'district_admin', 'master_admin'].includes(userProfile.role)) {
    throw new Error('You do not have permission to upload records.');
  }

  // Transform records to include user_id and tenant_id
  const recordsToInsert = records.map(record => ({
    user_id: userId,
    tenant_id: userProfile.tenant_id,
    first_name: record.first_name,
    last_name: record.last_name,
    school_id: record.school_id,
    expiration_date: record.expiration_date,
    trespassed_from: record.trespassed_from,
    aka: record.aka || null,
    date_of_birth: record.date_of_birth || null,
    incident_date: record.incident_date || null,
    location: record.location || null,
    description: record.description || null,
    status: record.status || 'active',
    is_former_student: record.is_former_student || false,
    known_associates: record.known_associates || null,
    current_school: record.current_school || null,
    guardian_first_name: record.guardian_first_name || null,
    guardian_last_name: record.guardian_last_name || null,
    guardian_phone: record.guardian_phone || null,
    contact_info: record.contact_info || null,
    notes: record.notes || null,
    photo_url: record.photo_url || null,
  }));

  console.log('[uploadTrespassRecords] Inserting records:', {
    count: recordsToInsert.length,
    userId,
    tenant_id: userProfile.tenant_id,
    role: userProfile.role,
    sampleRecord: recordsToInsert[0],
  });

  // Insert records
  const { data, error } = await supabase
    .from('trespass_records')
    .insert(recordsToInsert)
    .select();

  if (error) {
    console.error('[uploadTrespassRecords] Insert error:', error);
    throw new Error(error.message);
  }

  console.log('[uploadTrespassRecords] Successfully inserted records:', data?.length);

  // Revalidate dashboard to show new records
  revalidatePath('/dashboard');

  return {
    success: true,
    count: data?.length || 0,
  };
}

/**
 * Create a single trespass record via server action
 * This ensures proper authentication and tenant isolation
 */
export async function createTrespassRecord(record: CSVRecordInput) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error('Not authenticated');
    }

    const supabase = await createServerClient();

    // Get user's profile to verify role and tenant_id
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role, tenant_id')
      .eq('id', userId)
      .single();

    if (profileError || !userProfile) {
      throw new Error('User profile not found. Please sign out and sign in again.');
    }

    if (!userProfile.tenant_id) {
      throw new Error('Your profile is missing a tenant ID. Please contact your administrator.');
    }

    // Verify user has permission to create records
    if (!['campus_admin', 'district_admin', 'master_admin'].includes(userProfile.role)) {
      throw new Error('You do not have permission to create records.');
    }

    // Check photo size if provided
    if (record.photo_url && record.photo_url.length > 4000000) {
      throw new Error('Photo is too large. Please use a smaller image (max 3MB).');
    }

    // Transform record to include user_id and tenant_id
    const recordToInsert = {
      user_id: userId,
      tenant_id: userProfile.tenant_id,
      first_name: record.first_name,
      last_name: record.last_name,
      school_id: record.school_id,
      expiration_date: record.expiration_date,
      trespassed_from: record.trespassed_from,
      aka: record.aka || null,
      date_of_birth: record.date_of_birth || null,
      incident_date: record.incident_date || null,
      location: record.location || null,
      description: record.description || null,
      status: record.status || 'active',
      is_former_student: record.is_former_student || false,
      known_associates: record.known_associates || null,
      current_school: record.current_school || null,
      guardian_first_name: record.guardian_first_name || null,
      guardian_last_name: record.guardian_last_name || null,
      guardian_phone: record.guardian_phone || null,
      contact_info: record.contact_info || null,
      notes: record.notes || null,
      photo_url: record.photo_url || null,
    };

    console.log('[createTrespassRecord] Inserting record:', {
      userId,
      tenant_id: userProfile.tenant_id,
      role: userProfile.role,
      name: `${record.first_name} ${record.last_name}`,
      hasPhoto: !!record.photo_url,
      photoSize: record.photo_url ? record.photo_url.length : 0,
    });

    // Insert record
    const { data, error } = await supabase
      .from('trespass_records')
      .insert(recordToInsert)
      .select()
      .single();

    if (error) {
      console.error('[createTrespassRecord] Insert error:', error);
      throw new Error(error.message);
    }

    console.log('[createTrespassRecord] Successfully inserted record:', data.id);

    // Revalidate dashboard to show new record
    revalidatePath('/dashboard');

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('[createTrespassRecord] Fatal error:', {
      message: error.message,
      stack: error.stack,
      name: `${record.first_name} ${record.last_name}`,
    });
    throw error;
  }
}
