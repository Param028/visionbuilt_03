-- Migration: Set up Supabase Storage for image uploads
-- This migration creates a storage bucket for images with appropriate policies

-- Create the images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access on images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload access on images" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete access on images" ON storage.objects;

-- Policy: Public read access for all images
CREATE POLICY "Public read access on images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- Policy: Authenticated users can upload images
CREATE POLICY "Authenticated upload access on images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Policy: Admins can delete images
CREATE POLICY "Admin delete access on images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'super_admin')
  )
);

-- Policy: Admins can update images
CREATE POLICY "Admin update access on images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'super_admin')
  )
)
WITH CHECK (
  bucket_id = 'images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'super_admin')
  )
);
