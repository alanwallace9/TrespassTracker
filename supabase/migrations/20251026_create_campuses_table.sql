/*
  # Campus Management System

  ## Changes:
  1. Create campuses table for tracking school locations
  2. Add RLS policies for campus access
  3. Create indexes for performance

  ## Purpose:
  - Allow master/district admins to manage campus list
  - Provide dropdown list for campus selection when inviting users
  - Track which campuses belong to which tenants
*/

-- ============================================================
-- STEP 1: Create campuses table
-- ============================================================
CREATE TABLE IF NOT EXISTS campuses (
  id text PRIMARY KEY,                          -- Campus identifier (e.g., 'bhs', 'north-ms')
  tenant_id text NOT NULL,                      -- Foreign key to tenants
  name text NOT NULL,                           -- Human-readable name (e.g., 'Birdville High School')
  abbreviation text,                            -- Short name (e.g., 'BHS')
  status text DEFAULT 'active' NOT NULL         -- 'active', 'inactive'
    CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT fk_campuses_tenant
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_campuses_tenant_id ON campuses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campuses_status ON campuses(status);

-- Create trigger for updated_at
CREATE TRIGGER update_campuses_updated_at
  BEFORE UPDATE ON campuses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- STEP 2: Enable RLS
-- ============================================================
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 3: Create RLS policies
-- ============================================================

-- SELECT: Users can view campuses from their tenant
CREATE POLICY "Users can view campuses from their tenant"
  ON campuses FOR SELECT
  TO authenticated
  USING (tenant_id = get_my_tenant_id());

-- INSERT: Only district/master admins can create campuses
CREATE POLICY "Admins can create campuses for their tenant"
  ON campuses FOR INSERT
  TO authenticated
  WITH CHECK (
    get_my_role_from_db() IN ('district_admin', 'master_admin')
    AND tenant_id = get_my_tenant_id()
  );

-- UPDATE: Only district/master admins can update campuses
CREATE POLICY "Admins can update campuses from their tenant"
  ON campuses FOR UPDATE
  TO authenticated
  USING (
    get_my_role_from_db() IN ('district_admin', 'master_admin')
    AND tenant_id = get_my_tenant_id()
  )
  WITH CHECK (
    get_my_role_from_db() IN ('district_admin', 'master_admin')
    AND tenant_id = get_my_tenant_id()
  );

-- DELETE: Only master admins can delete campuses
CREATE POLICY "Master admins can delete campuses"
  ON campuses FOR DELETE
  TO authenticated
  USING (
    get_my_role_from_db() = 'master_admin'
    AND tenant_id = get_my_tenant_id()
  );

-- ============================================================
-- STEP 4: Insert official Birdville ISD campuses
-- ============================================================
INSERT INTO campuses (id, tenant_id, name, abbreviation, status) VALUES
  -- Elementary Schools
  ('101', 'birdville', 'Birdville ES', '101', 'active'),
  ('102', 'birdville', 'David E Smith ES', '102', 'active'),
  ('104', 'birdville', 'Binion ES', '104', 'active'),
  ('105', 'birdville', 'Mullendore ES', '105', 'active'),
  ('107', 'birdville', 'Smithfield ES', '107', 'active'),
  ('108', 'birdville', 'Snow Heights ES', '108', 'active'),
  ('109', 'birdville', 'Cheney Hills ES', '109', 'active'),
  ('110', 'birdville', 'Stowe ES', '110', 'active'),
  ('111', 'birdville', 'West Birdville ES', '111', 'active'),
  ('112', 'birdville', 'Holiday Heights ES', '112', 'active'),
  ('113', 'birdville', 'Watauga ES', '113', 'active'),
  ('114', 'birdville', 'Hardeman ES', '114', 'active'),
  ('115', 'birdville', 'Porter ES', '115', 'active'),
  ('116', 'birdville', 'ACFT ES', '116', 'active'),
  ('117', 'birdville', 'Foster Village ES', '117', 'active'),
  ('118', 'birdville', 'North Ridge ES', '118', 'active'),
  ('119', 'birdville', 'Spicer ES', '119', 'active'),
  ('120', 'birdville', 'Green Valley ES', '120', 'active'),
  ('121', 'birdville', 'Walker Creek ES', '121', 'active'),
  -- Middle Schools
  ('041', 'birdville', 'Haltom MS', '041', 'active'),
  ('042', 'birdville', 'North Richland MS', '042', 'active'),
  ('043', 'birdville', 'Richland MS', '043', 'active'),
  ('044', 'birdville', 'North Oaks MS', '044', 'active'),
  ('045', 'birdville', 'Watauga MS', '045', 'active'),
  ('046', 'birdville', 'Smithfield MS', '046', 'active'),
  ('047', 'birdville', 'North Ridge MS', '047', 'active'),
  -- High Schools
  ('001', 'birdville', 'Haltom HS', '001', 'active'),
  ('002', 'birdville', 'Richland HS', '002', 'active'),
  ('010', 'birdville', 'Birdville HS', '010', 'active'),
  ('012', 'birdville', 'Griggs HS', '012', 'active'),
  -- Special Facilities
  ('006', 'birdville', 'DAEP', '006', 'active'),
  ('902', 'birdville', 'Kunkel', '902', 'active'),
  ('000', 'birdville', 'District', '000', 'active')
ON CONFLICT (id) DO NOTHING;
