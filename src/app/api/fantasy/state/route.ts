import { NextResponse } from 'next/server';

// In-memory storage (replace with Redis/DB in production)
const gameState = {
  phase: "setup", // setup, drafting, playing, settled
  currentWeek: 1,
  prizePool: "3.0", // ETH
  totalPasses: 0,
  managers: new Map(), // fid -> manager data
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid');

  if (!fid) {
    return NextResponse.json({ error: 'FID required' }, { status: 400 });
  }

  const manager = gameState.managers.get(fid);

  return NextResponse.json({
    phase: gameState.phase,
    currentWeek: gameState.currentWeek,
    prizePool: gameState.prizePool,
    totalPasses: gameState.totalPasses,
    passTokenId: manager?.passTokenId,
    manager: manager ? {
      wallet: manager.wallet,
      influenceCoins: manager.influenceCoins,
      squad: manager.squad || [],
      totalPoints: manager.totalPoints || 0,
    } : undefined,
  });
}

