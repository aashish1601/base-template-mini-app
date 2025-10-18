import { NextResponse } from 'next/server';

// Mock storage
const gameState = {
  managers: new Map(),
};

export async function POST(request: Request) {
  try {
    const { passTokenId, handle } = await request.json();

    if (!passTokenId || !handle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find manager (in production, query from DB)
    let manager = null;
    for (const [fid, mgr] of gameState.managers.entries()) {
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

    // Validate handle is in squad
    if (!manager.squad.includes(handle)) {
      return NextResponse.json(
        { error: 'Creator not in your squad' },
        { status: 400 }
      );
    }

    // Set captain
    manager.captainHandle = handle;

    return NextResponse.json({
      success: true,
      message: `@${handle} is now your captain`,
    });
  } catch (error) {
    console.error('Set captain error:', error);
    return NextResponse.json(
      { error: 'Failed to set captain' },
      { status: 500 }
    );
  }
}

