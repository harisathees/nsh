/*
  # Create calculations table

  1. New Tables
    - `calculations`
      - `id` (uuid, primary key)
      - `loan_id` (uuid, foreign key to loans table)
      - `end_date` (date)
      - `additional_reduction_amount` (numeric)
      - `calculation_method` (text)
      - `total_months` (text)
      - `final_interest_rate` (text)
      - `total_interest` (numeric)
      - `interest_reduction` (numeric)
      - `total_amount` (numeric)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `calculations` table
    - Add policy for authenticated users to manage calculations

  3. Changes
    - Foreign key relationship with loans table
    - Indexes for performance
*/

CREATE TABLE IF NOT EXISTS calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid NOT NULL,
  end_date date NOT NULL,
  additional_reduction_amount numeric(10,2) DEFAULT 0,
  calculation_method text NOT NULL,
  total_months text NOT NULL,
  final_interest_rate text NOT NULL,
  total_interest numeric(10,2) NOT NULL,
  interest_reduction numeric(10,2) DEFAULT 0,
  total_amount numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraint
ALTER TABLE calculations 
ADD CONSTRAINT fk_calculations_loan_id 
FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_calculations_loan_id ON calculations(loan_id);
CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON calculations(created_at);

-- Enable RLS
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Allow all operations on calculations"
  ON calculations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);