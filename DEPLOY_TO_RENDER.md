# Deploy to Render - Complete Guide

## Step 1: Create Render Account

1. Go to https://render.com
2. Sign up with your GitHub account (recommended for auto-deploy)
3. Authorize Render to access your repositories

## Step 2: Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `Audience-Aura-Org/Aurapark`
3. Configure the service:

### Basic Settings:
- **Name**: `aurapark-transport` (or any name you prefer)
- **Region**: Choose closest to your users (e.g., Frankfurt for Europe)
- **Branch**: `main`
- **Root Directory**: `./` (leave as root)
- **Runtime**: `Node`

### Build & Deploy Settings:
- **Build Command**: 
  ```bash
  npm install && npm run build
  ```

- **Start Command**: 
  ```bash
  npm start
  ```

### Advanced Settings:
- **Auto-Deploy**: `Yes` (deploys automatically on git push)
- **Health Check Path**: `/health` (uses your custom health endpoint!)

## Step 3: Environment Variables

Add these in the Render dashboard under "Environment":

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://audienceauraorg_db_user:Talktome387@clustertransportation.ttzk4q2.mongodb.net/transport-platform?retryWrites=true&w=majority
JWT_SECRET=aura_park_secure_2026_xyz
NEXTAUTH_SECRET=aura_park_secure_2026_xyz
NEXTAUTH_URL=https://aurapark-transport.onrender.com
```

**Note**: Render uses port 10000 by default. Update `NEXTAUTH_URL` with your actual Render URL after deployment.

## Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Run `npm install && npm run build`
   - Start your app with `npm start`
   - Provide you with a URL like: `https://aurapark-transport.onrender.com`

## Step 5: Custom Domain (Optional)

### Option A: Use Render's Custom Domain
1. Go to your service → **Settings** → **Custom Domains**
2. Add `park.audienceaura.org`
3. Update your DNS at Hostinger:
   - Type: `CNAME`
   - Name: `park` (or `@` for root domain)
   - Value: `aurapark-transport.onrender.com`

### Option B: Keep Hostinger for Static Assets
You can use Hostinger to serve static files (images, fonts, etc.) and Render for the dynamic app:
- Static CDN: `https://park.audienceaura.org/static/...`
- Dynamic App: `https://app.audienceaura.org` (points to Render)

## Step 6: Update Environment Variables

After deployment, update `NEXTAUTH_URL` to your actual domain:
```
NEXTAUTH_URL=https://park.audienceaura.org
```

## Expected Results

✅ Build completes in ~2-3 minutes
✅ Health check at `/health` returns 200 OK
✅ App accessible at your Render URL
✅ Auto-deploys on every git push to main

## Troubleshooting

### If build fails:
- Check build logs in Render dashboard
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

### If app crashes:
- Check runtime logs in Render dashboard
- Verify environment variables are set correctly
- Test MongoDB connection string

### If 503 error:
- Check if health check path is set to `/health`
- Verify start command is `npm start`
- Ensure PORT environment variable is set

## Cost

- **Free Tier**: 
  - 750 hours/month (enough for one always-on service)
  - Spins down after 15 minutes of inactivity
  - Spins up automatically on request (cold start ~30 seconds)

- **Paid Tier** ($7/month):
  - Always-on (no cold starts)
  - More resources
  - Better for production

## Alternative Platforms

If Render doesn't work for you, try:

1. **Railway.app** - Similar to Render, $5/month
2. **Fly.io** - Global edge deployment, free tier available
3. **Vercel** - Best for Next.js, but requires some config changes
4. **DigitalOcean App Platform** - $5/month, very reliable

---

## Next Steps After Deployment

1. Test all routes and API endpoints
2. Verify database connections
3. Test authentication flows
4. Monitor performance and logs
5. Set up custom domain if needed
