-- ============================================
-- IMPORTANT: Run this in Supabase SQL Editor
-- This adds location fields and profile_completed flag to profiles table
-- ============================================

-- Add location fields to profiles table
DO $$ 
BEGIN
  -- Add location field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'location'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location TEXT;
    RAISE NOTICE '✓ Added location column';
  END IF;
  
  -- Add latitude field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE profiles ADD COLUMN latitude DECIMAL(10, 8);
    RAISE NOTICE '✓ Added latitude column';
  END IF;
  
  -- Add longitude field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE profiles ADD COLUMN longitude DECIMAL(11, 8);
    RAISE NOTICE '✓ Added longitude column';
  END IF;
  
  -- Add profile_completed flag
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'profile_completed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN profile_completed BOOLEAN DEFAULT FALSE;
    RAISE NOTICE '✓ Added profile_completed column';
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ ALL COLUMNS ADDED SUCCESSFULLY!';
  RAISE NOTICE '========================================';
END $$;

-- Verify the columns were added
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

