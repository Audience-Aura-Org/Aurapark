# Complete Hostinger Node.js Deployment Guide

## Prerequisites
- Hostinger Business or Premium plan (Node.js requires these plans)
- GitHub repository connected
- SSH access (optional but helpful)

## Step 1: Access Node.js Application Manager

1. Log into **Hostinger hPanel**
2. Go to **Advanced** → **Node.js**
3. If you don't see "Node.js" option:
   - Your plan might not support it
   - Contact Hostinger support to enable Node.js
   - You may need to upgrade to Business plan

## Step 2: Create Node.js Application

### Option A: Using Hostinger's Node.js Manager (Recommended)

1. Click **"Create Application"**
2. Fill in the details:

   **Application Details:**
   - Application root: `/domains/park.audienceaura.org/public_html`
   - Application URL: `https://park.audienceaura.org`
   - Application mode: `production`
   - Node.js version: `18.x` or `20.x` (NOT 22.x - might be unstable)

   **Application Entry Point:**
   - Entry point: `server.js`
   - OR
   - Startup file: `server.js`

3. Click **"Create"**

### Option B: Manual Setup via File Manager

If Node.js manager isn't available, you'll need to:

1. **Upload files** to `/domains/park.audienceaura.org/public_html/`
2. **Create .htaccess** file (see below)
3. **Set up Passenger** (Hostinger's Node.js runner)

## Step 3: Configure Application Files

### Create/Update .htaccess

Create this file in your public_html directory:

```apache
# .htaccess for Node.js application
PassengerEnabled on
PassengerAppRoot /home/u177313858/domains/park.audienceaura.org/public_html
PassengerAppType node
PassengerStartupFile server.js
PassengerNodejs /usr/bin/node

# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Passenger configuration
PassengerMinInstances 1
PassengerMaxPoolSize 6
PassengerPoolIdleTime 0
PassengerMaxPreloaderIdleTime 0
```

### Create passenger_wsgi.py (if needed)

Some Hostinger setups require this:

```python
import os
import sys

# This file is required by Passenger but won't be used
# Your Node.js app will run via server.js
```

## Step 4: Set Environment Variables

### Via Hostinger Control Panel:

1. Go to **Node.js** → Your Application → **Environment Variables**
2. Add these variables:

```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://audienceauraorg_db_user:Talktome387@clustertransportation.ttzk4q2.mongodb.net/transport-platform?retryWrites=true&w=majority
JWT_SECRET=aura_park_secure_2026_xyz
NEXTAUTH_SECRET=aura_park_secure_2026_xyz
NEXTAUTH_URL=https://park.audienceaura.org
```

### Via .env file (Alternative):

Create `.env` file in your root directory:

```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://audienceauraorg_db_user:Talktome387@clustertransportation.ttzk4q2.mongodb.net/transport-platform?retryWrites=true&w=majority
JWT_SECRET=aura_park_secure_2026_xyz
NEXTAUTH_SECRET=aura_park_secure_2026_xyz
NEXTAUTH_URL=https://park.audienceaura.org
```

**Important**: Add `.env` to your `.gitignore` if using this method!

## Step 5: Deploy Your Code

### Method 1: GitHub Integration (Recommended)

1. In Hostinger, go to **Git** → **Create Repository**
2. Connect to: `https://github.com/Audience-Aura-Org/Aurapark`
3. Branch: `main`
4. Deploy path: `/domains/park.audienceaura.org/public_html`
5. Click **"Pull"** to deploy

### Method 2: Manual Upload via File Manager

1. Build locally: `npm run build`
2. Upload these folders/files to public_html:
   - `server.js`
   - `package.json`
   - `.next/` folder
   - `public/` folder
   - `node_modules/` folder (or run `npm install` via SSH)

### Method 3: SSH Deployment (Most Control)

```bash
# SSH into your server
ssh u177313858@park.audienceaura.org

# Navigate to your directory
cd domains/park.audienceaura.org/public_html

# Clone repository
git clone https://github.com/Audience-Aura-Org/Aurapark.git .

# Install dependencies
npm install

# Build application
npm run build

# Restart Node.js application
touch tmp/restart.txt
```

## Step 6: Build Process on Hostinger

After deploying code, you need to build:

### Via SSH:
```bash
cd /home/u177313858/domains/park.audienceaura.org/public_html
npm install
npm run build
```

### Via Hostinger Terminal (if available):
Same commands as SSH

## Step 7: Start/Restart Application

### Via Node.js Manager:
- Click **"Restart"** button

### Via SSH:
```bash
# Passenger restart
touch tmp/restart.txt

# Or restart Node.js service
passenger-config restart-app /home/u177313858/domains/park.audienceaura.org/public_html
```

## Step 8: Verify Deployment

1. Visit: `https://park.audienceaura.org`
2. Check health: `https://park.audienceaura.org/health`
3. Should return: `{"status":"System Online",...}`

## Troubleshooting

### Issue: "Application Error" or 503

**Check logs:**
```bash
# Via SSH
tail -f /home/u177313858/logs/park.audienceaura.org/error.log
tail -f /home/u177313858/logs/park.audienceaura.org/access.log
```

**Common fixes:**
1. Ensure `server.js` exists in root
2. Check Node.js version compatibility
3. Verify environment variables are set
4. Run `npm install` to ensure dependencies
5. Check file permissions: `chmod 755 server.js`

### Issue: "Cannot find module"

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port already in use

Hostinger manages ports automatically. Ensure your `server.js` uses:
```javascript
const port = parseInt(process.env.PORT || '3000', 10)
```

### Issue: Build fails

```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

## Important Notes

1. **Node.js Support**: Not all Hostinger plans support Node.js
   - Check: https://www.hostinger.com/tutorials/how-to-install-node-js
   - May need Business plan or higher

2. **Passenger vs PM2**: Hostinger uses Passenger, not PM2
   - Don't try to install PM2
   - Use Passenger restart commands

3. **Memory Limits**: Shared hosting has limits
   - Your app might be killed if using too much memory
   - Consider VPS if you hit limits

4. **Cold Starts**: Hostinger may spin down inactive apps
   - First request after inactivity might be slow

## Alternative: If Node.js Isn't Available

If your Hostinger plan doesn't support Node.js applications:

### Option 1: Upgrade Plan
- Upgrade to Business or Premium plan
- Costs ~$3-10/month

### Option 2: Use Hostinger + External Node.js
- Deploy Node.js app to Render/Railway (free)
- Use Hostinger only for domain/DNS
- Point domain to external service

### Option 3: Static Export (Limited)
- Convert to static Next.js export
- Lose server-side features (API routes, auth, etc.)
- Not recommended for your app

## Contact Hostinger Support

If you're stuck, contact Hostinger support with:
- "I need to deploy a Node.js application with custom server"
- "My application uses Next.js with a custom server.js file"
- "I need Passenger or Node.js application support enabled"

They can:
- Confirm if your plan supports Node.js
- Enable Node.js features
- Help with Passenger configuration
- Provide specific paths and settings for your account
