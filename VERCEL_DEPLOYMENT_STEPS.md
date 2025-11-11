# Step-by-Step Vercel Deployment Guide for Bringora

Follow these exact steps to deploy your Bringora app to Vercel:

## Step 1: Go to Vercel

1. Open your browser
2. Go to **[vercel.com](https://vercel.com)**
3. Click **"Sign Up"** (or **"Log In"** if you already have an account)
4. **Sign in with GitHub** (recommended - it's the easiest way)

## Step 2: Create New Project

1. After logging in, you'll see the Vercel dashboard
2. Click the **"Add New..."** button (top right)
3. Select **"Project"**

## Step 3: Import Your GitHub Repository

1. You'll see a list of your GitHub repositories
2. **Find "Bringora"** in the list (or search for it)
3. Click **"Import"** next to your Bringora repository

## Step 4: Configure Project Settings

Vercel will auto-detect most settings, but verify:

1. **Framework Preset:** Should show **"Vite"** (auto-detected)
2. **Root Directory:** Leave as `./` (default)
3. **Build Command:** Should show `npm run build` (auto-detected)
4. **Output Directory:** Should show `dist` (auto-detected)
5. **Install Command:** Should show `npm install` (auto-detected)

**Don't click Deploy yet!** We need to add environment variables first.

## Step 5: Add Environment Variables

**This is crucial!** Your app needs these to work:

1. **Click "Environment Variables"** (below the project settings)
2. You'll see a form to add variables
3. **Add these THREE variables one by one:**

   **Variable 1:**
   - **Name:** `VITE_SUPABASE_URL`
   - **Value:** Your Supabase project URL (from Supabase dashboard → Settings → API)
   - **Environment:** Check all three: ☑ Production, ☑ Preview, ☑ Development
   - Click **"Add"**

   **Variable 2:**
   - **Name:** `VITE_SUPABASE_ANON_KEY`
   - **Value:** Your Supabase anon public key (from Supabase dashboard → Settings → API)
   - **Environment:** Check all three: ☑ Production, ☑ Preview, ☑ Development
   - Click **"Add"**

   **Variable 3:**
   - **Name:** `VITE_MAPBOX_TOKEN`
   - **Value:** Your Mapbox access token (from mapbox.com account page)
   - **Environment:** Check all three: ☑ Production, ☑ Preview, ☑ Development
   - Click **"Add"**

4. **Verify all three are added** in the list below

## Step 6: Deploy!

1. Scroll back up
2. Click the big **"Deploy"** button
3. Wait 2-3 minutes while Vercel:
   - Installs dependencies
   - Builds your app
   - Deploys it

## Step 7: Get Your Deployment URL

1. Once deployment finishes, you'll see:
   - ✅ **"Congratulations! Your project has been deployed"**
   - A URL like: `bringora.vercel.app` or `bringora-xxxxx.vercel.app`

2. **Click the URL** to open your live app!

## Step 8: Test Your Deployment

1. **Visit your Vercel URL** (e.g., `https://bringora.vercel.app`)
2. **Test the app:**
   - Check if homepage loads
   - Try signing up
   - Test features

## Step 9: Connect Your Custom Domain (From Lovable)

### 9.1: Add Domain in Vercel

1. In your Vercel project dashboard, go to **"Settings"** tab
2. Click **"Domains"** in the left sidebar
3. Click **"Add Domain"** button
4. **Enter your domain** (e.g., `bringora.com` or `www.bringora.com`)
5. Click **"Add"**

### 9.2: Get DNS Records from Vercel

1. Vercel will show you **DNS configuration instructions**
2. You'll see something like:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```
   OR
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

3. **Copy these DNS records** (you'll need them next)

### 9.3: Update DNS in Lovable

1. **Go to Lovable** where you purchased your domain
2. **Find DNS Settings** or **Domain Management**
3. **Add the DNS records** Vercel provided:

   **For root domain (bringora.com):**
   - **Type:** A or CNAME (use what Vercel shows)
   - **Name:** @ (or leave blank)
   - **Value:** The value Vercel provided
   - **TTL:** 3600 (or default)
   - **Save**

   **For www subdomain (www.bringora.com):**
   - **Type:** CNAME
   - **Name:** www
   - **Value:** cname.vercel-dns.com (or what Vercel shows)
   - **TTL:** 3600 (or default)
   - **Save**

### 9.4: Wait for DNS Propagation

1. **Wait 15-30 minutes** (can take up to 48 hours, but usually faster)
2. Vercel will automatically provision **SSL certificate** (HTTPS)
3. Check status in Vercel dashboard → Domains
4. When it shows ✅ **"Valid Configuration"**, your domain is ready!

### 9.5: Test Your Custom Domain

1. Visit `https://yourdomain.com`
2. Your app should load!
3. Test all features

## Step 10: Update Supabase Redirect URLs

**Important!** Your app won't work with OAuth unless you update this:

1. **Go to Supabase Dashboard**
2. **Authentication** → **URL Configuration**
3. **Add to "Redirect URLs":**
   - `https://yourdomain.com/auth/callback`
   - `https://yourdomain.com/**`
   - Keep `http://localhost:5173/**` for local development
4. **Update "Site URL"** to: `https://yourdomain.com`
5. **Save**

## Step 11: Update Google OAuth (If Using)

If you enabled Google sign-in:

1. **Go to Google Cloud Console** → **APIs & Services** → **Credentials**
2. **Edit your OAuth Client**
3. **Add to "Authorized redirect URIs":**
   - `https://yourdomain.com/auth/callback`
   - Keep the Supabase one: `https://your-project-id.supabase.co/auth/v1/callback`
4. **Save**

## Troubleshooting

### Build Failed
- Check that all environment variables are set
- Check Vercel build logs for errors
- Make sure `package.json` is correct

### Domain Not Working
- Wait longer for DNS propagation (up to 48 hours)
- Check DNS records are correct in Lovable
- Verify in Vercel dashboard → Domains that it shows "Valid Configuration"

### App Works But Auth Doesn't
- Make sure you updated Supabase redirect URLs
- Check environment variables are set correctly
- Verify Supabase project is active

### Environment Variables Not Working
- Make sure variable names start with `VITE_`
- Check they're added for all environments (Production, Preview, Development)
- Redeploy after adding variables

## Quick Checklist

- [ ] Signed up/logged into Vercel
- [ ] Imported Bringora repository from GitHub
- [ ] Added all 3 environment variables
- [ ] Deployed successfully
- [ ] Tested the Vercel URL
- [ ] Added custom domain in Vercel
- [ ] Updated DNS records in Lovable
- [ ] Waited for DNS propagation
- [ ] Updated Supabase redirect URLs
- [ ] Updated Google OAuth redirect URIs (if using)
- [ ] Tested custom domain

## You're Done! 🎉

Your Bringora app is now live at your custom domain!

---

**Need help?** Check the build logs in Vercel dashboard if something goes wrong. The logs will show exactly what the issue is.



