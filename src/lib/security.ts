/**
 * Security utilities for input sanitization, XSS prevention, and validation
 */

/**
 * Sanitize user input to prevent XSS attacks
 * Removes potentially dangerous HTML/JavaScript
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }

  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers (onclick, onerror, etc.)
    .trim()
}

/**
 * Sanitize HTML content (for rich text if needed in future)
 * More permissive than sanitizeInput but still safe
 */
export function sanitizeHTML(html: string): string {
  if (typeof html !== 'string') {
    return ''
  }

  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '')
  
  return sanitized.trim()
}

/**
 * Validate file type for uploads
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!validTypes.includes(file.type)) {
    return false
  }

  if (file.size > maxSize) {
    return false
  }

  return true
}

/**
 * Validate file name to prevent path traversal attacks
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid characters
    .replace(/\.\./g, '_') // Prevent path traversal
    .substring(0, 255) // Limit length
}

/**
 * Generate a secure file name for uploads
 */
export function generateSecureFileName(originalName: string, userId: string): string {
  const timestamp = Date.now()
  const extension = originalName.split('.').pop() || 'jpg'
  const sanitized = sanitizeFileName(originalName.split('.')[0])
  
  return `${userId}_${timestamp}_${sanitized}.${extension}`
}

/**
 * Validate URL to prevent open redirect attacks
 */
export function isValidRedirectUrl(url: string, allowedDomains: string[] = []): boolean {
  try {
    const urlObj = new URL(url, window.location.origin)
    
    // Only allow relative URLs or same origin
    if (urlObj.origin === window.location.origin) {
      return true
    }
    
    // Check against allowed domains
    if (allowedDomains.length > 0) {
      return allowedDomains.some(domain => urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`))
    }
    
    return false
  } catch {
    return false
  }
}

/**
 * Rate limiting helper (client-side check)
 * Note: Real rate limiting should be implemented server-side
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

/**
 * Clear rate limit for a key (useful for testing)
 */
export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key)
}

/**
 * Validate phone number format (additional security check)
 */
export function validatePhoneNumber(phone: string): { valid: boolean; normalized: string | null } {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '')
  
  // Check length (10-13 digits for international numbers)
  if (digitsOnly.length < 10 || digitsOnly.length > 13) {
    return { valid: false, normalized: null }
  }
  
  // Normalize to E.164 format (optional)
  const normalized = `+${digitsOnly}`
  
  return { valid: true, normalized }
}

/**
 * Validate email format (additional security check)
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(email)) {
    return false
  }
  
  // Check for common dangerous patterns
  const dangerousPatterns = [
    /javascript:/i,
    /<script/i,
    /on\w+\s*=/i,
  ]
  
  return !dangerousPatterns.some(pattern => pattern.test(email))
}

/**
 * Escape HTML entities to prevent XSS
 */
export function escapeHTML(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  
  return text.replace(/[&<>"']/g, (char) => map[char])
}

/**
 * Validate and sanitize location coordinates
 */
export function validateCoordinates(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  )
}

/**
 * Content Security Policy helper
 * Returns CSP header value for the application
 */
export function getCSPHeader(): string {
  return [
    "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://*.mapbox.com https://vercel.live",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.mapbox.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://*.mapbox.com wss://*.supabase.co",
    "frame-src 'self' https://*.supabase.co",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ')
}

