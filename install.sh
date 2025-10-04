#!/bin/bash

echo "🚀 Installing Vibe Coach dependencies..."

# Clean up any existing node_modules
echo "🧹 Cleaning up existing dependencies..."
rm -rf node_modules package-lock.json pnpm-lock.yaml yarn.lock

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Copy .env.local.example to .env.local"
    echo "2. Fill in your environment variables"
    echo "3. Run 'npm run dev' to start the development server"
else
    echo "❌ Installation failed. Please check the error messages above."
    exit 1
fi
