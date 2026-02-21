#!/bin/bash

# Production Setup Script for Busapp Transport Platform
# Run this script to set up your production environment
# Usage: bash scripts/setup-prod.sh

set -e

echo "🚀 Starting Busapp Transport Platform Production Setup..."
echo ""

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check npm version
echo "✅ npm version: $(npm --version)"
echo ""

echo "📦 Installing production dependencies..."

# Install root dependencies (production only)
npm ci --only=production

# Install transport-platform dependencies
cd transport-platform
npm ci --only=production

# Install web app dependencies
cd apps/web
npm ci --only=production

cd ../../..

echo ""
echo "📝 Validating environment variables..."

# Check if .env.local exists in production (should be set by deployment service)
if [ ! -f "transport-platform/apps/web/.env.local" ]; then
    echo "⚠️  .env.local not found - Ensure it's set by your deployment service"
    echo "    Required variables: MONGODB_URI, JWT_SECRET, FLUTTERWAVE_SECRET_KEY, etc."
fi

echo ""
echo "🔧 Building application..."

cd transport-platform/apps/web

# Build Next.js application
npm run build

echo ""
echo "✅ Production setup complete!"
echo ""
echo "🚀 To start the production server:"
echo "   npm run start"
echo ""
echo "📊 Production checklist:"
echo "  [ ] Environment variables verified (.env.local)"
echo "  [ ] Database connection tested"
echo "  [ ] Payment gateway credentials configured"
echo "  [ ] CORS and security headers configured"
echo "  [ ] Logging and monitoring set up"
echo "  [ ] Backup and disaster recovery tested"
echo ""
echo "📖 Deployment guides:"
echo "  Read HOSTINGER_DEPLOYMENT_CHECKLIST.md for Hostinger deployment"
echo "  Read DEPLOY_TO_RENDER.md for Render deployment"
echo "  Read SETUP_PRODUCTION.md for comprehensive setup guide"
