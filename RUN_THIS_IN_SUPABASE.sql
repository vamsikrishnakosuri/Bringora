-- ============================================
-- IMPORTANT: Run this entire script in Supabase SQL Editor
-- This will add all missing columns to help_requests table
-- ============================================

-- Add all missing columns to help_requests table
DO $$ 
BEGIN
  -- Add requester_name if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'help_requests' 
    AND column_name = 'requester_name'
  ) THEN
    ALTER TABLE help_requests ADD COLUMN requester_name TEXT;
    RAISE NOTICE 'Column requester_name added successfully';
  END IF;
  
  -- Add date_needed if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'help_requests' 
    AND column_name = 'date_needed'
  ) THEN
    ALTER TABLE help_requests ADD COLUMN date_needed DATE;
    RAISE NOTICE 'Column date_needed added successfully';
  END IF;
  
  -- Add time_needed if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'help_requests' 
    AND column_name = 'time_needed'
  ) THEN
    ALTER TABLE help_requests ADD COLUMN time_needed TIME;
    RAISE NOTICE 'Column time_needed added successfully';
  END IF;
  
  -- Add duration if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'help_requests' 
    AND column_name = 'duration'
  ) THEN
    ALTER TABLE help_requests ADD COLUMN duration TEXT;
    RAISE NOTICE 'Column duration added successfully';
  END IF;
  
  -- Add payment_type if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'help_requests' 
    AND column_name = 'payment_type'
  ) THEN
    ALTER TABLE help_requests ADD COLUMN payment_type TEXT;
    -- Add check constraint
    ALTER TABLE help_requests ADD CONSTRAINT help_requests_payment_type_check 
      CHECK (payment_type IS NULL OR payment_type IN ('fixed', 'range'));
    RAISE NOTICE 'Column payment_type added successfully';
  END IF;
  
  -- Add fixed_amount if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'help_requests' 
    AND column_name = 'fixed_amount'
  ) THEN
    ALTER TABLE help_requests ADD COLUMN fixed_amount DECIMAL(10, 2);
    RAISE NOTICE 'Column fixed_amount added successfully';
  END IF;
  
  -- Add min_amount if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'help_requests' 
    AND column_name = 'min_amount'
  ) THEN
    ALTER TABLE help_requests ADD COLUMN min_amount DECIMAL(10, 2);
    RAISE NOTICE 'Column min_amount added successfully';
  END IF;
  
  -- Add max_amount if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'help_requests' 
    AND column_name = 'max_amount'
  ) THEN
    ALTER TABLE help_requests ADD COLUMN max_amount DECIMAL(10, 2);
    RAISE NOTICE 'Column max_amount added successfully';
  END IF;
  
  -- Add preference_shop if it doesn't exist (THIS IS THE ONE CAUSING THE ERROR)
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'help_requests' 
    AND column_name = 'preference_shop'
  ) THEN
    ALTER TABLE help_requests ADD COLUMN preference_shop TEXT;
    RAISE NOTICE 'Column preference_shop added successfully';
  END IF;
  
  -- Add additional_info if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'help_requests' 
    AND column_name = 'additional_info'
  ) THEN
    ALTER TABLE help_requests ADD COLUMN additional_info TEXT;
    RAISE NOTICE 'Column additional_info added successfully';
  END IF;
  
  RAISE NOTICE 'Migration completed successfully!';
END $$;

-- Refresh the schema cache (this helps Supabase recognize the new columns)
NOTIFY pgrst, 'reload schema';

