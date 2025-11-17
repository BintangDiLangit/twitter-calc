#!/bin/bash
set -e

echo "=== Build Script ==="
echo "Current directory: $(pwd)"
echo "Contents:"
ls -la

echo ""
echo "Checking for frontend directory..."
if [ -d "frontend" ]; then
  echo "✓ Frontend directory found"
  cd frontend
  echo "Changed to: $(pwd)"
  echo "Installing frontend dependencies..."
  npm install
  echo "Building frontend..."
  npm run build
  echo "✓ Build complete!"
else
  echo "✗ Frontend directory not found!"
  echo "Current directory contents:"
  ls -la
  exit 1
fi

