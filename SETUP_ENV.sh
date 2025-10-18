#!/bin/bash

echo "🔑 Setting up Environment Variables"
echo "===================================="
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists!"
    echo "   Do you want to overwrite it? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        echo "❌ Setup cancelled"
        exit 0
    fi
fi

# Copy the example file
echo "📄 Creating .env.local from .env.local.example..."
cp .env.local.example .env.local

echo "✅ Done!"
echo ""
echo "Your .env.local file has been created with:"
echo "  ✓ Neynar API Key: 9CB40C40-F4DF-4C1A-BC0A-252B84E3B73D"
echo "  ✓ Oracle Secret: (pre-generated)"
echo "  ✓ Cron Secret: (pre-generated)"
echo "  ✓ All app configuration set"
echo ""
echo "Next steps:"
echo "  1. Test API key: npm run dev"
echo "  2. Visit: http://localhost:3000/fantasy"
echo "  3. (Optional) Add Redis keys for production"
echo ""
echo "To add Redis later:"
echo "  1. Sign up at https://console.upstash.com"
echo "  2. Create a database"
echo "  3. Copy URL and TOKEN"
echo "  4. Edit .env.local and uncomment KV_REST_API_* lines"
echo ""

