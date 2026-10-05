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

## Admin CMS

- `/admin/login` opens the Supabase Auth-protected CMS.
- **Projects** supports create, edit, publish/unpublish, archive, category assignment, featured flag, SEO fields, and deletion with confirmation.
- **Categories** supports two-level taxonomy, slug generation, editing, hiding, and guarded deletion.
- **Media library** uploads images, video, PDF, DOCX, PPTX, XLSX, and ZIP files directly to the `portfolio-media` bucket. Images are resized in-browser to WebP (maximum 2400px long edge, quality 82); SVG and files over 50MB are rejected. Storage objects are removed if the `media_assets` insert fails.

## Deployment verification

GitHub Actions runs `npm run build`, starts a Vite preview, and checks every public route on each push and pull request. To also check the deployed Vercel site, add a repository variable named `VERCEL_DEPLOYMENT_URL` containing the HTTPS deployment URL. The workflow waits for it to respond, then runs the same route checks against it.
