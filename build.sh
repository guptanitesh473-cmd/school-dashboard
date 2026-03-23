#!/bin/bash
# Build frontend and output to backend/public (ready for production)
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Installing backend dependencies..."
cd "$SCRIPT_DIR/backend"
npm install --omit=dev

echo "Installing frontend dependencies..."
cd "$SCRIPT_DIR/frontend"
npm install

echo "Building frontend..."
npm run build

echo ""
echo "Build complete! backend/public has the built frontend."
echo "Run: pm2 start ecosystem.config.js"
