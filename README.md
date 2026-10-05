# Vision Built portfolio

A Vite + React + TypeScript + Tailwind portfolio site backed by Supabase.

## Included

- BrowserRouter public site: Home, Work, category filtering, project detail, Services, About, Contact, Privacy and Terms.
- Published-only project queries with category/subcategory support and project media.
- Supabase Auth admin login at `/admin/login` with database-backed `admin`/`super_admin` access checks.
- CMS dashboard shell with project/enquiry counts and enquiry inbox.
- Validated contact enquiries with honeypot and client cooldown protection.
- Vercel rewrite, `robots.txt`, sitemap, responsive layout, accessible focus states and reduced-motion support.
- Versioned schema and RLS migration at `supabase/migrations/portfolio_cms_migration.sql`.

## Local development

1. Copy `.env.example` to `.env.local` and add the public Supabase URL and anon/publishable key.
2. Run `npm install`.
3. Run `npm run dev`.
4. Apply the migration in `supabase/migrations/portfolio_cms_migration.sql` to a Supabase project.

The browser bundle contains no service-role keys or payment credentials. Admin writes are protected by Supabase RLS and the `public.is_admin()` function.
