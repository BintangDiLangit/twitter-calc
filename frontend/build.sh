#!/bin/bash
set -e

echo "Current directory: $(pwd)"
echo "Listing files:"
ls -la

if [ -d "frontend" ]; then
  echo "Frontend directory found, changing to it..."
  cd frontend
elif [ -f "package.json" ] && [ -f "vite.config.ts" ]; then
  echo "Already in frontend directory"
else
  echo "Error: Cannot find frontend directory or frontend files"
  exit 1
fi

echo "Installing dependencies..."
npm install

echo "Building..."
npm run build

echo "Build complete!"

