import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Real Supabase client - connected to your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type TrespassRecord = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  aka: string | null;
  date_of_birth: string | null;
  school_id: string | null;
  known_associates: string | null;
  current_school: string | null;
  guardian_first_name: string | null;
  guardian_last_name: string | null;
  guardian_phone: string | null;
  contact_info: string | null;
  incident_date: string;
  location: string;
  description: string;
  notes: string | null;
  photo_url: string | null;
  status: 'active' | 'inactive';
  is_former_student: boolean;
  expiration_date: string | null;
  trespassed_from: string;
  created_at: string;
  updated_at: string;
};

export type UserProfile = {
  id: string;                                          // Clerk user ID (e.g., "user_2abc...")
  email: string | null;                                // User email from Clerk
  display_name: string | null;
  role: 'viewer' | 'campus_admin' | 'district_admin' | 'master_admin';
  campus_id: string | null;                            // Campus ID for campus_admin users
  theme: 'light' | 'dark' | 'system';
  created_at: string;
  updated_at: string;
};

export type RecordPhoto = {
  id: string;
  record_id: string;
  storage_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  display_order: number;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
};

export type RecordDocument = {
  id: string;
  record_id: string;
  storage_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  document_type: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
};
