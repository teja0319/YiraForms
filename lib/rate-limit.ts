type Entry = { count: number; resetAt: number }
const store = new Map<string, Entry>()

export function clientKey(ip: string | null | undefined, path: string) {
  return `${ip ?? "unknown"}:${path}`
}

/**
 * limit: number of requests
 * intervalMs: time window
 */
export function checkRateLimit(key: string, limit: number, intervalMs: number) {
  const now = Date.now()
  const item = store.get(key)
  if (!item || item.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + intervalMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + intervalMs }
  }
  if (item.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: item.resetAt }
  }
  item.count += 1
  return { allowed: true, remaining: limit - item.count, resetAt: item.resetAt }
}
