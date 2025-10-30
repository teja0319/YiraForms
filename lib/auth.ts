import { jwtVerify, SignJWT } from "jose"
import type { NextRequest } from "next/server"
import { getEnv } from "./env"

const alg = "HS256"

export type AuthToken = {
  userId: string
  email: string
}

function getSecret() {
  const secret = getEnv("JWT_SECRET")
  return new TextEncoder().encode(secret)
}

export async function signAuthToken(payload: AuthToken, expiresIn = "7d") {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret())
}

export async function verifyAuthToken(token: string): Promise<AuthToken | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as AuthToken
  } catch {
    return null
  }
}

export function getBearerToken(req: NextRequest): string | null {
  const h = req.headers.get("authorization")
  if (!h) return null
  const [type, token] = h.split(" ")
  if (type?.toLowerCase() !== "bearer" || !token) return null
  return token
}

export async function requireAuth(req: NextRequest): Promise<AuthToken> {
  const token = getBearerToken(req)
  if (!token) {
    throw makeHttpError("UNAUTHORIZED", "Missing Authorization header", 401)
  }
  const auth = await verifyAuthToken(token)
  if (!auth) {
    throw makeHttpError("UNAUTHORIZED", "Invalid or expired token", 401)
  }
  return auth
}

export async function verifyApiKey(apiKey: string): Promise<{ userId: string } | null> {
  try {
    const crypto = require("crypto")
    const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex")

    const { ApiKey } = await import("@/models/api-key")
    const foundKey = await ApiKey.findOne({ key: keyHash })

    if (!foundKey) return null

    // Update last used timestamp
    await ApiKey.updateOne({ _id: foundKey._id }, { lastUsedAt: new Date() })

    return { userId: String(foundKey.userId) }
  } catch {
    return null
  }
}

export function getApiKeyFromHeader(req: NextRequest): string | null {
  const h = req.headers.get("authorization")
  if (!h) return null
  const [type, key] = h.split(" ")
  if (type?.toLowerCase() !== "bearer" || !key) return null
  return key
}

export async function requireApiKey(req: NextRequest): Promise<{ userId: string }> {
  const apiKey = getApiKeyFromHeader(req)
  if (!apiKey) {
    throw makeHttpError("UNAUTHORIZED", "Missing Authorization header", 401)
  }
  const auth = await verifyApiKey(apiKey)
  if (!auth) {
    throw makeHttpError("UNAUTHORIZED", "Invalid API key", 401)
  }
  return auth
}

export function makeHttpError(
  code: "VALIDATION_ERROR" | "NOT_FOUND" | "UNAUTHORIZED" | "FORBIDDEN" | "RATE_LIMITED" | "INTERNAL_ERROR",
  message: string,
  status = 400,
  details?: any,
) {
  const error = { ok: false as const, error: { code, message, details } }
  const err = new Error(message) as any
  err.status = status
  err.body = error
  return err
}
