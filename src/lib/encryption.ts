import CryptoJS from 'crypto-js';

/**
 * Encryption key for localStorage data
 * In production, this should be set via environment variable
 * Falls back to a default key for development (not recommended for production)
 */
const ENCRYPTION_KEY = import.meta.env.VITE_CACHE_ENCRYPTION_KEY || 'talentos-hub-default-encryption-key-2026';

/**
 * Encrypts data using AES-256 encryption
 * @param data - The data to encrypt (will be JSON stringified)
 * @returns Encrypted string
 */
export const encryptData = (data: unknown): string => {
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
};

/**
 * Decrypts AES-256 encrypted data
 * @param encrypted - The encrypted string
 * @returns Decrypted and parsed data, or null if decryption fails
 */
export const decryptData = <T>(encrypted: string): T | null => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);

    if (!jsonString) {
      return null;
    }

    return JSON.parse(jsonString) as T;
  } catch {
    return null;
  }
};
