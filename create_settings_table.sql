-- Run this in your Supabase SQL Editor
create table if not exists site_settings (
  id text primary key default 'global',
  hero_title text not null default 'Build the FUTURE',
  hero_subtitle text not null default 'Vision Built transforms ideas into digital reality. From high-scale software to futuristic web experiences, we engineer success.',
  contact_email text not null default 'hello@visionbuilt.com',
  contact_phone text not null default '+1 (555) 123-4567',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default row if none exists
insert into site_settings (id)
select 'global'
where not exists (select 1 from site_settings where id = 'global');

-- Enable RLS
alter table site_settings enable row level security;

-- Policies
create policy "Public can view site settings" on site_settings for select using (true);
create policy "Admins can update site settings" on site_settings for update using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid() and (profiles.role = 'admin' or profiles.role = 'super_admin')
  )
);
