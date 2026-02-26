
-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Tables

-- PROFILES (Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'client' CHECK (role IN ('client', 'developer', 'admin', 'super_admin')),
    country TEXT DEFAULT 'India',
    currency TEXT DEFAULT 'INR',
    avatar_url TEXT,
    performance_score INTEGER DEFAULT 0,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- SERVICES (Catalog)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    features TEXT[] DEFAULT '{}',
    icon TEXT,
    allow_domain BOOLEAN DEFAULT true,
    domain_price NUMERIC DEFAULT 15,
    allow_business_email BOOLEAN DEFAULT true,
    business_email_price NUMERIC DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- MARKETPLACE ITEMS
CREATE TABLE IF NOT EXISTS public.marketplace_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Websites', -- New Category Field
    short_description TEXT,
    full_description TEXT,
    price NUMERIC NOT NULL,
    tags TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    image_url TEXT,
    preview_images TEXT[] DEFAULT '{}',
    demo_url TEXT,
    download_url TEXT,
    developer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    developer_name TEXT,
    views INTEGER DEFAULT 0,
    purchases INTEGER DEFAULT 0,
    rating NUMERIC DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    free_until TIMESTAMP WITH TIME ZONE,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE public.marketplace_items ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Websites';
ALTER TABLE public.marketplace_items ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- OFFERS (Coupons)
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    code TEXT UNIQUE NOT NULL,
    "discountPercentage" INTEGER NOT NULL,
    "validUntil" TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('service', 'project')) NOT NULL,
    service_id UUID REFERENCES public.services(id),
    project_id UUID REFERENCES public.marketplace_items(id),
    service_title TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'mockup_ready', 'completed', 'cancelled')),
    domain_requested BOOLEAN DEFAULT false,
    business_email_requested BOOLEAN DEFAULT false,
    total_amount NUMERIC NOT NULL,
    deposit_amount NUMERIC DEFAULT 0,
    amount_paid NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    requirements JSONB DEFAULT '{}',
    reference_project_ids TEXT[] DEFAULT '{}', -- Added reference IDs
    applied_offer_code TEXT,
    discount_amount NUMERIC DEFAULT 0,
    rating INTEGER,
    review TEXT,
    deliverables TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS deliverables TEXT[] DEFAULT '{}';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS reference_project_ids TEXT[] DEFAULT '{}';

-- MESSAGES (Chat)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    sender_name TEXT,
    sender_role TEXT,
    content TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- TASKS (Admin/Dev)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_to_name TEXT,
    created_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
    priority TEXT DEFAULT 'medium',
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- PROJECT SUGGESTIONS (Public Wishlist)
CREATE TABLE IF NOT EXISTS public.project_suggestions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT,
    title TEXT NOT NULL,
    description TEXT,
    votes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'planned', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- ADMIN ACTIVITY LOG
CREATE TABLE IF NOT EXISTS public.admin_activity (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'success',
    razorpay_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 3. Row Level Security (RLS) Policies (Simplified for brevity, ensure existing policies are maintained)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Note: Re-run existing policies if needed from previous schema

-- Recurring Services / Subscriptions
CREATE TABLE IF NOT EXISTS public.recurring_services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  interval TEXT DEFAULT 'month', -- 'month', 'year'
  features TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  show_on_home BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE public.recurring_services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to allow updates without errors
DROP POLICY IF EXISTS "Public read access" ON public.recurring_services;
DROP POLICY IF EXISTS "Admin full access" ON public.recurring_services;

CREATE POLICY "Public read access" ON public.recurring_services
  FOR SELECT USING (true);

CREATE POLICY "Admin full access" ON public.recurring_services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

