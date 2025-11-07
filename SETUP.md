# Bringora Setup Guide

## Prerequisites

- Node.js 18+ and npm/yarn
- A Supabase account (free tier works perfectly)
- A Mapbox account (free tier available)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for your project to be provisioned
3. Go to **SQL Editor** in your Supabase dashboard
4. Copy and paste the contents of `supabase-schema.sql` into the editor
5. Run the SQL script to create all tables, policies, and functions
6. Go to **Authentication > Providers** and enable:
   - Email provider (already enabled)
   - Google OAuth (configure with your Google OAuth credentials)
7. Go to **Settings > API** and copy:
   - Project URL → `VITE_SUPABASE_URL`
   - `anon` `public` key → `VITE_SUPABASE_ANON_KEY`

## Step 3: Set Up Mapbox

1. Go to [mapbox.com](https://mapbox.com) and create a free account
2. Go to your account page and create an access token
3. Copy your access token → `VITE_MAPBOX_TOKEN`

## Step 4: Configure Environment Variables

1. Create a `.env` file in the root directory
2. Add the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAPBOX_TOKEN=your_mapbox_access_token
```

## Step 5: Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Step 6: Set Up Admin Access (Optional)

To enable admin features:

1. In Supabase, go to **Authentication > Users**
2. Find your user and note the user ID
3. You can manually update the `profiles` table to add an `is_admin` field, or modify the RLS policies to allow specific users admin access

## Free Tier Considerations

All features are designed to work with free tiers:

- **Supabase Free Tier**: 
  - 500 MB database
  - 2 GB bandwidth
  - 50,000 monthly active users
  - Perfect for starting out!

- **Mapbox Free Tier**:
  - 50,000 map loads per month
  - More than enough for a community app

## Security Features

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Secure authentication with Supabase Auth
- ✅ Protected routes for authenticated users
- ✅ Encrypted data transmission
- ✅ No sensitive data stored in frontend

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure your `.env` file is in the root directory
- Restart your dev server after adding environment variables

### "Failed to sign in with Google"
- Make sure Google OAuth is enabled in Supabase
- Check that your redirect URL is configured correctly

### Database errors
- Make sure you've run the `supabase-schema.sql` script
- Check that RLS policies are enabled

## Next Steps

1. Customize the branding and colors if needed
2. Add more translations for additional languages
3. Enhance the location picker with Mapbox integration
4. Add real-time notifications
5. Implement rating and review system

## Support

This is a fully free, open-source application. All features are designed to work without any paid services.

