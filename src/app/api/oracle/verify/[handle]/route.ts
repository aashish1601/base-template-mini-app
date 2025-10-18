import { NextResponse } from 'next/server';
import { oracleStorage } from '~/lib/oracle/storage';

/**
 * Verification endpoint - allows users to see raw data and calculations
 * GET /api/oracle/verify/[handle]?week=1
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params;
    const { searchParams } = new URL(request.url);
    const week = parseInt(searchParams.get('week') || '0');

    const currentWeek = await oracleStorage.getCurrentWeek();
    const weekNumber = week || currentWeek;

    // Get stored data
    const metrics = await oracleStorage.getCreatorMetrics(handle, weekNumber);
    const breakdown = await oracleStorage.getPointsBreakdown(handle, weekNumber);
    const baseline = await oracleStorage.getBaseline(handle, weekNumber);

    if (!metrics || !breakdown) {
      return NextResponse.json(
        { error: 'No data found for this creator/week' },
        { status: 404 }
      );
    }

    // Return transparent data
    return NextResponse.json({
      handle,
      weekNumber,
      dataSource: {
        provider: 'Neynar API',
        endpoint: 'https://api.neynar.com/v2/farcaster',
        lastUpdated: new Date(metrics.lastUpdated).toISOString(),
      },
      rawMetrics: {
        followerCount: metrics.followerCount,
        baselineFollowers: baseline,
        newFollowers: metrics.newFollowers,
        totalLikes: metrics.totalLikes,
        totalRecasts: metrics.totalRecasts,
        totalReplies: metrics.totalReplies,
        totalViews: metrics.totalViews,
        postsCount: metrics.postsCount,
        viralPosts: metrics.viralPosts,
        sponsoredPosts: metrics.sponsoredPosts,
        avgLikesPerPost: metrics.avgLikesPerPost.toFixed(2),
        engagementRate: (metrics.engagementRate * 100).toFixed(2) + '%',
      },
      pointsCalculation: {
        followerPoints: `${metrics.newFollowers} × 0.1 = ${breakdown.followerPoints}`,
        likePoints: `${metrics.totalLikes} × 0.2 = ${breakdown.likePoints}`,
        viewPoints: `${metrics.totalViews} ÷ 1000 × 2 = ${breakdown.viewPoints}`,
        replyPoints: `${metrics.totalReplies} × 0.5 = ${breakdown.replyPoints}`,
        postPoints: `${metrics.postsCount} × 1 = ${breakdown.postPoints}`,
        recastPoints: `${metrics.totalRecasts} × 0.3 = ${breakdown.recastPoints}`,
        viralBonus: `${metrics.viralPosts} posts × 50 = ${breakdown.viralBonus}`,
        sponsorBonus: `${metrics.sponsoredPosts} posts × 20 = ${breakdown.sponsorBonus}`,
        consistencyBonus: breakdown.consistencyBonus,
        engagementBonus: breakdown.engagementBonus,
        subtotal: breakdown.basePoints,
        captainMultiplier: `${breakdown.captainMultiplier}×`,
        finalPoints: breakdown.finalPoints,
      },
      formula: {
        description: 'Points = (Followers×0.1 + Likes×0.2 + Views÷1k×2 + Replies×0.5 + Posts×1 + Recasts×0.3 + Bonuses) × CaptainMultiplier',
        bonuses: [
          '50 pts per viral post (>1000 likes)',
          '20 pts per sponsored post',
          '10 pts if 5+ posts this week',
          '15 pts if >10% engagement rate',
        ],
        captainBonus: 'Captain gets 1.5× all points',
      },
      verification: {
        canVerify: true,
        neynarProfileUrl: `https://warpcast.com/${handle}`,
        apiEndpoint: `/api/oracle/verify/${handle}?week=${weekNumber}`,
      },
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification data' },
      { status: 500 }
    );
  }
}

