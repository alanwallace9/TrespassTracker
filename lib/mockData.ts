// TESTING MODE: Mock data for development
// TODO: Remove this file before production

import { TrespassRecord, UserProfile } from './supabase';

export const MOCK_USER_ID = 'test-user-id';

export const mockUserProfile: UserProfile = {
  id: MOCK_USER_ID,
  email: 'test@example.com',
  display_name: 'Test Admin',
  role: 'master_admin',
  theme: 'system',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Helper to generate dates
const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

const daysFromNow = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

export const mockTrespassRecords: Omit<TrespassRecord, 'id' | 'created_at' | 'updated_at'>[] = [
  // 1. Active record
  {
    user_id: MOCK_USER_ID,
    first_name: 'John',
    last_name: 'Doe',
    aka: 'JD',
    date_of_birth: '2005-03-15',
    school_id: 'STU123456',
    known_associates: 'Mike Smith, Sarah Johnson',
    current_school: 'N/A',
    guardian_first_name: 'Robert',
    guardian_last_name: 'Doe',
    guardian_phone: '555-0123',
    contact_info: 'robert.doe@email.com',
    incident_date: daysAgo(10),
    location: 'Lincoln High School - Main Entrance',
    description: 'Individual found on campus after hours without authorization. Refused to leave when asked by security.',
    notes: 'Has been warned previously. Security footage captured.',
    photo_url: null,
    status: 'active',
    is_former_student: false,
    expiration_date: daysFromNow(355), // Active for ~1 year
    trespassed_from: 'All Lincoln High School campuses',
  },

  // 2. Expired record
  {
    user_id: MOCK_USER_ID,
    first_name: 'Emily',
    last_name: 'Rodriguez',
    aka: null,
    date_of_birth: '2003-08-22',
    school_id: null,
    known_associates: null,
    current_school: 'N/A',
    guardian_first_name: 'Maria',
    guardian_last_name: 'Rodriguez',
    guardian_phone: '555-0456',
    contact_info: 'maria.r@email.com',
    incident_date: daysAgo(400),
    location: 'Washington Middle School - Parking Lot',
    description: 'Found loitering in parking lot during school hours. No legitimate reason for being on campus.',
    notes: 'Cooperative with staff. Left without incident.',
    photo_url: null,
    status: 'active',
    is_former_student: false,
    expiration_date: daysAgo(35), // Expired 35 days ago
    trespassed_from: 'Washington Middle School',
  },

  // 3. Active former student
  {
    user_id: MOCK_USER_ID,
    first_name: 'Marcus',
    last_name: 'Thompson',
    aka: 'Marc',
    date_of_birth: '2004-11-30',
    school_id: 'STU987654',
    known_associates: 'Trevor Williams (current student)',
    current_school: 'N/A - Graduated 2023',
    guardian_first_name: 'James',
    guardian_last_name: 'Thompson',
    guardian_phone: '555-0789',
    contact_info: 'j.thompson@email.com',
    incident_date: daysAgo(5),
    location: 'Roosevelt High School - Athletic Field',
    description: 'Former student found on campus attempting to meet with current students. Previously expelled for disciplinary issues.',
    notes: 'Was expelled in junior year. Known to have conflicts with current staff. Police were called.',
    photo_url: null,
    status: 'active',
    is_former_student: true,
    expiration_date: daysFromNow(725), // Active for ~2 years
    trespassed_from: 'All district facilities',
  },
];
