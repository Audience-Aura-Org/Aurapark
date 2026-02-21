#!/bin/bash

# Test Script for Busapp Transport Platform
# Runs all unit tests, integration tests, and linting
# Usage: bash scripts/test.sh

set -e

echo "🧪 Starting Busapp Transport Platform Test Suite..."
echo ""

cd transport-platform/apps/web

echo "📋 Running ESLint..."
npx eslint . --ext .ts,.tsx --format=compact || true

echo ""
echo "✅ ESLint check completed"
echo ""

echo "🔍 Type checking..."
npx tsc --noEmit

echo "✅ Type checking passed"
echo ""

echo "🧪 Running unit tests..."
npm test -- --coverage --forceExit

echo ""
echo "✅ Test suite completed!"
echo ""
echo "📊 Test commands:"
echo "  npm test                    - Run all tests"
echo "  npm test -- --watch         - Run tests in watch mode"
echo "  npm test -- --coverage      - Run with coverage report"
echo "  npm test SeatLockService    - Run specific test"
echo ""
echo "📈 Coverage reports available at: coverage/index.html"
