#!/bin/bash

echo "🚀 Fantasy League - Production Deployment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not installed${NC}"
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

echo -e "${BLUE}Step 1: Committing latest changes${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Add all files
git add .

# Show what will be committed
echo "Files to commit:"
git status --short

echo ""
read -p "Commit these changes? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git commit -m "Production deployment: $(date +%Y-%m-%d\ %H:%M:%S)" || echo "Nothing to commit"
    echo -e "${GREEN}✅ Changes committed${NC}"
else
    echo -e "${YELLOW}⏭️  Skipping commit${NC}"
fi

echo ""
echo -e "${BLUE}Step 2: Pushing to GitHub${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Push to GitHub? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin main || git push origin master
    echo -e "${GREEN}✅ Pushed to GitHub${NC}"
else
    echo -e "${YELLOW}⏭️  Skipping GitHub push${NC}"
fi

echo ""
echo -e "${BLUE}Step 3: Building locally to catch errors${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed - fix errors before deploying${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 4: Deploying to Vercel${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Choose deployment option:"
echo "  1) Deploy to production (recommended)"
echo "  2) Deploy to preview first (safer)"
echo "  3) Skip deployment"
echo ""
read -p "Enter choice (1-3): " -n 1 -r
echo ""

if [[ $REPLY == "1" ]]; then
    echo ""
    echo "🚀 Deploying to PRODUCTION..."
    vercel --prod
    echo -e "${GREEN}✅ Deployed to production!${NC}"
elif [[ $REPLY == "2" ]]; then
    echo ""
    echo "🔍 Deploying to PREVIEW..."
    vercel
    echo -e "${GREEN}✅ Deployed to preview!${NC}"
    echo ""
    echo "Test your preview URL, then run:"
    echo "  vercel --prod"
else
    echo -e "${YELLOW}⏭️  Skipping deployment${NC}"
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get the URL
VERCEL_URL=$(vercel ls | grep "fantasy-league" | head -1 | awk '{print $2}' 2>/dev/null || echo "your-app.vercel.app")

echo "📱 Your app is live at:"
echo "   https://$VERCEL_URL/fantasy"
echo ""
echo "📋 Next steps:"
echo "   1. Set environment variables in Vercel dashboard"
echo "   2. Trigger a redeploy"
echo "   3. Test your production URL"
echo "   4. Check cron job status"
echo ""
echo "🔧 Set environment variables:"
echo "   vercel env add NEYNAR_API_KEY production"
echo "   vercel env add NEXT_PUBLIC_URL production"
echo "   vercel env add ORACLE_SECRET production"
echo "   vercel env add CRON_SECRET production"
echo ""
echo "Or use the Vercel dashboard:"
echo "   https://vercel.com/dashboard"
echo ""
echo "📖 Full guide: DEPLOY_TO_PRODUCTION.md"
echo ""

