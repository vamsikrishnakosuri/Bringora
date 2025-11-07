-- ============================================
-- URGENT: Run this in Supabase SQL Editor NOW
-- This will add ALL missing columns to help_requests table
-- ============================================

-- First, let's check what columns exist (for debugging)
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'help_requests' 
-- ORDER BY ordinal_position;

-- Add ALL missing columns in one go
DO $$ 
BEGIN
  -- Add requester_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'help_requests' AND column_name = 'requester_name'
  ) THEN
    ALTER TABLE help_requests ADD COLUMN requester_name TEXT;
    RAISE NOTICE '✓ Added requester_name';
  END IF;
  
  -- Add date_needed
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'help_requests' AND column_name = 'date_needed'
  ) THEN
    ALTER TABLE help_requests ADD COLUMN date_needed DATE;
    RAISE NOTICE '✓ Added date_needed';
  END IF;
  
  -- Add time_needed
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'help_requests' AND column_name = 'time_needed'
  ) THEN
    ALTER TABLE help_requests ADD COLUMN time_needed TIME;
    RAISE NOTICE '✓ Added time_needed';
  END IF;
  
  -- Add duration
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'help_requests' AND column_name = 'duration'
  ) THEN
    ALTER TABLE help_requests ADD COLUMN duration TEXT;
    RAISE NOTICE '✓ Added duration';
  END IF;
  
  -- Add payment_type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'help_requests' AND column_name = 'payment_type'
  ) THEN
    ALTER TABLE help_requests ADD COLUMN payment_type TEXT;
    RAISE NOTICE '✓ Added payment_type';
  END IF;
  
  -- Add fixed_amount
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'help_requests' AND column_name = 'fixed_amount'
  ) THEN
    ALTER TABLE help_requests ADD COLUMN fixed_amount DECIMAL(10, 2);
    RAISE NOTICE '✓ Added fixed_amount';
  END IF;
  
  -- Add min_amount
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'help_requests' AND column_name = 'min_amount'
  ) THEN
    ALTER TABLE help_requests ADD COLUMN min_amount DECIMAL(10, 2);
    RAISE NOTICE '✓ Added min_amount';
  END IF;
  
  -- Add max_amount
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'help_requests' AND column_name = 'max_amount'
  ) THEN
    ALTER TABLE help_requests ADD COLUMN max_amount DECIMAL(10, 2);
    RAISE NOTICE '✓ Added max_amount';
  END IF;
  
  -- Add preference_shop (THIS IS THE ONE CAUSING YOUR ERROR!)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'help_requests' AND column_name = 'preference_shop'
  ) THEN
    ALTER TABLE help_requests ADD COLUMN preference_shop TEXT;
    RAISE NOTICE '✓ Added preference_shop - THIS FIXES YOUR ERROR!';
  END IF;
  
  -- Add additional_info
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'help_requests' AND column_name = 'additional_info'
  ) THEN
    ALTER TABLE help_requests ADD COLUMN additional_info TEXT;
    RAISE NOTICE '✓ Added additional_info';
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ ALL COLUMNS ADDED SUCCESSFULLY!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Please wait 30-60 seconds for Supabase to refresh the schema cache.';
  RAISE NOTICE 'Then try submitting your form again.';
END $$;

-- Verify the columns were added
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'help_requests'
ORDER BY ordinal_position;

