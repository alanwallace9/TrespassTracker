'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { TrespassRecord } from '@/lib/supabase';

/**
 * Create a new trespass record
 */
export async function createRecord(data: Omit<TrespassRecord, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createServerClient();

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

  revalidatePath('/dashboard');
  return record;
}

/**
 * Update an existing trespass record
 */
export async function updateRecord(id: string, data: Partial<TrespassRecord>) {
  const supabase = await createServerClient();

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

  revalidatePath('/dashboard');
  return record;
}

/**
 * Delete a trespass record
 */
export async function deleteRecord(id: string) {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from('trespass_records')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting record:', error);
    throw new Error(error.message);
  }

  revalidatePath('/dashboard');
}

/**
 * Get a single record by ID
 */
export async function getRecord(id: string) {
  const supabase = await createServerClient();

  const { data: record, error } = await supabase
    .from('trespass_records')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching record:', error);
    throw new Error(error.message);
  }

  return record;
}
