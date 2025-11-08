/**
 * End-to-End Encryption Utilities
 * Uses Web Crypto API for client-side encryption (AES-GCM)
 * 
 * IMPORTANT: This provides encryption, but true E2E security requires:
 * - Keys never leave the client
 * - Keys are derived from a shared secret (password/key exchange)
 * - For production, consider using a library like libsodium.js or Signal Protocol
 */

// Generate a random encryption key (for demo - in production, use key derivation)
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  )
}

// Derive a key from a password (PBKDF2)
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )

  // Ensure salt is a proper ArrayBuffer (create new ArrayBuffer from Uint8Array)
  const saltBuffer = new Uint8Array(salt).buffer

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  )
}

// Generate a random salt
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16))
}

// Generate a random IV (Initialization Vector)
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12)) // 12 bytes for AES-GCM
}

// Encrypt a message
export async function encryptMessage(
  message: string,
  key: CryptoKey
): Promise<{ encrypted: string; iv: string; metadata: any }> {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const iv = generateIV()

  // Ensure iv is a proper ArrayBuffer (create new ArrayBuffer from Uint8Array)
  const ivBuffer = new Uint8Array(iv).buffer

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer,
      tagLength: 128, // 128-bit authentication tag
    },
    key,
    data
  )

  // Convert encrypted data and IV to base64 for storage
  const encryptedArray = new Uint8Array(encrypted)
  const encryptedBase64 = btoa(String.fromCharCode(...encryptedArray))
  const ivBase64 = btoa(String.fromCharCode(...iv))

  return {
    encrypted: encryptedBase64,
    iv: ivBase64,
    metadata: {
      algorithm: 'AES-GCM',
      keyLength: 256,
      tagLength: 128,
    },
  }
}

// Decrypt a message
export async function decryptMessage(
  encryptedData: string,
  iv: string,
  key: CryptoKey
): Promise<string> {
  // Convert base64 back to Uint8Array
  const encryptedArray = Uint8Array.from(
    atob(encryptedData),
    (c) => c.charCodeAt(0)
  )
  const ivArray = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0))

  // Ensure ivArray is a proper ArrayBuffer (create new ArrayBuffer from Uint8Array)
  const ivBuffer = new Uint8Array(ivArray).buffer

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer,
      tagLength: 128,
    },
    key,
    encryptedArray
  )

  const decoder = new TextDecoder()
  return decoder.decode(decrypted)
}

// Generate a conversation key from user IDs (deterministic)
// In production, use a proper key exchange protocol
export async function generateConversationKey(
  user1Id: string,
  user2Id: string,
  helpRequestId?: string
): Promise<CryptoKey> {
  // Create a deterministic "password" from user IDs
  // In production, this should be a proper key exchange
  const sortedIds = [user1Id, user2Id].sort().join('_')
  const secret = helpRequestId ? `${sortedIds}_${helpRequestId}` : sortedIds
  
  // Use a fixed salt for deterministic key generation
  // In production, store salt per conversation
  const salt = new TextEncoder().encode(`bringora_salt_${secret}`)
  
  return await deriveKeyFromPassword(secret, salt)
}

// Export key to base64 (for storage/transmission - use carefully!)
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key)
  const exportedArray = new Uint8Array(exported)
  return btoa(String.fromCharCode(...exportedArray))
}

// Import key from base64
export async function importKey(keyBase64: string): Promise<CryptoKey> {
  const keyArray = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0))
  return await crypto.subtle.importKey(
    'raw',
    keyArray,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  )
}

// Hash a message for integrity checking (optional)
export async function hashMessage(message: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

