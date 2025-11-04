# Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration
\`\`\`bash
# Verify all required environment variables are set
# MONGODB_URI - Your MongoDB connection string
# MONGODB_DB - Database name
# JWT_SECRET - Strong random secret (min 32 characters)
# NODE_ENV - Set to 'production'
\`\`\`

### 2. Security Audit
\`\`\`bash
pnpm audit
# Fix any vulnerabilities
pnpm audit fix
\`\`\`

### 3. Build Verification
\`\`\`bash
pnpm build
# Should complete without errors or warnings
\`\`\`

### 4. Database Indexes
\`\`\`bash
pnpm create-indexes
# Ensures all required database indexes exist
\`\`\`

## Vercel Deployment (Recommended)

### Step 1: Push to GitHub
\`\`\`bash
git add .
git commit -m "Production ready"
git push origin main
\`\`\`

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select "Next.js" as framework

### Step 3: Set Environment Variables
In Vercel dashboard, add:
- `MONGODB_URI` - Your MongoDB URI
- `MONGODB_DB` - Database name (e.g., `yira-forms`)
- `JWT_SECRET` - Generate: `openssl rand -base64 32`

### Step 4: Deploy
Click "Deploy" and wait for build completion.

### Step 5: Post-Deployment
1. Test API endpoints
2. Check logs for errors
3. Set up monitoring/alerts

## Docker Deployment

### Build Image
\`\`\`bash
docker build -t yira-forms:latest .
\`\`\`

### Run Container
\`\`\`bash
docker run -d \
  --name yira-forms \
  -p 3000:3000 \
  -e MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net" \
  -e MONGODB_DB="yira-forms" \
  -e JWT_SECRET="your-secret-key" \
  -e NODE_ENV="production" \
  yira-forms:latest
\`\`\`

### Docker Compose
\`\`\`yaml
version: '3.8'
services:
  app:
    image: yira-forms:latest
    ports:
      - "3000:3000"
    environment:
      MONGODB_URI: ${MONGODB_URI}
      MONGODB_DB: yira-forms
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    restart: unless-stopped
\`\`\`

## Self-Hosted Deployment

### Prerequisites
- Node.js 18.17.0+
- PM2 or supervisor for process management
- Nginx for reverse proxy
- SSL certificate (Let's Encrypt)

### Setup
\`\`\`bash
# Clone repository
git clone https://github.com/teja0319/YiraForms.git
cd YiraForms

# Install dependencies
pnpm install

# Build
pnpm build

# Start with PM2
pm2 start "pnpm start" --name "yira-forms"
pm2 save
pm2 startup
\`\`\`

### Nginx Configuration
\`\`\`nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\`

## Monitoring & Logging

### Error Tracking (Sentry)
1. Create Sentry account
2. Add `SENTRY_DSN` to environment
3. Errors automatically captured

### Application Monitoring
- Use Vercel Analytics (included)
- Monitor database query performance
- Set up alerts for API errors

### Log Aggregation
- View logs in Vercel dashboard
- Or use ELK stack for self-hosted

## Scaling Considerations

### Database
- Enable MongoDB sharding for large datasets
- Use read replicas for high traffic
- Monitor connection pool usage

### Application
- Enable CDN for static assets
- Implement request caching
- Use serverless functions (Vercel Functions)

### Rate Limiting
- Adjust rate limits in production settings
- Implement API key-based quotas
- Monitor API usage patterns

## Rollback Procedure

### Vercel
1. Go to Deployment history
2. Click on previous stable deployment
3. Click "Promote to Production"

### Docker
\`\`\`bash
docker pull yira-forms:previous-version
docker run -d --name yira-forms-rollback ...
\`\`\`

## Troubleshooting

### Build Failures
\`\`\`bash
# Clear build cache
pnpm clean
rm -rf .next
pnpm build
\`\`\`

### Database Connection Issues
\`\`\`bash
# Verify MongoDB URI
# Check IP whitelist in MongoDB Atlas
# Ensure database exists
\`\`\`

### High API Latency
- Check database query performance
- Monitor server CPU/memory
- Review rate limiting settings

## Support

Contact DevOps team or create an issue for deployment assistance.
