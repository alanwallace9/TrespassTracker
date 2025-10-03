/*
  ============================================================================
  Add Missing Columns for CSV Import
  ============================================================================

  Adds columns that are in your CSV but missing from the database schema.

  Missing columns from CSV:
  - dob
  - warning_expires_date
  - trespass_from
  - image_url
  - age
  - alias
  - original_image_url
  - cached_image_url

  ============================================================================
*/

-- Add missing columns to trespass_records table
ALTER TABLE trespass_records
  ADD COLUMN IF NOT EXISTS dob DATE,
  ADD COLUMN IF NOT EXISTS warning_expires_date DATE,
  ADD COLUMN IF NOT EXISTS trespass_from TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS age INTEGER,
  ADD COLUMN IF NOT EXISTS alias TEXT,
  ADD COLUMN IF NOT EXISTS original_image_url TEXT,
  ADD COLUMN IF NOT EXISTS cached_image_url TEXT;

-- ============================================================================
-- Column mapping notes for CSV import:
-- ============================================================================
--
-- CSV Column          → Database Column
-- -------------------------------------------
-- dob                 → dob (NEW - same as date_of_birth)
-- warning_expires_date → warning_expires_date (NEW - same as expiration_date)
-- trespass_from       → trespass_from (NEW - same as trespassed_from)
-- image_url           → image_url (NEW - same as photo_url)
-- age                 → age (NEW - calculated field)
-- alias               → alias (NEW - same as aka)
-- original_image_url  → original_image_url (NEW)
-- cached_image_url    → cached_image_url (NEW)
--
-- IMPORTANT: Your CSV has different column names than the app uses.
-- You may want to map these during import or update the app to use CSV names.
--
-- ============================================================================
