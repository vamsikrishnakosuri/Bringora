# Security Documentation

## Overview

Bringora implements comprehensive security measures to protect user data, prevent attacks, and ensure a safe user experience. This document outlines all security features and best practices.

## Table of Contents

1. [Input Validation](#input-validation)
2. [XSS Prevention](#xss-prevention)
3. [SQL Injection Prevention](#sql-injection-prevention)
4. [File Upload Security](#file-upload-security)
5. [Authentication & Authorization](#authentication--authorization)
6. [Rate Limiting](#rate-limiting)
7. [Content Security Policy](#content-security-policy)
8. [Data Sanitization](#data-sanitization)
9. [Environment Variables](#environment-variables)
10. [Best Practices](#best-practices)

---

## Input Validation

### Email Validation
- **Location**: `src/lib/validation.ts`
- **Schema**: `emailSchema`
- **Rules**:
  - Must contain `@` symbol
  - Must have a valid domain with `.`
  - Maximum 255 characters
  - Valid email format

### Phone Number Validation
- **Location**: `src/lib/validation.ts`
- **Schema**: `phoneSchema`
- **Rules**:
  - 10-13 digits (international format)
  - Supports various formats: `+91 1234567890`, `(123) 456-7890`, etc.
  - Additional validation in `src/lib/security.ts` using `validatePhoneNumber()`

### Name Validation
- **Location**: `src/lib/validation.ts`
- **Schema**: `nameSchema`
- **Rules**:
  - 2-100 characters
  - Only letters, spaces, hyphens, apostrophes
  - Supports Unicode characters (Indian languages, accented characters)
  - Automatically trims and normalizes whitespace

### Password Validation
- **Location**: `src/lib/validation.ts`
- **Schema**: `passwordSchema`
- **Rules**:
  - Minimum 8 characters
  - Maximum 128 characters
  - Must contain:
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number

### Amount Validation
- **Location**: `src/lib/validation.ts`
- **Schema**: `amountSchema`
- **Rules**:
  - Valid number format (e.g., `100` or `100.50`)
  - Range: ₹1 to ₹1,00,00,000
  - Prevents negative values

### Location Validation
- **Location**: `src/lib/validation.ts`
- **Schema**: `locationSchema`
- **Rules**:
  - Address: 5-500 characters
  - Latitude: -90 to 90
  - Longitude: -180 to 180
  - Coordinate validation in `src/lib/security.ts`

### Date/Time Validation
- **Date**: Must be today or in the future
- **Time**: Must be in HH:MM format (24-hour)
- **Duration**: 1-168 hours (1 week max)

---

## XSS Prevention

### Input Sanitization
- **Location**: `src/lib/security.ts`
- **Function**: `sanitizeInput()`
- **Removes**:
  - `<` and `>` characters
  - `javascript:` protocol
  - Event handlers (`onclick`, `onerror`, etc.)

### HTML Sanitization
- **Location**: `src/lib/security.ts`
- **Function**: `sanitizeHTML()`
- **Removes**:
  - `<script>` tags and content
  - Event handlers
  - `javascript:` protocol

### HTML Escaping
- **Location**: `src/lib/security.ts`
- **Function**: `escapeHTML()`
- **Escapes**: `&`, `<`, `>`, `"`, `'`

### Implementation
All user inputs are sanitized before:
- Saving to database
- Displaying in UI
- Sending in API requests

**Example**:
```typescript
const sanitizedName = sanitizeInput(fullName.trim())
```

---

## SQL Injection Prevention

### Supabase Protection
- Supabase uses parameterized queries by default
- All database operations use Supabase client methods
- No raw SQL queries in application code

### Row Level Security (RLS)
- **Location**: `supabase-schema.sql`
- All tables have RLS enabled
- Users can only access their own data
- Admin policies for moderation

### Best Practices
- Never concatenate user input into SQL queries
- Always use Supabase client methods
- Validate data before database operations

---

## File Upload Security

### File Type Validation
- **Location**: `src/lib/security.ts`
- **Function**: `isValidImageFile()`
- **Allowed Types**:
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/webp`
- **Max Size**: 5MB

### File Name Sanitization
- **Location**: `src/lib/security.ts`
- **Function**: `sanitizeFileName()`
- **Removes**:
  - Invalid characters
  - Path traversal attempts (`..`)
  - Limits length to 255 characters

### Secure File Naming
- **Location**: `src/lib/security.ts`
- **Function**: `generateSecureFileName()`
- **Format**: `{userId}_{timestamp}_{sanitizedOriginalName}.{extension}`
- Prevents:
  - File name collisions
  - Path traversal
  - Unauthorized access

### Storage
- Files stored in Supabase Storage
- Private buckets with RLS policies
- Access controlled by user ID

---

## Authentication & Authorization

### Authentication Methods
1. **Email/Password**
   - Password validation (8+ chars, uppercase, lowercase, number)
   - Email confirmation (configurable)
   - Password reset via email

2. **Google OAuth**
   - Secure OAuth 2.0 flow
   - Redirect URL validation
   - Token management by Supabase

### Session Management
- Secure session tokens
- Auto-refresh tokens
- Session persistence
- Protected routes

### Authorization
- **Protected Routes**: `src/components/ProtectedRoute.tsx`
- **Profile Check**: `src/components/ProfileCheck.tsx`
- **Admin Routes**: Require admin role

### Best Practices
- Never store passwords in plain text
- Use Supabase Auth for all authentication
- Validate user permissions on every request
- Implement proper logout

---

## Rate Limiting

### Client-Side Rate Limiting
- **Location**: `src/lib/security.ts`
- **Function**: `checkRateLimit()`
- **Purpose**: Prevent abuse on client-side
- **Note**: Real rate limiting should be implemented server-side

### Recommended Server-Side Limits
- **Supabase**: Configure rate limits in Supabase dashboard
- **API Endpoints**: 100 requests per minute per user
- **File Uploads**: 10 uploads per hour per user
- **Authentication**: 5 attempts per 15 minutes

### Implementation
```typescript
const key = `rate_limit_${userId}_${action}`
const allowed = checkRateLimit(key, 10, 60000) // 10 requests per minute
```

---

## Content Security Policy

### CSP Header
- **Location**: `src/lib/security.ts`
- **Function**: `getCSPHeader()`
- **Policies**:
  - `default-src 'self'`
  - `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://*.mapbox.com`
  - `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`
  - `font-src 'self' https://fonts.gstatic.com`
  - `img-src 'self' data: https: blob:`
  - `connect-src 'self' https://*.supabase.co https://*.mapbox.com wss://*.supabase.co`
  - `frame-src 'self' https://*.supabase.co`
  - `object-src 'none'`
  - `base-uri 'self'`
  - `form-action 'self'`
  - `frame-ancestors 'none'`
  - `upgrade-insecure-requests`

### Implementation
Add CSP header in:
- Vercel: `vercel.json`
- Netlify: `netlify.toml`
- Nginx: `nginx.conf`

---

## Data Sanitization

### Before Database Insert
All user inputs are sanitized:
```typescript
const sanitizedName = sanitizeInput(fullName.trim())
const sanitizedPhone = phone.trim()
const sanitizedAddress = sanitizeInput(location.address)
```

### Before Display
- HTML entities are escaped
- XSS vectors are removed
- User-generated content is sanitized

### Location Data
- Coordinates validated: `validateCoordinates()`
- Address sanitized: `sanitizeInput()`
- Prevents coordinate injection

---

## Environment Variables

### Required Variables
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_MAPBOX_TOKEN`: Mapbox access token

### Security
- **Never commit** `.env` files
- Use `.env.example` for documentation
- Store secrets in:
  - Vercel: Environment Variables
  - Netlify: Site Settings
  - Supabase: Project Settings

### Access Control
- Use `VITE_` prefix for client-side variables
- Server-side secrets should never be exposed
- Rotate keys regularly

---

## Best Practices

### 1. Always Validate Input
```typescript
// ✅ Good
try {
  emailSchema.parse(email)
} catch (err) {
  setError(err.errors[0].message)
}

// ❌ Bad
if (email.includes('@')) {
  // proceed
}
```

### 2. Sanitize Before Storage
```typescript
// ✅ Good
const sanitized = sanitizeInput(userInput)
await supabase.from('table').insert({ data: sanitized })

// ❌ Bad
await supabase.from('table').insert({ data: userInput })
```

### 3. Use Type-Safe Schemas
```typescript
// ✅ Good
const validated = requestHelpSchema.parse(formData)

// ❌ Bad
const data = { ...formData } // No validation
```

### 4. Validate File Uploads
```typescript
// ✅ Good
if (!isValidImageFile(file)) {
  showToast('Invalid file type or size', 'error')
  return
}

// ❌ Bad
if (file.type.startsWith('image/')) {
  // proceed
}
```

### 5. Secure File Names
```typescript
// ✅ Good
const secureName = generateSecureFileName(originalName, userId)

// ❌ Bad
const fileName = originalName // Vulnerable to path traversal
```

### 6. Validate Coordinates
```typescript
// ✅ Good
if (!validateCoordinates(lat, lng)) {
  setError('Invalid location')
  return
}

// ❌ Bad
const location = { lat, lng } // No validation
```

### 7. Check Rate Limits
```typescript
// ✅ Good
if (!checkRateLimit(key, 10, 60000)) {
  showToast('Too many requests. Please wait.', 'error')
  return
}

// ❌ Bad
// No rate limiting
```

---

## Security Checklist

### Before Deployment
- [ ] All environment variables are set
- [ ] CSP headers are configured
- [ ] Rate limiting is enabled (server-side)
- [ ] File upload validation is working
- [ ] Input sanitization is applied
- [ ] RLS policies are enabled
- [ ] Authentication is tested
- [ ] Password requirements are enforced
- [ ] Error messages don't leak sensitive info
- [ ] HTTPS is enabled

### Regular Maintenance
- [ ] Review and update dependencies
- [ ] Rotate API keys and secrets
- [ ] Monitor for security vulnerabilities
- [ ] Review access logs
- [ ] Update security policies
- [ ] Test authentication flows
- [ ] Verify RLS policies

---

## Reporting Security Issues

If you discover a security vulnerability, please:
1. **Do NOT** create a public GitHub issue
2. Email security concerns to: [your-email@example.com]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

**Last Updated**: 2024
**Version**: 1.0.0

