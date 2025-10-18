#!/bin/bash

echo "🎮 Influencer Fantasy League - Quick Start"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check for .env.local file
if [ ! -f ".env.local" ]; then
    echo "⚠️  No .env.local file found."
    echo "   Creating minimal config..."
    cat > .env.local << 'EOF'
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_FRAME_NAME="Influencer Fantasy League"
NEXT_PUBLIC_FRAME_DESCRIPTION="Draft creators, earn points, win ETH prizes"
NEXT_PUBLIC_FRAME_BUTTON_TEXT="Play Now"
NEXT_PUBLIC_FRAME_PRIMARY_CATEGORY="gaming"
NEXT_PUBLIC_FRAME_TAGS="fantasy,creators,gaming,social"
NEXT_PUBLIC_USE_WALLET=true
EOF
    echo "   ✅ Created .env.local"
    echo "   ⚠️  Add your NEYNAR_API_KEY for full functionality"
    echo ""
fi

echo "🚀 Starting development server..."
echo "   Fantasy League: http://localhost:3000/fantasy"
echo "   Original Demo: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev

