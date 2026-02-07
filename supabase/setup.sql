-- =====================================================
-- TASMIM.AI - Complete Database Setup
-- =====================================================
-- Run this entire script in Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABLES
-- =====================================================

-- User profiles (extends auth.users)
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

-- Projects (brand identities)
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

-- Assets (generated images)
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

-- Generation logs (audit trail)
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

-- Subscriptions
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

-- Designer consultations (Pro plan)
CREATE TABLE IF NOT EXISTS public.designer_consults (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  month_key TEXT NOT NULL, -- Format: YYYY-MM
  used BOOLEAN DEFAULT FALSE,
  iterations_used INTEGER DEFAULT 0,
  iterations_limit INTEGER DEFAULT 5,
  notes TEXT,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month_key)
);

-- Credit transactions (audit)
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Positive = add, Negative = deduct
  balance_after INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON public.projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_assets_project_id ON public.assets(project_id);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON public.assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(status);
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON public.generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designer_consults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Assets policies
CREATE POLICY "Users can view own assets" ON public.assets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create assets" ON public.assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets" ON public.assets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets" ON public.assets
  FOR DELETE USING (auth.uid() = user_id);

-- Generations policies
CREATE POLICY "Users can view own generations" ON public.generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create generations" ON public.generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Designer consults policies
CREATE POLICY "Users can view own consults" ON public.designer_consults
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own consults" ON public.designer_consults
  FOR UPDATE USING (auth.uid() = user_id);

-- Credit transactions policies
CREATE POLICY "Users can view own transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- 4. FUNCTIONS
-- =====================================================

-- Function to use credits (atomic operation)
CREATE OR REPLACE FUNCTION public.use_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  new_balance INTEGER,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile public.user_profiles%ROWTYPE;
  v_new_balance INTEGER;
BEGIN
  -- Lock the user row to prevent race conditions
  SELECT * INTO v_profile
  FROM public.user_profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 'User not found'::TEXT;
    RETURN;
  END IF;

  -- Handle free users (trial generations)
  IF v_profile.plan = 'free' THEN
    IF v_profile.trial_generations_used >= v_profile.trial_generations_limit THEN
      RETURN QUERY SELECT FALSE, 0, 'No free trials remaining'::TEXT;
      RETURN;
    END IF;

    -- Increment trial usage
    UPDATE public.user_profiles
    SET trial_generations_used = trial_generations_used + 1,
        updated_at = NOW()
    WHERE id = p_user_id;

    v_new_balance := v_profile.trial_generations_limit - v_profile.trial_generations_used - 1;

    -- Log transaction
    INSERT INTO public.credit_transactions (user_id, amount, balance_after, reason, reference_id)
    VALUES (p_user_id, -1, v_new_balance, p_reason || ' (trial)', p_reference_id);

    RETURN QUERY SELECT TRUE, v_new_balance, NULL::TEXT;
    RETURN;
  END IF;

  -- Handle paid users (credits)
  IF v_profile.credits_balance < p_amount THEN
    RETURN QUERY SELECT FALSE, v_profile.credits_balance, 'Insufficient credits'::TEXT;
    RETURN;
  END IF;

  v_new_balance := v_profile.credits_balance - p_amount;

  -- Deduct credits
  UPDATE public.user_profiles
  SET credits_balance = v_new_balance,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Log transaction
  INSERT INTO public.credit_transactions (user_id, amount, balance_after, reason, reference_id)
  VALUES (p_user_id, -p_amount, v_new_balance, p_reason, p_reference_id);

  RETURN QUERY SELECT TRUE, v_new_balance, NULL::TEXT;
END;
$$;

-- Function to add credits
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  UPDATE public.user_profiles
  SET credits_balance = credits_balance + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id
  RETURNING credits_balance INTO v_new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Log transaction
  INSERT INTO public.credit_transactions (user_id, amount, balance_after, reason, reference_id)
  VALUES (p_user_id, p_amount, v_new_balance, p_reason, p_reference_id);

  RETURN v_new_balance;
END;
$$;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =====================================================
-- 5. TRIGGERS
-- =====================================================

-- Create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamps
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_assets_updated_at ON public.assets;
CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- 6. STORAGE BUCKETS
-- =====================================================
-- Note: Run these separately in SQL Editor if they fail

INSERT INTO storage.buckets (id, name, public)
VALUES ('assets-public', 'assets-public', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('assets-private', 'assets-private', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for assets-public
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'assets-public');

CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'assets-public' 
    AND auth.role() = 'authenticated'
  );

-- Storage policies for assets-private
CREATE POLICY "Users can access own private files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'assets-private' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload own private files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'assets-private' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================================================
-- DONE! Your database is ready.
-- =====================================================
