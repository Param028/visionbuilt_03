
# Vision Built - Production Deployment Guide

## 1. API Keys & Secrets Checklist

| Variable Name | Type | Location | Purpose |
| :--- | :--- | :--- | :--- |
| **VITE_SUPABASE_URL** | Public | `.env` (Frontend) | Connects React to Supabase instance. |
| **VITE_SUPABASE_ANON_KEY** | Public | `.env` (Frontend) | Public key for client-side DB access (RLS protected). |
| **VITE_RAZORPAY_KEY_ID** | Public | `.env` (Frontend) | Opens Razorpay Modal in browser. |
| **SUPABASE_URL** | Secret | Supabase Edge Functions | Auto-set by Supabase. |
| **SUPABASE_SERVICE_ROLE_KEY** | Secret | Supabase Edge Functions | Admin access for Edge Functions (Bypasses RLS). |
| **RAZORPAY_KEY_ID** | Secret | Supabase Edge Functions | Validates orders on server side. |
| **RAZORPAY_KEY_SECRET** | Secret | Supabase Edge Functions | Signs/captures payments securely. |
| **RESEND_API_KEY** | Secret | Supabase Edge Functions | Sends transactional emails. Get from [Resend.com](https://resend.com). |
| **SENDER_EMAIL** | Secret | Supabase Edge Functions | The "From" address (e.g., `noreply@visionbuilt.in`). |
| **ADMIN_EMAIL** | Secret | Supabase Edge Functions | Your email to receive order alerts. |

---

## 2. Chronological Deployment Steps

### Step 1: Database Initialization
1.  Log in to the **Supabase Dashboard**.
2.  Go to the **SQL Editor**.
3.  Copy the entire content of `supabase/schema.sql` from your project.
4.  Paste it into the editor and click **Run**.
    *   *This creates tables, policies, triggers, and the Super Admin user.*

### Step 2: Edge Functions Deployment
*Prerequisite:* Install Supabase CLI (`npm install -g supabase`).

1.  **Login to CLI:**
    ```bash
    supabase login
    ```
2.  **Link Project:**
    ```bash
    supabase link --project-ref <your-project-id>
    ```
3.  **Set Secrets (Backend Keys):**
    Run the following command to set production secrets:
    ```bash
    supabase secrets set RAZORPAY_KEY_ID=rzp_live_... RAZORPAY_KEY_SECRET=... RESEND_API_KEY=re_... SENDER_EMAIL=noreply@yourdomain.com ADMIN_EMAIL=you@gmail.com
    ```
4.  **Deploy Functions:**
    ```bash
    supabase functions deploy send-email
    supabase functions deploy create-razorpay-order
    supabase functions deploy invite-developer
    supabase functions deploy delete-team-member
    ```

### Step 3: Auth Configuration
Supabase handles Forgot Password / Magic Links automatically, but you need to configure the provider.

1.  Go to **Authentication > Providers** in Supabase.
2.  Enable **Email** provider.
3.  *(Optional but Recommended)*: Go to **Settings > SMTP Settings**.
    *   Enable **Custom SMTP**.
    *   Host: `smtp.resend.com`
    *   Port: `465`
    *   User: `resend`
    *   Pass: `YOUR_RESEND_API_KEY`
    *   Sender Email: `noreply@yourdomain.com`
    *   *Why?* This ensures your "Reset Password" emails don't go to spam.

### Step 4: Storage Setup
1.  Go to **Storage** in Supabase.
2.  Verify a public bucket named `public` exists.
3.  If not, create it and ensure it is set to **Public**.

### Step 5: Frontend Deployment (Vercel)
1.  Push your code to **GitHub**.
2.  Import the repo into **Vercel**.
3.  In Vercel **Project Settings > Environment Variables**, add:
    *   `VITE_SUPABASE_URL`
    *   `VITE_SUPABASE_ANON_KEY`
    *   `VITE_RAZORPAY_KEY_ID`
4.  Deploy.

### Step 6: Final Verification
1.  Visit your Vercel URL.
2.  Sign up as a new user.
    *   *Check:* Did you receive the "Welcome" email? (Triggered by DB webhook -> Edge Function).
3.  Log in as Super Admin (`vbuilt20@gmail.com` / `vision03`).
4.  Go to **Admin > Services** and add a test service.
5.  Go to **Dashboard** and try to place an order.
    *   *Check:* Does Razorpay modal open?
