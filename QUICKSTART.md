# Quick Start Guide - Bringora

Follow these steps to get your Bringora application up and running:

## Step 1: Install Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

This will install all required packages (React, Supabase, Tailwind, etc.)

## Step 2: Set Up Supabase (Free Account)

1. **Create a Supabase Account**
   - Go to [https://supabase.com](https://supabase.com)
   - Sign up for a free account
   - Click "New Project"

2. **Create Your Project**
   - Choose a project name (e.g., "bringora")
   - Set a database password (save this!)
   - Choose a region closest to you
   - Wait 2-3 minutes for setup

3. **Set Up Database Schema**
   - In your Supabase dashboard, go to **SQL Editor**
   - Click **New Query**
   - Open the `supabase-schema.sql` file from this project
   - Copy ALL the contents and paste into the SQL Editor
   - Click **Run** (or press Ctrl+Enter)
   - You should see "Success. No rows returned"

4. **Enable Google OAuth (Optional but Recommended)**
   - Go to **Authentication > Providers**
   - Find **Google** and toggle it ON
   - You'll need Google OAuth credentials (can skip for now if you want to test with email only)

5. **Get Your API Keys**
   - Go to **Settings > API**
   - Copy the **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - Copy the **anon public** key (long string starting with `eyJ...`)

## Step 3: Set Up Mapbox (Free Account)

1. **Create a Mapbox Account**
   - Go to [https://mapbox.com](https://mapbox.com)
   - Sign up for a free account
   - Verify your email

2. **Get Your Access Token**
   - Go to your account page: [https://account.mapbox.com](https://account.mapbox.com)
   - Scroll to **Access tokens**
   - Copy your **Default public token** (starts with `pk.eyJ...`)

## Step 4: Create Environment File

1. **Create `.env` file** in the root directory (same level as `package.json`)

2. **Add these variables:**

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_MAPBOX_TOKEN=your-mapbox-token-here
```

**Replace with your actual values from Steps 2 and 3!**

Example:
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNscxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Step 5: Start the Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Step 6: Open in Browser

Open [http://localhost:5173](http://localhost:5173) in your browser.

You should see the Bringora homepage with:
- Black and white premium design
- "Request Help" and "Offer Help" cards
- Language selector
- Theme toggle

## Step 7: Test the Application

1. **Test Sign Up:**
   - Click "Request Help" or "Offer Help"
   - You'll be redirected to sign up
   - Create an account with email/password
   - Check your email for verification (if required by Supabase)

2. **Test Request Help:**
   - After signing in, click "Request Help"
   - Fill out the form
   - Submit a help request

3. **Test Offer Help:**
   - Click "Offer Help"
   - Browse available requests
   - Contact requesters via phone

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env` file exists in the root directory
- Check that variable names start with `VITE_`
- Restart the dev server after creating/editing `.env`

### "Failed to connect to Supabase"
- Verify your `VITE_SUPABASE_URL` is correct
- Check that your Supabase project is active
- Make sure you copied the full URL (including `https://`)

### Database errors when submitting forms
- Make sure you ran the `supabase-schema.sql` script
- Check Supabase dashboard > Table Editor to see if tables exist
- Verify RLS policies are enabled (they should be after running the SQL)

### Google OAuth not working
- This is optional - you can use email/password only
- To enable: Set up OAuth in Google Cloud Console and add credentials to Supabase

### Mapbox not loading
- Verify your token is correct
- Check Mapbox account for any usage limits
- The app will work without maps for basic functionality

## What's Next?

- ✅ Your app is running locally
- ✅ Users can sign up and request/offer help
- ✅ All features work with free tiers
- 🎨 Customize colors, text, or branding
- 🌍 Add more language translations
- 📍 Enhance location features with Mapbox
- 🔔 Add real-time notifications

## Need Help?

- Check `SETUP.md` for detailed setup instructions
- Review `README.md` for feature documentation
- Check Supabase dashboard for database issues
- Verify all environment variables are set correctly

---

**You're all set! Start building your community platform! 🚀**



