/*
  # Create Pledge Management Schema

  1. New Tables
    - `customers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `mobile_no` (text)
      - `whatsapp_no` (text)
      - `address` (text)
      - `id_proof` (text)
      - `photo_url` (text)
      - `audio_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `loans`
      - `id` (uuid, primary key)
      - `loan_no` (text, unique)
      - `customer_id` (uuid, foreign key)
      - `date` (date)
      - `amount` (decimal)
      - `interest_rate` (decimal)
      - `validity_months` (integer)
      - `interest_taken` (boolean)
      - `payment_method` (text)
      - `processing_fee` (decimal)
      - `estimated_amount` (decimal)
      - `status` (text, default 'Active')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `jewels`
      - `id` (uuid, primary key)
      - `loan_id` (uuid, foreign key)
      - `type` (text)
      - `quality` (text)
      - `description` (text)
      - `pieces` (integer)
      - `weight` (decimal)
      - `stone_weight` (decimal)
      - `net_weight` (decimal)
      - `faults` (text)
      - `image_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
*/

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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE jewels ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing all operations for now - adjust based on your auth requirements)
CREATE POLICY "Allow all operations on customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on loans"
  ON loans
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on jewels"
  ON jewels
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_loans_customer_id ON loans(customer_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_jewels_loan_id ON jewels(loan_id);
CREATE INDEX IF NOT EXISTS idx_loans_loan_no ON loans(loan_no);