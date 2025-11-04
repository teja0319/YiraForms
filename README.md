# YiraForms - Production-Ready Forms API

A production-grade Next.js API for managing dynamic forms, organizations, and submissions with secure API key authentication.

## 🚀 Quick Start

### Prerequisites
- Node.js 18.17.0 or higher
- MongoDB Atlas or self-hosted MongoDB
- pnpm (recommended) or npm

### Local Development

1. Clone and install:
\`\`\`bash
git clone https://github.com/teja0319/YiraForms.git
cd YiraForms
pnpm install
\`\`\`

2. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
# Edit .env.local with your MongoDB URI and JWT secret
\`\`\`

3. Run development server:
\`\`\`bash
pnpm dev
\`\`\`

4. Create database indexes:
\`\`\`bash
pnpm create-indexes
\`\`\`

Visit http://localhost:3000/forms/[formId] to test form submissions or http://localhost:3000/swagger-docs for API documentation.

## 📋 API Authentication

All API endpoints (except `/api/auth/login`, `/api/auth/register`, and `/api/forms/{formId}/submissions`) require API key authentication.

### Getting Your API Key

1. Sign up: `POST /api/auth/register`
\`\`\`bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
\`\`\`

Response includes your API key starting with `sk_live_`

2. Use API key in requests:
\`\`\`bash
curl -X GET http://localhost:3000/api/orgs \
  -H "Authorization: Bearer sk_live_your_api_key_here"
\`\`\`

## 🗂️ API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account (returns API key)
- `POST /api/auth/login` - Login (returns auth token)

### API Key Management
- `GET /api/auth/api-keys` - List your API keys (requires API key)
- `POST /api/auth/api-keys` - Create new API key (requires API key)
- `DELETE /api/auth/api-keys/{keyId}` - Delete API key (requires API key)

### Organizations
- `GET /api/orgs` - List your organizations (requires API key)
- `POST /api/orgs` - Create organization (requires API key)
- `GET /api/orgs/{orgId}` - Get organization details (requires API key)
- `PUT /api/orgs/{orgId}` - Update organization (requires API key)
- `DELETE /api/orgs/{orgId}` - Delete organization (requires API key)

### Forms
- `GET /api/orgs/{orgId}/forms` - List forms in organization (requires API key)
- `POST /api/orgs/{orgId}/forms` - Create form (requires API key)
- `GET /api/orgs/{orgId}/forms/{formId}` - Get form details (requires API key)
- `PUT /api/orgs/{orgId}/forms/{formId}` - Update form (requires API key)
- `DELETE /api/orgs/{orgId}/forms/{formId}` - Delete form (requires API key)

### Form Submissions
- `POST /api/forms/{formId}/submissions` - Submit form (public, no auth required)
- `GET /api/orgs/{orgId}/forms/{formId}/submissions` - List submissions (requires API key)
- `GET /api/orgs/{orgId}/forms/{formId}/submissions/{submissionId}` - Get submission (requires API key)

### Documentation
- `GET /swagger-docs` - Interactive API documentation (Swagger UI)
- `GET /api/openapi` - OpenAPI specification (JSON)

## 📦 Deployment

### Vercel (Recommended)

1. Push to GitHub and connect to Vercel
2. Add environment variables in Vercel dashboard:
   - `MONGODB_URI` - Your MongoDB connection string
   - `MONGODB_DB` - Database name
   - `JWT_SECRET` - Random secret key

3. Deploy:
\`\`\`bash
vercel deploy --prod
\`\`\`

### Docker

\`\`\`bash
docker build -t yira-forms .
docker run -p 3000:3000 \
  -e MONGODB_URI="your_mongodb_uri" \
  -e MONGODB_DB="yira-forms" \
  -e JWT_SECRET="your_secret" \
  yira-forms
\`\`\`

### Manual Server

\`\`\`bash
pnpm build
pnpm start
\`\`\`

## 🔒 Security Features

- API key authentication (similar to ChatGPT)
- JWT token-based user authentication
- Password hashing with bcryptjs
- Field-level validation with Zod
- CORS support for cross-origin requests
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- Rate limiting on sensitive endpoints
- Row-level security policies

## 📊 Form Validation

Forms support comprehensive field validation:

- **Required**: Mark fields as mandatory
- **Email**: Validate email format
- **Min/Max Length**: String length constraints
- **Min/Max Value**: Numeric range constraints
- **Pattern**: Custom regex validation
- **Options**: Predefined select/radio options

Validation errors are returned with detailed field-level messages.

## 🌐 Public Form Submission

Users can submit forms without authentication at:
\`\`\`
GET /forms/{formId}  - View form
POST /api/forms/{formId}/submissions  - Submit form
\`\`\`

After successful submission, users see a thank you page and are redirected.

## 📝 Environment Variables

\`\`\`
MONGODB_URI         - MongoDB connection string (required)
MONGODB_DB          - Database name (default: yira-forms)
JWT_SECRET          - Secret for signing JWT tokens (required for production)
NODE_ENV            - Environment (development/production)
NEXT_PUBLIC_API_URL - Public API URL (for client-side requests)
\`\`\`

## 🛠️ Development

### Project Structure
\`\`\`
app/
├── api/              # API routes
├── forms/            # Form pages
└── swagger-docs/     # API documentation UI

components/
├── forms/            # Form components
├── ui/               # Reusable UI components
└── auth/             # Authentication components

lib/
├── auth.ts           # Authentication utilities
├── api-key.ts        # API key utilities
├── validators.ts     # Zod validation schemas
└── db.ts             # Database connection

models/               # Mongoose models
├── user.ts
├── org.ts
├── form.ts
├── api-key.ts
└── submission.ts

scripts/              # Utility scripts
└── db/create-indexes.ts
\`\`\`

### Database Indexes

The application automatically creates indexes on:
- User email (unique)
- Organization owner reference
- Form organization reference
- Submission form reference and timestamps

Run manually: `pnpm create-indexes`

## 🚨 Production Checklist

Before deploying to production:

- [ ] Set strong `JWT_SECRET` environment variable
- [ ] Configure MongoDB with authentication and encryption
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Set `NODE_ENV=production`
- [ ] Review and update CORS settings
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting appropriately
- [ ] Run security audit: `npm audit`
- [ ] Test all API endpoints
- [ ] Set up automated backups for database
- [ ] Document custom API endpoints
- [ ] Set up error tracking (Sentry, etc.)

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub or contact the development team.

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

Built with:
- [Next.js 15](https://nextjs.org)
- [Mongoose](https://mongoosejs.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
