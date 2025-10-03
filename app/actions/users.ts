'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type UserProfileUpdate = {
  display_name?: string;
  theme?: 'light' | 'dark' | 'system';
};

/**
 * Update user profile (display name, theme, etc.)
 */
export async function updateUserProfile(userId: string, updates: UserProfileUpdate) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    throw new Error(error.message);
  }

  revalidatePath('/dashboard');
  return data;
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user profile:', error);
    throw new Error(error.message);
  }

  return data;
}
