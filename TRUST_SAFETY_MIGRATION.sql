-- Trust & Safety System Database Migration
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. RATINGS & REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rater_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rated_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  help_request_id UUID REFERENCES help_requests(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(rater_id, rated_user_id, help_request_id) -- One rating per user per request
);

-- ============================================
-- 2. TRUST SCORES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS trust_scores (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 50 CHECK (score >= 0 AND score <= 100),
  factors JSONB DEFAULT '{}'::jsonb, -- {ratings: 4.5, tasks: 20, response_time: 120, reports: 0}
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. SAFETY CHECK-INS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS safety_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  help_request_id UUID REFERENCES help_requests(id) ON DELETE CASCADE,
  checkin_type TEXT NOT NULL CHECK (checkin_type IN ('before', 'during', 'after')),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. COMMUNITY ENDORSEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS endorsements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endorser_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endorsed_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship TEXT CHECK (relationship IN ('friend', 'colleague', 'neighbor', 'family', 'other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(endorser_id, endorsed_user_id) -- One endorsement per user pair
);

-- ============================================
-- 5. REFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_references (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reference_name TEXT NOT NULL,
  reference_phone TEXT,
  reference_email TEXT,
  relationship TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. PHONE VERIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS phone_verifications (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_method TEXT CHECK (verification_method IN ('sms', 'call')),
  otp_code TEXT, -- Temporary, should be hashed in production
  otp_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. UPDATE PROFILES TABLE
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 50;

-- ============================================
-- 8. UPDATE HELPERS TABLE
-- ============================================
ALTER TABLE helpers ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3, 2) DEFAULT 0;
ALTER TABLE helpers ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;
ALTER TABLE helpers ADD COLUMN IF NOT EXISTS response_time_avg INTEGER DEFAULT 0; -- seconds
ALTER TABLE helpers ADD COLUMN IF NOT EXISTS completed_tasks INTEGER DEFAULT 0;
ALTER TABLE helpers ADD COLUMN IF NOT EXISTS cancelled_tasks INTEGER DEFAULT 0;
ALTER TABLE helpers ADD COLUMN IF NOT EXISTS success_rate DECIMAL(5, 2) DEFAULT 100.00; -- percentage

-- ============================================
-- 9. UPDATE HELP_REQUESTS TABLE
-- ============================================
ALTER TABLE help_requests ADD COLUMN IF NOT EXISTS meeting_location_suggestion TEXT;
ALTER TABLE help_requests ADD COLUMN IF NOT EXISTS safety_checkin_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE help_requests ADD COLUMN IF NOT EXISTS rated BOOLEAN DEFAULT FALSE;

-- ============================================
-- 10. UPDATE HELPER_APPLICATIONS TABLE
-- ============================================
-- Make ID verification optional
ALTER TABLE helper_applications ADD COLUMN IF NOT EXISTS id_verification_optional BOOLEAN DEFAULT TRUE;
ALTER TABLE helper_applications ADD COLUMN IF NOT EXISTS verification_method TEXT CHECK (verification_method IN ('government_id', 'phone', 'email', 'community', 'none'));

-- ============================================
-- 11. ROW LEVEL SECURITY POLICIES
-- ============================================

-- Ratings policies
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ratings for any user"
  ON ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can create ratings for completed tasks"
  ON ratings FOR INSERT
  WITH CHECK (auth.uid() = rater_id);

CREATE POLICY "Users can update their own ratings"
  ON ratings FOR UPDATE
  USING (auth.uid() = rater_id);

-- Trust scores policies
ALTER TABLE trust_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view trust scores"
  ON trust_scores FOR SELECT
  USING (true);

CREATE POLICY "System can update trust scores"
  ON trust_scores FOR UPDATE
  USING (true); -- In production, use service role

-- Safety checkins policies
ALTER TABLE safety_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own checkins"
  ON safety_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own checkins"
  ON safety_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Endorsements policies
ALTER TABLE endorsements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view endorsements"
  ON endorsements FOR SELECT
  USING (true);

CREATE POLICY "Users can create endorsements"
  ON endorsements FOR INSERT
  WITH CHECK (auth.uid() = endorser_id AND auth.uid() != endorsed_user_id);

-- References policies
ALTER TABLE user_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own references"
  ON user_references FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own references"
  ON user_references FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Phone verifications policies
ALTER TABLE phone_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own phone verification"
  ON phone_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own phone verification"
  ON phone_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own phone verification"
  ON phone_verifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 12. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to calculate trust score
CREATE OR REPLACE FUNCTION calculate_trust_score(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER := 50; -- Base score
  v_rating_avg DECIMAL;
  v_task_count INTEGER;
  v_response_time INTEGER;
  v_report_count INTEGER;
  v_endorsement_count INTEGER;
BEGIN
  -- Get average rating (0-5 scale, convert to 0-30 points)
  SELECT COALESCE(AVG(rating), 0) INTO v_rating_avg
  FROM ratings
  WHERE rated_user_id = p_user_id;
  
  v_score := v_score + (v_rating_avg * 6); -- Max 30 points from ratings
  
  -- Get task count (max 20 points for 50+ tasks)
  SELECT COALESCE(completed_tasks, 0) INTO v_task_count
  FROM helpers
  WHERE user_id = p_user_id;
  
  IF v_task_count >= 50 THEN
    v_score := v_score + 20;
  ELSIF v_task_count >= 20 THEN
    v_score := v_score + 15;
  ELSIF v_task_count >= 10 THEN
    v_score := v_score + 10;
  ELSIF v_task_count >= 5 THEN
    v_score := v_score + 5;
  END IF;
  
  -- Get response time (max 10 points for < 5 min)
  SELECT COALESCE(response_time_avg, 0) INTO v_response_time
  FROM helpers
  WHERE user_id = p_user_id;
  
  IF v_response_time > 0 AND v_response_time < 300 THEN -- < 5 minutes
    v_score := v_score + 10;
  ELSIF v_response_time < 600 THEN -- < 10 minutes
    v_score := v_score + 5;
  END IF;
  
  -- Get endorsement count (max 10 points for 5+ endorsements)
  SELECT COUNT(*) INTO v_endorsement_count
  FROM endorsements
  WHERE endorsed_user_id = p_user_id;
  
  IF v_endorsement_count >= 5 THEN
    v_score := v_score + 10;
  ELSIF v_endorsement_count >= 3 THEN
    v_score := v_score + 5;
  END IF;
  
  -- Get report count (subtract points)
  SELECT COUNT(*) INTO v_report_count
  FROM reports
  WHERE reported_user_id = p_user_id AND status = 'confirmed';
  
  v_score := v_score - (v_report_count * 10); -- -10 per confirmed report
  
  -- Ensure score is between 0 and 100
  v_score := GREATEST(0, LEAST(100, v_score));
  
  RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- Function to update helper stats when rating is added
CREATE OR REPLACE FUNCTION update_helper_stats_on_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update average rating and total ratings
  UPDATE helpers
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM ratings
      WHERE rated_user_id = NEW.rated_user_id
    ),
    total_ratings = (
      SELECT COUNT(*)
      FROM ratings
      WHERE rated_user_id = NEW.rated_user_id
    )
  WHERE user_id = NEW.rated_user_id;
  
  -- Update trust score
  UPDATE trust_scores
  SET 
    score = calculate_trust_score(NEW.rated_user_id),
    updated_at = NOW()
  WHERE user_id = NEW.rated_user_id;
  
  -- If trust_scores row doesn't exist, create it
  INSERT INTO trust_scores (user_id, score, updated_at)
  SELECT NEW.rated_user_id, calculate_trust_score(NEW.rated_user_id), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM trust_scores WHERE user_id = NEW.rated_user_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats when rating is added/updated
CREATE TRIGGER update_helper_stats_on_rating
  AFTER INSERT OR UPDATE ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_helper_stats_on_rating();

-- Function to update trust score in profiles
CREATE OR REPLACE FUNCTION sync_trust_score_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET trust_score = NEW.score
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync trust score to profiles
CREATE TRIGGER sync_trust_score_to_profile
  AFTER INSERT OR UPDATE ON trust_scores
  FOR EACH ROW
  EXECUTE FUNCTION sync_trust_score_to_profile();

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_ratings_updated_at
  BEFORE UPDATE ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 13. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_ratings_rated_user_id ON ratings(rated_user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rater_id ON ratings(rater_id);
CREATE INDEX IF NOT EXISTS idx_ratings_help_request_id ON ratings(help_request_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_endorsed_user_id ON endorsements(endorsed_user_id);
CREATE INDEX IF NOT EXISTS idx_safety_checkins_user_id ON safety_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_checkins_help_request_id ON safety_checkins(help_request_id);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone ON phone_verifications(phone);

-- ============================================
-- 14. INITIALIZE TRUST SCORES FOR EXISTING USERS
-- ============================================
INSERT INTO trust_scores (user_id, score)
SELECT id, 50
FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM trust_scores WHERE user_id = auth.users.id);

-- Update profiles with initial trust scores
UPDATE profiles
SET trust_score = 50
WHERE trust_score IS NULL;

COMMENT ON TABLE ratings IS 'User ratings and reviews for completed tasks';
COMMENT ON TABLE trust_scores IS 'Calculated trust scores for all users';
COMMENT ON TABLE safety_checkins IS 'Safety check-in records for meetings';
COMMENT ON TABLE endorsements IS 'Community endorsements between users';
COMMENT ON TABLE user_references IS 'User-provided references';
COMMENT ON TABLE phone_verifications IS 'Phone number verification records';

