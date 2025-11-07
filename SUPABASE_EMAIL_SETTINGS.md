# Supabase Email Settings Guide

## Issue: Sign Up Not Working / Requires Email Confirmation

By default, Supabase requires users to confirm their email before they can sign in. This is a security feature, but you can adjust it for testing.

## Option 1: Keep Email Confirmation (Recommended for Production)

**This is the default and most secure option.**

When users sign up:
1. They receive a confirmation email
2. They click the link in the email
3. Their account is activated
4. They can then sign in

**The app now shows a success message telling users to check their email!**

## Option 2: Disable Email Confirmation (For Testing Only)

If you want to skip email confirmation for testing:

1. **Go to Supabase Dashboard**
   - Open your project
   - Go to **Authentication > Settings**

2. **Disable Email Confirmation**
   - Find **"Enable email confirmations"**
   - Toggle it **OFF**
   - Click **"Save"**

3. **Now users can sign up and sign in immediately without email confirmation**

⚠️ **Warning:** Only disable this for development/testing. For production, keep email confirmation enabled for security.

## Option 3: Use Magic Link (Passwordless)

You can also enable magic link authentication:

1. Go to **Authentication > Providers**
2. Enable **Email** provider
3. Users can sign in with just their email (no password needed)
4. They receive a magic link to sign in

## Testing Your Setup

1. **Try signing up** with a new email
2. **Check your email** (including spam folder) for the confirmation link
3. **Click the confirmation link**
4. **Return to the app** and sign in

## Troubleshooting

### "User already registered" error
- The email is already in use
- Try signing in instead, or use a different email

### Not receiving confirmation email
- Check spam/junk folder
- Verify email address is correct
- Check Supabase dashboard > Authentication > Users to see if user was created
- Check Supabase dashboard > Settings > Auth for email settings

### Email confirmation link not working
- Make sure you copied the full link
- Check if the link expired (usually valid for 24 hours)
- Try requesting a new confirmation email

## Quick Fix for Development

If you just want to test quickly without email confirmation:

1. Disable email confirmation in Supabase (as shown above)
2. Sign up with any email
3. You'll be signed in immediately
4. **Remember to re-enable it before going to production!**

---

The app is now updated to show a clear success message after signup, guiding users to check their email! ✅

