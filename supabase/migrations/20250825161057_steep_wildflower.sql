/*
  # Create Re-Pledge Tables

  1. New Tables
    - `repledge_entries`
      - `id` (uuid, primary key)
      - `loan_id` (uuid, foreign key to loans table)
      - `loan_no` (text)
      - `re_no` (text)
      - `net_weight` (numeric)
      - `gross_weight` (numeric)
      - `stone_weight` (numeric)
      - `amount` (numeric)
      - `processing_fee` (numeric)
      - `bank_name` (text)
      - `interest_percent` (numeric)
      - `validity_period` (integer)
      - `after_interest_percent` (numeric)
      - `payment_date` (date)
      - `due_date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `repledge_entries` table
    - Add policies for authenticated users to manage their data
*/

CREATE TABLE IF NOT EXISTS repledge_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid REFERENCES loans(id) ON DELETE CASCADE,
  loan_no text,
  re_no text,
  net_weight numeric(8,3),
  gross_weight numeric(8,3),
  stone_weight numeric(8,3),
  amount numeric(10,2),
  processing_fee numeric(10,2) DEFAULT 0,
  bank_name text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'closed', 'pending')),
  interest_percent numeric(5,2),
  validity_period integer,
  after_interest_percent numeric(5,2),
  payment_method text,
  due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE repledge_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on repledge_entries"
  ON repledge_entries
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_repledge_entries_loan_id ON repledge_entries(loan_id);
CREATE INDEX IF NOT EXISTS idx_repledge_entries_loan_no ON repledge_entries(loan_no);
CREATE INDEX IF NOT EXISTS idx_repledge_entries_created_at ON repledge_entries(created_at);