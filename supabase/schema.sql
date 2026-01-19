
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

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
    currency TEXT DEFAULT 'USD',
    requirements JSONB DEFAULT '{}',
    applied_offer_code TEXT,
    discount_amount NUMERIC DEFAULT 0,
    rating INTEGER,
    review TEXT,
    deliverables TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

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

-- 3. Row Level Security (RLS) Policies

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

-- --- CLEANUP EXISTING POLICIES TO PREVENT ERRORS ---
DO $$ 
BEGIN
    -- Profiles
    DROP POLICY IF EXISTS "Public profiles" ON public.profiles;
    DROP POLICY IF EXISTS "User update own" ON public.profiles;
    DROP POLICY IF EXISTS "User insert own" ON public.profiles;
    
    -- Services
    DROP POLICY IF EXISTS "Public services" ON public.services;
    DROP POLICY IF EXISTS "Admin manage services" ON public.services;
    
    -- Orders
    DROP POLICY IF EXISTS "Users see own orders" ON public.orders;
    DROP POLICY IF EXISTS "Users create orders" ON public.orders;
    DROP POLICY IF EXISTS "Admin update orders" ON public.orders;
    
    -- Messages
    DROP POLICY IF EXISTS "Order participants read messages" ON public.messages;
    DROP POLICY IF EXISTS "Order participants send messages" ON public.messages;
    
    -- Offers & Marketplace
    DROP POLICY IF EXISTS "Public read offers" ON public.offers;
    DROP POLICY IF EXISTS "Admin manage offers" ON public.offers;
    DROP POLICY IF EXISTS "Public read marketplace" ON public.marketplace_items;
    DROP POLICY IF EXISTS "Admin manage marketplace" ON public.marketplace_items;
    
    -- Tasks
    DROP POLICY IF EXISTS "Admin/Dev view tasks" ON public.tasks;
    DROP POLICY IF EXISTS "Admin manage tasks" ON public.tasks;
    DROP POLICY IF EXISTS "Dev update tasks" ON public.tasks;
    
    -- Admin Activity
    DROP POLICY IF EXISTS "Admin view activity" ON public.admin_activity;
    DROP POLICY IF EXISTS "Admin log activity" ON public.admin_activity;
    
    -- Suggestions
    DROP POLICY IF EXISTS "Public read suggestions" ON public.project_suggestions;
    DROP POLICY IF EXISTS "Authenticated create suggestions" ON public.project_suggestions;
    DROP POLICY IF EXISTS "Authenticated vote suggestions" ON public.project_suggestions;
    DROP POLICY IF EXISTS "Admin manage suggestions" ON public.project_suggestions;
    
    -- Payments
    DROP POLICY IF EXISTS "View own payments" ON public.payments;
    DROP POLICY IF EXISTS "Admin view payments" ON public.payments;
    DROP POLICY IF EXISTS "User create payment" ON public.payments;
END $$;

-- --- CREATE POLICIES ---

-- Profiles
CREATE POLICY "Public profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "User update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
-- Important: Allow users to insert their own profile if the trigger fails
CREATE POLICY "User insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Services
CREATE POLICY "Public services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admin manage services" ON public.services FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin'))
);

-- Orders
CREATE POLICY "Users see own orders" ON public.orders FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin', 'developer'))
);
CREATE POLICY "Users create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin update orders" ON public.orders FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin', 'developer'))
);

-- Messages
CREATE POLICY "Order participants read messages" ON public.messages FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM public.orders WHERE id = order_id) OR
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin', 'developer'))
);
CREATE POLICY "Order participants send messages" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.orders WHERE id = order_id) OR
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin', 'developer'))
);

-- Offers & Marketplace
CREATE POLICY "Public read offers" ON public.offers FOR SELECT USING (true);
CREATE POLICY "Admin manage offers" ON public.offers FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

CREATE POLICY "Public read marketplace" ON public.marketplace_items FOR SELECT USING (true);
CREATE POLICY "Admin manage marketplace" ON public.marketplace_items FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin', 'developer')));

-- Tasks
CREATE POLICY "Admin/Dev view tasks" ON public.tasks FOR SELECT USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin', 'developer'))
);
CREATE POLICY "Admin manage tasks" ON public.tasks FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin'))
);
CREATE POLICY "Dev update tasks" ON public.tasks FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('developer'))
);

-- Admin Activity
CREATE POLICY "Admin view activity" ON public.admin_activity FOR SELECT USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admin log activity" ON public.admin_activity FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin', 'developer'))
);

-- Project Suggestions
CREATE POLICY "Public read suggestions" ON public.project_suggestions FOR SELECT USING (true);
CREATE POLICY "Authenticated create suggestions" ON public.project_suggestions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated vote suggestions" ON public.project_suggestions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin manage suggestions" ON public.project_suggestions FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin'))
);

-- Payments
CREATE POLICY "View own payments" ON public.payments FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM public.orders WHERE id = order_id)
);
CREATE POLICY "Admin view payments" ON public.payments FOR SELECT USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin', 'developer'))
);
CREATE POLICY "User create payment" ON public.payments FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.orders WHERE id = order_id)
);

-- 4. Triggers

-- Handle New User (Auto-create Profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Wrap in a block to catch errors and prevent Auth from failing (500)
  BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', 'User'), 'client')
    ON CONFLICT (id) DO NOTHING; -- Idempotency: if profile exists, do nothing
  EXCEPTION WHEN OTHERS THEN
    -- In case of any DB error (unique email violation elsewhere, etc), swallow the error 
    -- so the user can still sign up. The client app will handle profile creation via 
    -- the "insert own" policy if missing.
    RAISE WARNING 'Trigger failed to create profile for %: %', new.id, SQLERRM;
  END;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists to ensure clean state
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('public', 'public', true) ON CONFLICT DO NOTHING;

-- 6. Super Admin Seed
DO $$
DECLARE
  new_user_id UUID := uuid_generate_v4();
BEGIN
  -- Insert user into auth.users if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'vbuilt20@gmail.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      'vbuilt20@gmail.com',
      crypt('vision03', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Super Admin"}',
      now(),
      now(),
      '',
      ''
    );
  END IF;

  -- Ensure role is super_admin in profiles
  -- We do this as an UPSERT just in case the trigger failed or ran differently
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    (SELECT id FROM auth.users WHERE email = 'vbuilt20@gmail.com'),
    'vbuilt20@gmail.com',
    'Super Admin',
    'super_admin'
  )
  ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
  
END $$;

-- Fix foreign key constraints for existing tables (Migration)
DO $$
BEGIN
    -- Orders -> User: Add ON DELETE CASCADE
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'orders_user_id_fkey') THEN
        ALTER TABLE public.orders DROP CONSTRAINT orders_user_id_fkey;
        ALTER TABLE public.orders ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    
    -- Messages -> Sender: Add ON DELETE CASCADE
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'messages_sender_id_fkey') THEN
        ALTER TABLE public.messages DROP CONSTRAINT messages_sender_id_fkey;
        ALTER TABLE public.messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;
