-- Tasmim.ai Database Schema
-- AI-Powered Logo & Brand Asset Generation for MENA

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE plan_type AS ENUM ('free', 'starter', 'pro', 'one_time');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');
CREATE TYPE asset_type AS ENUM ('logo', 'icon', 'pattern', 'social_post', 'stationery', 'favicon', 'wordmark');
CREATE TYPE asset_status AS ENUM ('todo', 'in_progress', 'done', 'failed');
CREATE TYPE locale_type AS ENUM ('en', 'ar');

-- =============================================================================
-- TABLES
-- =============================================================================

-- User Profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    locale locale_type DEFAULT 'en',
    plan plan_type DEFAULT 'free',
    credits_balance INTEGER DEFAULT 0,
    trial_generations_used INTEGER DEFAULT 0,
    trial_generations_limit INTEGER DEFAULT 2,
    credits_reset_at TIMESTAMPTZ,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects (brand containers)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    brand_name TEXT NOT NULL,
    brand_name_ar TEXT,
    industry TEXT,
    keywords TEXT[] DEFAULT '{}',
    palette JSONB DEFAULT '{"primary": "#1a365d", "secondary": "#c6a962", "accent": "#e2e8f0"}',
    style JSONB DEFAULT '{"mood": "modern", "complexity": "minimal"}',
    target_audience TEXT,
    description TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets (generated items)
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    type asset_type NOT NULL,
    status asset_status DEFAULT 'todo',
    prompt TEXT,
    model TEXT,
    image_url TEXT,
    storage_path TEXT,
    thumbnail_url TEXT,
    metadata JSONB DEFAULT '{}',
    is_watermarked BOOLEAN DEFAULT TRUE,
    is_favorite BOOLEAN DEFAULT FALSE,
    version INTEGER DEFAULT 1,
    parent_asset_id UUID REFERENCES assets(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generations (AI call logs)
CREATE TABLE generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    request JSONB NOT NULL,
    response JSONB,
    provider TEXT DEFAULT 'mock',
    model TEXT,
    credits_used INTEGER DEFAULT 1,
    is_trial BOOLEAN DEFAULT FALSE,
    processing_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    plan plan_type NOT NULL,
    status subscription_status DEFAULT 'active',
    provider TEXT DEFAULT 'stripe',
    provider_subscription_id TEXT,
    provider_customer_id TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Designer Consultations (for Pro plan)
CREATE TABLE designer_consults (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    month_key TEXT NOT NULL, -- Format: YYYY-MM
    used BOOLEAN DEFAULT FALSE,
    iterations_used INTEGER DEFAULT 0,
    iterations_limit INTEGER DEFAULT 5,
    notes TEXT,
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit Transactions (audit trail)
CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- Positive for credits added, negative for used
    balance_after INTEGER NOT NULL,
    reason TEXT NOT NULL, -- 'subscription_renewal', 'generation', 'refund', 'bonus'
    reference_id UUID, -- Links to generation_id or subscription_id
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_assets_project_id ON assets(project_id);
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generations_created_at ON generations(created_at DESC);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE designer_consults ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Projects: Users can only access their own projects
CREATE POLICY "Users can view own projects"
    ON projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
    ON projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
    ON projects FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
    ON projects FOR DELETE
    USING (auth.uid() = user_id);

-- Assets: Users can only access their own assets
CREATE POLICY "Users can view own assets"
    ON assets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own assets"
    ON assets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets"
    ON assets FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets"
    ON assets FOR DELETE
    USING (auth.uid() = user_id);

-- Generations: Users can only access their own generations
CREATE POLICY "Users can view own generations"
    ON generations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own generations"
    ON generations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Subscriptions: Users can only view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Designer Consults: Users can only access their own consults
CREATE POLICY "Users can view own consults"
    ON designer_consults FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own consults"
    ON designer_consults FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consults"
    ON designer_consults FOR UPDATE
    USING (auth.uid() = user_id);

-- Credit Transactions: Users can only view their own transactions
CREATE POLICY "Users can view own transactions"
    ON credit_transactions FOR SELECT
    USING (auth.uid() = user_id);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to use credits atomically
CREATE OR REPLACE FUNCTION use_credits(
    p_user_id UUID,
    p_amount INTEGER,
    p_reason TEXT,
    p_reference_id UUID DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    new_balance INTEGER,
    error_message TEXT
) AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
    v_plan plan_type;
    v_trial_used INTEGER;
    v_trial_limit INTEGER;
BEGIN
    -- Lock the user row for update
    SELECT credits_balance, plan, trial_generations_used, trial_generations_limit
    INTO v_current_balance, v_plan, v_trial_used, v_trial_limit
    FROM user_profiles
    WHERE id = p_user_id
    FOR UPDATE;

    -- Check if user exists
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 0, 'User not found'::TEXT;
        RETURN;
    END IF;

    -- For free users, check trial generations
    IF v_plan = 'free' THEN
        IF v_trial_used >= v_trial_limit THEN
            RETURN QUERY SELECT FALSE, v_current_balance, 'Trial generations exhausted'::TEXT;
            RETURN;
        END IF;
        
        -- Use trial generation
        UPDATE user_profiles
        SET trial_generations_used = trial_generations_used + 1,
            updated_at = NOW()
        WHERE id = p_user_id;
        
        RETURN QUERY SELECT TRUE, v_current_balance, NULL::TEXT;
        RETURN;
    END IF;

    -- For paid users, check credits
    IF v_current_balance < p_amount THEN
        RETURN QUERY SELECT FALSE, v_current_balance, 'Insufficient credits'::TEXT;
        RETURN;
    END IF;

    -- Deduct credits
    v_new_balance := v_current_balance - p_amount;
    
    UPDATE user_profiles
    SET credits_balance = v_new_balance,
        updated_at = NOW()
    WHERE id = p_user_id;

    -- Log transaction
    INSERT INTO credit_transactions (user_id, amount, balance_after, reason, reference_id)
    VALUES (p_user_id, -p_amount, v_new_balance, p_reason, p_reference_id);

    RETURN QUERY SELECT TRUE, v_new_balance, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits
CREATE OR REPLACE FUNCTION add_credits(
    p_user_id UUID,
    p_amount INTEGER,
    p_reason TEXT,
    p_reference_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_new_balance INTEGER;
BEGIN
    UPDATE user_profiles
    SET credits_balance = credits_balance + p_amount,
        credits_reset_at = CASE 
            WHEN p_reason = 'subscription_renewal' THEN NOW() + INTERVAL '1 month'
            ELSE credits_reset_at
        END,
        updated_at = NOW()
    WHERE id = p_user_id
    RETURNING credits_balance INTO v_new_balance;

    INSERT INTO credit_transactions (user_id, amount, balance_after, reason, reference_id)
    VALUES (p_user_id, p_amount, v_new_balance, p_reason, p_reference_id);

    RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_assets_updated_at
    BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- STORAGE BUCKETS (run via Supabase Dashboard or separate migration)
-- =============================================================================

-- Note: Storage buckets need to be created via Supabase Dashboard or API
-- Bucket: assets-public (public, for watermarked previews)
-- Bucket: assets-private (private, for paid downloads with signed URLs)
