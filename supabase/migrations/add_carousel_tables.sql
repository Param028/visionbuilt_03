-- Migration: Add carousel categories and items tables
-- This migration adds the ability to manage product carousels with categories

-- CAROUSEL CATEGORIES
CREATE TABLE IF NOT EXISTS public.carousel_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Lucide icon name
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- CAROUSEL ITEMS (Products/Services in carousels)
CREATE TABLE IF NOT EXISTS public.carousel_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES public.carousel_categories(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  price NUMERIC,
  tags TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE public.carousel_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carousel_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access on carousel_categories" ON public.carousel_categories;
DROP POLICY IF EXISTS "Admin full access on carousel_categories" ON public.carousel_categories;
DROP POLICY IF EXISTS "Public read access on carousel_items" ON public.carousel_items;
DROP POLICY IF EXISTS "Admin full access on carousel_items" ON public.carousel_items;

-- Policies for carousel categories
CREATE POLICY "Public read access on carousel_categories" ON public.carousel_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin full access on carousel_categories" ON public.carousel_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Policies for carousel items
CREATE POLICY "Public read access on carousel_items" ON public.carousel_items
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin full access on carousel_items" ON public.carousel_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Insert sample data for testing
INSERT INTO public.carousel_categories (name, slug, description, icon, display_order, is_active) VALUES
  ('Shoot & Edit', 'shoot-edit', 'Professional photography and video editing services', 'Camera', 1, true),
  ('Web Development', 'web-development', 'Custom website and web application development', 'Code', 2, true),
  ('UI/UX Design', 'ui-ux-design', 'User interface and experience design services', 'Palette', 3, true)
ON CONFLICT (name) DO NOTHING;

-- Get the category IDs for sample items
DO $$
DECLARE
  shoot_edit_id UUID;
  web_dev_id UUID;
  ui_ux_id UUID;
BEGIN
  SELECT id INTO shoot_edit_id FROM public.carousel_categories WHERE slug = 'shoot-edit' LIMIT 1;
  SELECT id INTO web_dev_id FROM public.carousel_categories WHERE slug = 'web-development' LIMIT 1;
  SELECT id INTO ui_ux_id FROM public.carousel_categories WHERE slug = 'ui-ux-design' LIMIT 1;

  -- Insert sample items for Shoot & Edit
  IF shoot_edit_id IS NOT NULL THEN
    INSERT INTO public.carousel_items (category_id, title, description, image_url, link_url, price, tags, features, display_order, is_active) VALUES
      (shoot_edit_id, 'Product Photography', 'Professional product shots for e-commerce', NULL, NULL, 299, ARRAY['photography', 'product'], ARRAY['High-resolution images', 'White background', 'Multiple angles'], 1, true),
      (shoot_edit_id, 'Video Editing', 'Professional video editing and post-production', NULL, NULL, 499, ARRAY['video', 'editing'], ARRAY['Color grading', 'Sound design', 'Motion graphics'], 2, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert sample items for Web Development
  IF web_dev_id IS NOT NULL THEN
    INSERT INTO public.carousel_items (category_id, title, description, image_url, link_url, price, tags, features, display_order, is_active) VALUES
      (web_dev_id, 'Custom Website', 'Fully custom website development', NULL, NULL, 1499, ARRAY['web', 'custom'], ARRAY['Responsive design', 'SEO optimized', 'Fast loading'], 1, true),
      (web_dev_id, 'E-commerce Store', 'Complete online store setup', NULL, NULL, 2499, ARRAY['ecommerce', 'store'], ARRAY['Payment integration', 'Inventory management', 'Analytics'], 2, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert sample items for UI/UX Design
  IF ui_ux_id IS NOT NULL THEN
    INSERT INTO public.carousel_items (category_id, title, description, image_url, link_url, price, tags, features, display_order, is_active) VALUES
      (ui_ux_id, 'UI Design', 'Beautiful user interface design', NULL, NULL, 999, ARRAY['ui', 'design'], ARRAY['Modern aesthetics', 'User-friendly', 'Brand consistent'], 1, true),
      (ui_ux_id, 'UX Research', 'User experience research and testing', NULL, NULL, 799, ARRAY['ux', 'research'], ARRAY['User testing', 'Analytics', 'Improvement strategy'], 2, true)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
