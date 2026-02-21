# Vercel Deployment Guide

## Prerequisites

Before deploying to Vercel, ensure you have:

1. **MongoDB Atlas Account** - A cloud MongoDB instance
2. **GitHub Repository** - Code pushed to GitHub
3. **Vercel Account** - Connected to your GitHub

## Environment Variables Setup

To fix the "Internal Server Error" on login, you need to set environment variables on Vercel:

### 1. MongoDB Connection

Navigate to **Project Settings → Environment Variables** and add:

```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/busapp?retryWrites=true&w=majority
```

**Steps to get your MongoDB URI:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster if you haven't already
3. Click "Connect"
4. Choose "Drivers" → "Node.js"
5. Copy the connection string
6. Replace `<password>` with your actual password
7. Add the database name (e.g., `busapp`)

### 2. JWT Secret

```
JWT_SECRET = your_super_secret_jwt_key_at_least_32_characters_long
```

Use a strong random string at least 32 characters long. You can generate one with:
```bash
openssl rand -base64 32
```

### 3. Optional Settings

```
PAYMENT_GATEWAY = flutterwave
FLUTTERWAVE_PUBLIC_KEY = your_key
FLUTTERWAVE_SECRET_KEY = your_secret
SEAT_LOCK_EXPIRY_MINUTES = 15
```

## Verification

After setting environment variables:

1. **Wait for Vercel to redeploy** (automatic after env var update)
2. **Check health endpoint**: `https://aurapark-web.vercel.app/api/health`
3. **You should see**: `{ "status": "ok", "checks": { "database": "connected" } }`

## Troubleshooting

### Internal Server Error on Login

**Check the health endpoint:**
```
GET https://aurapark-web.vercel.app/api/health
```

If database shows as "failed":
- Verify `MONGODB_URI` is set correctly
- Check MongoDB Atlas IP whitelist includes Vercel IPs (allow all: `0.0.0.0/0`)
- Ensure database user has correct permissions

### Database Connection Timeout

**Solutions:**
1. Go to MongoDB Atlas → Security → Network Access
2. Add `0.0.0.0/0` to allow all IPs (for testing)
3. Or add Vercel's IP addresses specifically

### Cookie/Authentication Issues

**CORS is now enabled for:**
- `https://aurapark-web.vercel.app`
- `https://www.aurapark-web.vercel.app`
- `http://localhost:3000` (development)

If you need to add another origin, update `apps/web/proxy.ts`:
```typescript
const ALLOWED_ORIGINS = [
  // ... existing origins
  'https://your-domain.com',  // Add here
];
```

## Deployment Checklist

- [ ] Verify MongoDB URI is set
- [ ] Verify JWT_SECRET is set
- [ ] Check health endpoint returns `status: ok`
- [ ] Test login on https://aurapark-web.vercel.app/login
- [ ] Test booking flow end-to-end
- [ ] Verify cookies are being set (check DevTools → Application → Cookies)

## Common Issues

| Issue | Solution |
|-------|----------|
| 500 Error on login | Check MONGODB_URI environment variable |
| "Database connection failed" | Whitelist Vercel IPs in MongoDB Atlas |
| CORS errors | Check proxy.ts ALLOWED_ORIGINS |
| Cookies not working | Ensure secure cookies in production |
| Login but redirect fails | Check JWT_SECRET matches between requests |

## Next Steps

After successful deployment:

1. Monitor logs in Vercel dashboard
2. Set up error tracking (optional Sentry integration)
3. Configure payment gateway in production mode
4. Set up monitoring/alerts for production

For questions or issues, check the repository documentation or create an issue.
