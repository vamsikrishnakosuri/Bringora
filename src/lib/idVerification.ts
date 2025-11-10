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
 * Verify Aadhaar using available verification APIs
 * Supports multiple providers: Surepass, IDfy, Veri5Digital, or AI Parichay
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

  // Get API provider from environment (default: 'api_setu' - free government APIs)
  const API_PROVIDER = (import.meta.env.VITE_VERIFICATION_API_PROVIDER || 'api_setu').toLowerCase()
  
  try {
    // Convert image file to base64 for API
    const base64Image = await fileToBase64(idPhotoFile)
    const cleanedAadhaar = aadhaarNumber.replace(/\s+/g, '')
    
    let result: IDVerificationResult

    // Try different API providers based on configuration
    switch (API_PROVIDER) {
      case 'api_setu':
        result = await verifyWithAPISetu(cleanedAadhaar, base64Image, userFullName)
        break
      case 'surepass':
        result = await verifyWithSurepass(cleanedAadhaar, base64Image, userFullName)
        break
      case 'idfy':
        result = await verifyWithIDfy(cleanedAadhaar, base64Image, userFullName)
        break
      case 'veri5digital':
        result = await verifyWithVeri5Digital(cleanedAadhaar, base64Image, userFullName)
        break
      case 'ai_parichay':
        result = await verifyWithAIParichay(cleanedAadhaar, base64Image, userFullName)
        break
      default:
        // Fallback to format validation only
        return {
          valid: true,
          verified: false,
          confidence: 0,
          method: 'format_only',
          error: `API provider '${API_PROVIDER}' not configured. Manual review required.`,
        }
    }

    return result
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
 * Verify with API Setu (Government of India - FREE)
 * Website: https://directory.apisetu.gov.in/
 * This is the recommended provider as it's free and government-backed
 */
async function verifyWithAPISetu(
  aadhaarNumber: string,
  base64Image: string,
  userFullName: string
): Promise<IDVerificationResult> {
  // API Setu Aadhaar e-KYC endpoint
  // Note: Actual endpoint may vary - check https://directory.apisetu.gov.in/ for latest
  const API_ENDPOINT = import.meta.env.VITE_API_SETU_AADHAAR_URL || 'https://api.apisetu.gov.in/uidai/aadhaar/ekyc'
  const API_KEY = import.meta.env.VITE_API_SETU_API_KEY || ''

  // API Setu may require API key (free registration at apisetu.gov.in)
  if (!API_KEY) {
    console.warn('API Setu API key not configured. Visit https://directory.apisetu.gov.in/ to get free API key')
    // Still try without key (some endpoints may work without auth)
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(API_KEY && { 'X-API-Key': API_KEY }),
      },
      body: JSON.stringify({
        aadhaar_number: aadhaarNumber,
        // Some APIs may accept image, others may only accept Aadhaar number
        image: base64Image,
      }),
    })

    if (!response.ok) {
      // If API requires different format, try alternative endpoint
      if (response.status === 404 || response.status === 401) {
        throw new Error('API Setu endpoint not configured. Please check https://directory.apisetu.gov.in/ for correct endpoint')
      }
      const errorData = await response.json().catch(() => ({ message: 'API request failed' }))
      throw new Error(errorData.message || `API Setu error: ${response.status}`)
    }

    const result = await response.json()
    
    // Parse API Setu response (structure may vary)
    const verified = result.status === 'success' || result.verified === true || result.kyc_status === 'verified'
    const extractedName = result.full_name || result.name || result.kyc_data?.name

    // Name matching
    const nameMatch = extractedName && 
      (userFullName.toLowerCase().includes(extractedName.toLowerCase().split(' ')[0]) ||
       extractedName.toLowerCase().includes(userFullName.toLowerCase().split(' ')[0]))

    return {
      valid: true,
      verified: verified && nameMatch,
      confidence: result.confidence_score || result.match_score || (verified ? 90 : 0),
      extractedData: {
        name: extractedName,
        idNumber: aadhaarNumber,
        dob: result.date_of_birth || result.dob || result.kyc_data?.dob,
      },
      method: 'api_setu',
      error: verified && !nameMatch ? 'Name mismatch with ID' : undefined,
    }
  } catch (error: any) {
    console.error('API Setu verification error:', error)
    // Fallback gracefully
    throw error
  }
}

/**
 * Verify with Surepass API (Paid alternative)
 * Website: https://www.surepass.io/
 */
async function verifyWithSurepass(
  aadhaarNumber: string,
  base64Image: string,
  userFullName: string
): Promise<IDVerificationResult> {
  const API_ENDPOINT = import.meta.env.VITE_SUREPASS_API_URL || 'https://api.surepass.io/api/v1/aadhaar/verify'
  const API_KEY = import.meta.env.VITE_SUREPASS_API_KEY || ''

  if (!API_KEY) {
    throw new Error('Surepass API key not configured')
  }

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      aadhaar_number: aadhaarNumber,
      image: base64Image,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'API request failed' }))
    throw new Error(errorData.message || `API error: ${response.status}`)
  }

  const result = await response.json()
  const verified = result.status === 'success' || result.verified === true
  const extractedName = result.full_name || result.name

  // Name matching
  const nameMatch = extractedName && 
    (userFullName.toLowerCase().includes(extractedName.toLowerCase().split(' ')[0]) ||
     extractedName.toLowerCase().includes(userFullName.toLowerCase().split(' ')[0]))

  return {
    valid: true,
    verified: verified && nameMatch,
    confidence: result.confidence_score || (verified ? 85 : 0),
    extractedData: {
      name: extractedName,
      idNumber: aadhaarNumber,
      dob: result.date_of_birth || result.dob,
    },
    method: 'surepass',
    error: verified && !nameMatch ? 'Name mismatch with ID' : undefined,
  }
}

/**
 * Verify with IDfy API
 * Website: https://www.idfy.com/
 */
async function verifyWithIDfy(
  aadhaarNumber: string,
  base64Image: string,
  userFullName: string
): Promise<IDVerificationResult> {
  const API_ENDPOINT = import.meta.env.VITE_IDFY_API_URL || 'https://api.idfy.com/v1/aadhaar/verify'
  const API_KEY = import.meta.env.VITE_IDFY_API_KEY || ''

  if (!API_KEY) {
    throw new Error('IDfy API key not configured')
  }

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      aadhaar_number: aadhaarNumber,
      image: base64Image,
    }),
  })

  if (!response.ok) {
    throw new Error(`IDfy API error: ${response.status}`)
  }

  const result = await response.json()
  const verified = result.status === 'success' || result.verified === true

  return {
    valid: true,
    verified,
    confidence: result.confidence || (verified ? 80 : 0),
    method: 'idfy',
  }
}

/**
 * Verify with Veri5Digital API
 * Website: https://www.veri5digital.com/
 */
async function verifyWithVeri5Digital(
  aadhaarNumber: string,
  base64Image: string,
  userFullName: string
): Promise<IDVerificationResult> {
  const API_ENDPOINT = import.meta.env.VITE_VERI5_API_URL || 'https://api.veri5digital.com/v1/aadhaar/verify'
  const API_KEY = import.meta.env.VITE_VERI5_API_KEY || ''

  if (!API_KEY) {
    throw new Error('Veri5Digital API key not configured')
  }

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({
      aadhaar: aadhaarNumber,
      image: base64Image,
    }),
  })

  if (!response.ok) {
    throw new Error(`Veri5Digital API error: ${response.status}`)
  }

  const result = await response.json()
  const verified = result.verified === true

  return {
    valid: true,
    verified,
    confidence: result.confidence || (verified ? 80 : 0),
    method: 'veri5digital',
  }
}

/**
 * Verify with AI Parichay API (if accessible)
 * Reference: https://ai.nic.in/AI/
 */
async function verifyWithAIParichay(
  aadhaarNumber: string,
  base64Image: string,
  userFullName: string
): Promise<IDVerificationResult> {
  const API_ENDPOINT = import.meta.env.VITE_AI_PARICHAY_API_URL || 'https://ai.nic.in/api/aiparichay/verify'
  const API_KEY = import.meta.env.VITE_AI_PARICHAY_API_KEY || ''

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` }),
    },
    body: JSON.stringify({
      id_type: 'aadhaar',
      id_number: aadhaarNumber,
      id_image: base64Image,
      user_name: userFullName,
    }),
  })

  if (!response.ok) {
    throw new Error(`AI Parichay API error: ${response.status}`)
  }

  const result = await response.json()
  const verified = result.verified === true || result.status === 'verified'
  const extractedName = result.extracted_data?.name || result.name

  const nameMatch = extractedName && 
    (userFullName.toLowerCase().includes(extractedName.toLowerCase().split(' ')[0]) ||
     extractedName.toLowerCase().includes(userFullName.toLowerCase().split(' ')[0]))

  return {
    valid: true,
    verified: verified && nameMatch,
    confidence: result.confidence || result.match_score || 0,
    extractedData: result.extracted_data || {
      name: extractedName,
      idNumber: aadhaarNumber,
      dob: result.extracted_data?.dob,
    },
    method: 'ai_parichay',
    error: verified && !nameMatch ? 'Name mismatch with ID' : undefined,
  }
}

/**
 * Verify PAN using API Setu (Government of India - FREE)
 * Reference: https://directory.apisetu.gov.in/
 */
async function verifyPANWithAPISetu(
  panNumber: string,
  userFullName: string
): Promise<IDVerificationResult> {
  const API_ENDPOINT = import.meta.env.VITE_API_SETU_PAN_URL || 'https://api.apisetu.gov.in/incometax/pan/verify'
  const API_KEY = import.meta.env.VITE_API_SETU_API_KEY || ''

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(API_KEY && { 'X-API-Key': API_KEY }),
      },
      body: JSON.stringify({
        pan: panNumber,
      }),
    })

    if (!response.ok) {
      throw new Error(`API Setu PAN verification error: ${response.status}`)
    }

    const result = await response.json()
    const verified = result.status === 'success' || result.valid === true
    const extractedName = result.name || result.full_name

    const nameMatch = extractedName && 
      (userFullName.toLowerCase().includes(extractedName.toLowerCase().split(' ')[0]) ||
       extractedName.toLowerCase().includes(userFullName.toLowerCase().split(' ')[0]))

    return {
      valid: true,
      verified: verified && nameMatch,
      confidence: verified ? 90 : 0,
      extractedData: {
        name: extractedName,
        idNumber: panNumber,
      },
      method: 'api_setu',
      error: verified && !nameMatch ? 'Name mismatch with PAN' : undefined,
    }
  } catch (error: any) {
    console.error('API Setu PAN verification error:', error)
    throw error
  }
}

/**
 * Verify Driving License using API Setu (Government of India - FREE)
 * Reference: https://directory.apisetu.gov.in/
 */
async function verifyDrivingLicenseWithAPISetu(
  dlNumber: string,
  dob: string,
  userFullName: string
): Promise<IDVerificationResult> {
  const API_ENDPOINT = import.meta.env.VITE_API_SETU_DL_URL || 'https://api.apisetu.gov.in/transport/drivinglicense/verify'
  const API_KEY = import.meta.env.VITE_API_SETU_API_KEY || ''

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(API_KEY && { 'X-API-Key': API_KEY }),
      },
      body: JSON.stringify({
        dl_number: dlNumber,
        date_of_birth: dob,
      }),
    })

    if (!response.ok) {
      throw new Error(`API Setu DL verification error: ${response.status}`)
    }

    const result = await response.json()
    const verified = result.status === 'success' || result.valid === true
    const extractedName = result.name || result.full_name

    const nameMatch = extractedName && 
      (userFullName.toLowerCase().includes(extractedName.toLowerCase().split(' ')[0]) ||
       extractedName.toLowerCase().includes(userFullName.toLowerCase().split(' ')[0]))

    return {
      valid: true,
      verified: verified && nameMatch,
      confidence: verified ? 90 : 0,
      extractedData: {
        name: extractedName,
        idNumber: dlNumber,
        dob: result.date_of_birth || dob,
      },
      method: 'api_setu',
      error: verified && !nameMatch ? 'Name mismatch with Driving License' : undefined,
    }
  } catch (error: any) {
    console.error('API Setu DL verification error:', error)
    throw error
  }
}

/**
 * Verify ID using Government API
 * Supports multiple ID types with appropriate API calls
 * Uses API Setu (free government APIs) by default
 */
export async function verifyIdWithAPI(
  idType: IDType,
  idNumber: string,
  idPhotoFile: File,
  userFullName: string
): Promise<IDVerificationResult> {
  // Validate format first
  const formatValidation = validateIdFormat(idNumber, idType)
  
  if (!formatValidation.valid) {
    return {
      valid: false,
      verified: false,
      error: formatValidation.error,
      method: 'format_only',
    }
  }

  // Get API provider from environment (default: 'api_setu' - free government APIs)
  const API_PROVIDER = (import.meta.env.VITE_VERIFICATION_API_PROVIDER || 'api_setu').toLowerCase()

  try {
    // Use API Setu for government ID verification (FREE)
    if (API_PROVIDER === 'api_setu') {
      switch (idType) {
        case 'aadhaar':
          return await verifyAadhaarWithAPI(idNumber, idPhotoFile, userFullName)
        
        case 'pan':
          return await verifyPANWithAPISetu(idNumber, userFullName)
        
        case 'driving_license':
          // Extract DOB from photo if possible, or use placeholder
          // For now, we'll verify without DOB (some APIs may not require it)
          return await verifyDrivingLicenseWithAPISetu(idNumber, '', userFullName)
        
        default:
          // For other ID types, format validation only
          return {
            valid: true,
            verified: false,
            confidence: 0,
            method: 'format_only',
            error: `${getIdTypeDisplayName(idType)} verification via API Setu not yet implemented. Manual review required.`,
          }
      }
    }

    // For Aadhaar with other providers
    if (idType === 'aadhaar') {
      return await verifyAadhaarWithAPI(idNumber, idPhotoFile, userFullName)
    }

    // Other ID types: format validation only
    return {
      valid: true,
      verified: false,
      confidence: 0,
      method: 'format_only',
      error: `${getIdTypeDisplayName(idType)} verification API not yet integrated. Manual review required.`,
    }
  } catch (error: any) {
    console.error(`Verification error for ${idType}:`, error)
    // Fallback to format validation only
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

