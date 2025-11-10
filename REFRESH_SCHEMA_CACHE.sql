-- Refresh Supabase Schema Cache
-- Run this if you still see "schema cache" errors after adding the column

-- This forces Supabase to refresh its schema cache
NOTIFY pgrst, 'reload schema';

-- Alternative: You can also try this
-- SELECT pg_notify('pgrst', 'reload schema');

-- Note: Sometimes it takes 10-30 seconds for the cache to refresh
-- If errors persist, try:
-- 1. Wait 30 seconds and refresh your app
-- 2. Clear your browser cache
-- 3. Restart your Supabase project (if you have access)


