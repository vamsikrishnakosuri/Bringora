# Connecting Your Lovable Domain to Bringora

## Quick Steps

### 1. Deploy Your App First

Choose one:
- **Vercel** (easiest): [vercel.com](https://vercel.com)
- **Netlify** (also easy): [netlify.com](https://netlify.com)

Follow the deployment guide in `DEPLOYMENT.md`

### 2. Get Your Domain Info from Lovable

1. **Log into Lovable** where you purchased the domain
2. **Find Domain Management** or **DNS Settings**
3. **Note your domain name** (e.g., `bringora.com`)

### 3. Connect Domain to Your Hosting

#### If Using Vercel:

1. **In Vercel Dashboard:**
   - Go to your project → **Settings** → **Domains**
   - Click **Add Domain**
   - Enter your domain (e.g., `bringora.com`)

2. **Vercel will show you DNS records to add**

3. **In Lovable DNS Settings, add:**
   ```
   Type: CNAME
   Name: @ (or leave blank for root)
   Value: cname.vercel-dns.com
   ```
   
   **For www:**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

#### If Using Netlify:

1. **In Netlify Dashboard:**
   - Go to **Site settings** → **Domain management**
   - Click **Add custom domain**
   - Enter your domain

2. **Netlify will show DNS records**

3. **In Lovable DNS Settings, add the records Netlify provides**

### 4. Update Supabase Redirect URLs

1. **Go to Supabase Dashboard**
2. **Authentication** → **URL Configuration**
3. **Add to Redirect URLs:**
   - `https://yourdomain.com/auth/callback`
   - `https://yourdomain.com/**`
4. **Update Site URL** to: `https://yourdomain.com`
5. **Save**

### 5. Wait for DNS Propagation

- Usually takes **15-30 minutes**
- Can take up to 48 hours (rare)
- Check status: [whatsmydns.net](https://www.whatsmydns.net)

### 6. Test

1. Visit `https://yourdomain.com`
2. Test sign up/sign in
3. Everything should work!

## If You Can't Find DNS Settings in Lovable

**Option 1: Contact Lovable Support**
- Ask them how to access DNS settings
- Or ask them to point the domain to your hosting

**Option 2: Transfer Domain**
- Get transfer code from Lovable
- Transfer to Vercel/Netlify (they both support domain management)
- Then manage DNS directly in Vercel/Netlify

**Option 3: Use Subdomain**
- If Lovable hosts your main domain
- Use a subdomain like `app.bringora.com`
- Point that to your Vercel/Netlify deployment

## Common Issues

### "Domain not found" in Vercel/Netlify
- Make sure DNS records are added in Lovable
- Wait for DNS propagation
- Check spelling of domain

### SSL certificate not working
- Wait a few minutes after DNS propagates
- Vercel/Netlify auto-provision SSL
- Make sure you're using HTTPS

### OAuth redirects not working
- Make sure you updated Supabase redirect URLs
- Check Google OAuth settings if using Google sign-in

## Need Help?

1. **Which hosting platform are you using?** (Vercel/Netlify)
2. **What's your domain name?**
3. **Can you access DNS settings in Lovable?**

Share these details and I can provide more specific help!



