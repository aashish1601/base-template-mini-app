import { NextResponse } from 'next/server';

/**
 * Cron job endpoint for Vercel Cron
 * Triggers the oracle aggregation daily
 * 
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/update-scores",
 *     "schedule": "0 0 * * *"
 *   }]
 * }
 */
export async function GET(request: Request) {
  try {
    // Verify this is coming from Vercel Cron
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🤖 Cron job triggered: updating scores...');

    // Call the oracle aggregation endpoint
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/oracle/aggregate`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${process.env.ORACLE_SECRET}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Oracle aggregation failed: ${data.error}`);
    }

    console.log(`✓ Updated ${data.processedCount} creators`);

    return NextResponse.json({
      success: true,
      message: 'Scores updated successfully',
      ...data,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Vercel Cron also accepts POST
export const POST = GET;

