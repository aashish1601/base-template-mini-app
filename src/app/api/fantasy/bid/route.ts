import { NextResponse } from 'next/server';

// Mock storage
const gameState = {
  managers: new Map(),
  creators: new Map(),
};

export async function POST(request: Request) {
  try {
    const { passTokenId, handle, bidIC } = await request.json();

    if (!passTokenId || !handle || !bidIC) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find manager by passTokenId (in production, query from DB)
    let manager = null;
    for (const [, mgr] of gameState.managers.entries()) {
      if (mgr.passTokenId === passTokenId) {
        manager = mgr;
        break;
      }
    }

    if (!manager) {
      return NextResponse.json(
        { error: 'Manager not found' },
        { status: 404 }
      );
    }

    // Validate bid
    if (manager.squad.length >= 5) {
      return NextResponse.json(
        { error: 'Squad is full (5 max)' },
        { status: 400 }
      );
    }

    if (manager.influenceCoins < bidIC) {
      return NextResponse.json(
        { error: 'Insufficient Influence Coins' },
        { status: 400 }
      );
    }

    // Check if creator already drafted
    if (gameState.creators.has(handle)) {
      return NextResponse.json(
        { error: 'Creator already drafted' },
        { status: 400 }
      );
    }

    // Process bid (in production, call smart contract)
    manager.influenceCoins -= bidIC;
    manager.squad.push(handle);
    gameState.creators.set(handle, {
      handle,
      owner: manager.wallet,
      price: bidIC,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully drafted @${handle}`,
      remainingIC: manager.influenceCoins,
    });
  } catch (error) {
    console.error('Bid error:', error);
    return NextResponse.json(
      { error: 'Failed to place bid' },
      { status: 500 }
    );
  }
}

