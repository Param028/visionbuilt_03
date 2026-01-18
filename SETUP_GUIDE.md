
# Vision Built - Setup Guide

## 1. Environment Variables
Ensure you have a `.env` file in the root directory with the following keys:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
# For Local Admin CLI Scripts (Optional)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 2. Authentication Setup (Fixing "Provider not enabled")

To make Google and GitHub login work, you must enable them in Supabase.

1.  Go to **Authentication > Providers** in your Supabase Dashboard.
2.  **GitHub:**
    *   Create an OAuth App here: [GitHub Developer Settings](https://github.com/settings/developers)
    *   **Homepage URL:** `http://localhost:5173` (or your production URL)
    *   **Callback URL:** Copy from Supabase (e.g., `https://xyz.supabase.co/auth/v1/callback`)
    *   Enter Client ID & Secret in Supabase.
3.  **Google:**
    *   Create Credentials here: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
    *   **Authorized Javascript Origins:** `http://localhost:5173`
    *   **Authorized Redirect URIs:** Copy from Supabase.
    *   Enter Client ID & Secret in Supabase.

## 3. URL Configuration
1.  Go to **Authentication > URL Configuration** in Supabase.
2.  Set **Site URL** to `http://localhost:5173`.
3.  Add `http://localhost:5173/*` and `https://<your-vercel-url>/*` to **Redirect URLs**.

## 4. Database Setup
Copy the content of `supabase/schema.sql` and run it in the **SQL Editor** of your Supabase dashboard to create all necessary tables and the Super Admin user.

## 5. Admin CLI
To manage users or delete developers without restrictions:
1.  Ensure `SUPABASE_SERVICE_ROLE_KEY` is in your `.env`.
2.  Run: `npm run admin`
