# ChatGPT Operator Prompt - Vercel Deployment for Tasmim.ai

## TASK: Deploy Tasmim.ai to Vercel

### STEP 1: Import Project

1. Go to https://vercel.com/new
2. If not logged in, log in with GitHub
3. Find and click "Import" next to the "tasmim" repository
   - If repo not visible, click "Adjust GitHub App Permissions" and grant access
4. Keep these settings:
   - Framework Preset: Next.js (should auto-detect)
   - Root Directory: `./` (leave default)

### STEP 2: Add Environment Variables

Before clicking Deploy, expand "Environment Variables" section and add these FIVE variables ONE BY ONE:

**Variable 1:**
- Name: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://fwkfaensbpurjkoomhrb.supabase.co`

**Variable 2:**
- Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3a2ZhZW5zYnB1cmprb29taHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzODcwMzgsImV4cCI6MjA4NTk2MzAzOH0.Z-8gJ_FhdKUVHehS-eFR8imWEklx9TD64R5Fway8ztE`

**Variable 3:**
- Name: `SUPABASE_SERVICE_ROLE_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3a2ZhZW5zYnB1cmprb29taHJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDM4NzAzOCwiZXhwIjoyMDg1OTYzMDM4fQ.Gcq_REYtoMESXrsU7EbhX8wbdA2bX8Or5IzHpRS5XdM`

**Variable 4:**
- Name: `NEXT_PUBLIC_APP_URL`
- Value: `https://tasmim.vercel.app`

**Variable 5:**
- Name: `AI_IMAGE_PROVIDER`
- Value: `mock`

For each variable:
1. Type the Name exactly as shown
2. Paste the Value exactly as shown
3. Make sure all environments are checked (Production, Preview, Development)
4. Click "Add"

### STEP 3: Deploy

1. After all 5 environment variables are added, click "Deploy"
2. Wait for deployment to complete (usually 2-3 minutes)
3. Note the deployment URL when finished

### STEP 4: Update Supabase Site URL

After deployment succeeds:
1. Go to https://supabase.com/dashboard
2. Open the Tasmim project
3. Go to Authentication → URL Configuration
4. Change "Site URL" from `http://localhost:3000` to the Vercel deployment URL
5. Click Save

### STEP 5: Verify Deployment

1. Click the Vercel deployment URL to open the site
2. Confirm the landing page loads correctly
3. Try switching to Arabic (العربية) to test RTL mode
4. Report the final URL back

---

## CONFIRMATION CHECKLIST

When complete, confirm:
✅ Project imported from GitHub
✅ All 5 environment variables added
✅ Deployment successful
✅ Site loads correctly
✅ Supabase Site URL updated

Tell me the final Vercel URL.
