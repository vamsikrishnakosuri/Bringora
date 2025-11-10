# Deploy Bringora to Production with Your Custom Domain

This guide will help you deploy your Bringora app and connect your domain from Lovable.

## Option 1: Deploy to Vercel (Recommended - Free & Easy)

Vercel is the easiest option and works great with Vite/React apps.

### Step 1: Prepare Your Code

1. **Push to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/bringora.git
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign up/login
2. **Click "Add New Project"**
3. **Import your GitHub repository** (or connect it)
4. **Configure the project:**
   - Framework Preset: **Vite**
   - Root Directory: `./` (leave as is)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)
   - Install Command: `npm install` (auto-detected)

5. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add these three:
     - `VITE_SUPABASE_URL` = your Supabase URL
     - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
     - `VITE_MAPBOX_TOKEN` = your Mapbox token
   - Make sure they're added for **Production**, **Preview**, and **Development**

6. **Click "Deploy"**
   - Wait 2-3 minutes for deployment
   - You'll get a URL like: `bringora.vercel.app`

### Step 3: Connect Your Custom Domain

1. **In Vercel Dashboard:**
   - Go to your project
   - Click **Settings** → **Domains**
   - Click **Add Domain**

2. **Enter your domain:**
   - Type your domain (e.g., `bringora.com` or `www.bringora.com`)
   - Click **Add**

3. **Configure DNS in Lovable:**
   - Go to your Lovable dashboard where you purchased the domain
   - Find **DNS Settings** or **Domain Management**
   - You need to add these DNS records:

   **For root domain (bringora.com):**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21 (Vercel's IP - check Vercel for current IP)
   ```

   **OR use CNAME (easier):**
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

   **For www subdomain:**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

4. **Wait for DNS propagation** (5 minutes to 48 hours, usually 15-30 minutes)

5. **Vercel will automatically provision SSL** (HTTPS) for your domain

### Step 4: Update Supabase Settings

1. **Go to Supabase Dashboard** → **Authentication** → **URL Configuration**
2. **Add your custom domain to:**
   - **Site URL**: `https://yourdomain.com`
   - **Redirect URLs**: 
     - `https://yourdomain.com/auth/callback`
     - `https://yourdomain.com/**`
     - `http://localhost:5173/**` (keep for local dev)

3. **Save**

### Step 5: Update Google OAuth (if enabled)

1. **Go to Google Cloud Console** → **APIs & Services** → **Credentials**
2. **Edit your OAuth Client**
3. **Add to Authorized redirect URIs:**
   - `https://yourdomain.com/auth/callback`
   - Keep the Supabase one: `https://your-project-id.supabase.co/auth/v1/callback`

4. **Save**

---

## Option 2: Deploy to Netlify (Also Free & Easy)

### Step 1: Deploy to Netlify

1. **Go to [netlify.com](https://netlify.com)** and sign up/login
2. **Click "Add new site"** → **"Import an existing project"**
3. **Connect to GitHub** and select your repository
4. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: `./` (leave empty)

5. **Add Environment Variables:**
   - Go to **Site settings** → **Environment variables**
   - Add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_MAPBOX_TOKEN`

6. **Click "Deploy site"**
   - You'll get a URL like: `bringora.netlify.app`

### Step 2: Connect Custom Domain

1. **In Netlify Dashboard:**
   - Go to **Site settings** → **Domain management**
   - Click **Add custom domain**
   - Enter your domain

2. **Configure DNS:**
   - Netlify will show you DNS records to add
   - Go to Lovable DNS settings and add:
     ```
     Type: A
     Name: @
     Value: [Netlify's IP - shown in Netlify dashboard]
     ```
   - Or use CNAME:
     ```
     Type: CNAME
     Name: @
     Value: [your-site].netlify.app
     ```

3. **Wait for DNS propagation**

4. **Netlify automatically provides SSL**

---

## Option 3: Get Domain from Lovable

If your domain is managed by Lovable, you have a few options:

### Option A: Transfer Domain to Vercel/Netlify

1. **Get domain transfer code from Lovable**
2. **Transfer to your hosting provider** (Vercel/Netlify both support domain transfers)

### Option B: Point DNS from Lovable

1. **Keep domain in Lovable**
2. **Update DNS records in Lovable** to point to your Vercel/Netlify deployment
3. **Use the DNS records provided by your hosting platform**

### Option C: Use Lovable's Deployment (if available)

If Lovable offers hosting:
1. **Build your app**: `npm run build`
2. **Upload the `dist` folder** to Lovable
3. **Connect your domain** in Lovable's dashboard

---

## Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel or Netlify
- [ ] Environment variables added
- [ ] Custom domain added in hosting platform
- [ ] DNS records updated in Lovable
- [ ] Supabase redirect URLs updated
- [ ] Google OAuth redirect URLs updated (if using)
- [ ] SSL certificate active (automatic)
- [ ] Tested the live site

## Testing Your Deployment

1. **Visit your custom domain**
2. **Test sign up/sign in**
3. **Test all features**
4. **Check that redirects work** (especially OAuth callbacks)

## Troubleshooting

### Domain not working
- Wait 15-30 minutes for DNS propagation
- Check DNS records are correct
- Use [whatsmydns.net](https://www.whatsmydns.net) to check propagation

### SSL certificate issues
- Vercel/Netlify auto-provision SSL, but it can take a few minutes
- Make sure DNS is pointing correctly first

### OAuth redirect errors
- Make sure you added the custom domain to Supabase redirect URLs
- Check Google OAuth redirect URIs include your domain

### Environment variables not working
- Make sure they're set in your hosting platform
- Redeploy after adding variables
- Check variable names start with `VITE_`

---

**Need help?** Let me know which hosting platform you want to use and I can provide more specific guidance!


