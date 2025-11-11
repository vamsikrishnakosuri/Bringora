# Bringora - Complete Knowledge Base

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [File Structure & Purpose](#file-structure--purpose)
4. [Core Features Explained](#core-features-explained)
5. [Database Schema](#database-schema)
6. [Authentication Flow](#authentication-flow)
7. [User Flows](#user-flows)
8. [API Integrations](#api-integrations)
9. [Security Implementation](#security-implementation)
10. [Deployment & Configuration](#deployment--configuration)

---

## 🎯 Project Overview

**Bringora** is a fully free, community-based platform that connects people who need help with daily tasks to nearby verified helpers. It's designed to be secure, privacy-focused, and user-friendly.

### Key Principles
- **100% Free**: No fees, no ads, no commissions
- **Community-Based**: Built for people helping people
- **Secure**: End-to-end encrypted messaging, verified helpers
- **Privacy-Focused**: No direct contact info exposure
- **Accessible**: Multi-language support, responsive design

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Hook Form + Zod** - Form handling and validation
- **Lucide React** - Icons
- **Mapbox GL JS** - Maps and location services

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication (Email/Password + Google OAuth)
  - Storage (for ID photos, selfies)
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Edge Functions (for translations)

### Deployment
- **Vercel** - Hosting and CI/CD
- **GitHub** - Version control
- **Custom Domain** - Via Lovable

---

## 📁 File Structure & Purpose

### Root Configuration Files

#### `package.json`
**Purpose**: Defines project dependencies, scripts, and metadata
**Key Contents**:
- Dependencies: React, TypeScript, Supabase, Mapbox, etc.
- Scripts: `dev`, `build`, `preview`, `lint`
- Project metadata and version

#### `tsconfig.json`
**Purpose**: TypeScript compiler configuration
**Key Settings**:
- Path aliases (`@/` for `src/`)
- Strict type checking
- JSX support
- Module resolution

#### `tailwind.config.js`
**Purpose**: Tailwind CSS configuration
**Key Features**:
- Custom color palette (light/dark mode)
- Custom animations
- Responsive breakpoints
- Theme-aware utilities

#### `vite.config.ts`
**Purpose**: Vite build configuration
**Key Settings**:
- Path aliases
- Build optimizations
- Plugin configuration

#### `vercel.json`
**Purpose**: Vercel deployment configuration
**Key Features**:
- Security headers (CSP, XSS protection, etc.)
- Redirect rules
- Build settings

#### `index.html`
**Purpose**: HTML entry point
**Key Features**:
- Meta tags (viewport, theme-color)
- Font imports (Inter from Google Fonts)
- Mapbox CSS link
- Theme initialization script

---

### Source Code Structure (`src/`)

#### `src/main.tsx`
**Purpose**: React application entry point
**What it does**:
- Renders the root `App` component
- Sets up React StrictMode
- Imports global CSS

#### `src/App.tsx`
**Purpose**: Main application component with routing
**Key Features**:
- Defines all routes
- Wraps app with context providers (Auth, Theme, Language)
- Includes Header, ErrorBoundary, ToastProvider
- Handles route changes and scroll behavior

**Routes**:
- `/` - Homepage
- `/auth` - Sign in/Sign up
- `/auth/callback` - OAuth callback handler
- `/onboarding` - Profile completion
- `/request-help` - Create help request
- `/offer-help` - Browse nearby requests (for helpers)
- `/my-requests` - User's submitted requests
- `/browse-requests` - Browse all requests
- `/profile` - User profile settings
- `/admin` - Admin dashboard
- `/terms` - Terms and conditions

#### `src/index.css`
**Purpose**: Global CSS styles
**Key Features**:
- CSS variables for theming
- Base styles and resets
- Custom animations
- Accessibility styles (focus states, touch targets)
- Date/time picker icon fixes

---

### Context Providers (`src/contexts/`)

#### `src/contexts/AuthContext.tsx`
**Purpose**: Authentication state management
**What it provides**:
- `user` - Current user object
- `session` - Current session
- `loading` - Auth loading state
- `signIn(email, password)` - Email/password sign in
- `signUp(email, password)` - Email/password sign up
- `signInWithGoogle()` - Google OAuth sign in
- `signOut()` - Sign out
- `resetPassword(email)` - Password reset

**How it works**:
- Listens to Supabase auth state changes
- Automatically updates user state
- Handles session persistence

#### `src/contexts/ThemeContext.tsx`
**Purpose**: Light/dark mode theme management
**What it provides**:
- `theme` - Current theme ('light' or 'dark')
- `toggleTheme()` - Switch between themes
- `setTheme(theme)` - Set specific theme

**How it works**:
- Stores theme preference in localStorage
- Applies theme class to document root
- Persists across page reloads and OAuth redirects

#### `src/contexts/LanguageContext.tsx`
**Purpose**: Multi-language support
**What it provides**:
- `language` - Current language code
- `setLanguage(code)` - Change language
- `t(key)` - Translation function

**Supported Languages**:
- English (en)
- Telugu (te)
- Hindi (hi)
- Kannada (kn)
- Malayalam (ml)
- Tamil (ta)

**Translation Keys**: All UI text, form labels, error messages, etc.

---

### Pages (`src/pages/`)

#### `src/pages/Home.tsx`
**Purpose**: Landing page
**Features**:
- Two main cards: "Request Help" and "Offer Help"
- Feature descriptions
- Payment warning banner
- Responsive design
- Animated cards with hover effects

#### `src/pages/Auth.tsx`
**Purpose**: Sign in/Sign up page
**Features**:
- Unified UI for both sign in and sign up
- Email/password authentication
- Google OAuth button
- Password reset link
- Form validation
- Error handling with helpful messages
- Auto-focus on email field

**User Flow**:
1. User enters email/password or clicks Google
2. Form validates input
3. Calls AuthContext methods
4. Redirects to callback or onboarding

#### `src/pages/AuthCallback.tsx`
**Purpose**: Handles OAuth callback from Google
**What it does**:
1. Receives OAuth redirect
2. Gets session from Supabase
3. Saves Google avatar to profiles table
4. Checks if profile is complete
5. Redirects to onboarding or homepage

#### `src/pages/Onboarding.tsx`
**Purpose**: Profile completion flow for new users
**Steps**:
1. **Contact Info**: Name, phone, email (optional)
2. **Location**: Map-based location picker
3. **Complete**: Success message and redirect

**Features**:
- Multi-step form
- Location picker with Mapbox
- Form validation
- Auto-saves to profiles table
- Sets `profile_completed` flag

#### `src/pages/RequestHelp.tsx`
**Purpose**: Create a help request
**Form Fields**:
- **Service Details**:
  - Category (cleaning, cooking, delivery, etc.)
  - Date & Time
  - Duration (hours/minutes)
- **Contact Information**:
  - Full Name (auto-filled from profile)
  - Phone Number (auto-filled from profile)
- **Location Details**:
  - Interactive Mapbox map (auto-filled from profile)
  - Address, latitude, longitude
- **Payment Details**:
  - Fixed amount or Range (min-max)
- **Additional Info**:
  - Preferred shop/store/place
  - Preferred contact methods (call, message, email)
  - Additional information/instructions

**Features**:
- Auto-fills from user profile
- Comprehensive validation
- Location picker with autocomplete
- Summary screen after submission
- Saves to `help_requests` table

#### `src/pages/OfferHelp.tsx`
**Purpose**: Browse nearby help requests (for verified helpers)
**Features**:
- Shows requests within helper's service radius
- Displays distance from helper's location
- Contact requester button (opens chat)
- Counter offer functionality
- Filters out user's own requests
- Service radius display and update option

**Helper Application Flow**:
1. Check if user is verified helper
2. If not, show application form
3. If pending, show pending message
4. If approved, show nearby requests

#### `src/pages/MyRequests.tsx`
**Purpose**: View user's submitted help requests
**Features**:
- Lists all user's requests in card format
- Shows request status
- Category-based images
- Payment amount display
- Location and distance info
- Edit/delete functionality
- "Go back to homepage" button

#### `src/pages/BrowseRequests.tsx`
**Purpose**: Browse all help requests (public view)
**Features**:
- Shows all pending requests
- Card-based layout
- Contact requester functionality
- Counter offer option
- Responsive grid layout

#### `src/pages/Profile.tsx`
**Purpose**: User profile settings
**Features**:
- Display user avatar (Google profile picture if available)
- Edit profile information:
  - Full Name
  - Phone Number
  - Location (with map picker)
- Save changes
- Shows Google badge if signed in with Google
- Form validation

#### `src/pages/TermsAndConditions.tsx`
**Purpose**: Terms and conditions page
**Content**:
- Service description
- User responsibilities
- Payment disclaimers
- Safety guidelines
- Free service declaration
- Liability limitations

#### `src/pages/AdminDashboard.tsx`
**Purpose**: Admin interface (placeholder)
**Future Features**:
- Helper verification
- Request monitoring
- User management
- Report review

---

### Components (`src/components/`)

#### `src/components/Header.tsx`
**Purpose**: Navigation header
**Features**:
- Logo (clickable, goes to homepage)
- Language selector dropdown
- Theme toggle button
- Profile avatar/icon (shows Google picture if available)
- "My Requests" button
- "Sign Out" button
- Responsive mobile menu
- Auto-loads and displays user avatar

#### `src/components/Logo.tsx`
**Purpose**: App logo component
**Features**:
- Uses `src/Logo.png` image
- Displays in both light and dark modes
- Clickable, navigates to homepage

#### `src/components/ThemeToggle.tsx`
**Purpose**: Light/dark mode toggle button
**Features**:
- Animated pill-shaped toggle (20x10)
- Sky blue gradient with clouds/sun for light mode
- Dark slate gradient with stars/moon for dark mode
- Smooth 700ms transition with 360° rotation
- Shadows and fading effects

#### `src/components/FeatureCard.tsx`
**Purpose**: Homepage feature cards
**Features**:
- "Request Help" and "Offer Help" cards
- Hover effects with shine animation
- Liquid glass styling
- Responsive design
- Clickable, navigates to respective pages

#### `src/components/LocationPicker.tsx`
**Purpose**: Interactive map-based location picker
**Features**:
- Mapbox GL JS integration
- Search with autocomplete (India-focused)
- GPS location detection
- Click-to-select location
- Address, latitude, longitude capture
- Suggestions dropdown (positioned above input)
- Initial location support (for auto-fill)

#### `src/components/PaymentWarningBanner.tsx`
**Purpose**: Warning banner about not paying upfront
**Features**:
- Prominent display
- Stylized design
- "Do not pay upfront" messaging
- Appears on key pages (Home, RequestHelp)

#### `src/components/ContactModal.tsx`
**Purpose**: Modal for contacting requesters
**Features**:
- Opens chat interface
- Shows available contact methods based on requester's preferences
- End-to-end encrypted messaging
- Report user functionality

#### `src/components/Chat.tsx`
**Purpose**: In-app messaging interface
**Features**:
- End-to-end encrypted messages
- Real-time message sending/receiving
- Conversation list
- Message history
- Client-side encryption using Web Crypto API

#### `src/components/ReportUser.tsx`
**Purpose**: User reporting functionality
**Features**:
- Report abusive language
- Report inappropriate behavior
- Report spam/fake requests
- Report safety concerns
- Saves to `reports` table

#### `src/components/HelperApplicationForm.tsx`
**Purpose**: Multi-step helper application form
**Steps**:
1. **Personal Information**: Name, phone, email (optional)
2. **Identity Verification**:
   - Government ID type selection (Aadhaar, PAN, Driving License, Passport, Voter ID, Ration Card)
   - ID number with format validation
   - ID photo upload
   - Selfie with ID upload
   - Automated ID verification (placeholder for API)
3. **Service Area Setup**:
   - Location selection
   - Service radius configuration (km/miles)

**Features**:
- File upload validation
- Government ID format validation
- Photo uploads to Supabase Storage
- Saves to `helper_applications` table

#### `src/components/ServiceRadiusSetup.tsx`
**Purpose**: Service radius configuration for helpers
**Features**:
- Location picker
- Radius input (km or miles)
- Saves to `helpers` table
- Updates helper's service area

#### `src/components/ProfileCheck.tsx`
**Purpose**: Route guard component
**What it does**:
- Checks if user is authenticated
- Checks if profile is complete
- Redirects to auth or onboarding if needed
- Wraps protected routes

#### `src/components/ErrorBoundary.tsx`
**Purpose**: React error boundary
**Features**:
- Catches React component errors
- Displays user-friendly error message
- Logs errors for debugging
- Prevents app crash

#### `src/components/InstallPrompt.tsx`
**Purpose**: PWA install prompt
**Features**:
- Detects if app can be installed
- Shows custom install prompt
- Handles install event

---

### UI Components (`src/components/ui/`)

#### `src/components/ui/Button.tsx`
**Purpose**: Reusable button component
**Variants**:
- `default` - Primary button
- `outline` - Outlined button
- `ghost` - Transparent button
**Features**:
- Loading state
- Disabled state
- Icon support
- Responsive sizing
- Accessibility (ARIA labels)

#### `src/components/ui/Input.tsx`
**Purpose**: Form input component
**Features**:
- Error state display
- Icon support
- Placeholder text
- Type variants (text, email, tel, number, etc.)
- Validation styling
- Accessibility

#### `src/components/ui/Card.tsx`
**Purpose**: Card container component
**Features**:
- Liquid glass styling (backdrop blur, transparency)
- Border styling
- Padding variants
- Responsive design

#### `src/components/ui/Select.tsx`
**Purpose**: Dropdown select component
**Features**:
- Custom styling
- Option rendering
- Accessibility

#### `src/components/ui/ToastContainer.tsx`
**Purpose**: Toast notification system
**Features**:
- Success, error, info, warning toasts
- Auto-dismiss
- Stack multiple toasts
- Smooth animations
- Accessible (ARIA live regions)

---

### Utilities (`src/lib/`)

#### `src/lib/supabase.ts`
**Purpose**: Supabase client initialization
**What it exports**:
- `supabase` - Configured Supabase client
- Uses environment variables for URL and anon key

#### `src/lib/validation.ts`
**Purpose**: Zod validation schemas
**Schemas**:
- `nameSchema` - Name validation
- `emailSchema` - Email format validation
- `phoneSchema` - Phone number validation (10-13 digits)
- `locationSchema` - Location with coordinates
- `categorySchema` - Service category
- `dateSchema`, `timeSchema` - Date/time validation
- `durationSchema` - Duration validation
- `amountSchema` - Payment amount
- `contactMethodsSchema` - Contact method selection
- `aadhaarSchema`, `panSchema`, etc. - Government ID validation
- `helperApplicationSchema` - Complete helper application

#### `src/lib/security.ts`
**Purpose**: Security utilities
**Functions**:
- `sanitizeInput(text)` - XSS prevention, HTML entity encoding
- `validatePhoneNumber(phone)` - Phone format validation
- `validateCoordinates(lat, lng)` - Coordinate validation
- `generateSecureFileName(originalName, userId)` - Secure file naming
- `getCSPHeader()` - Content Security Policy header

#### `src/lib/encryption.ts`
**Purpose**: End-to-end encryption utilities
**Functions**:
- `generateKey()` - Generate encryption key
- `deriveKey(password, salt)` - Derive key from password
- `encryptMessage(message, key)` - Encrypt message
- `decryptMessage(encryptedData, key)` - Decrypt message
- Uses Web Crypto API (AES-GCM, PBKDF2)

#### `src/lib/utils.ts`
**Purpose**: General utility functions
**Functions**:
- `calculateDistance(lat1, lng1, lat2, lng2)` - Haversine distance calculation
- `formatDistance(distance, unit)` - Format distance display
- Other helper functions

#### `src/lib/idVerification.ts`
**Purpose**: Government ID verification (placeholder)
**Functions**:
- `verifyGovernmentId(data)` - Placeholder for API integration
- Will integrate with Indian government ID APIs (AI Parichay, Veri5Digital, etc.)

#### `src/lib/constants.ts`
**Purpose**: Application constants
**Contents**:
- Language codes and names
- Service categories
- Other constants

---

### Public Assets (`public/`)

#### `public/manifest.json`
**Purpose**: PWA manifest
**Features**:
- App name, description
- Icons (192x192, 512x512)
- Theme colors
- Display mode

#### `public/sw.js`
**Purpose**: Service worker for PWA
**Features**:
- Offline capability (basic)
- Cache management
- Install prompt handling

#### `public/Bringora-192.png`
**Purpose**: App icon (192x192 pixels)

#### `public/Bringora-512.png`
**Purpose**: App icon (512x512 pixels)

---

### SQL Migrations

#### `supabase-schema.sql`
**Purpose**: Initial database schema
**Tables**:
- `profiles` - User profiles
- `help_requests` - Help requests
- `helpers` - Helper profiles
- `helper_applications` - Helper applications
- `counter_offers` - Counter offers
- `conversations` - Chat conversations
- `messages` - Encrypted messages
- `reports` - User reports

**Policies**: Row Level Security (RLS) policies

#### `UPDATE_PROFILES_TABLE.sql`
**Purpose**: Add location fields to profiles table
**Adds**:
- `location` (TEXT)
- `latitude` (DECIMAL)
- `longitude` (DECIMAL)
- `profile_completed` (BOOLEAN)

#### `ADD_CONTACT_METHODS_AND_COUNTER_OFFERS.sql`
**Purpose**: Add contact methods and counter offers
**Adds**:
- `preferred_contact_methods` (ARRAY) to `help_requests`
- `counter_offers` table

#### `ADD_GOVERNMENT_ID_VERIFICATION.sql`
**Purpose**: Add government ID verification fields
**Adds**:
- `id_type` (TEXT)
- `id_number` (TEXT)
- `verification_status` (TEXT)
- `verification_details` (JSONB)
- To `helper_applications` table

#### `CREATE_CHAT_AND_REPORTS_TABLES.sql`
**Purpose**: Create chat and reports tables
**Creates**:
- `conversations` table
- `messages` table
- `reports` table

---

## 🔑 Core Features Explained

### 1. Authentication System

**How it works**:
1. User signs up/signs in via `Auth.tsx`
2. `AuthContext` manages authentication state
3. Supabase handles authentication
4. On success, user session is stored
5. `AuthCallback.tsx` handles OAuth redirects
6. Profile is checked for completion
7. User is redirected to onboarding or homepage

**Google OAuth Flow**:
1. User clicks "Continue with Google"
2. Redirected to Google OAuth
3. User authorizes
4. Redirected back to `/auth/callback`
5. `AuthCallback.tsx` processes the callback
6. Saves Google avatar and name to profiles
7. Checks profile completion
8. Redirects accordingly

### 2. Profile Management

**Profile Data**:
- Full name
- Phone number
- Email
- Location (address, lat, lng)
- Avatar URL (from Google or custom)
- Profile completion flag

**Auto-fill Logic**:
- When creating a request, profile data auto-fills form fields
- User can still edit if needed
- Location map centers on user's saved location

### 3. Help Request System

**Request Creation Flow**:
1. User fills out `RequestHelp.tsx` form
2. Form validates all inputs
3. Location is selected via Mapbox
4. Request is saved to `help_requests` table
5. Summary screen shows all details
6. User can create new request or go to homepage

**Request Display**:
- Cards show category, description, payment, location, distance
- Category-based images
- Distance calculation from helper's location
- Contact and counter offer buttons

### 4. Helper System

**Application Process**:
1. User clicks "Offer Help"
2. If not a helper, sees `HelperApplicationForm`
3. Step 1: Personal information
4. Step 2: Government ID verification
5. Step 3: Service area setup
6. Application saved to `helper_applications` table
7. Status: "pending" → admin reviews → "approved" or "rejected"

**Helper Features**:
- Service radius configuration
- Nearby requests filtered by radius
- Distance calculation
- Contact requester via chat
- Counter offer functionality

### 5. Messaging System

**End-to-End Encryption**:
- Messages encrypted client-side before sending
- Uses AES-GCM encryption
- Keys derived from user passwords
- Only sender and receiver can decrypt

**Chat Flow**:
1. Helper clicks "Contact Requester"
2. `ContactModal` opens
3. `Chat` component loads conversation
4. Messages encrypted before sending
5. Messages decrypted when received
6. Real-time updates via Supabase subscriptions

### 6. Reporting System

**How it works**:
1. User clicks "Report User"
2. `ReportUser` component opens
3. User selects report type and provides details
4. Report saved to `reports` table
5. Admin can review and take action

### 7. Multi-Language Support

**Implementation**:
- `LanguageContext` manages current language
- All text uses `t(key)` function
- Translations stored in `LanguageContext.tsx`
- Language preference saved in localStorage
- Language switcher in header

### 8. Theme System

**Light/Dark Mode**:
- `ThemeContext` manages theme state
- Theme stored in localStorage
- Applied to document root via class
- All components use theme-aware classes
- Smooth transitions between themes

---

## 🗄️ Database Schema

### `profiles` Table
```sql
- id (UUID, PRIMARY KEY) - References auth.users
- email (TEXT)
- full_name (TEXT)
- phone (TEXT)
- avatar_url (TEXT)
- location (TEXT)
- latitude (DECIMAL)
- longitude (DECIMAL)
- profile_completed (BOOLEAN)
- is_helper (BOOLEAN)
- is_approved (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### `help_requests` Table
```sql
- id (UUID, PRIMARY KEY)
- user_id (UUID) - References auth.users
- title (TEXT)
- description (TEXT)
- category (TEXT)
- location (TEXT)
- latitude (DECIMAL)
- longitude (DECIMAL)
- phone (TEXT)
- requester_name (TEXT)
- date_needed (DATE)
- time_needed (TIME)
- duration (TEXT)
- payment_type (TEXT) - 'fixed' or 'range'
- fixed_amount (DECIMAL)
- min_amount (DECIMAL)
- max_amount (DECIMAL)
- preference_shop (TEXT)
- additional_info (TEXT)
- preferred_contact_methods (ARRAY) - ['call', 'message', 'email']
- status (TEXT) - 'pending', 'accepted', 'completed', 'cancelled'
- helper_id (UUID) - References auth.users
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### `helpers` Table
```sql
- id (UUID, PRIMARY KEY)
- user_id (UUID) - References auth.users
- service_location (TEXT)
- service_latitude (DECIMAL)
- service_longitude (DECIMAL)
- service_radius (DECIMAL)
- service_radius_unit (TEXT) - 'km' or 'miles'
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### `helper_applications` Table
```sql
- id (UUID, PRIMARY KEY)
- user_id (UUID) - References auth.users
- full_name (TEXT)
- phone (TEXT)
- email (TEXT)
- id_type (TEXT) - 'aadhaar', 'pan', etc.
- id_number (TEXT)
- id_photo_url (TEXT)
- selfie_photo_url (TEXT)
- verification_status (TEXT) - 'pending', 'verified', 'failed', 'manual_review'
- verification_details (JSONB)
- status (TEXT) - 'pending', 'approved', 'rejected'
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### `counter_offers` Table
```sql
- id (UUID, PRIMARY KEY)
- request_id (UUID) - References help_requests
- helper_id (UUID) - References auth.users
- amount (DECIMAL)
- status (TEXT) - 'pending', 'accepted', 'rejected'
- created_at (TIMESTAMP)
```

### `conversations` Table
```sql
- id (TEXT, PRIMARY KEY)
- participant1_id (UUID) - References auth.users
- participant2_id (UUID) - References auth.users
- help_request_id (UUID) - References help_requests
- last_message_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

### `messages` Table
```sql
- id (UUID, PRIMARY KEY)
- conversation_id (TEXT) - References conversations
- sender_id (UUID) - References auth.users
- receiver_id (UUID) - References auth.users
- encrypted_content (TEXT)
- encryption_metadata (JSONB)
- created_at (TIMESTAMP)
```

### `reports` Table
```sql
- id (UUID, PRIMARY KEY)
- reporter_id (UUID) - References auth.users
- reported_user_id (UUID) - References auth.users
- report_type (TEXT)
- description (TEXT)
- status (TEXT) - 'pending', 'reviewed', 'resolved'
- created_at (TIMESTAMP)
```

---

## 🔐 Security Implementation

### Input Validation
- **Zod schemas** for all form inputs
- **Client-side validation** before submission
- **Server-side validation** via RLS policies

### Input Sanitization
- **XSS prevention** via HTML entity encoding
- **SQL injection prevention** via parameterized queries (Supabase)
- **File upload validation** (size, type)

### Authentication Security
- **Secure password requirements**
- **Email confirmation** for new accounts
- **OAuth 2.0** for Google sign-in
- **Session management** via Supabase

### Data Protection
- **Row Level Security (RLS)** on all tables
- **End-to-end encryption** for messages
- **Secure file storage** in Supabase Storage
- **No direct contact info exposure**

### Security Headers
- **Content Security Policy (CSP)**
- **X-Content-Type-Options**
- **X-Frame-Options**
- **X-XSS-Protection**
- **Referrer-Policy**
- **Permissions-Policy**

---

## 🚀 Deployment & Configuration

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAPBOX_TOKEN=your_mapbox_access_token
```

### Vercel Configuration
- **Automatic deployments** from GitHub
- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Node version**: Auto-detected

### Supabase Configuration
- **Database**: PostgreSQL with RLS
- **Storage buckets**: `helper_id_verification`
- **Authentication providers**: Email/Password, Google OAuth
- **Redirect URLs**: Configured for production domain

### Google OAuth Setup
1. Create OAuth 2.0 credentials in Google Cloud Console
2. Add authorized redirect URIs
3. Configure in Supabase Auth settings
4. Add client ID and secret to Supabase

### Mapbox Setup
1. Create account on Mapbox
2. Generate access token
3. Add to environment variables
4. Configure CSP headers to allow Mapbox

---

## 📱 User Flows

### New User Sign Up Flow
1. User visits homepage
2. Clicks "Request Help" or "Offer Help"
3. Redirected to `/auth`
4. Enters email/password or clicks Google
5. If email: receives confirmation email
6. If Google: redirected to Google OAuth
7. After auth: redirected to `/auth/callback`
8. `AuthCallback` checks profile completion
9. If incomplete: redirected to `/onboarding`
10. Completes onboarding (name, phone, location)
11. Redirected to homepage
12. Can now create requests or apply as helper

### Request Help Flow
1. User clicks "Request Help" on homepage
2. Redirected to `/request-help`
3. Form auto-fills from profile (name, phone, location)
4. User fills remaining fields:
   - Category, date, time, duration
   - Payment details
   - Preferred shop/store
   - Contact methods
   - Additional info
5. Submits form
6. Request saved to database
7. Summary screen shown
8. User can create new request or go to homepage
9. Request appears in "My Requests" page

### Offer Help Flow
1. User clicks "Offer Help" on homepage
2. Redirected to `/offer-help`
3. If not a helper:
   - Shows helper application form
   - User completes 3-step application
   - Application saved, status: "pending"
   - Shows "Application Under Review" message
4. If approved helper:
   - Shows nearby requests (within service radius)
   - Requests filtered by distance
   - User can contact requester or make counter offer
5. If helper but no service radius:
   - Shows service radius setup form
   - User sets location and radius
   - Then sees nearby requests

### Contact Requester Flow
1. Helper clicks "Contact Requester" on request card
2. `ContactModal` opens
3. Shows available contact methods (based on requester's preferences)
4. Helper clicks "Message"
5. `Chat` component opens
6. Conversation created (if first message)
7. Messages encrypted and sent
8. Real-time updates via Supabase
9. Both users can see conversation history

---

## 🔧 API Integrations

### Supabase
- **Authentication API**: Sign in, sign up, OAuth, password reset
- **Database API**: CRUD operations on all tables
- **Storage API**: File uploads (ID photos, selfies)
- **Real-time API**: WebSocket subscriptions for messages

### Mapbox
- **Geocoding API**: Address search and autocomplete
- **Map API**: Interactive maps, markers, click events
- **Directions API**: (Future) Route planning

### Google OAuth
- **OAuth 2.0**: User authentication
- **User Info**: Name, email, profile picture

---

## 🎨 Design System

### Colors
**Light Mode**:
- Background: White/Gray gradients
- Foreground: Black
- Muted: Gray
- Borders: Light gray

**Dark Mode**:
- Background: #0A0A0A (off-black)
- Foreground: #F5F5F5 (soft white)
- Cards: #1A1A1A with transparency
- Borders: #2A2A2A

### Typography
- **Font**: Inter (Google Fonts)
- **Sizes**: Responsive (sm, base, lg, xl, 2xl, 3xl, 4xl)
- **Weights**: Regular, Medium, Semibold, Bold

### Components
- **Liquid Glass**: Backdrop blur, transparency, subtle borders
- **Animations**: Smooth transitions, hover effects, fade-ins
- **Shadows**: Subtle, theme-aware

### Responsive Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px

---

## 📝 Key Concepts

### Row Level Security (RLS)
- Supabase feature that enforces database-level security
- Policies define who can read/write data
- Applied to all tables
- Users can only access their own data (with exceptions for public data)

### End-to-End Encryption
- Messages encrypted on client before sending
- Only sender and receiver can decrypt
- Server cannot read message content
- Uses Web Crypto API (browser-native)

### Service Radius
- Helpers define how far they're willing to travel
- Requests filtered by distance from helper's location
- Calculated using Haversine formula
- Units: kilometers or miles

### Profile Completion
- New users must complete profile before using app
- Required: Name, phone, location
- Checked on protected routes
- Redirects to onboarding if incomplete

---

## 🐛 Common Issues & Solutions

### Email Confirmation 404
**Issue**: Email confirmation links show 404
**Solution**: Update Supabase redirect URLs to include production domain

### Mapbox Not Loading
**Issue**: Map not visible, CSP errors
**Solution**: Add Mapbox domains to CSP headers in `vercel.json`

### Theme Switching After OAuth
**Issue**: Theme reverts after Google OAuth redirect
**Solution**: Theme preservation in localStorage and inline script (already implemented)

### Database Column Missing
**Issue**: Schema cache errors for new columns
**Solution**: Run SQL migrations in Supabase SQL Editor

### TypeScript Errors
**Issue**: Build fails with TypeScript errors
**Solution**: Add null checks (`user?.` instead of `user.`)

---

## 🚧 Future Enhancements

### Government ID Verification
- Integrate with Indian government ID APIs
- Automated verification
- Real-time status updates

### Admin Dashboard
- Helper approval interface
- Report review system
- User management
- Analytics

### Mobile App
- Capacitor integration
- Native iOS/Android apps
- Push notifications

### Additional Features
- Push notifications
- Rating/review system
- Advanced search filters
- Request categories expansion
- Payment integration (optional)

---

## 📚 Additional Resources

### Documentation Files
- `PROJECT_IMPLEMENTATION_SUMMARY.md` - High-level overview
- `STEP_BY_STEP_MOBILE_APP_GUIDE.md` - Mobile app development guide
- `HELPER_VERIFICATION_OPTIONS.md` - Verification options analysis
- `SECURITY.md` - Security best practices

### SQL Migration Files
- All migration files in root directory
- Run in Supabase SQL Editor in order

---

## 🎯 Summary

**Bringora** is a comprehensive, secure, and user-friendly platform for connecting people who need help with verified helpers in their community. The application features:

- ✅ Complete authentication system (Email/Password + Google OAuth)
- ✅ Profile management with auto-fill
- ✅ Help request creation and management
- ✅ Helper verification system
- ✅ End-to-end encrypted messaging
- ✅ Multi-language support
- ✅ Light/dark mode
- ✅ Responsive design
- ✅ Security best practices
- ✅ PWA support

All code is well-organized, type-safe, and follows best practices for security, accessibility, and user experience.

---

**Last Updated**: Based on latest implementation
**Version**: 1.0.0
**Status**: Production-ready (pending final verification API integration)



