import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128-bit IV for GCM
const KEY_LENGTH = 32; // 256-bit key

/**
 * Generate encryption key from environment variable or create a secure random key
 */
function getEncryptionKey(): Buffer {
  const keyString = process.env.ENCRYPTION_KEY;
  
  if (keyString) {
    // Use provided key (must be 64 hex characters for 256-bit key)
    if (keyString.length !== 64) {
      throw new Error('ENCRYPTION_KEY must be 64 hex characters (256 bits)');
    }
    return Buffer.from(keyString, 'hex');
  }
  
  // FIXME: CRITICAL - Set ENCRYPTION_KEY environment variable for production
  // WARNING: Using random key will cause data loss on restart
  console.warn('⚠️  No ENCRYPTION_KEY provided, using random key (development only)');
  return crypto.randomBytes(KEY_LENGTH);
}

const encryptionKey = getEncryptionKey();

/**
 * Encrypt sensitive data (like API keys) using AES-256-GCM
 * Returns base64 encoded string: iv:tag:encrypted_data
 */
export function encrypt(plaintext: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);
    cipher.setAAD(Buffer.from('leedz-api-key')); // Additional authenticated data
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Combine IV, tag, and encrypted data
    const combined = iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
    return Buffer.from(combined).toString('base64');
    
  } catch (error) {
    console.error('❌ Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data encrypted with encrypt()
 */
export function decrypt(encryptedData: string): string {
  try {
    // Decode from base64 and split components
    const combined = Buffer.from(encryptedData, 'base64').toString();
    const parts = combined.split(':');
    
    if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);
    decipher.setAAD(Buffer.from('leedz-api-key')); // Must match AAD from encryption
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
    
  } catch (error) {
    console.error('❌ Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash sensitive data for comparison (one-way)
 */
export function hash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate a secure random encryption key (for setup)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Validate if string is a valid API key format (basic validation)
 * TODO: Add actual Google Places API validation call to verify key works
 * FIXME: Current validation is format-only, doesn't check if key is valid/active
 */
export function validateApiKeyFormat(apiKey: string): boolean {
  // Google Places API keys typically start with "AIza" and are 39 characters
  const googleApiKeyPattern = /^AIza[0-9A-Za-z_-]{35}$/;
  
  // Allow test keys for development/testing (exactly 39 chars, starts with TEST_)
  const testApiKeyPattern = /^TEST_[A-Z0-9_]{34}$/;
  
  return googleApiKeyPattern.test(apiKey) || testApiKeyPattern.test(apiKey);
} 