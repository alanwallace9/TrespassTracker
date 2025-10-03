/*
  ============================================================================
  CLEANUP SCRIPT - Run this BEFORE the updated COMBINED_MIGRATION.sql
  ============================================================================

  This removes old policies and triggers so you can run the updated migration.

  Steps:
  1. Run this script FIRST
  2. Then run COMBINED_MIGRATION.sql

  This will NOT delete your data, only the old policies/triggers.
  ============================================================================
*/

-- ============================================================================
-- Drop all existing RLS policies
-- ============================================================================

-- trespass_records policies
DROP POLICY IF EXISTS "Authenticated users can view all records" ON trespass_records;
DROP POLICY IF EXISTS "Authenticated users can view all trespass records" ON trespass_records;
DROP POLICY IF EXISTS "Authenticated users can create records" ON trespass_records;
DROP POLICY IF EXISTS "Authenticated users can create trespass records" ON trespass_records;
DROP POLICY IF EXISTS "Authenticated users can update records" ON trespass_records;
DROP POLICY IF EXISTS "Authenticated users can update trespass records" ON trespass_records;
DROP POLICY IF EXISTS "Authenticated users can delete records" ON trespass_records;
DROP POLICY IF EXISTS "Authenticated users can delete trespass records" ON trespass_records;
DROP POLICY IF EXISTS "Admins can create records" ON trespass_records;
DROP POLICY IF EXISTS "Admins can update records" ON trespass_records;
DROP POLICY IF EXISTS "District and Master admins can delete records" ON trespass_records;

-- user_profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "District and Master admins can create users" ON user_profiles;

-- ============================================================================
-- Drop existing triggers (so they can be recreated)
-- ============================================================================

DROP TRIGGER IF EXISTS update_trespass_records_updated_at ON trespass_records;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;

-- ============================================================================
-- Cleanup complete! Now run COMBINED_MIGRATION.sql
-- ============================================================================
