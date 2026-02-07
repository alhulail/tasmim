# 🚀 TASMIM.AI - Quick Deploy Checklist

## Step 1: Supabase Database (2 minutes)

1. Open your Supabase project dashboard
2. Go to **SQL Editor** → **New Query**
3. Copy the ENTIRE contents of `supabase/setup.sql` and paste it
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. You should see: `Success. No rows returned`

## Step 2: Supabase Auth (2 minutes)

### Enable Email Auth (already enabled by default)

### Enable Google Auth:
1. Go to **Authentication** → **Providers** → **Google**
2. Toggle **Enable**
3. Get credentials from [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   - Create OAuth 2.0 Client ID
   - Authorized redirect URI: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
4. Copy **Client ID** and **Client Secret** into Supabase

## Step 3: Get Your Keys (1 minute)

Go to **Settings** → **API** and copy these values:

```
Project URL:      https://__________.supabase.co
anon public key:  eyJhbGci...
service_role:     eyJhbGci...  (keep this secret!)
```

## Step 4: Deploy to Vercel (3 minutes)

### Option A: Via Vercel Dashboard (easiest)
1. Push code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repo
4. Add environment variables (see below)
5. Deploy

### Option B: Via CLI
```bash
npm i -g vercel
cd tasmim
vercel
```

## Step 5: Environment Variables

Add these in Vercel → Settings → Environment Variables:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |
| `AI_IMAGE_PROVIDER` | `mock` (change to `openai` later) |

## Step 6: Update Redirect URLs (1 minute)

In Supabase → **Authentication** → **URL Configuration**:

1. **Site URL**: `https://your-app.vercel.app`
2. **Redirect URLs**: Add:
   - `https://your-app.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback`

## ✅ Done!

Your app should now be live. Test:
- [ ] Landing page loads
- [ ] Can switch to Arabic
- [ ] Can sign up with email
- [ ] Can sign up with Google
- [ ] Can create a project
- [ ] Can generate an asset (uses free trial)

---

## 🔧 Troubleshooting

### "Invalid API key" 
→ Check env vars are set correctly, redeploy

### Auth redirect fails
→ Check redirect URLs match exactly (no trailing slashes)

### Database errors
→ Re-run the SQL setup script

### Generation fails
→ Check console for errors, ensure `AI_IMAGE_PROVIDER=mock` for testing

---

## 📱 Next Steps

1. **Custom domain**: Vercel → Settings → Domains
2. **Real AI**: Set `AI_IMAGE_PROVIDER=openai` and add `OPENAI_API_KEY`
3. **Payments**: Add Stripe integration
4. **Monitoring**: Add Sentry for error tracking
