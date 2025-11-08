import { z } from 'zod'

// Email validation schema
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters')
  .refine(
    (email) => {
      const parts = email.split('@')
      if (parts.length !== 2) return false
      const [local, domain] = parts
      return local.length > 0 && domain.length > 0 && domain.includes('.')
    },
    { message: 'Email must contain @ and a valid domain with .' }
  )

// Phone number validation (India-focused, but flexible)
export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(
    /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
    'Please enter a valid phone number'
  )
  .refine(
    (phone) => {
      // Remove all non-digit characters for validation
      const digitsOnly = phone.replace(/\D/g, '')
      // Indian phone numbers: 10 digits (without country code) or 10-13 digits (with country code)
      return digitsOnly.length >= 10 && digitsOnly.length <= 13
    },
    { message: 'Phone number must be 10-13 digits' }
  )
  .transform((phone) => phone.trim())

// Full name validation
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .regex(
    /^[a-zA-Z\s\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF\u0590-\u05FF\u0400-\u04FF\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0E00-\u0E7F\u0F00-\u0FFF'-]+$/,
    'Name can only contain letters, spaces, hyphens, and apostrophes'
  )
  .transform((name) => name.trim().replace(/\s+/g, ' '))

// Password validation
export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  )

// Location validation
export const locationSchema = z.object({
  address: z
    .string()
    .min(1, 'Address is required')
    .min(5, 'Address must be at least 5 characters')
    .max(500, 'Address must be less than 500 characters'),
  latitude: z
    .number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude'),
  longitude: z
    .number()
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude'),
})

// Amount validation (for payments)
export const amountSchema = z
  .string()
  .min(1, 'Amount is required')
  .regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a valid number (e.g., 100 or 100.50)')
  .refine(
    (val) => {
      const num = parseFloat(val)
      return num > 0 && num <= 10000000 // Max 1 crore rupees
    },
    { message: 'Amount must be between ₹1 and ₹1,00,00,000' }
  )

// Date validation
export const dateSchema = z
  .string()
  .min(1, 'Date is required')
  .refine(
    (date) => {
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selectedDate >= today
    },
    { message: 'Date must be today or in the future' }
  )

// Time validation
export const timeSchema = z
  .string()
  .min(1, 'Time is required')
  .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format (24-hour)')

// Duration validation
export const durationSchema = z
  .string()
  .min(1, 'Duration is required')
  .regex(/^\d+$/, 'Duration must be a positive number')
  .refine(
    (val) => {
      const num = parseInt(val, 10)
      return num > 0 && num <= 168 // Max 1 week (168 hours)
    },
    { message: 'Duration must be between 1 and 168 hours' }
  )

// Category validation
export const categorySchema = z
  .string()
  .min(1, 'Category is required')
  .refine(
    (cat) => {
      const validCategories = [
        'cleaning',
        'cooking',
        'delivery',
        'shopping',
        'moving',
        'repairs',
        'tutoring',
        'pet_care',
        'gardening',
        'other'
      ]
      return validCategories.includes(cat) || cat === 'other'
    },
    { message: 'Please select a valid category' }
  )

// Preferred contact methods validation
export const contactMethodsSchema = z
  .array(z.enum(['call', 'message', 'email']))
  .min(1, 'Please select at least one contact method')
  .max(3, 'Please select up to 3 contact methods')

// Text field validation (for descriptions, additional info, etc.)
export const textFieldSchema = (minLength = 0, maxLength = 1000) =>
  z
    .string()
    .max(maxLength, `Text must be less than ${maxLength} characters`)
    .optional()
    .transform((val) => (val || '').trim())

// Service radius validation
export const radiusSchema = z
  .string()
  .min(1, 'Radius is required')
  .regex(/^\d+(\.\d+)?$/, 'Radius must be a valid number')
  .refine(
    (val) => {
      const num = parseFloat(val)
      return num > 0 && num <= 100 // Max 100 km/miles
    },
    { message: 'Radius must be between 1 and 100' }
  )

// Onboarding form schema
export const onboardingSchema = z.object({
  fullName: nameSchema,
  phone: phoneSchema,
  location: locationSchema,
})

// Auth form schema
export const authSchema = z.object({
  email: emailSchema,
  password: passwordSchema.optional(), // Optional for password reset
})

// Request Help form schema
export const requestHelpSchema = z.object({
  category: categorySchema,
  date: dateSchema,
  time: timeSchema,
  duration: durationSchema,
  durationUnit: z.enum(['hours', 'minutes']),
  requesterName: nameSchema,
  phone: phoneSchema,
  location: locationSchema,
  paymentType: z.enum(['fixed', 'range']),
  fixedAmount: amountSchema.optional(),
  minAmount: amountSchema.optional(),
  maxAmount: amountSchema.optional(),
  preferenceShop: textFieldSchema(0, 200).optional(),
  additionalInfo: textFieldSchema(0, 1000).optional(),
  preferredContactMethods: contactMethodsSchema,
}).refine(
  (data) => {
    if (data.paymentType === 'fixed') {
      return !!data.fixedAmount
    } else {
      return !!data.minAmount && !!data.maxAmount && parseFloat(data.minAmount) <= parseFloat(data.maxAmount)
    }
  },
  {
    message: 'Invalid payment amount configuration',
    path: ['paymentType'],
  }
)

// Offer Help - Personal Info schema
export const offerHelpPersonalSchema = z.object({
  fullName: nameSchema,
  phone: phoneSchema,
  email: emailSchema.optional(),
})

// Offer Help - Service Area schema
export const offerHelpServiceAreaSchema = z.object({
  location: locationSchema,
  serviceRadius: radiusSchema,
  serviceRadiusUnit: z.enum(['kilometers', 'miles']),
})

// Counter offer schema
export const counterOfferSchema = z.object({
  amount: amountSchema,
  requestId: z.string().uuid('Invalid request ID'),
})

// Indian Government ID Validation Schemas

// Aadhaar number validation (12 digits, with checksum)
export const aadhaarSchema = z
  .string()
  .min(1, 'Aadhaar number is required')
  .regex(/^\d{12}$/, 'Aadhaar must be exactly 12 digits')
  .refine(
    (aadhaar) => {
      // Aadhaar should not start with 0 or 1
      return !aadhaar.startsWith('0') && !aadhaar.startsWith('1')
    },
    { message: 'Aadhaar number cannot start with 0 or 1' }
  )
  .refine(
    (aadhaar) => {
      // Basic checksum validation (Verhoeff algorithm simplified)
      // For now, just check it's not all same digits
      return !/^(\d)\1{11}$/.test(aadhaar)
    },
    { message: 'Invalid Aadhaar number format' }
  )

// PAN number validation (10 alphanumeric: ABCDE1234F)
export const panSchema = z
  .string()
  .min(1, 'PAN number is required')
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'PAN must be in format: ABCDE1234F (5 letters, 4 digits, 1 letter)')
  .transform((pan) => pan.toUpperCase())

// Driving License validation (varies by state, basic format check)
export const drivingLicenseSchema = z
  .string()
  .min(1, 'Driving License number is required')
  .min(8, 'Driving License must be at least 8 characters')
  .max(20, 'Driving License must be less than 20 characters')
  .regex(/^[A-Z0-9\/\-]+$/, 'Driving License can only contain letters, numbers, / and -')

// Passport validation (8 alphanumeric characters)
export const passportSchema = z
  .string()
  .min(1, 'Passport number is required')
  .regex(/^[A-Z0-9]{8,9}$/, 'Passport must be 8-9 alphanumeric characters')
  .transform((passport) => passport.toUpperCase())

// Voter ID validation (alphanumeric, varies by state)
export const voterIdSchema = z
  .string()
  .min(1, 'Voter ID number is required')
  .min(8, 'Voter ID must be at least 8 characters')
  .max(20, 'Voter ID must be less than 20 characters')
  .regex(/^[A-Z0-9\/\-]+$/, 'Voter ID can only contain letters, numbers, / and -')

// Ration Card validation (varies by state)
export const rationCardSchema = z
  .string()
  .min(1, 'Ration Card number is required')
  .min(8, 'Ration Card must be at least 8 characters')
  .max(25, 'Ration Card must be less than 25 characters')

// ID Type enum
export const idTypeSchema = z.enum(['aadhaar', 'pan', 'driving_license', 'passport', 'voter_id', 'ration_card'])

// Government ID validation (based on type)
export const governmentIdSchema = z.object({
  idType: idTypeSchema,
  idNumber: z.string().min(1, 'ID number is required'),
}).refine(
  (data) => {
    switch (data.idType) {
      case 'aadhaar':
        return aadhaarSchema.safeParse(data.idNumber).success
      case 'pan':
        return panSchema.safeParse(data.idNumber).success
      case 'driving_license':
        return drivingLicenseSchema.safeParse(data.idNumber).success
      case 'passport':
        return passportSchema.safeParse(data.idNumber).success
      case 'voter_id':
        return voterIdSchema.safeParse(data.idNumber).success
      case 'ration_card':
        return rationCardSchema.safeParse(data.idNumber).success
      default:
        return false
    }
  },
  { message: 'Invalid ID number format for selected ID type' }
)

// Helper application schema with government ID
export const helperApplicationSchema = z.object({
  fullName: nameSchema,
  phone: phoneSchema,
  email: emailSchema.optional(),
  idType: idTypeSchema,
  idNumber: z.string().min(1, 'ID number is required'),
  idPhoto: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    'ID photo must be less than 5MB'
  ).refine(
    (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
    'ID photo must be an image (JPEG, PNG, or WebP)'
  ),
  selfiePhoto: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    'Selfie photo must be less than 5MB'
  ).refine(
    (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
    'Selfie photo must be an image (JPEG, PNG, or WebP)'
  ),
}).refine(
  (data) => {
    // Validate ID number based on type
    switch (data.idType) {
      case 'aadhaar':
        return aadhaarSchema.safeParse(data.idNumber).success
      case 'pan':
        return panSchema.safeParse(data.idNumber).success
      case 'driving_license':
        return drivingLicenseSchema.safeParse(data.idNumber).success
      case 'passport':
        return passportSchema.safeParse(data.idNumber).success
      case 'voter_id':
        return voterIdSchema.safeParse(data.idNumber).success
      case 'ration_card':
        return rationCardSchema.safeParse(data.idNumber).success
      default:
        return false
    }
  },
  { message: 'Invalid ID number format for selected ID type', path: ['idNumber'] }
)

// File upload validation (for ID photos)
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      'File must be an image (JPEG, PNG, or WebP)'
    ),
})

// Type exports for TypeScript
export type OnboardingFormData = z.infer<typeof onboardingSchema>
export type AuthFormData = z.infer<typeof authSchema>
export type RequestHelpFormData = z.infer<typeof requestHelpSchema>
export type OfferHelpPersonalFormData = z.infer<typeof offerHelpPersonalSchema>
export type OfferHelpServiceAreaFormData = z.infer<typeof offerHelpServiceAreaSchema>
export type HelperApplicationFormData = z.infer<typeof helperApplicationSchema>
export type GovernmentIdFormData = z.infer<typeof governmentIdSchema>
export type CounterOfferFormData = z.infer<typeof counterOfferSchema>

