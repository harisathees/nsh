/*
  # Clean up database schema and fix all issues

  1. Remove duplicate foreign key constraints
  2. Ensure proper relationships
  3. Add storage bucket for images
  4. Set up proper RLS policies
*/

-- Remove duplicate foreign key constraint
ALTER TABLE loans DROP CONSTRAINT IF EXISTS loans_customer_id_fkey;

-- Keep only the named constraint
-- (fk_loans_customer_id should remain)

-- Create storage bucket for images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('pledge-images', 'pledge-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for images
CREATE POLICY "Anyone can view images" ON storage.objects
FOR SELECT USING (bucket_id = 'pledge-images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'pledge-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update images" ON storage.objects
FOR UPDATE USING (bucket_id = 'pledge-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete images" ON storage.objects
FOR DELETE USING (bucket_id = 'pledge-images' AND auth.role() = 'authenticated');


-- Create storage bucket for audios if it doesn't exist
-- SELECT Policy for audios (safe)
CREATE POLICY "Anyone can view audios" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'pledge-audios'
);

-- INSERT Policy for audios
CREATE POLICY "Authenticated users can upload audios" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'pledge-audios' AND auth.role() = 'authenticated'
);

-- UPDATE Policy for audios
CREATE POLICY "Authenticated users can update audios" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'pledge-audios' AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'pledge-audios' AND auth.role() = 'authenticated'
);

-- DELETE Policy for audios
CREATE POLICY "Authenticated users can delete audios" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'pledge-audios' AND auth.role() = 'authenticated'
);
