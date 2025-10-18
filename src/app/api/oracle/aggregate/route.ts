import { NextResponse } from 'next/server';
import { getNeynarOracle } from '~/lib/oracle/neynar-client';
import { calculateWeeklyPoints, validateMetrics } from '~/lib/oracle/points-calculator';
import { oracleStorage } from '~/lib/oracle/storage';

/**
 * Oracle aggregation endpoint
 * Fetches data from Neynar and calculates points
 * 
 * This should be called by a cron job every 15 minutes
 */
export async function POST(request: Request) {
  try {
    // Verify oracle authorization
    const authHeader = request.headers.get('authorization');
    const expectedSecret = `Bearer ${process.env.ORACLE_SECRET}`;
    
    if (authHeader !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const oracle = getNeynarOracle();
    const currentWeek = await oracleStorage.getCurrentWeek();

    // Get all active creators (ones that have been drafted)
    const activeCreators = await oracleStorage.getActiveCreators();
    
    if (activeCreators.length === 0) {
      return NextResponse.json({
        message: 'No active creators to process',
        currentWeek,
      });
    }

    const results = [];

    // Process each creator
    for (const handle of activeCreators) {
      try {
        // Get baseline (set at start of week)
        let baseline = await oracleStorage.getBaseline(handle, currentWeek);
        
        if (!baseline) {
          // First time this week - set baseline
          const profile = await oracle.getCreatorProfile(handle);
          if (profile && profile.followerCount !== null) {
            baseline = profile.followerCount;
            await oracleStorage.storeBaseline(handle, currentWeek, baseline);
          }
        }

        // Aggregate weekly metrics
        const metrics = await oracle.aggregateWeeklyMetrics(
          handle,
          currentWeek,
          baseline || undefined
        );

        if (!metrics) {
          console.warn(`Failed to aggregate metrics for ${handle}`);
          continue;
        }

        // Validate metrics
        const previousMetrics = await oracleStorage.getCreatorMetrics(
          handle,
          currentWeek - 1
        );
        const validation = validateMetrics(metrics, previousMetrics || undefined);

        if (!validation.valid) {
          console.warn(`Validation warnings for ${handle}:`, validation.warnings);
        }

        // Calculate points (without captain bonus - applied later per squad)
        const breakdown = calculateWeeklyPoints(metrics, false);

        // Store everything
        await oracleStorage.storeCreatorMetrics(handle, currentWeek, metrics);
        await oracleStorage.storePointsBreakdown(handle, currentWeek, breakdown);

        results.push({
          handle,
          points: breakdown.finalPoints,
          metrics: {
            followers: metrics.followerCount,
            newFollowers: metrics.newFollowers,
            likes: metrics.totalLikes,
            posts: metrics.postsCount,
          },
          warnings: validation.warnings,
        });

        console.log(`✓ Updated ${handle}: ${breakdown.finalPoints} pts`);
      } catch (error) {
        console.error(`Error processing ${handle}:`, error);
        results.push({
          handle,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      currentWeek,
      processedCount: results.length,
      results,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Oracle aggregation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to aggregate data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Manual trigger for testing (GET request)
 * In production, remove this or protect with strong auth
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const testMode = searchParams.get('test');
  
  if (testMode !== 'true') {
    return NextResponse.json(
      { error: 'Use POST with authorization header' },
      { status: 405 }
    );
  }

  // Simulate POST request for testing
  return POST(
    new Request(request.url, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${process.env.ORACLE_SECRET}`,
      },
    })
  );
}

