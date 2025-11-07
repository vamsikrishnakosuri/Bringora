export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'te', name: 'Telugu' },
  { code: 'hi', name: 'Hindi' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'ta', name: 'Tamil' },
] as const

export type LanguageCode = typeof LANGUAGES[number]['code']

export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''

