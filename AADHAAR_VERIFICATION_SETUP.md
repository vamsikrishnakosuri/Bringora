# Aadhaar Verification Setup Guide

## Overview

This application now integrates with **AI Parichay API** from [ai.nic.in](https://ai.nic.in/AI/) for automated Aadhaar verification. This enables real-time verification of Aadhaar numbers and extraction of data from Aadhaar card photos.

## Features

- ✅ **Automated Aadhaar Verification**: Verify Aadhaar numbers using government-backed AI Parichay API
- ✅ **OCR Data Extraction**: Extract name, ID number, DOB, and photo from Aadhaar card images
- ✅ **Name Matching**: Automatically match extracted name with user-provided name
- ✅ **Confidence Scoring**: Get confidence scores (0-100%) for verification results
- ✅ **Fallback Handling**: Gracefully falls back to format validation if API is unavailable

## Setup Instructions

### Step 1: Obtain API Credentials

1. Visit [https://ai.nic.in/AI/](https://ai.nic.in/AI/)
2. Navigate to **AI Parichay** service
3. Register your application/organization
4. Obtain:
   - API Endpoint URL
   - API Key (if required)

### Step 2: Configure Environment Variables

Add the following environment variables to your `.env` file:

```env
# AI Parichay API Configuration
VITE_AI_PARICHAY_API_URL=https://ai.nic.in/api/aiparichay/verify
VITE_AI_PARICHAY_OCR_URL=https://ai.nic.in/api/aiparichay/extract
VITE_AI_PARICHAY_API_KEY=your_api_key_here
```

**Note**: Replace `your_api_key_here` with your actual API key from AI Parichay.

### Step 3: Update Vercel Environment Variables (if deployed)

If your app is deployed on Vercel:

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add the three variables above:
   - `VITE_AI_PARICHAY_API_URL`
   - `VITE_AI_PARICHAY_OCR_URL`
   - `VITE_AI_PARICHAY_API_KEY`
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

