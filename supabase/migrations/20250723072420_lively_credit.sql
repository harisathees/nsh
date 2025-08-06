/*
  # Add Storage Policies for Image Upload

  1. Storage Policies
    - Allow anonymous users to upload images to pledge-images bucket
    - Allow anonymous users to view uploaded images
    - Enable public access for image viewing

  2. Security
    - Enable public access for the pledge-images bucket
    - Add policies for INSERT and SELECT operations
*/

-- Enable public access for the pledge-images bucket
UPDATE storage.buckets 
SET public = true 
WHERE id = 'pledge-images';

-- Allow anonymous users to upload images
CREATE POLICY "Allow anonymous uploads" ON storage.objects
FOR INSERT TO anon
WITH CHECK (bucket_id = 'pledge-images');

-- Allow anonymous users to view images
CREATE POLICY "Allow anonymous access" ON storage.objects
FOR SELECT TO anon
USING (bucket_id = 'pledge-images');

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'pledge-images');

-- Allow authenticated users to view images
CREATE POLICY "Allow authenticated access" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'pledge-images');







-- Enable public access for the pledge-audios bucket
UPDATE storage.buckets 
SET public = true 
WHERE id = 'pledge-audios';

-- Allow anonymous users to upload audios
CREATE POLICY "Allow anonymous uploads" ON storage.objects
FOR INSERT TO anon
WITH CHECK (bucket_id = 'pledge-audios');

-- Allow anonymous users to view audios
CREATE POLICY "Allow anonymous access" ON storage.objects
FOR SELECT TO anon
USING (bucket_id = 'pledge-audios');

-- Allow authenticated users to upload audios
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'pledge-audios');

-- Allow authenticated users to view audios
CREATE POLICY "Allow authenticated access" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'pledge-audios');