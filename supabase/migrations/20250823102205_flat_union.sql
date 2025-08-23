/*
  # Create repledge_entries table

  1. New Tables
    - `repledge_entries`
      - `id` (uuid, primary key)
      - `bank_name` (text)
      - `jewel_details` (text)
      - `jewel_name` (text)
      - `pieces` (integer)
      - `gross_weight` (numeric)
      - `stone_weight` (numeric)
      - `net_weight` (numeric)
      - `loan_no` (text, unique)
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
    - Enable RLS on `repledge_entries` table
    - Add policy for authenticated users to perform all operations

  3. Constraints
    - Add check constraint for payment_method
*/

CREATE TABLE IF NOT EXISTS repledge_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name text,
  jewel_details text,
  jewel_name text,
  pieces integer,
  gross_weight numeric(10,3),
  stone_weight numeric(10,3),
  net_weight numeric(10,3),
  loan_no text UNIQUE,
  date date,
  amount numeric(12,2),
  interest_rate numeric(5,2),
  validity date,
  invest numeric(12,2),
  payment_method text CHECK (payment_method IN ('Cash', 'Bank Transfer', 'UPI', 'Cheque')),
  repledge_interest numeric(5,2),
  processing_fee numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE repledge_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on repledge_entries"
  ON repledge_entries
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_repledge_entries_loan_no ON repledge_entries(loan_no);
CREATE INDEX IF NOT EXISTS idx_repledge_entries_bank_name ON repledge_entries(bank_name);
CREATE INDEX IF NOT EXISTS idx_repledge_entries_date ON repledge_entries(date);