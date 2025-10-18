import { NextResponse } from 'next/server';

// Mock storage (used for future expansion)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const gameState = {
  managers: new Map(),
  prizePool: "3.0",
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'overall';
    const week = parseInt(searchParams.get('week') || '1');

    // Mock leaderboard (in production, query from DB and calculate)
    const mockLeaderboard = [
      {
        rank: 1,
        passTokenId: 5,
        managerName: "dwr.eth",
        totalPoints: 1247,
        weeklyPoints: [145, 162, 138, 151, 173, 142, 158, 178],
        prize: "1.35 ETH",
        isCurrentUser: false,
      },
      {
        rank: 2,
        passTokenId: 12,
        managerName: "vitalik.eth",
        totalPoints: 1189,
        weeklyPoints: [132, 155, 141, 148, 165, 139, 152, 157],
        prize: "0.75 ETH",
        isCurrentUser: false,
      },
      {
        rank: 3,
        passTokenId: 8,
        managerName: "jessepollak",
        totalPoints: 1134,
        weeklyPoints: [128, 147, 136, 142, 159, 135, 145, 142],
        prize: "0.45 ETH",
        isCurrentUser: false,
      },
      {
        rank: 4,
        passTokenId: 23,
        managerName: "linda",
        totalPoints: 1087,
        weeklyPoints: [121, 139, 131, 137, 152, 128, 138, 141],
        prize: "0.06 ETH",
        isCurrentUser: true,
      },
      {
        rank: 5,
        passTokenId: 17,
        managerName: "ted",
        totalPoints: 1045,
        weeklyPoints: [115, 132, 127, 133, 145, 124, 132, 137],
        prize: "0.06 ETH",
        isCurrentUser: false,
      },
      {
        rank: 6,
        passTokenId: 31,
        managerName: "sanjay",
        totalPoints: 1003,
        weeklyPoints: [108, 125, 122, 128, 138, 119, 127, 136],
        prize: "0.06 ETH",
        isCurrentUser: false,
      },
      {
        rank: 7,
        passTokenId: 9,
        managerName: "cassie",
        totalPoints: 967,
        weeklyPoints: [102, 119, 117, 123, 131, 114, 122, 139],
        prize: "0.06 ETH",
        isCurrentUser: false,
      },
      {
        rank: 8,
        passTokenId: 14,
        managerName: "prbly",
        totalPoints: 934,
        weeklyPoints: [97, 113, 112, 118, 126, 109, 117, 142],
        prize: "0.06 ETH",
        isCurrentUser: false,
      },
    ];

    return NextResponse.json({
      leaderboard: mockLeaderboard,
      view,
      week,
    });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

