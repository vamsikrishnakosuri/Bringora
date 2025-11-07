-- Migration: Add preference_shop column to help_requests table
-- Run this in your Supabase SQL Editor if the column doesn't exist

DO $$ 
BEGIN
  -- Add preference_shop if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'help_requests' 
    AND column_name = 'preference_shop'
  ) THEN
    ALTER TABLE help_requests ADD COLUMN preference_shop TEXT;
    RAISE NOTICE 'Column preference_shop added successfully';
  ELSE
    RAISE NOTICE 'Column preference_shop already exists';
  END IF;
END $$;

