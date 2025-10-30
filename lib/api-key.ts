import { randomBytes } from "crypto"

/**
 * Generate a unique API key in the format: sk_live_<random>
 * Similar to ChatGPT's API key format
 */
export function generateApiKey(): string {
  const prefix = "sk_live_"
  const randomPart = randomBytes(32).toString("hex")
  return prefix + randomPart
}

/**
 * Hash an API key for storage (one-way)
 * We store hashed keys so even if DB is compromised, keys are protected
 */
export function hashApiKey(key: string): string {
  const crypto = require("crypto")
  return crypto.createHash("sha256").update(key).digest("hex")
}

/**
 * Verify an API key against its hash
 */
export function verifyApiKey(key: string, hash: string): boolean {
  const crypto = require("crypto")
  const keyHash = crypto.createHash("sha256").update(key).digest("hex")
  return keyHash === hash
}
