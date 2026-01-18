
-- Enable UUID extension for unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing (Required for creating users via SQL)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'client' CHECK (role IN ('client', 'developer', 'admin', 'super_admin')),
    country TEXT DEFAULT 'India',
    currency TEXT DEFAULT 'INR',
    avatar_url TEXT,
    performance_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 2. Services
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    features TEXT[] DEFAULT '{}',
    icon TEXT,
    -- New configuration fields
    allow_domain BOOLEAN DEFAULT true,
    domain_price NUMERIC DEFAULT 15,
    allow_business_email BOOLEAN DEFAULT true,
    business_email_price NUMERIC DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 3. Marketplace Items
CREATE TABLE IF NOT EXISTS public.marketplace_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    short_description TEXT,
    full_description TEXT,
    price NUMERIC NOT NULL,
    tags TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    image_url TEXT,
    preview_images TEXT[] DEFAULT '{}',
    demo_url TEXT,
    download_url TEXT,
    developer_id UUID REFERENCES public.profiles(id),
    developer_name TEXT,
    views INTEGER DEFAULT 0,
    purchases INTEGER DEFAULT 0,
    rating NUMERIC DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    free_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 4. Offers/Coupons
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    code TEXT UNIQUE NOT NULL,
    "discountPercentage" INTEGER NOT NULL,
    "validUntil" TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 5. Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    type TEXT CHECK (type IN ('service', 'project')) NOT NULL,
    service_id UUID REFERENCES public.services(id),
    project_id UUID REFERENCES public.marketplace_items(id),
    service_title TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'mockup_ready', 'completed', 'cancelled')),
    domain_requested BOOLEAN DEFAULT false,
    business_email_requested BOOLEAN DEFAULT false,
    total_amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    requirements JSONB DEFAULT '{}',
    applied_offer_code TEXT,
    discount_amount NUMERIC DEFAULT 0,
    rating INTEGER,
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 6. Messages (Chat)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) NOT NULL,
    sender_name TEXT,
    sender_role TEXT,
    content TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 7. Tasks (Internal)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to_id UUID REFERENCES public.profiles(id),
    assigned_to_name TEXT,
    created_by_id UUID REFERENCES public.profiles(id),
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
    priority TEXT DEFAULT 'medium',
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 8. Project Suggestions (Wishlist)
CREATE TABLE IF NOT EXISTS public.project_suggestions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    user_name TEXT,
    title TEXT NOT NULL,
    description TEXT,
    votes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'planned', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 9. Admin Activity Log
CREATE TABLE IF NOT EXISTS public.admin_activity (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- RLS POLICIES (BASIC SECURE DEFAULT)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, User update own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Services: Public read, Admin write
CREATE POLICY "Public services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admins can insert services" ON public.services FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));
CREATE POLICY "Admins can update services" ON public.services FOR UPDATE USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

-- Orders: Users see own, Admins see all
CREATE POLICY "Users can see own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin', 'developer')));
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin', 'developer')));

-- Storage Buckets (Run manually in Dashboard if SQL fails)
INSERT INTO storage.buckets (id, name, public) VALUES ('public', 'public', true) ON CONFLICT DO NOTHING;

-- =================================================================
-- SUPER ADMIN CREATION SCRIPT
-- =================================================================
DO $$
DECLARE
  target_user_id UUID;
  existing_user_id UUID;
BEGIN
  -- Check if user already exists
  SELECT id INTO existing_user_id FROM auth.users WHERE email = 'vbuilt20@gmail.com';

  IF existing_user_id IS NOT NULL THEN
     -- If user exists, just update their profile to be super_admin
     UPDATE public.profiles SET role = 'super_admin' WHERE id = existing_user_id;
     RAISE NOTICE 'User vbuilt20@gmail.com already exists. Updated role to super_admin.';
  ELSE
     -- If user does not exist, create them
     target_user_id := uuid_generate_v4();
     
     INSERT INTO auth.users (
       instance_id,
       id,
       aud,
       role,
       email,
       encrypted_password,
       email_confirmed_at,
       recovery_sent_at,
       last_sign_in_at,
       raw_app_meta_data,
       raw_user_meta_data,
       created_at,
       updated_at,
       confirmation_token,
       email_change,
       email_change_token_new,
       recovery_token
     ) VALUES (
       '00000000-0000-0000-0000-000000000000',
       target_user_id,
       'authenticated',
       'authenticated',
       'vbuilt20@gmail.com',
       crypt('vision03', gen_salt('bf')), -- Password hashing
       now(),
       now(),
       now(),
       '{"provider":"email","providers":["email"]}',
       '{"full_name":"Vision_03"}',
       now(),
       now(),
       '',
       '',
       '',
       ''
     );

     INSERT INTO public.profiles (
       id,
       email,
       name,
       role,
       country,
       currency
     ) VALUES (
       target_user_id,
       'vbuilt20@gmail.com',
       'Vision_03',
       'super_admin',
       'India',
       'INR'
     );
     
     RAISE NOTICE 'Created super_admin user: vbuilt20@gmail.com';
  END IF;
END $$;
