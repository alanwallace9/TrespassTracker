'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type UserProfileUpdate = {
  display_name?: string;
  theme?: 'light' | 'dark' | 'system';
  notifications_enabled?: boolean;
};

/**
 * Update user profile (display name, theme, etc.)
 * Uses upsert to create profile if it doesn't exist
 */
export async function updateUserProfile(userId: string, updates: UserProfileUpdate) {
  const supabase = await createServerClient();

  // Get current user from Supabase to check if profile exists
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  // If profile doesn't exist, we need to create it with required fields
  const upsertData = existingProfile
    ? {
        id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      }
    : {
        id: userId,
        email: null, // Will be populated from Clerk
        role: 'viewer', // Default role
        ...updates,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(upsertData)
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
  const supabase = await createServerClient();

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

/**
 * Get display name only (lightweight version)
 */
export async function getDisplayName(userId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('user_profiles')
    .select('display_name')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching display name:', error);
    return null;
  }

  return data?.display_name || null;
}
