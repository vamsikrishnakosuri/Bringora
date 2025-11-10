# Fix Google OAuth Redirect Error

## Problem
When clicking "Sign in with Google", you get `ERR_CONNECTION_REFUSED` because the redirect URL is pointing to localhost instead of your Vercel domain.

## Solution

### Step 1: Update Supabase Redirect URLs

1. **Go to Supabase Dashboard**
2. **Authentication** → **URL Configuration**
3. **In "Redirect URLs", add:**
   - `https://your-vercel-app.vercel.app/auth/callback`
   - `https://your-vercel-app.vercel.app/**`
   - `https://your-custom-domain.com/auth/callback` (if you have custom domain)
   - `https://your-custom-domain.com/**`
   - Keep `http://localhost:5173/**` for local development
4. **Update "Site URL"** to your Vercel URL: `https://your-vercel-app.vercel.app`
5. **Save**

### Step 2: Update Google OAuth Settings

1. **Go to Google Cloud Console** → **APIs & Services** → **Credentials**
2. **Click on your OAuth 2.0 Client ID**
3. **In "Authorized redirect URIs", add:**
   - `https://your-project-id.supabase.co/auth/v1/callback`
   - `https://your-vercel-app.vercel.app/auth/callback` (if you want direct redirect)
   - Keep existing ones
4. **Save**

### Step 3: Verify the Code

The code is already updated to use `window.location.origin` dynamically, so it will automatically use:
- `http://localhost:5173` when running locally
- `https://your-vercel-app.vercel.app` when deployed

### Step 4: Test

1. **Clear your browser cache** (or use incognito mode)
2. **Visit your Vercel URL**
3. **Click "Sign in with Google"**
4. **It should redirect correctly now!**

## Common Issues

### Still redirecting to localhost?
- Clear browser cache
- Check Supabase redirect URLs include your Vercel domain
- Make sure you're accessing the app via the Vercel URL, not localhost

### "Redirect URI mismatch" error?
- Verify the redirect URI in Google Console matches exactly what Supabase uses
- The format should be: `https://your-project-id.supabase.co/auth/v1/callback`
- Check for typos or extra spaces

### OAuth works but user not signed in?
- Check Supabase dashboard → Authentication → Users
- Verify the user was created
- Check browser console for errors

## Quick Checklist

- [ ] Supabase redirect URLs updated with Vercel domain
- [ ] Supabase Site URL updated to Vercel domain
- [ ] Google OAuth redirect URI includes Supabase callback URL
- [ ] Code uses `window.location.origin` (already done)
- [ ] Tested on Vercel deployment (not localhost)
- [ ] Cleared browser cache

---

**The code fix has been pushed. Just update Supabase and Google settings!**


