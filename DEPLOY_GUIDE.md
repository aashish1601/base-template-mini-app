# 🚀 Deployment Guide - Fantasy League Mini-App

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Neynar API key
- Domain (optional, Vercel provides free subdomain)

---

## Step 1: Prepare Your Repository

```bash
cd base-template-mini-app

# Initialize git (if not already)
git init

# Add all files
git add .
git commit -m "Initial commit - Influencer Fantasy League"

# Create GitHub repo and push
gh repo create fantasy-league --public --source=. --remote=origin --push
# OR manually create repo on GitHub and:
git remote add origin https://github.com/YOUR_USERNAME/fantasy-league.git
git push -u origin main
```

---

## Step 2: Deploy to Vercel

### Option A: Vercel CLI (Fastest)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: fantasy-league
# - Directory: ./
# - Override settings? No

# Production deploy
vercel --prod
```

### Option B: Vercel Dashboard (Easiest)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your GitHub repo
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

---

## Step 3: Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```env
# Required
NEXT_PUBLIC_URL=https://your-app.vercel.app
NEXT_PUBLIC_FRAME_NAME=Influencer Fantasy League
NEXT_PUBLIC_FRAME_DESCRIPTION=Draft creators, earn points, win ETH
NEXT_PUBLIC_FRAME_BUTTON_TEXT=Play Now
NEXT_PUBLIC_FRAME_PRIMARY_CATEGORY=gaming
NEXT_PUBLIC_FRAME_TAGS=fantasy,creators,gaming,social

# Wallet Features
NEXT_PUBLIC_USE_WALLET=true

# Neynar API
NEYNAR_API_KEY=YOUR_NEYNAR_KEY
NEYNAR_CLIENT_ID=YOUR_CLIENT_ID

# Database (Redis - Optional)
KV_REST_API_URL=https://your-redis.upstash.io
KV_REST_API_TOKEN=your_token

# Smart Contracts (After deployment)
NEXT_PUBLIC_MANAGER_PASS_ADDRESS=0x...
NEXT_PUBLIC_LEAGUE_CORE_ADDRESS=0x...

# Oracle (For scoring automation)
ORACLE_PRIVATE_KEY=0x...
CHAINLINK_FUNCTIONS_SUBSCRIPTION_ID=123
```

Then click "Save" and trigger a redeploy.

---

## Step 4: Get Neynar API Key

1. Visit [dev.neynar.com](https://dev.neynar.com)
2. Sign in with Farcaster
3. Create new API key
4. Copy key and client ID
5. Add to Vercel environment variables

---

## Step 5: Set Up Redis (Optional but Recommended)

### Using Upstash (Free 10k requests/day)

```bash
# 1. Go to console.upstash.com
# 2. Create new Redis database
# 3. Copy REST URL and Token
# 4. Add to Vercel env vars:
KV_REST_API_URL=https://your-db.upstash.io
KV_REST_API_TOKEN=AXX...
```

### Update API Routes

Replace in-memory storage with Redis in:
- `/api/fantasy/state/route.ts`
- `/api/fantasy/mint/route.ts`
- `/api/fantasy/bid/route.ts`

Example:
```typescript
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Store manager
await redis.set(`manager:${fid}`, JSON.stringify(managerData));

// Retrieve manager
const data = await redis.get(`manager:${fid}`);
```

---

## Step 6: Deploy Smart Contracts

### Install Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Compile Contracts

```bash
cd contracts
forge build
```

### Deploy to Base Sepolia (Testnet)

```bash
# Set your private key
export PRIVATE_KEY=0xYOUR_PRIVATE_KEY

# Deploy ManagerPass
forge create ManagerPass \
  --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY

# Note the deployed address
# Deploy LeagueCore with oracle address
forge create LeagueCore \
  --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY \
  --constructor-args 0xYOUR_WALLET_ADDRESS
```

### Deploy to Base Mainnet (Production)

```bash
# Deploy ManagerPass
forge create ManagerPass \
  --rpc-url https://mainnet.base.org \
  --private-key $PRIVATE_KEY \
  --verify

# Deploy LeagueCore
forge create LeagueCore \
  --rpc-url https://mainnet.base.org \
  --private-key $PRIVATE_KEY \
  --constructor-args 0xYOUR_ORACLE_ADDRESS \
  --verify
```

Add contract addresses to Vercel env vars.

---

## Step 7: Verify Deployment

1. **Check homepage**: `https://your-app.vercel.app`
2. **Check fantasy page**: `https://your-app.vercel.app/fantasy`
3. **Test API**: `curl https://your-app.vercel.app/api/fantasy/state?fid=1`
4. **Check logs**: Vercel Dashboard → Deployments → View Function Logs

---

## Step 8: Set Up Monitoring

### Vercel Analytics

```bash
npm install @vercel/analytics
```

Add to `src/app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Error Tracking (Sentry)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## Step 9: Custom Domain (Optional)

1. Buy domain (Namecheap, GoDaddy, etc.)
2. In Vercel Dashboard → Settings → Domains
3. Add your domain
4. Update DNS records:
   ```
   A     @    76.76.21.21
   CNAME www  cname.vercel-dns.com
   ```
5. Wait for propagation (1-24 hours)
6. Update `NEXT_PUBLIC_URL` in env vars

---

## Step 10: Claim Mini-App Ownership

To send notifications and earn developer rewards:

1. Go to [farcaster.xyz/~/developers/mini-apps/manifest](https://farcaster.xyz/~/developers/mini-apps/manifest)
2. Click "Claim Ownership"
3. Sign with your phone
4. Copy the three values:
   ```
   ACCOUNT_ASSOCIATION_HEADER
   ACCOUNT_ASSOCIATION_PAYLOAD
   ACCOUNT_ASSOCIATION_SIGNATURE
   ```
5. Add to Vercel env vars
6. Redeploy

---

## Troubleshooting

### Build Fails

```bash
# Check build logs
vercel logs

# Common fixes:
# 1. Ensure all dependencies installed
npm install

# 2. Check TypeScript errors
npm run build

# 3. Verify environment variables set
vercel env pull
```

### Runtime Errors

```bash
# Check function logs in Vercel Dashboard
# Common issues:
# - Missing env vars
# - CORS errors (add domain to CORS config)
# - API rate limits (upgrade Neynar plan)
```

### Wallet Connection Issues

```bash
# Ensure these are set:
NEXT_PUBLIC_USE_WALLET=true
NEXT_PUBLIC_URL=https://... (not http)

# Test on Base Sepolia first
# Check Wagmi config includes Base chain
```

---

## Performance Optimization

### Enable Edge Functions

Add to route files:
```typescript
export const runtime = 'edge';
```

### Add Caching

```typescript
export const revalidate = 60; // ISR - regenerate every 60s
```

### Image Optimization

Use Next.js Image component:
```typescript
import Image from 'next/image';

<Image 
  src="/icon.png"
  width={48}
  height={48}
  alt="Icon"
/>
```

---

## CI/CD (Auto-Deploy on Push)

Vercel auto-deploys on:
- `main` branch → Production
- Other branches → Preview

To disable auto-deploy:
```bash
# vercel.json
{
  "github": {
    "enabled": false
  }
}
```

---

## Scaling Considerations

### Traffic Spikes
- Vercel auto-scales
- Upgrade plan if hitting limits
- Consider CDN for static assets

### Database
- Upstash Redis (10k req/day free)
- Upgrade to Pro for unlimited
- Or use Supabase PostgreSQL

### Smart Contracts
- Gas optimization important
- Consider L2 rollup (Base is already L2)
- Batch operations when possible

---

## Security Checklist

- [ ] All API routes authenticated
- [ ] Rate limiting enabled
- [ ] Input validation (Zod)
- [ ] CORS configured
- [ ] Env vars not exposed client-side
- [ ] Smart contracts audited
- [ ] Private keys in secure vault
- [ ] HTTPS enforced
- [ ] Content Security Policy set

---

## Cost Estimate (Monthly)

| Service | Tier | Cost |
|---------|------|------|
| Vercel | Hobby | $0 (then $20/mo) |
| Upstash Redis | Free | $0 (10k req/day) |
| Neynar API | Starter | $0 (then $49/mo) |
| Base Gas | Variable | ~$5-50 |
| Domain | Optional | ~$12/year |
| **Total** | | **~$0-70/mo** |

---

## Going Viral

### Share on Farcaster
```bash
# Use ShareButton in app
# Post cast with mini-app embed
# Tag @farcaster @neynar
```

### Launch Strategy
1. Soft launch to 10 beta testers
2. Fix bugs
3. Announce Season 1 start date
4. Daily updates during draft
5. Weekly leaderboard casts
6. Partnerships with creators

---

## Support

Issues? Check:
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Farcaster Docs](https://docs.farcaster.xyz)
- [Neynar Docs](https://docs.neynar.com)

Or reach out:
- Discord: [Your server]
- Twitter: [@YourHandle]

---

**🎉 Congrats! Your Fantasy League is live!**

Next: Drive traffic and iterate based on user feedback.

