# Hostinger Deployment Checklist

## 1. Node.js Application Settings (Hostinger Control Panel)

### Application Root
- Should be set to: `/public_html/.builds/source/repository`
- This is where your `server.js` file is located

### Application URL
- Should match your domain: `https://park.audienceaura.org`

### Application Startup File
- **CRITICAL**: Must be set to: `server.js`
- NOT `apps/web/server.js`
- NOT `.next/standalone/server.js`

### Node.js Version
- Recommended: Node.js 18.x or 20.x
- Check that it matches your local development version

### Environment Variables (MUST BE SET)
Go to your Node.js app settings and add these:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-actual-secret-key-here
MONGODB_URI=your-mongodb-connection-string
```

**IMPORTANT**: The `PORT` variable should match what Hostinger expects. Try both:
- `PORT=3000` (default in our server.js)
- Check Hostinger docs for their required port

## 2. Build Verification

After the build completes, verify these files exist in your repository root:

```
/public_html/.builds/source/repository/
├── server.js              ← Your custom server
├── package.json           ← Root package.json
├── .next/                 ← Next.js build output
│   ├── static/           ← Static assets
│   └── server/           ← Server bundles
├── public/               ← Public assets
├── node_modules/         ← Dependencies from standalone
└── apps/
    └── web/
```

## 3. Common Hostinger Issues & Fixes

### Issue: "Application is not running"
**Fix**: Click "Restart" in the Node.js application manager

### Issue: "Port already in use"
**Fix**: Change PORT in environment variables or update server.js to use `process.env.PORT`

### Issue: "Module not found"
**Fix**: Ensure the build script copied node_modules from standalone build

### Issue: "Cannot find .next directory"
**Fix**: Check build logs - the .next folder should be in the root after build

## 4. Debugging Commands

If you have SSH access to Hostinger, run these:

```bash
# Check if .next exists
ls -la .next/

# Check if node_modules exists
ls -la node_modules/ | head

# Check server.js
cat server.js | head -20

# Try running manually
NODE_ENV=production PORT=3000 node server.js

# Check what's listening on port 3000
netstat -tulpn | grep 3000
```

## 5. Alternative: Simplified Deployment

If standalone mode continues to cause issues, we can switch to a simpler approach:

1. Remove `output: 'standalone'` from next.config.mjs
2. Update build script to just copy .next and public
3. Ensure all dependencies are in the root package.json

## 6. Contact Hostinger Support

If none of the above works, contact Hostinger support with:
- Build logs (showing successful compilation)
- Application settings screenshot
- Error logs from their control panel
- Ask specifically: "What port should my Node.js app listen on?"
