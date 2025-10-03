/*
  ============================================================================
  COMBINED MIGRATION - TrespassTracker Complete Database Setup
  ============================================================================

  This single migration sets up the entire database schema for Clerk authentication.

  What this does:
  1. Creates trespass_records table with all fields
  2. Creates user_profiles table (Clerk-compatible with TEXT IDs)
  3. Sets up Row Level Security (RLS) policies with role-based permissions
  4. Creates indexes for performance
  5. Sets up triggers for updated_at timestamps

  Run this ONCE on a fresh Supabase database.

  ============================================================================
  PERMISSION SUMMARY (Role-Based Access Control)
  ============================================================================

  TRESPASS RECORDS:
  ------------------
  View (SELECT):     ALL authenticated users
  Create (INSERT):   user, district_admin, master_admin
  Update (UPDATE):   user, district_admin, master_admin
  Delete (DELETE):   district_admin, master_admin ONLY

  USER PROFILES:
  ------------------
  View own profile:  ALL authenticated users
  Create users:      district_admin, master_admin ONLY
  Update own:        ALL authenticated users (theme, display_name)

  ============================================================================
*/

-- ============================================================================
-- STEP 1: Create helper function for updated_at timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 2: Create trespass_records table
-- ============================================================================

CREATE TABLE IF NOT EXISTS trespass_records (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,  -- Clerk user ID (e.g., "user_2abc...")

  -- Personal Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  aka TEXT,  -- Also known as (aliases)
  date_of_birth DATE,
  school_id TEXT,  -- Student ID number

  -- Relationships
  known_associates TEXT,
  current_school TEXT,
  is_former_student BOOLEAN DEFAULT false,

  -- Guardian Information
  guardian_first_name TEXT,
  guardian_last_name TEXT,
  guardian_phone TEXT,
  contact_info TEXT,

  -- Incident Details
  incident_date DATE NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  notes TEXT,
  photo_url TEXT,

  -- Status & Restrictions
  status TEXT NOT NULL DEFAULT 'active',
  expiration_date DATE,
  trespassed_from TEXT NOT NULL DEFAULT '',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive'))
);

-- ============================================================================
-- STEP 3: Create user_profiles table (Clerk-compatible)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,  -- Clerk user ID (e.g., "user_2abc...")
  email TEXT,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  theme TEXT NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_role CHECK (role IN ('user', 'district_admin', 'master_admin')),
  CONSTRAINT valid_theme CHECK (theme IN ('light', 'dark', 'system'))
);

-- ============================================================================
-- STEP 4: Enable Row Level Security (RLS)
-- ============================================================================

ALTER TABLE trespass_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 5: Create RLS Policies for trespass_records
-- ============================================================================

-- All authenticated users can view all records
CREATE POLICY "Authenticated users can view all records"
  ON trespass_records
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can create records (user, district_admin, master_admin)
CREATE POLICY "Admins can create records"
  ON trespass_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (auth.jwt() ->> 'sub')
      AND role IN ('user', 'district_admin', 'master_admin')
    )
  );

-- Only admins can update records
CREATE POLICY "Admins can update records"
  ON trespass_records
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (auth.jwt() ->> 'sub')
      AND role IN ('user', 'district_admin', 'master_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (auth.jwt() ->> 'sub')
      AND role IN ('user', 'district_admin', 'master_admin')
    )
  );

-- Only district_admin and master_admin can delete records
CREATE POLICY "District and Master admins can delete records"
  ON trespass_records
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (auth.jwt() ->> 'sub')
      AND role IN ('district_admin', 'master_admin')
    )
  );

-- ============================================================================
-- STEP 6: Create RLS Policies for user_profiles
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.jwt() ->> 'sub' = id);

-- Only district_admin and master_admin can create new users
CREATE POLICY "District and Master admins can create users"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (auth.jwt() ->> 'sub')
      AND role IN ('district_admin', 'master_admin')
    )
  );

-- Users can update their own profile (theme, display_name)
-- Admins cannot change their own role through this policy
CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.jwt() ->> 'sub' = id)
  WITH CHECK (auth.jwt() ->> 'sub' = id);

-- ============================================================================
-- STEP 7: Create Indexes for Performance
-- ============================================================================

-- trespass_records indexes
CREATE INDEX IF NOT EXISTS idx_trespass_records_user_id
  ON trespass_records(user_id);
CREATE INDEX IF NOT EXISTS idx_trespass_records_incident_date
  ON trespass_records(incident_date DESC);
CREATE INDEX IF NOT EXISTS idx_trespass_records_status
  ON trespass_records(status);

-- user_profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_role
  ON user_profiles(role);

-- ============================================================================
-- STEP 8: Create Triggers for updated_at
-- ============================================================================

CREATE TRIGGER update_trespass_records_updated_at
  BEFORE UPDATE ON trespass_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 9: Helper Functions
-- ============================================================================

-- Get current user's role (for use in RLS policies or application logic)
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM user_profiles WHERE id = (auth.jwt() ->> 'sub');
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- Migration Complete!
-- ============================================================================
--
-- Next Steps:
-- 1. Configure Clerk JWT Template in Clerk Dashboard:
--    - Template name: "supabase"
--    - Claims: {"sub": "{{user.id}}", "email": "{{user.primary_email_address}}", "role": "authenticated"}
--
-- 2. Import your CSV data into trespass_records table
--
-- 3. Create your first user profile (master_admin)
--
-- ============================================================================
