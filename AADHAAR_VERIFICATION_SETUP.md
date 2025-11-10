# Government ID Verification Setup Guide

## Overview

This application uses **FREE Government APIs from API Setu** (Government of India) for automated ID verification. API Setu provides access to 973+ free APIs from 300+ government departments, including PAN, Aadhaar, Driving License, Vehicle Registration, and more.

**Website**: https://directory.apisetu.gov.in/

## Features

- ✅ **FREE Government APIs**: Use official API Setu APIs (no cost!)
- ✅ **Multi-ID Support**: Aadhaar, PAN, Driving License, and more
- ✅ **Automated Verification**: Verify IDs using government databases
- ✅ **Name Matching**: Automatically match extracted name with user-provided name
- ✅ **Confidence Scoring**: Get confidence scores (0-100%) for verification results
- ✅ **Fallback Handling**: Gracefully falls back to format validation if API is unavailable
- ✅ **Alternative Providers**: Support for paid alternatives (Surepass, IDfy, Veri5Digital) if needed

## Available API Providers

### 1. **API Setu** (Recommended - FREE Government APIs) ⭐⭐⭐
- **Website**: https://directory.apisetu.gov.in/
- **Cost**: **FREE** (government-backed)
- **Setup**: Free registration at apisetu.gov.in
- **Features**: 
  - ✅ Aadhaar e-KYC verification
  - ✅ PAN card verification (NSDL/Income Tax Department)
  - ✅ Driving License verification (Ministry of Road Transport)
  - ✅ Vehicle Registration & Tax APIs
  - ✅ 973+ other government APIs
- **Why Use This**: It's free, official, and government-backed!

### 2. **Surepass** (Paid Alternative)
- **Website**: https://www.surepass.io/
- **Cost**: Paid (affordable pricing)
- **Setup**: Easy registration, quick API access
- **Features**: Aadhaar verification, OCR extraction, name matching

### 3. **IDfy** (Paid Alternative)
- **Website**: https://www.idfy.com/
- **Cost**: Paid
- **Features**: Comprehensive verification services

### 4. **Veri5Digital** (Paid Alternative)
- **Website**: https://www.veri5digital.com/
- **Cost**: Paid (affordable: $0.10-$0.50 per verification)
- **Features**: Fast verification, good documentation

### 5. **AI Parichay** (Government - If Accessible)
- **Website**: https://ai.nic.in/AI/ (may not be accessible)
- **Cost**: FREE (government-backed)
- **Note**: Currently inaccessible for external users

## Setup Instructions

### Step 1: Get FREE API Key from API Setu (Recommended)

1. Visit **https://directory.apisetu.gov.in/**
2. Browse available APIs:
   - **Aadhaar e-KYC**: Search for "UIDAI" or "Aadhaar"
   - **PAN Verification**: Search for "NSDL" or "Income Tax"
   - **Driving License**: Search for "Transport" or "Driving License"
3. Register for free API access
4. Get your API key from the dashboard
5. Note the exact API endpoint URLs for each service

### Step 2: Configure Environment Variables

Add the following environment variables to your `.env` file:

#### Option A: Using API Setu (FREE - Recommended) ⭐
```env
# Verification API Provider (default is api_setu)
VITE_VERIFICATION_API_PROVIDER=api_setu

# API Setu Configuration (FREE Government APIs)
VITE_API_SETU_API_KEY=your_api_setu_key_here
VITE_API_SETU_AADHAAR_URL=https://api.apisetu.gov.in/uidai/aadhaar/ekyc
VITE_API_SETU_PAN_URL=https://api.apisetu.gov.in/incometax/pan/verify
VITE_API_SETU_DL_URL=https://api.apisetu.gov.in/transport/drivinglicense/verify
```

**Note**: 
- Get your free API key from https://directory.apisetu.gov.in/
- API endpoints may vary - check the directory for exact URLs
- All APIs are **FREE** to use!

#### Option B: Using Surepass (Paid Alternative)
```env
# Verification API Provider
VITE_VERIFICATION_API_PROVIDER=surepass

# Surepass API Configuration
VITE_SUREPASS_API_URL=https://api.surepass.io/api/v1/aadhaar/verify
VITE_SUREPASS_API_KEY=your_surepass_api_key_here
```

#### Option C: Using IDfy (Paid Alternative)
```env
# Verification API Provider
VITE_VERIFICATION_API_PROVIDER=idfy

# IDfy API Configuration
VITE_IDFY_API_URL=https://api.idfy.com/v1/aadhaar/verify
VITE_IDFY_API_KEY=your_idfy_api_key_here
```

#### Option D: Using Veri5Digital (Paid Alternative)
```env
# Verification API Provider
VITE_VERIFICATION_API_PROVIDER=veri5digital

# Veri5Digital API Configuration
VITE_VERI5_API_URL=https://api.veri5digital.com/v1/aadhaar/verify
VITE_VERI5_API_KEY=your_veri5_api_key_here
```

**Note**: Replace `your_*_api_key_here` with your actual API key from the chosen provider.

### Step 3: Update Vercel Environment Variables (if deployed)

If your app is deployed on Vercel:

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add the variables based on your chosen provider:
   
   **For Surepass:**
   - `VITE_VERIFICATION_API_PROVIDER=surepass`
   - `VITE_SUREPASS_API_KEY=your_key`
   
   **For IDfy:**
   - `VITE_VERIFICATION_API_PROVIDER=idfy`
   - `VITE_IDFY_API_KEY=your_key`
   
   **For Veri5Digital:**
   - `VITE_VERIFICATION_API_PROVIDER=veri5digital`
   - `VITE_VERI5_API_KEY=your_key`
   
4. Redeploy your application

### Step 4: Verify Database Schema

Ensure your `helper_applications` table has the following columns (run the migration if needed):

```sql
-- Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'helper_applications' 
AND column_name IN (
  'id_verified', 
  'verification_method', 
  'verification_confidence', 
  'verification_api_response',
  'verified_at'
);
```

If columns are missing, run:
```bash
# Run the migration file
psql -f ADD_GOVERNMENT_ID_VERIFICATION.sql
```

## How It Works

### Verification Flow

1. **User Submits Application**:
   - User selects Aadhaar as ID type
   - Enters Aadhaar number (12 digits)
   - Uploads Aadhaar card photo
   - Uploads selfie with ID

2. **Format Validation**:
   - Validates Aadhaar format (12 digits, no leading 0/1, not all same digits)
   - If invalid, shows error immediately

3. **API Verification** (if format valid):
   - Converts ID photo to base64
   - Sends to AI Parichay API with:
     - Aadhaar number
     - ID photo (base64)
     - User's full name
   - API performs:
     - OCR extraction (name, ID number, DOB, photo)
     - ID number validation
     - Name matching

4. **Result Processing**:
   - If verified: `id_verified = true`, confidence score stored
   - If failed: `id_verified = false`, error reason stored
   - If API unavailable: Falls back to format validation only

5. **Database Storage**:
   - Full verification result stored in `verification_api_response` (JSON)
   - Confidence score stored in `verification_confidence`
   - Verification method stored in `verification_method` (`ai_parichay` or `format_only`)

### API Response Structure

The API is expected to return:

```json
{
  "verified": true,
  "confidence": 95,
  "extracted_data": {
    "name": "John Doe",
    "id_number": "123456789012",
    "dob": "1990-01-01",
    "photo": "base64_encoded_photo"
  },
  "match_score": 95
}
```

## Code Structure

### Key Files

- **`src/lib/idVerification.ts`**:
  - `verifyAadhaarWithAPI()`: Main Aadhaar verification function
  - `verifyIdWithAPI()`: Generic ID verification (routes to appropriate API)
  - `extractIdData()`: OCR extraction from ID photos
  - `fileToBase64()`: Helper to convert File to base64

- **`src/components/HelperApplicationForm.tsx`**:
  - Calls verification API on form submission
  - Stores verification results in database
  - Shows appropriate success/error messages

## Testing

### Test Without API (Format Validation Only)

If API credentials are not configured, the system will:
- Still validate Aadhaar format
- Store application with `verification_method = 'format_only'`
- Require manual admin review

### Test With API

1. Ensure environment variables are set
2. Submit a helper application with:
   - Valid Aadhaar number (12 digits)
   - Clear Aadhaar card photo
   - Name matching the ID
3. Check console logs for API response
4. Verify database record has:
   - `id_verified = true/false`
   - `verification_method = 'ai_parichay'`
   - `verification_api_response` with full result

## Error Handling

The system handles various error scenarios:

1. **API Unavailable**: Falls back to format validation
2. **Invalid API Response**: Logs error, continues with format validation
3. **Name Mismatch**: Verification fails but application still submitted
4. **Network Errors**: Gracefully handles and continues

## Privacy & Security

- ✅ Aadhaar numbers are stored encrypted (implement encryption in production)
- ✅ Only last 4 digits displayed in UI (`XXXX XXXX 1234`)
- ✅ Full API responses stored securely in database
- ✅ Complies with Aadhaar Act 2016 requirements
- ✅ No Aadhaar data sent to third-party services (only government API)

## Troubleshooting

### API Not Working

1. **Check Environment Variables**:
   ```bash
   # In browser console
   console.log(import.meta.env.VITE_AI_PARICHAY_API_URL)
   ```

2. **Check API Endpoint**: Verify the endpoint URL is correct
3. **Check API Key**: Ensure API key is valid and not expired
4. **Check CORS**: Ensure API allows requests from your domain

### Verification Always Fails

1. **Check Image Quality**: Ensure Aadhaar photo is clear and readable
2. **Check Name Matching**: Verify user's name matches ID exactly
3. **Check API Response**: Review `verification_api_response` in database
4. **Check Console Logs**: Look for API error messages

### Database Errors

1. **Check Schema**: Ensure all columns exist
2. **Check Permissions**: Ensure Supabase RLS policies allow inserts
3. **Check Data Types**: Verify JSONB column for `verification_api_response`

## Next Steps

1. **Get API Credentials**: Register with AI Parichay at [ai.nic.in](https://ai.nic.in/AI/)
2. **Configure Environment**: Add environment variables
3. **Test Integration**: Submit test application
4. **Monitor Results**: Check verification success rate
5. **Optimize**: Adjust confidence thresholds if needed

## Support

For issues with:
- **AI Parichay API**: Contact NIC support at [ai.nic.in](https://ai.nic.in/AI/)
- **Application Integration**: Check code comments in `src/lib/idVerification.ts`
- **Database Issues**: Review migration files and schema

---

**Last Updated**: Implementation complete with AI Parichay API integration
**Status**: ✅ Ready for API credential configuration


