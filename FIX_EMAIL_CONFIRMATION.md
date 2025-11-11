# Fix Email Confirmation 404 Error

## Problem
When users click the email confirmation link, they get a 404 error, but they can still log in.

## Solution

### Step 1: Update Supabase Redirect URLs

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Go to Authentication → URL Configuration**
   - Find "Redirect URLs" section

3. **Add These URLs** (replace with your actual domain):
   ```
   https://your-app.vercel.app/auth/callback
   https://your-app.vercel.app/**
   http://localhost:5173/auth/callback (for local development)
   ```

4. **Set Site URL**:
   ```
   https://your-app.vercel.app
   ```

5. **Click "Save"**

### Step 2: Verify Code

The code already uses the correct redirect URL:
- `emailRedirectTo: ${window.location.origin}/auth/callback`

The issue is that Supabase needs to know this URL is allowed.

### Step 3: Test

1. Sign up with a new email
2. Check email for confirmation link
3. Click the link
4. Should redirect to `/auth/callback` and then to homepage

---

**After updating Supabase settings, the 404 error should be fixed!**



