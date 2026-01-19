
-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "net"; -- Required for webhooks/edge functions

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
    developer_id UUID REFERENCES public.profiles(id),
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
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
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
    sender_id UUID REFERENCES public.profiles(id) NOT NULL,
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
    assigned_to_id UUID REFERENCES public.profiles(id),
    assigned_to_name TEXT,
    created_by_id UUID REFERENCES public.profiles(id),
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
    priority TEXT DEFAULT 'medium',
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- PROJECT SUGGESTIONS (Public Wishlist)
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

-- ADMIN ACTIVITY LOG
CREATE TABLE IF NOT EXISTS public.admin_activity (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id UUID REFERENCES public.profiles(id),
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

-- Profiles: Public read, User update own
CREATE POLICY "Public profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "User update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Services: Public read, Admin write
CREATE POLICY "Public services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admin manage services" ON public.services FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin'))
);

-- Orders: Users see own, Admins see all
CREATE POLICY "Users see own orders" ON public.orders FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin', 'developer'))
);
CREATE POLICY "Users create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin update orders" ON public.orders FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin', 'developer'))
);

-- Messages: Participants see, Participants write
CREATE POLICY "Order participants read messages" ON public.messages FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM public.orders WHERE id = order_id) OR
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin', 'developer'))
);
CREATE POLICY "Order participants send messages" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.orders WHERE id = order_id) OR
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin', 'developer'))
);

-- Other tables: General public read, Admin write
CREATE POLICY "Public read offers" ON public.offers FOR SELECT USING (true);
CREATE POLICY "Admin manage offers" ON public.offers FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

CREATE POLICY "Public read marketplace" ON public.marketplace_items FOR SELECT USING (true);
CREATE POLICY "Admin manage marketplace" ON public.marketplace_items FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin', 'developer')));

-- 4. Triggers

-- Handle New User (Auto-create Profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', 'User'), 'client');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('public', 'public', true) ON CONFLICT DO NOTHING;

-- 6. Super Admin Seed (Optional)
DO $$
DECLARE
  target_user_id UUID;
  existing_user_id UUID;
BEGIN
  -- Check if user exists
  SELECT id INTO existing_user_id FROM auth.users WHERE email = 'vbuilt20@gmail.com';

  IF existing_user_id IS NOT NULL THEN
     UPDATE public.profiles SET role = 'super_admin' WHERE id = existing_user_id;
  END IF;
END $$;
