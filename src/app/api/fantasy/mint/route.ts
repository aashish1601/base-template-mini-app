import { NextResponse } from 'next/server';

// Mock minting (replace with actual smart contract call)
const gameState = {
  totalPasses: 0,
  managers: new Map(),
};

export async function POST(request: Request) {
  try {
    const { fid } = await request.json();

    if (!fid) {
      return NextResponse.json({ error: 'FID required' }, { status: 400 });
    }

    // Check if already has a pass
    if (gameState.managers.has(fid)) {
      return NextResponse.json(
        { error: 'You already own a pass' },
        { status: 400 }
      );
    }

    // Check if season full
    if (gameState.totalPasses >= 100) {
      return NextResponse.json(
        { error: 'Season full' },
        { status: 400 }
      );
    }

    // Mint pass (in production, call smart contract here)
    gameState.totalPasses++;
    const passTokenId = gameState.totalPasses;

    // Create manager
    gameState.managers.set(fid, {
      fid,
      passTokenId,
      wallet: `0x${fid}`, // Mock wallet
      influenceCoins: 100,
      squad: [],
      totalPoints: 0,
      weeklyPoints: {},
    });

    return NextResponse.json({
      success: true,
      passTokenId,
      message: 'Manager Pass minted successfully!',
    });
  } catch (error) {
    console.error('Mint error:', error);
    return NextResponse.json(
      { error: 'Failed to mint pass' },
      { status: 500 }
    );
  }
}

