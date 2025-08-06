/*
  # Add Foreign Key Constraint Between Loans and Customers

  1. Changes
    - Add foreign key constraint linking loans.customer_id to customers.id
    - This enables Supabase to understand the relationship for join queries

  2. Security
    - No RLS changes needed as tables already have proper policies
*/

-- Add foreign key constraint between loans and customers
ALTER TABLE loans
ADD CONSTRAINT fk_loans_customer_id
FOREIGN KEY (customer_id)
REFERENCES customers(id)
ON DELETE CASCADE;