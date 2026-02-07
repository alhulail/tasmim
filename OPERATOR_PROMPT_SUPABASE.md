# ChatGPT Operator Prompt - Supabase Setup for Tasmim.ai

Copy and paste this entire prompt into ChatGPT Operator:

---

## TASK: Set up Supabase project for Tasmim.ai

Go to https://supabase.com/dashboard and complete these steps for my "Tasmim" project:

### STEP 1: Run Database Migration

1. Click on the "Tasmim" project to open it
2. In the left sidebar, click "SQL Editor"
3. Click "New Query" 
4. Copy and paste this ENTIRE SQL script into the editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  locale TEXT DEFAULT 'en' CHECK (locale IN ('en', 'ar')),
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'one_time')),
  credits_balance INTEGER DEFAULT 0,
  trial_generations_used INTEGER DEFAULT 0,
  trial_generations_limit INTEGER DEFAULT 2,
  credits_reset_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  brand_name_ar TEXT,
  industry TEXT,
  keywords TEXT[] DEFAULT '{}',
  palette JSONB DEFAULT '{"primary": "#4f46e5", "secondary": "#c6a962", "accent": "#0ea5e9"}',
  style JSONB DEFAULT '{"mood": "modern", "complexity": "moderate"}',
  target_audience TEXT,
  description TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets table
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('logo', 'icon', 'pattern', 'social_post', 'stationery', 'favicon', 'wordmark')),
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'failed')),
  prompt TEXT,
  model TEXT,
  image_url TEXT,
  storage_path TEXT,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}',
  is_watermarked BOOLEAN DEFAULT TRUE,
  is_favorite BOOLEAN DEFAULT FALSE,
  version INTEGER DEFAULT 1,
  parent_asset_id UUID REFERENCES public.assets(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generations table
CREATE TABLE IF NOT EXISTS public.generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  request JSONB NOT NULL,
  response JSONB,
  provider TEXT,
  model TEXT,
  credits_used INTEGER DEFAULT 1,
  is_trial BOOLEAN DEFAULT FALSE,
  processing_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'starter', 'pro', 'one_time')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  provider TEXT DEFAULT 'stripe',
  provider_subscription_id TEXT,
  provider_customer_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Designer consults table
CREATE TABLE IF NOT EXISTS public.designer_consults (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  month_key TEXT NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  iterations_used INTEGER DEFAULT 0,
  iterations_limit INTEGER DEFAULT 5,
  notes TEXT,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month_key)
);

-- Credit transactions table
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designer_consults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own assets" ON public.assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create assets" ON public.assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assets" ON public.assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own assets" ON public.assets FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own generations" ON public.generations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create generations" ON public.generations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own consults" ON public.designer_consults FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own consults" ON public.designer_consults FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own transactions" ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);

-- Function: Handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Trigger: Create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Use credits
CREATE OR REPLACE FUNCTION public.use_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS TABLE (success BOOLEAN, new_balance INTEGER, error_message TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_profile public.user_profiles%ROWTYPE;
  v_new_balance INTEGER;
BEGIN
  SELECT * INTO v_profile FROM public.user_profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 'User not found'::TEXT;
    RETURN;
  END IF;
  IF v_profile.plan = 'free' THEN
    IF v_profile.trial_generations_used >= v_profile.trial_generations_limit THEN
      RETURN QUERY SELECT FALSE, 0, 'No free trials remaining'::TEXT;
      RETURN;
    END IF;
    UPDATE public.user_profiles SET trial_generations_used = trial_generations_used + 1, updated_at = NOW() WHERE id = p_user_id;
    v_new_balance := v_profile.trial_generations_limit - v_profile.trial_generations_used - 1;
    INSERT INTO public.credit_transactions (user_id, amount, balance_after, reason, reference_id) VALUES (p_user_id, -1, v_new_balance, p_reason || ' (trial)', p_reference_id);
    RETURN QUERY SELECT TRUE, v_new_balance, NULL::TEXT;
    RETURN;
  END IF;
  IF v_profile.credits_balance < p_amount THEN
    RETURN QUERY SELECT FALSE, v_profile.credits_balance, 'Insufficient credits'::TEXT;
    RETURN;
  END IF;
  v_new_balance := v_profile.credits_balance - p_amount;
  UPDATE public.user_profiles SET credits_balance = v_new_balance, updated_at = NOW() WHERE id = p_user_id;
  INSERT INTO public.credit_transactions (user_id, amount, balance_after, reason, reference_id) VALUES (p_user_id, -p_amount, v_new_balance, p_reason, p_reference_id);
  RETURN QUERY SELECT TRUE, v_new_balance, NULL::TEXT;
END;
$$;

-- Function: Add credits
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  UPDATE public.user_profiles SET credits_balance = credits_balance + p_amount, updated_at = NOW() WHERE id = p_user_id RETURNING credits_balance INTO v_new_balance;
  IF NOT FOUND THEN RAISE EXCEPTION 'User not found'; END IF;
  INSERT INTO public.credit_transactions (user_id, amount, balance_after, reason, reference_id) VALUES (p_user_id, p_amount, v_new_balance, p_reason, p_reference_id);
  RETURN v_new_balance;
END;
$$;
```

5. Click the "Run" button (or press Cmd+Enter / Ctrl+Enter)
6. Wait for "Success. No rows returned" message

### STEP 2: Create Storage Buckets

1. In the left sidebar, click "Storage"
2. Click "New bucket"
3. Create first bucket:
   - Name: `assets-public`
   - Toggle ON "Public bucket"
   - Click "Create bucket"
4. Click "New bucket" again
5. Create second bucket:
   - Name: `assets-private`
   - Keep "Public bucket" OFF
   - Click "Create bucket"

### STEP 3: Enable Google Authentication

1. In the left sidebar, click "Authentication"
2. Click "Providers" tab
3. Find "Google" in the list and click on it
4. Toggle "Enable Google provider" ON
5. Leave Client ID and Client Secret empty for now (user will fill in later)
6. Click "Save"

### STEP 4: Configure Auth URLs

1. Still in Authentication section, click "URL Configuration" tab
2. Note down the current "Site URL" setting
3. In "Redirect URLs", click "Add URL"
4. Add: `http://localhost:3000/auth/callback`
5. Click "Add URL" again
6. Add: `https://tasmim.vercel.app/auth/callback`
7. Click "Save"

### STEP 5: Get API Keys (Important - Tell Me These)

1. In the left sidebar, click "Project Settings" (gear icon at bottom)
2. Click "API" in the settings menu
3. Find and copy these values:
   - **Project URL** (looks like: https://xxxxx.supabase.co)
   - **anon public** key (starts with: eyJhbG...)
   - **service_role** key (starts with: eyJhbG...)

4. Tell me all three values so the user can add them to their deployment.

---

## IMPORTANT NOTES:
- Do NOT skip any steps
- Run the ENTIRE SQL script in one go
- Make sure RLS is enabled (the script does this)
- The storage buckets must be named exactly as specified
- Get ALL THREE API keys at the end

When complete, confirm:
✅ SQL migration ran successfully
✅ Storage buckets created (assets-public, assets-private)  
✅ Google auth enabled
✅ Redirect URLs configured
✅ API keys retrieved
