#!/bin/bash

# Calculation Tree - Quick Start Script
# This script helps you get started with the application

set -e

echo "🌳 Calculation Tree - Quick Start"
echo "=================================="
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ from https://nodejs.org/"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js $(node --version) found"
echo "✅ npm $(npm --version) found"
echo ""

# Check for Docker
if command_exists docker && command_exists docker-compose; then
    echo "✅ Docker found"
    echo ""
    echo "You can run the application in two ways:"
    echo ""
    echo "1. 🐳 Docker Mode (Recommended for quick start)"
    echo "   - Everything runs in containers"
    echo "   - No local setup needed"
    echo "   - Run: docker-compose up --build"
    echo ""
    echo "2. 💻 Local Development Mode"
    echo "   - Better for development"
    echo "   - Hot reload enabled"
    echo "   - Requires local PostgreSQL"
    echo ""
    read -p "Choose mode (docker/local): " mode
else
    echo "⚠️  Docker not found - will use local development mode"
    mode="local"
fi

echo ""

if [ "$mode" = "docker" ]; then
    echo "🐳 Starting in Docker mode..."
    echo ""
    echo "Building and starting containers..."
    docker-compose up --build
elif [ "$mode" = "local" ]; then
    echo "💻 Setting up local development mode..."
    echo ""
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    npm install
    
    # Setup backend
    echo ""
    echo "🔧 Setting up backend..."
    cd backend
    npm install
    
    if [ ! -f ".env" ]; then
        echo "📝 Creating .env file..."
        cat > .env << EOL
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=calculation_tree
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:3000
EOL
        echo "✅ .env file created with random JWT secret"
    else
        echo "✅ .env file already exists"
    fi
    
    cd ..
    
    # Setup frontend
    echo ""
    echo "🎨 Setting up frontend..."
    cd frontend
    npm install
    cd ..
    
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "⚠️  Make sure PostgreSQL is running with:"
    echo "   - Database: calculation_tree"
    echo "   - User: postgres"
    echo "   - Password: postgres"
    echo ""
    echo "💡 To start a PostgreSQL container:"
    echo "   docker run --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=calculation_tree -p 5432:5432 -d postgres:16-alpine"
    echo ""
    echo "🚀 Starting development servers..."
    echo ""
    npm run dev
else
    echo "❌ Invalid mode selected"
    exit 1
fi

