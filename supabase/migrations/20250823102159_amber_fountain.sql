/*
  # Create banks table

  1. New Tables
    - `banks`
      - `id` (uuid, primary key)
      - `bank_name` (text, unique, not null)
      - `jewel_details` (text)
      - `jewel_name` (text)
      - `pieces` (integer)
      - `gross_weight` (numeric)
      - `stone_weight` (numeric)
      - `net_weight` (numeric)
      - `loan_no` (text)
      - `date` (date)
      - `amount` (numeric)
      - `interest_rate` (numeric)
      - `validity` (date)
      - `invest` (numeric)
      - `payment_method` (text)
      - `repledge_interest` (numeric)
      - `processing_fee` (numeric)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `banks` table
    - Add policy for authenticated users to perform all operations
*/

CREATE TABLE IF NOT EXISTS banks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name text UNIQUE NOT NULL,
  jewel_details text,
  jewel_name text,
  pieces integer,
  gross_weight numeric(10,3),
  stone_weight numeric(10,3),
  net_weight numeric(10,3),
  loan_no text,
  date date,
  amount numeric(12,2),
  interest_rate numeric(5,2),
  validity date,
  invest numeric(12,2),
  payment_method text,
  repledge_interest numeric(5,2),
  processing_fee numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE banks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on banks"
  ON banks
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert some sample banks
INSERT INTO banks (bank_name) VALUES 
  ('State Bank of India'),
  ('HDFC Bank'),
  ('ICICI Bank'),
  ('Axis Bank'),
  ('Punjab National Bank')
ON CONFLICT (bank_name) DO NOTHING;