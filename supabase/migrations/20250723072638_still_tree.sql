/*
  # Fix RLS policies for customers table

  1. Security Changes
    - Update RLS policy for customers table to allow anonymous users
    - Allow INSERT, SELECT, UPDATE, DELETE operations for anon role
    - Ensure authenticated users can also perform all operations

  2. Changes
    - Drop existing restrictive policy
    - Create new policy allowing both anon and authenticated users
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Allow all operations on customers" ON customers;

-- Create a new policy that allows both anonymous and authenticated users
CREATE POLICY "Allow all operations for anon and authenticated users" 
  ON customers 
  FOR ALL 
  TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);