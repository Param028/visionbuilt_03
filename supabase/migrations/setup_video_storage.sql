-- Migration: Set up Supabase Storage for video uploads
-- This migration creates a storage bucket for videos with appropriate policies

-- Create the videos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access on videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload access on videos" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete access on videos" ON storage.objects;

-- Policy: Public read access for all videos
CREATE POLICY "Public read access on videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'videos');

-- Policy: Authenticated users can upload videos
CREATE POLICY "Authenticated upload access on videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos');

-- Policy: Admins can delete videos
CREATE POLICY "Admin delete access on videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'videos'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'super_admin')
  )
);

-- Policy: Admins can update videos
CREATE POLICY "Admin update access on videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'videos'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'super_admin')
  )
)
WITH CHECK (
  bucket_id = 'videos'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'super_admin')
  )
);
