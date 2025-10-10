export function parsePagination(searchParams: URLSearchParams) {
  const limit = Math.min(Math.max(Number.parseInt(searchParams.get("limit") || "20", 10), 1), 100)
  const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10), 1)
  const skip = (page - 1) * limit
  return { limit, page, skip }
}
