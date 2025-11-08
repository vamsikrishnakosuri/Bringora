-- ============================================
-- CRITICAL: Run this in Supabase SQL Editor
-- ============================================
-- This adds the missing preferred_contact_methods column
-- Copy and paste this entire file into Supabase SQL Editor and run it

-- Step 1: Add preferred_contact_methods column
DO $$
BEGIN
  -- Check if column exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'help_requests' 
    AND column_name = 'preferred_contact_methods'
  ) THEN
    -- Add the column
    ALTER TABLE help_requests 
    ADD COLUMN preferred_contact_methods TEXT[] DEFAULT ARRAY['call', 'message', 'email']::TEXT[];
    
    RAISE NOTICE '✅ Column preferred_contact_methods added successfully!';
  ELSE
    RAISE NOTICE 'ℹ️ Column preferred_contact_methods already exists.';
  END IF;
END $$;

-- Step 2: Create counter_offers table if it doesn't exist
CREATE TABLE IF NOT EXISTS counter_offers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  help_request_id UUID REFERENCES help_requests(id) ON DELETE CASCADE NOT NULL,
  helper_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  proposed_amount DECIMAL(10, 2) NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(help_request_id, helper_id)
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_counter_offers_request ON counter_offers(help_request_id);
CREATE INDEX IF NOT EXISTS idx_counter_offers_helper ON counter_offers(helper_id);

-- Step 4: Verify the column was added
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'help_requests' 
AND column_name = 'preferred_contact_methods';

-- If you see a row returned above, the migration was successful! ✅

