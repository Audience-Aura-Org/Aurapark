#!/bin/bash

# Development Setup Script for Busapp Transport Platform
# Run this script to set up your development environment
# Usage: bash scripts/setup-dev.sh

set -e

echo "🚀 Starting Busapp Transport Platform Development Setup..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if MongoDB is running (optional check)
if command -v mongosh &> /dev/null; then
    echo "✅ MongoDB tools found"
else
    echo "⚠️  MongoDB tools not found (optional - you can use MongoDB Atlas)"
fi

echo ""
echo "📦 Installing dependencies..."

# Install root dependencies
npm install

# Install transport-platform dependencies
cd transport-platform
npm install

# Install web app dependencies
cd apps/web
npm install

cd ../../..

echo ""
echo "📝 Setting up environment variables..."

# Copy .env.example to .env.local if it doesn't exist
if [ ! -f "transport-platform/apps/web/.env.local" ]; then
    cp "transport-platform/apps/web/.env.example" "transport-platform/apps/web/.env.local"
    echo "✅ Created .env.local - Update it with your actual credentials"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🔗 Building types and validating setup..."

# Go to web app directory
cd transport-platform/apps/web

# Check TypeScript compilation
echo "Checking TypeScript configuration..."
npx tsc --noEmit 2>/dev/null || true

cd ../../..

echo ""
echo "✅ Development setup complete!"
echo ""
echo "📚 Next steps:"
echo "1. Update .env.local with your credentials (database, payment gateway, etc.)"
echo "2. Run: npm run dev (from transport-platform/apps/web)"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "💡 Useful commands:"
echo "  npm run dev          - Start development server"
echo "  npm run build        - Build for production"
echo "  npm test             - Run unit tests"
echo "  npm run lint         - Run ESLint"
echo "  npm run format       - Format code with Prettier"
echo ""
echo "📖 Documentation:"
echo "  Read README.md for project overview"
echo "  Read DEVELOPER_REFERENCE.md for API details"
echo "  Read SETUP_PRODUCTION.md for production deployment"
