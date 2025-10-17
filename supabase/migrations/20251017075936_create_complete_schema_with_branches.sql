/*
  # Complete Branch-Based Authentication System

  ## Summary
  Creates complete database schema with branch-based authentication for Pawn Brokerage Management.

  ## Tables Created

  ### 1. branches
  - Branch locations (Chennai, Madurai, Salem, etc.)
  - Each branch has unique code and name
  
  ### 2. users
  - User accounts with username/password authentication
  - Each user belongs to one branch
  - Roles: admin, manager, staff
  
  ### 3. customers, loans, jewels
  - Core business tables with branch_id for filtering
  
  ### 4. metal_rates
  - Gold and silver rates
  
  ### 5. Additional tables
  - repledges, banks, cash_logs (with branch support)

  ## Security
  - RLS is NOT enabled per user request
  - Password hashing using bcrypt
  - Branch-based data isolation through application logic

  ## Default Data
  - 3 sample branches created
  - Admin users created for each branch (username: admin_branchcode, password: admin123)
*/

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create branches table
CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  code text UNIQUE NOT NULL,
  address text DEFAULT '',
  phone text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  branch_id uuid REFERENCES branches(id) ON DELETE CASCADE,
  role text DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff')),
  is_active boolean DEFAULT true,
  auth_user_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mobile_no text,
  whatsapp_no text,
  address text,
  id_proof text,
  photo_url text,
  audio_url text,
  branch_id uuid REFERENCES branches(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_no text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  date date DEFAULT CURRENT_DATE,
  amount decimal(10,2),
  interest_rate decimal(5,2),
  validity_months integer,
  interest_taken boolean DEFAULT false,
  payment_method text,
  processing_fee decimal(10,2) DEFAULT 0,
  estimated_amount decimal(10,2),
  status text DEFAULT 'Active' CHECK (status IN ('Active', 'Overdue', 'Closed')),
  branch_id uuid REFERENCES branches(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create jewels table
CREATE TABLE IF NOT EXISTS jewels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid REFERENCES loans(id) ON DELETE CASCADE,
  type text,
  quality text,
  description text,
  pieces integer DEFAULT 1,
  weight decimal(8,3),
  stone_weight decimal(8,3),
  net_weight decimal(8,3),
  faults text,
  image_url text,
  branch_id uuid REFERENCES branches(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create metal_rates table
CREATE TABLE IF NOT EXISTS metal_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metal_type text UNIQUE NOT NULL,
  rate decimal(10,2) NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Create repledges table
CREATE TABLE IF NOT EXISTS repledges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repledge_no text UNIQUE NOT NULL,
  loan_id uuid REFERENCES loans(id),
  bank_id uuid,
  date date DEFAULT CURRENT_DATE,
  amount decimal(10,2),
  interest_rate decimal(5,2),
  validity_months integer,
  status text DEFAULT 'Active',
  branch_id uuid REFERENCES branches(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create banks table
CREATE TABLE IF NOT EXISTS banks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  branch text,
  account_no text,
  ifsc_code text,
  contact text,
  branch_id uuid REFERENCES branches(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cash_logs table
CREATE TABLE IF NOT EXISTS cash_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date DEFAULT CURRENT_DATE,
  description text,
  credit decimal(10,2) DEFAULT 0,
  debit decimal(10,2) DEFAULT 0,
  balance decimal(10,2),
  category text,
  branch_id uuid REFERENCES branches(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert sample branches
INSERT INTO branches (name, code, address, phone) VALUES
  ('Chennai', 'CHN', '123 Anna Salai, Chennai, Tamil Nadu', '044-12345678'),
  ('Madurai', 'MDU', '456 Main Road, Madurai, Tamil Nadu', '0452-2345678'),
  ('Salem', 'SLM', '789 Fort Road, Salem, Tamil Nadu', '0427-3456789')
ON CONFLICT (code) DO NOTHING;

-- Insert default metal rates
INSERT INTO metal_rates (metal_type, rate) VALUES
  ('Gold', 6500.00),
  ('Silver', 80.00)
ON CONFLICT (metal_type) DO NOTHING;

-- Create password hashing function
CREATE OR REPLACE FUNCTION hash_password(password text)
RETURNS text AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create password verification function
CREATE OR REPLACE FUNCTION verify_password(password text, password_hash text)
RETURNS boolean AS $$
BEGIN
  RETURN password_hash = crypt(password, password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default admin user for each branch
DO $$
DECLARE
  branch_rec RECORD;
BEGIN
  FOR branch_rec IN SELECT id, code FROM branches LOOP
    INSERT INTO users (username, password_hash, full_name, branch_id, role)
    VALUES (
      'admin_' || LOWER(branch_rec.code),
      crypt('admin123', gen_salt('bf')),
      'Admin ' || branch_rec.code,
      branch_rec.id,
      'admin'
    )
    ON CONFLICT (username) DO NOTHING;
  END LOOP;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_branch_id ON users(branch_id);
CREATE INDEX IF NOT EXISTS idx_customers_branch_id ON customers(branch_id);
CREATE INDEX IF NOT EXISTS idx_loans_branch_id ON loans(branch_id);
CREATE INDEX IF NOT EXISTS idx_loans_customer_id ON loans(customer_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_jewels_branch_id ON jewels(branch_id);
CREATE INDEX IF NOT EXISTS idx_jewels_loan_id ON jewels(loan_id);
CREATE INDEX IF NOT EXISTS idx_loans_loan_no ON loans(loan_no);
CREATE INDEX IF NOT EXISTS idx_repledges_branch_id ON repledges(branch_id);
CREATE INDEX IF NOT EXISTS idx_banks_branch_id ON banks(branch_id);
CREATE INDEX IF NOT EXISTS idx_cash_logs_branch_id ON cash_logs(branch_id);

-- Create function to authenticate user
CREATE OR REPLACE FUNCTION authenticate_user(p_username text, p_password text)
RETURNS TABLE(
  user_id uuid,
  username text,
  full_name text,
  branch_id uuid,
  branch_name text,
  branch_code text,
  role text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.username,
    u.full_name,
    u.branch_id,
    b.name,
    b.code,
    u.role
  FROM users u
  JOIN branches b ON u.branch_id = b.id
  WHERE u.username = p_username
    AND u.is_active = true
    AND b.is_active = true
    AND verify_password(p_password, u.password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: RLS is NOT enabled per user request
-- Data filtering by branch will be handled in application code
