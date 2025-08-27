-- Create banks table
CREATE TABLE banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  code VARCHAR,
  branch VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster searches
CREATE INDEX idx_banks_name ON banks(name);
CREATE INDEX idx_banks_active ON banks(is_active);

-- Update repledge_entries table to use bank_id instead of bank_name
ALTER TABLE repledge_entries 
ADD COLUMN bank_id UUID REFERENCES banks(id);

-- If you want to migrate existing data from bank_name to bank_id:
-- First, insert existing bank names into banks table
INSERT INTO banks (name)
SELECT DISTINCT bank_name 
FROM repledge_entries 
WHERE bank_name IS NOT NULL AND bank_name != '';

-- Then update repledge_entries to use bank_id
UPDATE repledge_entries 
SET bank_id = banks.id
FROM banks
WHERE repledge_entries.bank_name = banks.name;

-- Finally, you can drop the old bank_name column (optional)
-- ALTER TABLE repledge_entries DROP COLUMN bank_name;

-- Enable Row Level Security (RLS)
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;

-- Create policies for banks table (adjust based on your authentication setup)
-- Allow authenticated users to read all banks
CREATE POLICY "Allow authenticated users to read banks" ON banks
FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert banks
CREATE POLICY "Allow authenticated users to insert banks" ON banks
FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to update their own banks
CREATE POLICY "Allow authenticated users to update banks" ON banks
FOR UPDATE TO authenticated USING (true);

-- Allow authenticated users to delete banks (soft delete via is_active)
CREATE POLICY "Allow authenticated users to update bank status" ON banks
FOR UPDATE TO authenticated USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_banks_updated_at BEFORE UPDATE ON banks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();