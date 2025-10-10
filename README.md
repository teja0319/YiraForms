# Dynamic Forms API (Next.js + MongoDB)

Production-ready Next.js App Router backend to manage organizations, dynamic forms, and submissions.

## Features

- Organizations CRUD with owner-based permissions
- Forms CRUD with stable field IDs and validation rules
- Submissions endpoint storing primaryKey (required) and optional secondaryKey
- Retrieval by keys (primaryKey and optional secondaryKey), pagination and date filters
- JWT auth (register/login), zod validation, basic rate limiting
- Mongoose models with proper indexes; script to ensure indexes

## Environment

Configure Vars in the v0 sidebar (no .env files here):

- MONGODB_URI: your MongoDB connection string (Atlas recommended)
- JWT_SECRET: random string for signing tokens
- MONGODB_DB (optional): database name

## Quickstart

1. Register or login via:
   - POST /api/auth/register
   - POST /api/auth/login
2. Create an org:
   - POST /api/orgs (Bearer token required)
3. Create a form:
   - POST /api/orgs/:orgId/forms (Bearer token required)
4. Submit:
   - POST /api/forms/:formId/submissions
5. Retrieve:
   - GET /api/orgs/:orgId/forms/:formId/submissions?primaryKey=... [&secondaryKey=...]

You can also use the demo UI at `/` to try the flow.

## Indexes

Run the index script from the Scripts tab if available:

- scripts/db/create-indexes.ts

## Error Shape

\`\`\`
{ "ok": false, "error": { "code": "VALIDATION_ERROR|NOT_FOUND|UNAUTHORIZED|FORBIDDEN|RATE_LIMITED|INTERNAL_ERROR", "message": "..." , "details": {...} } }
\`\`\`

## Notes

- Submissions are immutable by this API design (no update/delete endpoints)
- `formVersion` recorded as `1` (extend to version your form schema as needed)
- Retrieval endpoint is protected and owner-only
- Rate limiting is best-effort, in-memory
