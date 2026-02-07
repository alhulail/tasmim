# ChatGPT Operator Prompt - Vercel Deployment for Tasmim.ai

Copy and paste this into ChatGPT Operator AFTER Supabase setup is complete:

---

## TASK: Deploy Tasmim.ai to Vercel

### STEP 1: Import Project

1. Go to https://vercel.com/new
2. If not logged in, log in with GitHub
3. Click "Import" next to the "tasmim" repository
   - If repo not visible, click "Adjust GitHub App Permissions" and grant access
4. Keep these settings:
   - Framework Preset: Next.js (should auto-detect)
   - Root Directory: `./` (leave default)

### STEP 2: Add Environment Variables

Before clicking Deploy, expand "Environment Variables" section and add these ONE BY ONE:

| NAME | VALUE |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | [PASTE THE PROJECT URL FROM SUPABASE] |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | [PASTE THE ANON KEY FROM SUPABASE] |
| `SUPABASE_SERVICE_ROLE_KEY` | [PASTE THE SERVICE ROLE KEY FROM SUPABASE] |
| `NEXT_PUBLIC_APP_URL` | `https://tasmim.vercel.app` |
| `AI_IMAGE_PROVIDER` | `mock` |

For each variable:
1. Type the NAME in the "Name" field
2. Paste the VALUE in the "Value" field  
3. Make sure "Production", "Preview", and "Development" are all checked
4. Click "Add"

### STEP 3: Deploy

1. After all 5 environment variables are added, click "Deploy"
2. Wait for deployment to complete (usually 1-2 minutes)
3. Note the deployment URL (will be something like tasmim-xxxxx.vercel.app)

### STEP 4: Set Up Custom Domain (Optional)

1. Once deployed, click "Continue to Dashboard"
2. Go to "Settings" tab
3. Click "Domains" in left sidebar
4. Add your custom domain if you have one (e.g., tasmim.ai)
5. Follow DNS instructions shown

### STEP 5: Verify Deployment

1. Click the deployment URL to open the site
2. Confirm the landing page loads
3. Try clicking "العربية" to test Arabic/RTL mode
4. Try clicking "Get Started" to test auth flow

---

## FINAL STEP: Update Supabase Redirect URL

Go back to Supabase and update the redirect URL:

1. Go to https://supabase.com/dashboard
2. Open the Tasmim project
3. Go to Authentication → URL Configuration
4. Update "Site URL" to: `https://tasmim.vercel.app` (or your Vercel URL)
5. Make sure redirect URL `https://tasmim.vercel.app/auth/callback` is in the list
6. Save

---

## CONFIRMATION CHECKLIST

When complete, confirm:
✅ Project deployed to Vercel
✅ All 5 environment variables set
✅ Site loads at Vercel URL
✅ Arabic language toggle works
✅ Supabase redirect URL updated

Report the final Vercel URL to the user.
