# Government ID Verification Implementation Plan

## Chosen Solution: Government ID APIs (India)

### Primary Option: AI Parichay API (NIC)
- **Provider**: National Informatics Centre (NIC) - Government of India
- **Cost**: FREE (government-backed)
- **Supported IDs**: Aadhaar, PAN, Voter ID, Driving License, Passport, Ration Card
- **Features**: OCR extraction, data validation, photo extraction
- **Website**: https://ai.nic.in/AI/AIParichay

### Backup Options (If AI Parichay not available):
1. **Veri5Digital** - Paid but affordable ($0.10-$0.50 per verification)
2. **Surepass** - Paid
3. **IDfy** - Paid

---

## Implementation Plan

### Phase 1: Database Schema Updates
Add fields to `helper_applications` table:
- `id_type` (Aadhaar, PAN, Driving License, Passport, Voter ID)
- `id_number` (masked storage - only last 4 digits visible)
- `id_verified` (boolean - API verification status)
- `verification_api_response` (JSON - store API response)
- `verification_confidence` (0-100%)

### Phase 2: Form Updates
Update helper application form to collect:
1. ID Type (dropdown)
2. ID Number (with format validation)
3. ID Photo (existing)
4. Selfie with ID (existing)

### Phase 3: Validation
- **Aadhaar**: 12 digits, checksum validation
- **PAN**: 10 alphanumeric (A-Z, 0-9), format: ABCDE1234F
- **Driving License**: State-specific format validation
- **Passport**: Format validation
- **Voter ID**: Format validation

### Phase 4: API Integration
- Integrate with AI Parichay API (or backup)
- Extract data from ID photo
- Match extracted data with user input
- Verify ID number format
- Store verification result

### Phase 5: Auto-Approval Logic
- Auto-approve if:
  - ID number format valid
  - API verification successful
  - Extracted name matches user name
  - Photo matches selfie (face matching)
- Manual review if any check fails

---

## Data Collection Strategy

### Required Fields:
1. **ID Type** - Dropdown (Aadhaar, PAN, Driving License, Passport, Voter ID)
2. **ID Number** - Text input (with format validation)
3. **ID Photo** - File upload (existing)
4. **Selfie with ID** - File upload (existing)
5. **Full Name** - Auto-filled from profile
6. **Phone** - Already verified
7. **Email** - Already verified

### Privacy & Security:
- Store ID number encrypted (only last 4 digits visible)
- Mask ID number in UI (show only last 4 digits: XXXX XXXX 1234)
- Secure storage in Supabase
- Comply with Aadhaar Act 2016

---

## Next Steps

1. Update database schema
2. Update helper application form
3. Add ID number validation
4. Integrate AI Parichay API (or prepare for integration)
5. Update admin dashboard to show verification status

Ready to implement?


