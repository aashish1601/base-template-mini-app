import { NextResponse } from 'next/server';

// Mock creator pool (in production, fetch from Neynar/social APIs)
const mockCreators = [
  { handle: "dwr.eth", followers: 125000, avgLikes: 450, currentBid: 25, bidder: null, imageUrl: null },
  { handle: "vitalik.eth", followers: 450000, avgLikes: 1200, currentBid: 35, bidder: null, imageUrl: null },
  { handle: "jessepollak", followers: 89000, avgLikes: 320, currentBid: 20, bidder: null, imageUrl: null },
  { handle: "linda", followers: 67000, avgLikes: 280, currentBid: 18, bidder: null, imageUrl: null },
  { handle: "ted", followers: 54000, avgLikes: 210, currentBid: 15, bidder: null, imageUrl: null },
  { handle: "sanjay", followers: 45000, avgLikes: 180, currentBid: 14, bidder: null, imageUrl: null },
  { handle: "cassie", followers: 38000, avgLikes: 150, currentBid: 12, bidder: null, imageUrl: null },
  { handle: "prbly", followers: 92000, avgLikes: 340, currentBid: 22, bidder: null, imageUrl: null },
  { handle: "manansh", followers: 31000, avgLikes: 120, currentBid: 10, bidder: null, imageUrl: null },
  { handle: "nounishprof", followers: 28000, avgLikes: 95, currentBid: 9, bidder: null, imageUrl: null },
  { handle: "humancompatible", followers: 41000, avgLikes: 165, currentBid: 13, bidder: null, imageUrl: null },
  { handle: "base", followers: 310000, avgLikes: 980, currentBid: 30, bidder: null, imageUrl: null },
  { handle: "warpcast", followers: 210000, avgLikes: 720, currentBid: 28, bidder: null, imageUrl: null },
  { handle: "farcaster", followers: 180000, avgLikes: 650, currentBid: 27, bidder: null, imageUrl: null },
  { handle: "neynar", followers: 52000, avgLikes: 195, currentBid: 16, bidder: null, imageUrl: null },
];

export async function GET(request: Request) {
  try {
    // In production:
    // 1. Fetch trending creators from Neynar API
    // 2. Calculate suggested bid based on follower count & engagement
    // 3. Check which creators have already been drafted

    return NextResponse.json({
      creators: mockCreators,
    });
  } catch (error) {
    console.error('Creators fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch creators' },
      { status: 500 }
    );
  }
}

