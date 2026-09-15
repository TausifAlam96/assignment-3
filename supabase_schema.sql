-- ==========================================================
-- DIGITAL HEROES - POSTGRESQL / SUPABASE DATABASE SCHEMA
-- Compliant with Digital Heroes PRD (Level 1) Edition 2026
-- ==========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CHARITIES TABLE
CREATE TABLE IF NOT EXISTS public.charities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    mission TEXT NOT NULL,
    impact_statement TEXT,
    image_url TEXT NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    total_raised NUMERIC(12, 2) DEFAULT 0.00,
    upcoming_events JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('user', 'admin')) DEFAULT 'user',
    selected_charity_id UUID REFERENCES public.charities(id) ON DELETE SET NULL,
    charity_percentage NUMERIC(5, 2) NOT NULL DEFAULT 10.00 CHECK (charity_percentage >= 10.00 AND charity_percentage <= 100.00),
    handicap NUMERIC(4, 1),
    home_club TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan TEXT NOT NULL CHECK (plan IN ('monthly', 'yearly')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due')) DEFAULT 'inactive',
    amount_cents INTEGER NOT NULL DEFAULT 2500,
    charity_percentage NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    renewal_date TIMESTAMP WITH TIME ZONE NOT NULL,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. GOLF SCORES TABLE (Stableford: 1 - 45, max 5 rolling per user, 1 per date)
CREATE TABLE IF NOT EXISTS public.scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
    score_date DATE NOT NULL,
    course_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_score_date UNIQUE (user_id, score_date)
);

-- 6. TRIGGER FUNCTION: Automatically retain only the latest 5 scores per user
CREATE OR REPLACE FUNCTION public.enforce_rolling_five_scores()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.scores
    WHERE id IN (
        SELECT id FROM (
            SELECT id,
                   ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY score_date DESC, created_at DESC) as rnum
            FROM public.scores
            WHERE user_id = NEW.user_id
        ) ranked
        WHERE ranked.rnum > 5
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_rolling_five_scores ON public.scores;
CREATE TRIGGER trigger_rolling_five_scores
    AFTER INSERT OR UPDATE ON public.scores
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_rolling_five_scores();

-- 7. DRAWS TABLE
CREATE TABLE IF NOT EXISTS public.draws (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    draw_date DATE NOT NULL,
    draw_type TEXT NOT NULL CHECK (draw_type IN ('random', 'algorithmic')),
    winning_numbers INTEGER[] NOT NULL CHECK (cardinality(winning_numbers) = 5),
    status TEXT NOT NULL CHECK (status IN ('draft', 'simulated', 'published', 'completed')) DEFAULT 'draft',
    total_prize_pool NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    jackpot_rollover NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    new_jackpot_rollover NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    subscribers_count INTEGER NOT NULL DEFAULT 0,
    tier_5_pool NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tier_4_pool NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tier_3_pool NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    simulated_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. DRAW RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.draw_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_scores INTEGER[] NOT NULL,
    match_type INTEGER NOT NULL CHECK (match_type IN (5, 4, 3, 0)),
    matched_numbers INTEGER[] NOT NULL,
    prize_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. WINNERS TABLE (Winner verification & payout tracking)
CREATE TABLE IF NOT EXISTS public.winners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
    draw_title TEXT NOT NULL,
    draw_date DATE NOT NULL,
    match_type INTEGER NOT NULL CHECK (match_type IN (5, 4, 3)),
    prize_amount NUMERIC(12, 2) NOT NULL,
    matched_numbers INTEGER[] NOT NULL,
    user_scores INTEGER[] NOT NULL,
    proof_url TEXT,
    proof_notes TEXT,
    verification_status TEXT NOT NULL CHECK (verification_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'paid')) DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE
);

-- 10. CHARITY DONATIONS RECORD
CREATE TABLE IF NOT EXISTS public.charity_donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    charity_id UUID NOT NULL REFERENCES public.charities(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    donation_type TEXT NOT NULL CHECK (donation_type IN ('subscription_cut', 'direct_donation')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. PLATFORM SETTINGS
CREATE TABLE IF NOT EXISTS public.settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    prize_pool_percentage NUMERIC(5, 2) NOT NULL DEFAULT 20.00,
    charity_min_percentage NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
    monthly_price NUMERIC(10, 2) NOT NULL DEFAULT 25.00,
    yearly_price NUMERIC(10, 2) NOT NULL DEFAULT 240.00,
    current_jackpot_rollover NUMERIC(12, 2) NOT NULL DEFAULT 4500.00,
    currency_symbol TEXT NOT NULL DEFAULT '₹',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charity_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'admin'
        FROM public.profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: User can view and update own profile; Admin can view all
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Scores: Users can manage only their own 5 scores; Admin can view all
CREATE POLICY "Users can view own scores" ON public.scores
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own scores" ON public.scores
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scores" ON public.scores
    FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete own scores" ON public.scores
    FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- Charities: Public read access; Admin write access
CREATE POLICY "Charities are viewable by everyone" ON public.charities
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify charities" ON public.charities
    FOR ALL USING (public.is_admin());

-- Draws: Published draws viewable by all; Admin manages all
CREATE POLICY "Anyone can view published draws" ON public.draws
    FOR SELECT USING (status = 'published' OR status = 'completed' OR public.is_admin());

CREATE POLICY "Only admins can manage draws" ON public.draws
    FOR ALL USING (public.is_admin());

-- Winners: User can view their own winning record and upload proof; Admin manages all
CREATE POLICY "Winners can view own winning records" ON public.winners
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Winners can update own proof" ON public.winners
    FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins manage all winners" ON public.winners
    FOR ALL USING (public.is_admin());
