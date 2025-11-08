/**
 * Government ID Verification Utilities for India
 * Supports: Aadhaar, PAN, Driving License, Passport, Voter ID, Ration Card
 */

export type IDType = 'aadhaar' | 'pan' | 'driving_license' | 'passport' | 'voter_id' | 'ration_card'

export interface IDVerificationResult {
  valid: boolean
  verified: boolean
  confidence?: number
  extractedData?: {
    name?: string
    dob?: string
    idNumber?: string
    photo?: string
  }
  error?: string
  method?: string
}

/**
 * Mask ID number for display (show only last 4 digits)
 */
export function maskIdNumber(idNumber: string, idType: IDType): string {
  if (!idNumber || idNumber.length < 4) return 'XXXX'
  
  const last4 = idNumber.slice(-4)
  
  switch (idType) {
    case 'aadhaar':
      // Format: XXXX XXXX 1234
      return `XXXX XXXX ${last4}`
    case 'pan':
      // Format: XXXXX1234X
      return `XXXXX${last4}`
    case 'driving_license':
    case 'passport':
    case 'voter_id':
    case 'ration_card':
      // Format: XXXX...1234
      const masked = 'X'.repeat(Math.max(0, idNumber.length - 4))
      return `${masked}${last4}`
    default:
      return `XXXX${last4}`
  }
}

/**
 * Validate ID number format (client-side validation)
 */
export function validateIdFormat(idNumber: string, idType: IDType): { valid: boolean; error?: string } {
  if (!idNumber || !idType) {
    return { valid: false, error: 'ID number and type are required' }
  }

  const cleaned = idNumber.replace(/\s+/g, '').toUpperCase()

  switch (idType) {
    case 'aadhaar':
      if (!/^\d{12}$/.test(cleaned)) {
        return { valid: false, error: 'Aadhaar must be exactly 12 digits' }
      }
      if (cleaned.startsWith('0') || cleaned.startsWith('1')) {
        return { valid: false, error: 'Aadhaar cannot start with 0 or 1' }
      }
      if (/^(\d)\1{11}$/.test(cleaned)) {
        return { valid: false, error: 'Invalid Aadhaar number' }
      }
      return { valid: true }

    case 'pan':
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleaned)) {
        return { valid: false, error: 'PAN must be in format: ABCDE1234F' }
      }
      return { valid: true }

    case 'driving_license':
      if (cleaned.length < 8 || cleaned.length > 20) {
        return { valid: false, error: 'Driving License must be 8-20 characters' }
      }
      if (!/^[A-Z0-9\/\-]+$/.test(cleaned)) {
        return { valid: false, error: 'Invalid Driving License format' }
      }
      return { valid: true }

    case 'passport':
      if (!/^[A-Z0-9]{8,9}$/.test(cleaned)) {
        return { valid: false, error: 'Passport must be 8-9 alphanumeric characters' }
      }
      return { valid: true }

    case 'voter_id':
      if (cleaned.length < 8 || cleaned.length > 20) {
        return { valid: false, error: 'Voter ID must be 8-20 characters' }
      }
      if (!/^[A-Z0-9\/\-]+$/.test(cleaned)) {
        return { valid: false, error: 'Invalid Voter ID format' }
      }
      return { valid: true }

    case 'ration_card':
      if (cleaned.length < 8 || cleaned.length > 25) {
        return { valid: false, error: 'Ration Card must be 8-25 characters' }
      }
      return { valid: true }

    default:
      return { valid: false, error: 'Unknown ID type' }
  }
}

/**
 * Get ID type display name
 */
export function getIdTypeDisplayName(idType: IDType): string {
  const names: Record<IDType, string> = {
    aadhaar: 'Aadhaar',
    pan: 'PAN Card',
    driving_license: 'Driving License',
    passport: 'Passport',
    voter_id: 'Voter ID',
    ration_card: 'Ration Card',
  }
  return names[idType] || idType
}

/**
 * Get ID type placeholder
 */
export function getIdTypePlaceholder(idType: IDType): string {
  const placeholders: Record<IDType, string> = {
    aadhaar: '1234 5678 9012',
    pan: 'ABCDE1234F',
    driving_license: 'DL-1234567890',
    passport: 'A12345678',
    voter_id: 'ABC1234567',
    ration_card: 'RC123456789',
  }
  return placeholders[idType] || 'Enter ID number'
}

/**
 * Verify Aadhaar using AI Parichay API from ai.nic.in
 * Reference: https://ai.nic.in/AI/
 */
export async function verifyAadhaarWithAPI(
  aadhaarNumber: string,
  idPhotoFile: File,
  userFullName: string
): Promise<IDVerificationResult> {
  // Validate Aadhaar format first
  const formatValidation = validateIdFormat(aadhaarNumber, 'aadhaar')
  
  if (!formatValidation.valid) {
    return {
      valid: false,
      verified: false,
      error: formatValidation.error,
      method: 'format_only',
    }
  }

  try {
    // Convert image file to base64 for API
    const base64Image = await fileToBase64(idPhotoFile)
    
    // AI Parichay API endpoint (to be configured with actual endpoint)
    // Note: Actual API endpoint needs to be obtained from ai.nic.in/AI/AIParichay
    const API_ENDPOINT = import.meta.env.VITE_AI_PARICHAY_API_URL || 'https://ai.nic.in/api/aiparichay/verify'
    const API_KEY = import.meta.env.VITE_AI_PARICHAY_API_KEY || ''

    // Prepare request payload
    const payload = {
      id_type: 'aadhaar',
      id_number: aadhaarNumber.replace(/\s+/g, ''),
      id_image: base64Image,
      user_name: userFullName,
    }

    // Call AI Parichay API
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` }),
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'API request failed' }))
      throw new Error(errorData.message || `API error: ${response.status}`)
    }

    const result = await response.json()

    // Parse API response
    // Expected response structure (adjust based on actual API):
    // {
    //   verified: boolean,
    //   confidence: number (0-100),
    //   extracted_data: {
    //     name: string,
    //     id_number: string,
    //     dob: string,
    //     photo: string (base64)
    //   },
    //   match_score: number
    // }

    const verified = result.verified === true || result.status === 'verified'
    const confidence = result.confidence || result.match_score || 0
    const extractedName = result.extracted_data?.name || result.name

    // Verify name match (fuzzy matching)
    const nameMatch = extractedName && 
      userFullName.toLowerCase().includes(extractedName.toLowerCase().split(' ')[0]) ||
      extractedName.toLowerCase().includes(userFullName.toLowerCase().split(' ')[0])

    return {
      valid: true,
      verified: verified && nameMatch,
      confidence: Math.min(100, Math.max(0, confidence)),
      extractedData: result.extracted_data || {
        name: extractedName,
        idNumber: result.extracted_data?.id_number || aadhaarNumber,
        dob: result.extracted_data?.dob,
        photo: result.extracted_data?.photo,
      },
      method: 'ai_parichay',
      error: verified && !nameMatch ? 'Name mismatch with ID' : undefined,
    }
  } catch (error: any) {
    console.error('Aadhaar verification API error:', error)
    
    // Fallback: Return format validation only if API fails
    return {
      valid: true,
      verified: false,
      confidence: 0,
      method: 'format_only',
      error: error.message || 'Verification API unavailable. Manual review required.',
    }
  }
}

/**
 * Verify ID using Government API
 * Supports multiple ID types with appropriate API calls
 */
export async function verifyIdWithAPI(
  idType: IDType,
  idNumber: string,
  idPhotoFile: File,
  userFullName: string
): Promise<IDVerificationResult> {
  // For Aadhaar, use AI Parichay API
  if (idType === 'aadhaar') {
    return await verifyAadhaarWithAPI(idNumber, idPhotoFile, userFullName)
  }

  // For other ID types, validate format only for now
  // Can be extended with specific APIs later
  const formatValidation = validateIdFormat(idNumber, idType)
  
  if (!formatValidation.valid) {
    return {
      valid: false,
      verified: false,
      error: formatValidation.error,
      method: 'format_only',
    }
  }

  // Other ID types: format validation only (can add API integration later)
  return {
    valid: true,
    verified: false,
    confidence: 0,
    method: 'format_only',
    error: `${getIdTypeDisplayName(idType)} verification API not yet integrated. Manual review required.`,
  }
}

/**
 * Extract data from ID photo using OCR via AI Parichay API
 * Reference: https://ai.nic.in/AI/
 */
export async function extractIdData(idPhotoFile: File, idType: IDType): Promise<{
  success: boolean
  data?: {
    name?: string
    idNumber?: string
    dob?: string
    photo?: string
  }
  error?: string
}> {
  try {
    // Convert image to base64
    const base64Image = await fileToBase64(idPhotoFile)
    
    // AI Parichay OCR endpoint
    const OCR_ENDPOINT = import.meta.env.VITE_AI_PARICHAY_OCR_URL || 'https://ai.nic.in/api/aiparichay/extract'
    const API_KEY = import.meta.env.VITE_AI_PARICHAY_API_KEY || ''

    const payload = {
      id_type: idType,
      image: base64Image,
    }

    const response = await fetch(OCR_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` }),
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`OCR API error: ${response.status}`)
    }

    const result = await response.json()

    // Parse extracted data
    return {
      success: true,
      data: {
        name: result.extracted_data?.name || result.name,
        idNumber: result.extracted_data?.id_number || result.id_number,
        dob: result.extracted_data?.dob || result.date_of_birth,
        photo: result.extracted_data?.photo || result.photo,
      },
    }
  } catch (error: any) {
    console.error('OCR extraction error:', error)
    return {
      success: false,
      error: error.message || 'OCR extraction failed',
    }
  }
}

/**
 * Helper function to convert File to base64
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1] // Remove data:image/...;base64, prefix
      resolve(base64String)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

