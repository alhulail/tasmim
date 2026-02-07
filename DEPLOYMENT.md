# Tasmim.ai Deployment Guide

## Quick Deploy (15 minutes)

### Step 1: Supabase Setup (5 min)

#### 1.1 Run Database Migration

Go to your Supabase project → **SQL Editor** → **New Query**

Paste the entire contents of `supabase/migrations/001_initial_schema.sql` and click **Run**.

You should see: "Success. No rows returned"

#### 1.2 Enable Google Auth

1. Go to **Authentication** → **Providers**
2. Find **Google** and enable it
3. You'll need:
   - **Client ID** and **Client Secret** from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create OAuth 2.0 credentials with these redirect URIs:
     ```
     https://YOUR-PROJECT.supabase.co/auth/v1/callback
     ```

#### 1.3 Create Storage Buckets

Go to **Storage** → **New Bucket**:

| Bucket Name | Public | Purpose |
|-------------|--------|---------|
| `assets-public` | ✅ Yes | Watermarked previews |
| `assets-private` | ❌ No | Paid downloads |

#### 1.4 Get Your Credentials

Go to **Settings** → **API** and copy:
- **Project URL**: `https://xxxxx.supabase.co`
- **anon public key**: `eyJhbG...`
- **service_role key**: `eyJhbG...` (keep secret!)

---

### Step 2: Vercel Deployment (5 min)

#### 2.1 Push to GitHub

```bash
cd tasmim
git init
git add .
git commit -m "Initial commit - Tasmim.ai MVP"
git remote add origin https://github.com/YOUR-USERNAME/tasmim.git
git push -u origin main
```

#### 2.2 Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. **Framework Preset**: Next.js (auto-detected)
4. **Root Directory**: `./` (leave default)
5. Add **Environment Variables** (see below)
6. Click **Deploy**

#### 2.3 Environment Variables

Add these in Vercel dashboard → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` | All |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` | All |
| `NEXT_PUBLIC_APP_URL` | `https://tasmim.ai` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://tasmim-xxx.vercel.app` | Preview |
| `AI_IMAGE_PROVIDER` | `mock` | All (change to `openai` when ready) |
| `OPENAI_API_KEY` | `sk-...` | All (optional) |

---

### Step 3: Post-Deployment (5 min)

#### 3.1 Update Supabase Redirect URLs

Go to Supabase → **Authentication** → **URL Configuration**:

- **Site URL**: `https://tasmim.ai` (or your Vercel URL)
- **Redirect URLs** (add all):
  ```
  https://tasmim.ai/auth/callback
  https://tasmim-xxx.vercel.app/auth/callback
  http://localhost:3000/auth/callback
  ```

#### 3.2 Custom Domain (Optional)

In Vercel → **Settings** → **Domains**:
1. Add `tasmim.ai`
2. Configure DNS:
   - Type: `CNAME`
   - Name: `@` or `www`
   - Value: `cname.vercel-dns.com`

---

## Environment Variables Reference

### Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App
NEXT_PUBLIC_APP_URL=https://tasmim.ai
```

### Optional (for AI generation)

```env
# AI Provider: 'mock', 'openai', or 'stability'
AI_IMAGE_PROVIDER=openai

# OpenAI (if using DALL-E)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx

# Stability AI (alternative)
STABILITY_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

### Optional (for payments)

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxx
```

---

## Troubleshooting

### "Invalid API key" error
- Check that environment variables are set correctly in Vercel
- Redeploy after adding env vars

### Auth redirect not working
- Verify redirect URLs in Supabase match your domain exactly
- Check for trailing slashes

### Database errors
- Ensure migration ran successfully
- Check RLS policies are enabled

### Images not loading
- Verify storage buckets exist
- Check bucket policies allow public access for `assets-public`

---

## Testing Checklist

After deployment, test these flows:

- [ ] Landing page loads in English
- [ ] Switch to Arabic (RTL layout works)
- [ ] Sign up with email
- [ ] Sign up with Google
- [ ] Create a new project
- [ ] Generate an asset (uses free trial)
- [ ] Download asset (should be watermarked for free users)
- [ ] Log out and log back in

---

## Next Steps After MVP

1. **Add Stripe** - Payment processing for subscriptions
2. **Real AI Provider** - Switch from mock to OpenAI/Stability
3. **Editor** - Add image editing capabilities
4. **Email Templates** - Custom auth emails
5. **Analytics** - Add Posthog or Mixpanel
6. **Monitoring** - Add Sentry for error tracking
