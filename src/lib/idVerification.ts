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
 * Verify ID using Government API (placeholder - to be implemented)
 * This will integrate with AI Parichay API or similar service
 */
export async function verifyIdWithAPI(
  idType: IDType,
  idNumber: string,
  idPhotoFile: File,
  userFullName: string
): Promise<IDVerificationResult> {
  // TODO: Implement API integration
  // For now, return format validation only
  
  const formatValidation = validateIdFormat(idNumber, idType)
  
  if (!formatValidation.valid) {
    return {
      valid: false,
      verified: false,
      error: formatValidation.error,
      method: 'format_only',
    }
  }

  // Placeholder for API integration
  // When ready, integrate with:
  // - AI Parichay API (https://ai.nic.in/AI/AIParichay)
  // - Veri5Digital API
  // - Surepass API
  // - IDfy API

  return {
    valid: true,
    verified: false, // Will be true after API integration
    confidence: 0,
    method: 'format_only',
  }
}

/**
 * Extract data from ID photo using OCR (placeholder)
 * This will use AI Parichay API or similar OCR service
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
  // TODO: Implement OCR extraction
  // AI Parichay API can extract:
  // - ID card number
  // - Holder's name
  // - Date of birth
  // - Photo

  return {
    success: false,
    error: 'OCR extraction not yet implemented',
  }
}

