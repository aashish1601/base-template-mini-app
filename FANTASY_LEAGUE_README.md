# 🏆 Influencer Fantasy League - Mini App

A Farcaster mini-app where users draft creators, earn points from their content performance, and win ETH prizes.

## 🎮 Features Implemented

### Smart Contracts
- ✅ `ManagerPass.sol` - ERC-721 NFT for season entry (100 max supply)
- ✅ `LeagueCore.sol` - Main game logic (drafting, scoring, prizes)

### Frontend Components
- ✅ **Lobby** - Season info, mint pass, prize breakdown
- ✅ **Draft Room** - Live auction to draft 5 creators
- ✅ **Squad** - View your team, set captain, track weekly points
- ✅ **Leaderboard** - Overall & weekly rankings with prize estimates

### API Routes
- ✅ `/api/fantasy/state` - Get current game state
- ✅ `/api/fantasy/mint` - Mint manager pass
- ✅ `/api/fantasy/creators` - Get available creators
- ✅ `/api/fantasy/bid` - Place draft bid
- ✅ `/api/fantasy/squad` - Get squad details
- ✅ `/api/fantasy/leaderboard` - Rankings & prizes
- ✅ `/api/fantasy/captain` - Set team captain

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd base-template-mini-app
npm install
```

### 2. Set Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_FRAME_NAME="Fantasy League"
NEXT_PUBLIC_FRAME_DESCRIPTION="Draft creators, win prizes"
NEXT_PUBLIC_FRAME_BUTTON_TEXT="Play Now"
NEXT_PUBLIC_USE_WALLET=true
NEYNAR_API_KEY=your_key_here
```

### 3. Run Development Server
```bash
npm run dev
```

Visit: `http://localhost:3000/fantasy`

## 📊 Game Flow

```
1. LOBBY (Setup Phase)
   ├─ View prize pool & passes left
   ├─ Mint Manager Pass (0.03 ETH)
   └─ Wait for draft to start

2. DRAFT ROOM (Drafting Phase)
   ├─ Browse 15+ trending creators
   ├─ Bid Influence Coins (100 IC budget)
   └─ Build squad of 5 creators

3. SQUAD (Playing Phase, 8 weeks)
   ├─ View weekly points per creator
   ├─ Set captain (1.5× multiplier)
   └─ Track total season score

4. LEADERBOARD (All Phases)
   ├─ See overall rankings
   ├─ Check weekly leaders
   └─ Claim prize if top 10

5. SETTLEMENT (Season End)
   └─ Top 10 claim ETH prizes
```

## 💎 Prize Distribution

| Rank | Share | Example (3 ETH pool) |
|------|-------|---------------------|
| 🥇 1st | 45% | 1.35 ETH |
| 🥈 2nd | 25% | 0.75 ETH |
| 🥉 3rd | 15% | 0.45 ETH |
| 📊 4-10th | 15% split | ~0.06 ETH each |

## 🎯 Scoring System (Per Creator, Per Week)

| Activity | Points |
|----------|--------|
| New follower | 0.1 |
| Post like | 0.2 |
| 1k video views | 2 |
| Share-cast | 1 |
| Reply to fan | 0.5 |
| Sponsorship | 20 |

**Captain Bonus**: 1.5× multiplier on all points

## 🔧 Production Deployment

### Deploy to Vercel
```bash
npm run deploy:vercel
```

### Smart Contract Deployment
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Compile contracts
cd contracts
forge build

# Deploy to Base
forge create ManagerPass \
  --rpc-url https://mainnet.base.org \
  --private-key $PRIVATE_KEY

forge create LeagueCore \
  --rpc-url https://mainnet.base.org \
  --private-key $PRIVATE_KEY \
  --constructor-args $ORACLE_ADDRESS
```

### Database Setup (Production)
Replace in-memory storage with Redis/PostgreSQL:

```typescript
// Use Upstash Redis
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Store game state
await redis.set(`manager:${fid}`, managerData);
```

## 🔌 Integration Points

### Neynar API (For Real Data)
```typescript
import { NeynarAPIClient } from '@neynar/nodejs-sdk';

const neynar = new NeynarAPIClient({ apiKey: process.env.NEYNAR_API_KEY });

// Fetch creator stats
const user = await neynar.lookupUserByUsername(handle);
const stats = {
  followers: user.follower_count,
  engagement: user.engagement_rate,
};
```

### Chainlink Oracle (For Scoring)
```typescript
// Automate weekly point calculation
// Use Chainlink Functions to:
// 1. Fetch social metrics from APIs
// 2. Calculate points per creator
// 3. Submit to LeagueCore.submitPoints()
```

## 🎨 Customization

### Change Prize Distribution
Edit `LeagueCore.sol`:
```solidity
function _calculatePrize(uint256 rank) internal view returns (uint256) {
    if (rank == 1) return (prizePool * 50) / 100; // 50% for 1st
    // ... modify as needed
}
```

### Add New Scoring Metrics
Update `/api/fantasy/squad/route.ts`:
```typescript
const points = 
  (likes * 0.2) + 
  (comments * 0.5) + 
  (newMetric * multiplier);
```

### Change Season Length
Edit `LeagueCore.sol`:
```solidity
uint256 public constant SEASON_WEEKS = 12; // Instead of 8
```

## 📱 Mobile Optimization

All components use:
- Tailwind responsive classes
- Safe area insets for iOS/Android
- Touch-optimized buttons
- Optimistic UI updates

## 🐛 Troubleshooting

**Issue**: Wallet not connecting
```bash
# Check Wagmi config
# Ensure NEXT_PUBLIC_USE_WALLET=true
# Test with Base testnet first
```

**Issue**: API routes returning errors
```bash
# Check CORS settings
# Verify environment variables loaded
# Test endpoints with curl
```

**Issue**: Components not rendering
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## 🔐 Security Notes

⚠️ **Current Implementation is a Prototype**

For production:
1. ✅ Add authentication to all API routes
2. ✅ Use real smart contracts with audited code
3. ✅ Implement rate limiting (Vercel Edge Config)
4. ✅ Validate all user inputs with Zod
5. ✅ Use prepared statements for DB queries
6. ✅ Enable CORS only for your domain
7. ✅ Add oracle signature verification

## 📈 Roadmap

- [ ] Real-time WebSocket updates
- [ ] NFT receipts for draft picks
- [ ] Secondary market for creator shares
- [ ] DAO governance for rule changes
- [ ] Multi-chain support (Optimism, Arbitrum)
- [ ] Mobile app (React Native)

## 🤝 Contributing

1. Fork the repo
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit PR

## 📄 License

MIT License - see LICENSE file

## 🆘 Support

- Discord: [Your Server]
- Twitter: [@YourHandle]
- Email: support@yourapp.com

---

Built with ❤️ using:
- [Farcaster Frames SDK](https://docs.farcaster.xyz)
- [Neynar API](https://neynar.com)
- [Next.js 15](https://nextjs.org)
- [Wagmi v2](https://wagmi.sh)
- [Tailwind CSS](https://tailwindcss.com)

