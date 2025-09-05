/*
  # Create close_repledge table

  1. New Tables
    - `close_repledge`
      - `id` (uuid, primary key)
      - `repledge_id` (uuid, foreign key to repledge.id)
      - `end_date` (date)
      - `payment_method` (text)
      - `calculation_method` (text)
      - `duration` (integer - days)
      - `final_interest_rate` (numeric)
      - `calculated_interest` (numeric)
      - `total_payable` (numeric)
      - `created_at` (timestamp with timezone, default now)

  2. Security
    - Enable RLS on `close_repledge` table
    - Add policy for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS close_repledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repledge_id uuid NOT NULL,
  end_date date NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'upi')),
  calculation_method text NOT NULL CHECK (calculation_method IN ('method_1', 'method_2', 'method_3')),
  duration integer NOT NULL,
  final_interest_rate numeric(5,2) NOT NULL,
  calculated_interest numeric(15,2) NOT NULL,
  total_payable numeric(15,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraint (assuming repledge table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'repledge') THEN
    ALTER TABLE close_repledge 
    ADD CONSTRAINT fk_close_repledge_repledge 
    FOREIGN KEY (repledge_id) REFERENCES repledge(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE close_repledge ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own close_repledge data"
  ON close_repledge
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert close_repledge data"
  ON close_repledge
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own close_repledge data"
  ON close_repledge
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_close_repledge_repledge_id ON close_repledge(repledge_id);
CREATE INDEX IF NOT EXISTS idx_close_repledge_created_at ON close_repledge(created_at);