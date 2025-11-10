# How to Enable Google OAuth in Supabase

Follow these steps to enable Google sign-in for your Bringora app:

## Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit [https://console.cloud.google.com](https://console.cloud.google.com)
   - Sign in with your Google account

2. **Create a New Project (or select existing)**
   - Click the project dropdown at the top
   - Click "New Project"
   - Name it "Bringora" (or any name you prefer)
   - Click "Create"

3. **Enable Google+ API**
   - Go to **APIs & Services > Library**
   - Search for "Google+ API" or "People API"
   - Click on it and click "Enable"

4. **Create OAuth Credentials**
   - Go to **APIs & Services > Credentials**
   - Click **"+ CREATE CREDENTIALS"**
   - Select **"OAuth client ID"**
   - If prompted, configure the OAuth consent screen first:
     - User Type: **External** (unless you have a Google Workspace)
     - App name: **Bringora**
     - User support email: Your email
     - Developer contact: Your email
     - Click "Save and Continue"
     - Scopes: Click "Save and Continue" (default is fine)
     - Test users: Add your email, click "Save and Continue"
     - Click "Back to Dashboard"

5. **Create OAuth Client ID**
   - Application type: **Web application**
   - Name: **Bringora Web Client**
   - **Authorized JavaScript origins:**
     - Add: `http://localhost:5173` (for development)
     - Add: `https://your-project-id.supabase.co` (your Supabase project URL)
   - **Authorized redirect URIs:**
     - Add: `https://your-project-id.supabase.co/auth/v1/callback`
     - Replace `your-project-id` with your actual Supabase project ID
   - Click **"Create"**
   - **Copy the Client ID and Client Secret** (you'll need these next)

## Step 2: Configure in Supabase

1. **Go to Supabase Dashboard**
   - Open your project
   - Go to **Authentication > Providers**

2. **Enable Google Provider**
   - Find **Google** in the list
   - Toggle it **ON**

3. **Add Credentials**
   - **Client ID (for OAuth):** Paste your Google Client ID
   - **Client Secret (for OAuth):** Paste your Google Client Secret
   - Click **"Save"**

## Step 3: Test It

1. Go back to your app
2. Click "Sign in with Google"
3. You should be redirected to Google to sign in
4. After signing in, you'll be redirected back to your app

## Troubleshooting

### "Provider is not enabled" error
- Make sure Google is toggled ON in Supabase
- Refresh the page after enabling

### Redirect URI mismatch
- Make sure the redirect URI in Google Console matches exactly:
  - `https://your-project-id.supabase.co/auth/v1/callback`
- Check for typos or extra spaces

### "Access blocked" error
- If you're using a test Google account, make sure it's added to "Test users" in OAuth consent screen
- Or publish your app (for production use)

## Quick Checklist

- [ ] Google Cloud project created
- [ ] Google+ API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth client ID created
- [ ] Authorized redirect URI added: `https://your-project-id.supabase.co/auth/v1/callback`
- [ ] Google provider enabled in Supabase
- [ ] Client ID and Secret added to Supabase
- [ ] Tested sign-in flow

That's it! Google OAuth should now work. 🎉


