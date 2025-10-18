import { NextResponse } from 'next/server';

// Mock storage
const gameState = {
  managers: new Map(),
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const passTokenId = parseInt(searchParams.get('passTokenId') || '0');

    if (!passTokenId) {
      return NextResponse.json(
        { error: 'Pass token ID required' },
        { status: 400 }
      );
    }

    // Find manager (in production, query from DB)
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

    // Mock squad details with points (in production, fetch from oracle/API)
    const squad = manager.squad.map((handle: string) => ({
      handle,
      weeklyPoints: [45, 62, 38, 51, 73, 42, 58, 67], // Mock data
      totalPoints: Math.floor(Math.random() * 400) + 200,
      isCaptain: manager.captainHandle === handle,
      recentActivity: {
        likes: Math.floor(Math.random() * 500) + 100,
        views: Math.floor(Math.random() * 50000) + 10000,
        posts: Math.floor(Math.random() * 20) + 5,
      },
    }));

    return NextResponse.json({
      squad,
      captainHandle: manager.captainHandle || null,
    });
  } catch (error) {
    console.error('Squad fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch squad' },
      { status: 500 }
    );
  }
}

