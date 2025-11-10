-- Simple fix for preferred_contact_methods column
-- Run this in Supabase SQL Editor if you get the schema cache error

ALTER TABLE help_requests 
ADD COLUMN IF NOT EXISTS preferred_contact_methods TEXT[] DEFAULT ARRAY['call', 'message', 'email']::TEXT[];

-- If the above doesn't work, try this:
-- ALTER TABLE help_requests DROP COLUMN IF EXISTS preferred_contact_methods;
-- ALTER TABLE help_requests ADD COLUMN preferred_contact_methods TEXT[] DEFAULT ARRAY['call', 'message', 'email']::TEXT[];


