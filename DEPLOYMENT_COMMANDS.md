
# Vision Built - Terminal Commands & API Keys

## 1. Required API Keys
Gather these keys before running the commands.

| Key | Value Source |
| :--- | :--- |
| `RESEND_API_KEY` | [Resend.com](https://resend.com) |
| `SENDER_EMAIL` | e.g. `noreply@yourdomain.com` (Verified in Resend) |
| `ADMIN_EMAIL` | Your email address |
| `RAZORPAY_KEY_ID` | [Razorpay Dashboard](https://dashboard.razorpay.com) |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard |
| `SUPABASE_URL` | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard > Settings > API |

---

## 2. Terminal Commands (Run in Order)

### A. Login & Link
```bash
# 1. Login to Supabase CLI
npx supabase login

# 2. Link your local folder to your cloud project
# Find your Reference ID in the URL: https://supabase.com/dashboard/project/<PROJECT_REF>
npx supabase link --project-ref <YOUR_PROJECT_REF>
# (Enter your Database Password when prompted)
```

### B. Set Production Secrets
This securely stores your API keys on the server so Edge Functions can use them.
*Replace the values below with your actual keys.*

```bash
npx supabase secrets set \
  RESEND_API_KEY=re_123456789 \
  SENDER_EMAIL=noreply@visionbuilt.in \
  ADMIN_EMAIL=myemail@gmail.com \
  RAZORPAY_KEY_ID=rzp_live_12345 \
  RAZORPAY_KEY_SECRET=secret_12345 \
  SUPABASE_URL=https://yourproject.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5...
```

### C. Deploy Edge Functions
This uploads the code for sending emails, creating orders, and managing teams.

```bash
# 1. Deploy Email Service (Welcome, Order Confirmation, Updates)
npx supabase functions deploy send-email --no-verify-jwt

# 2. Deploy Payment Service
npx supabase functions deploy create-razorpay-order --no-verify-jwt

# 3. Deploy Team Management (Invites)
npx supabase functions deploy invite-developer --no-verify-jwt

# 4. Deploy Team Management (Removal)
npx supabase functions deploy delete-team-member --no-verify-jwt
```

---

## 3. Frontend Setup (Vercel)

When deploying your React app to Vercel, add these **Environment Variables** in the Vercel Project Settings:

1.  `VITE_SUPABASE_URL`: (From Supabase > Settings > API)
2.  `VITE_SUPABASE_ANON_KEY`: (From Supabase > Settings > API)
3.  `VITE_RAZORPAY_KEY_ID`: (From Razorpay Dashboard)

---

## 4. Configuring Auth (Supabase Dashboard)

1.  Go to **Authentication** > **Providers** > **Email**.
2.  **Enable** Email provider.
3.  Go to **Authentication** > **SMTP Settings**.
4.  Toggle **Enable Custom SMTP**.
5.  Enter Resend details:
    *   Host: `smtp.resend.com`
    *   Port: `465`
    *   User: `resend`
    *   Pass: `YOUR_RESEND_API_KEY`
    *   Sender Email: `noreply@yourdomain.com`
