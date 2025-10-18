# Environment Variables Setup

Create a `.env.local` file in the root directory with these variables:

```env
# ===== REQUIRED =====

# App URL (use localhost for dev, Vercel URL for prod)
NEXT_PUBLIC_URL=http://localhost:3000

# App Branding
NEXT_PUBLIC_FRAME_NAME="Influencer Fantasy League"
NEXT_PUBLIC_FRAME_DESCRIPTION="Draft creators, earn points, win ETH prizes"
NEXT_PUBLIC_FRAME_BUTTON_TEXT="Play Now"
NEXT_PUBLIC_FRAME_PRIMARY_CATEGORY="gaming"
NEXT_PUBLIC_FRAME_TAGS="fantasy,creators,gaming,social"

# Enable wallet features
NEXT_PUBLIC_USE_WALLET=true

# ===== OPTIONAL =====

# Neynar API (for Farcaster data)
NEYNAR_API_KEY=your_neynar_api_key_here
NEYNAR_CLIENT_ID=your_client_id_here

# Redis/KV Storage (Upstash)
KV_REST_API_URL=https://your-redis.upstash.io
KV_REST_API_TOKEN=your_token_here

# Smart Contract Addresses (after deployment)
NEXT_PUBLIC_MANAGER_PASS_ADDRESS=0x...
NEXT_PUBLIC_LEAGUE_CORE_ADDRESS=0x...

# Oracle Configuration (for automated scoring)
ORACLE_PRIVATE_KEY=0x...
CHAINLINK_FUNCTIONS_SUBSCRIPTION_ID=

# Farcaster App Ownership (for notifications)
ACCOUNT_ASSOCIATION_HEADER=
ACCOUNT_ASSOCIATION_PAYLOAD=
ACCOUNT_ASSOCIATION_SIGNATURE=
```

## Quick Setup

```bash
# Copy template
cat > .env.local << 'EOF'
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_FRAME_NAME="Influencer Fantasy League"
NEXT_PUBLIC_FRAME_DESCRIPTION="Draft creators, earn points, win ETH prizes"
NEXT_PUBLIC_FRAME_BUTTON_TEXT="Play Now"
NEXT_PUBLIC_FRAME_PRIMARY_CATEGORY="gaming"
NEXT_PUBLIC_FRAME_TAGS="fantasy,creators,gaming,social"
NEXT_PUBLIC_USE_WALLET=true
NEYNAR_API_KEY=
NEYNAR_CLIENT_ID=
EOF

# Edit and add your API keys
nano .env.local
```

