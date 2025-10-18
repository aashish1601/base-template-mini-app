# 🤖 Oracle System Setup Guide

The oracle system automatically fetches influencer data and calculates points every 15 minutes.

---

## 📁 Files Created

### Core Library Files
```
src/lib/oracle/
├── types.ts                  # TypeScript definitions
├── neynar-client.ts         # Neynar API integration
├── points-calculator.ts     # Scoring logic
└── storage.ts               # Redis/memory storage
```

### API Routes
```
src/app/api/
├── oracle/
│   ├── aggregate/route.ts        # Main aggregation endpoint
│   └── verify/[handle]/route.ts  # Verification/transparency
└── cron/
    └── update-scores/route.ts    # Cron job endpoint
```

---

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install @neynar/nodejs-sdk @upstash/redis
```

### 2. Set Environment Variables
Add to `.env.local`:
```env
# Neynar API
NEYNAR_API_KEY=your_neynar_key_here

# Oracle secrets
ORACLE_SECRET=your_random_secret_here
CRON_SECRET=your_cron_secret_here

# Redis (optional - uses in-memory if not set)
KV_REST_API_URL=https://your-redis.upstash.io
KV_REST_API_TOKEN=your_token_here
```

### 3. Deploy to Vercel
```bash
vercel --prod
```

The cron job will automatically start running every 15 minutes!

---

## 🔄 How It Works

### Data Flow
```
Every 15 minutes:

1. Vercel Cron triggers
   ↓
2. /api/cron/update-scores
   ↓
3. /api/oracle/aggregate
   ↓
4. For each creator:
   - Fetch from Neynar API
   - Calculate metrics
   - Validate data
   - Calculate points
   - Store in Redis
   ↓
5. Frontend polls /api/fantasy/squad
   → Shows updated scores
```

### Scoring Formula

```typescript
Points Calculation:

Base Points =
  (New Followers × 0.1)
  + (Likes × 0.2)
  + (Views ÷ 1000 × 2)
  + (Replies × 0.5)
  + (Posts × 1)
  + (Recasts × 0.3)

Bonuses:
  + Viral posts (>1000 likes) × 50
  + Sponsored posts × 20
  + Consistency bonus (5+ posts) = 10
  + Engagement bonus (>10% rate) = 15

Captain Multiplier:
  Final Points = Base Points × 1.5 (if captain)
```

---

## 🧪 Testing

### Test Manually
```bash
# Test aggregation (requires ORACLE_SECRET)
curl -X POST http://localhost:3000/api/oracle/aggregate \
  -H "Authorization: Bearer your_oracle_secret"

# Test in browser (development only)
http://localhost:3000/api/oracle/aggregate?test=true
```

### Verify Data
```bash
# Check a creator's points breakdown
curl http://localhost:3000/api/oracle/verify/vitalik.eth?week=1
```

Expected response:
```json
{
  "handle": "vitalik.eth",
  "weekNumber": 1,
  "rawMetrics": {
    "followerCount": 450000,
    "newFollowers": 1234,
    "totalLikes": 5678,
    "postsCount": 12
  },
  "pointsCalculation": {
    "followerPoints": "1234 × 0.1 = 123",
    "likePoints": "5678 × 0.2 = 1136",
    "finalPoints": 1567
  }
}
```

---

## 📊 Monitoring

### Check Cron Logs
```bash
# In Vercel Dashboard
Settings → Cron Jobs → View Logs

# Or via CLI
vercel logs --follow
```

### Add to Squad API
Update `src/app/api/fantasy/squad/route.ts`:

```typescript
import { oracleStorage } from '~/lib/oracle/storage';

// Get real-time points
const breakdown = await oracleStorage.getPointsBreakdown(
  handle,
  currentWeek
);

const points = breakdown?.finalPoints || 0;
```

---

## 🔧 Configuration

### Change Update Frequency

Edit `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/update-scores",
    "schedule": "*/5 * * * *"    // Every 5 minutes
    // OR
    "schedule": "0 * * * *"      // Every hour
    // OR
    "schedule": "0 0 * * *"      // Daily at midnight
  }]
}
```

### Customize Point Values

Edit `src/lib/oracle/points-calculator.ts`:
```typescript
const POINTS_CONFIG = {
  newFollower: 0.2,          // Change from 0.1
  like: 0.3,                 // Change from 0.2
  viralBonus: 100,           // Change from 50
  captainMultiplier: 2.0,    // Change from 1.5
  // ...
};
```

---

## 🔐 Security

### Protect Endpoints

All oracle endpoints require authorization:

```typescript
// Check in every endpoint
const authHeader = request.headers.get('authorization');
if (authHeader !== `Bearer ${process.env.ORACLE_SECRET}`) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Generate Strong Secrets

```bash
# Generate random secrets
openssl rand -hex 32

# Add to Vercel
vercel env add ORACLE_SECRET
vercel env add CRON_SECRET
```

---

## 📈 Scaling

### For High Traffic

1. **Use Redis** (not in-memory):
```bash
# Sign up for Upstash (free 10k req/day)
# Get URL and token
# Add to environment variables
```

2. **Add Rate Limiting**:
```typescript
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});
```

3. **Batch Processing**:
```typescript
// Process creators in batches of 10
const batches = chunk(creators, 10);
for (const batch of batches) {
  await Promise.all(batch.map(processCreator));
}
```

---

## 🐛 Troubleshooting

### Issue: Cron not running

**Solution:**
```bash
# Check Vercel Cron status
vercel inspect your-deployment-url

# Verify cron secret set
vercel env ls

# Check logs
vercel logs --since 1h
```

### Issue: Neynar API errors

**Solution:**
```typescript
// Add retry logic
async function fetchWithRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

### Issue: Points not updating in UI

**Check:**
1. Cron is running: Check Vercel logs
2. Data is stored: Test `/api/oracle/verify/handle`
3. Frontend is fetching: Check network tab
4. Redis connection: Check `KV_REST_API_URL` set

---

## 📱 Frontend Integration

### Update Squad Component

```typescript
// src/components/fantasy/Squad.tsx

import { oracleStorage } from '~/lib/oracle/storage';

async function fetchSquadDetails(passTokenId: number) {
  const currentWeek = await oracleStorage.getCurrentWeek();
  
  const squad = await Promise.all(
    creators.map(async (handle) => {
      const breakdown = await oracleStorage.getPointsBreakdown(
        handle,
        currentWeek
      );
      
      return {
        handle,
        points: breakdown?.finalPoints || 0,
        breakdown, // Show detailed breakdown on click
      };
    })
  );
  
  return squad;
}
```

### Real-Time Updates

```typescript
// Use Server-Sent Events for live updates
const events = new EventSource('/api/oracle/stream');

events.onmessage = (event) => {
  const { handle, points } = JSON.parse(event.data);
  updateSquadMember(handle, points);
};
```

---

## 🎯 Next Steps

1. ✅ Deploy to Vercel
2. ✅ Verify cron running (check logs)
3. ✅ Test with 1-2 creators first
4. ✅ Monitor for 24 hours
5. ✅ Scale to all creators
6. ✅ Add monitoring dashboard

---

## 📞 Support

Issues? Check:
- Vercel logs: `vercel logs --follow`
- Oracle verification: `/api/oracle/verify/handle`
- Storage: Check Redis dashboard

---

**✅ Your oracle is now live and automatically updating scores!** 🎉

