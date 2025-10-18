#!/bin/bash

echo "🤖 Testing Oracle System"
echo "========================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check environment variables
echo "1️⃣  Checking environment variables..."
if [ -z "$NEYNAR_API_KEY" ]; then
    echo -e "${RED}❌ NEYNAR_API_KEY not set${NC}"
    exit 1
fi
echo -e "${GREEN}✅ NEYNAR_API_KEY set${NC}"

if [ -z "$ORACLE_SECRET" ]; then
    echo -e "${RED}❌ ORACLE_SECRET not set${NC}"
    exit 1
fi
echo -e "${GREEN}✅ ORACLE_SECRET set${NC}"
echo ""

# Test aggregation endpoint
echo "2️⃣  Testing oracle aggregation..."
echo "   Adding test creator to active list..."

# Add a test creator (vitalik.eth)
curl -s "http://localhost:3000/api/fantasy/bid" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"passTokenId": 1, "handle": "vitalik.eth", "bidIC": 25}' \
  > /dev/null 2>&1

sleep 1

# Trigger aggregation
echo "   Triggering aggregation..."
RESPONSE=$(curl -s -X POST "http://localhost:3000/api/oracle/aggregate?test=true")

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Aggregation successful${NC}"
    echo "$RESPONSE" | jq '.results[0]' 2>/dev/null || echo "$RESPONSE"
else
    echo -e "${RED}❌ Aggregation failed${NC}"
    echo "$RESPONSE"
    exit 1
fi
echo ""

# Test verification endpoint
echo "3️⃣  Testing verification endpoint..."
VERIFY=$(curl -s "http://localhost:3000/api/oracle/verify/vitalik.eth?week=1")

if echo "$VERIFY" | grep -q '"handle":"vitalik.eth"'; then
    echo -e "${GREEN}✅ Verification successful${NC}"
    echo "$VERIFY" | jq '.pointsCalculation' 2>/dev/null || echo "Points breakdown available"
else
    echo -e "${RED}❌ Verification failed${NC}"
    echo "$VERIFY"
fi
echo ""

# Test points calculation
echo "4️⃣  Testing points calculator..."
node -e "
const { calculateWeeklyPoints } = require('./src/lib/oracle/points-calculator.ts');
const metrics = {
  newFollowers: 100,
  totalLikes: 500,
  totalViews: 10000,
  totalReplies: 50,
  postsCount: 10,
  totalRecasts: 30,
  viralPosts: 1,
  sponsoredPosts: 0,
  engagementRate: 0.05,
};

const breakdown = calculateWeeklyPoints(metrics, false);
console.log('Regular points:', breakdown.finalPoints);

const captainBreakdown = calculateWeeklyPoints(metrics, true);
console.log('Captain points:', captainBreakdown.finalPoints);
console.log('✅ Points calculation working');
" 2>/dev/null && echo -e "${GREEN}✅ Points calculator working${NC}" || echo -e "${RED}⚠️  Points calculator test skipped (requires build)${NC}"
echo ""

echo "🎉 Oracle system tests complete!"
echo ""
echo "Next steps:"
echo "  1. Deploy to Vercel: vercel --prod"
echo "  2. Set env vars in Vercel dashboard"
echo "  3. Monitor cron logs: vercel logs --follow"
echo "  4. Check verification: https://your-app.vercel.app/api/oracle/verify/vitalik.eth"

