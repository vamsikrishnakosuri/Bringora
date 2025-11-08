-- Add preferred_contact_methods column to help_requests table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'help_requests' AND column_name = 'preferred_contact_methods') THEN
    ALTER TABLE help_requests ADD COLUMN preferred_contact_methods TEXT[] DEFAULT ARRAY['call', 'message', 'email']::TEXT[];
    RAISE NOTICE 'Column preferred_contact_methods added to help_requests table.';
  ELSE
    RAISE NOTICE 'Column preferred_contact_methods already exists in help_requests table.';
  END IF;
END $$;

-- Create counter_offers table for helper counter proposals
CREATE TABLE IF NOT EXISTS counter_offers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  help_request_id UUID REFERENCES help_requests(id) ON DELETE CASCADE NOT NULL,
  helper_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  proposed_amount DECIMAL(10, 2) NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(help_request_id, helper_id) -- One counter offer per helper per request
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_counter_offers_request ON counter_offers(help_request_id);
CREATE INDEX IF NOT EXISTS idx_counter_offers_helper ON counter_offers(helper_id);

-- Add email column to profiles if it doesn't exist (for email contact)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
    ALTER TABLE profiles ADD COLUMN email TEXT;
    RAISE NOTICE 'Column email added to profiles table.';
  ELSE
    RAISE NOTICE 'Column email already exists in profiles table.';
  END IF;
END $$;

