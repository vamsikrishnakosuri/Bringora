# Bringora - Community Help Platform

A community-based platform connecting people who need help with daily tasks to nearby helpers.

## Features

- 🔐 Secure authentication (Email/Password + Google OAuth)
- 🌍 Multi-language support (6 languages)
- 📍 Location-based matching with Mapbox
- 🎨 Premium monochrome design (Black & White)
- 🌓 Light/Dark mode support
- 👥 Two-sided platform (Request Help / Offer Help)
- 🛡️ Row Level Security with Supabase
- 📱 Fully responsive design

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Maps**: Mapbox GL
- **Forms**: React Hook Form + Zod
- **Routing**: React Router v6

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAPBOX_TOKEN=your_mapbox_token
```

3. Run the development server:
```bash
npm run dev
```

## Free & Secure

This application is designed to be **fully free** for users while maintaining high security standards through:
- Supabase Row Level Security (RLS)
- Secure authentication flows
- Encrypted data transmission
- No premium features or paywalls
- All features work with free tiers of Supabase and Mapbox

### Free Tier Compatibility

✅ **Supabase Free Tier** includes:
- 500 MB database (plenty for community data)
- 2 GB bandwidth per month
- 50,000 monthly active users
- Email authentication
- Google OAuth
- Row Level Security
- Edge Functions (for translations)

✅ **Mapbox Free Tier** includes:
- 50,000 map loads per month
- Geocoding API
- Perfect for location-based features

**All features in this app are designed to work 100% free!** No paid services required.

