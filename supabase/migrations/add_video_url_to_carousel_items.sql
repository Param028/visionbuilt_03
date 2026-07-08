-- Migration: Add video_url field to carousel_items
-- This migration adds support for videos in carousel items

ALTER TABLE public.carousel_items
ADD COLUMN IF NOT EXISTS video_url TEXT;
