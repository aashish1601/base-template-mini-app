import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import type { CreatorMetrics, NeynarCast } from './types';

export class NeynarOracle {
  private client: NeynarAPIClient;

  constructor(apiKey: string) {
    this.client = new NeynarAPIClient({ apiKey });
  }

  /**
   * Fetch creator's current profile data
   */
  async getCreatorProfile(handle: string) {
    try {
      const user = await this.client.lookupUserByUsername(handle);
      return {
        fid: user.fid,
        username: user.username,
        displayName: user.display_name,
        followerCount: user.follower_count,
        followingCount: user.following_count,
        pfp: user.pfp_url,
        verifications: user.verifications || [],
      };
    } catch (error) {
      console.error(`Failed to fetch profile for ${handle}:`, error);
      return null;
    }
  }

  /**
   * Fetch creator's recent casts within a date range
   */
  async getCreatorCasts(fid: number, limit = 100): Promise<NeynarCast[]> {
    try {
      const response = await this.client.fetchCastsForUser({ fid, limit });
      return response.casts.map((cast: Record<string, unknown>) => ({
        hash: cast.hash,
        author: {
          fid: cast.author.fid,
          username: cast.author.username,
        },
        text: cast.text,
        timestamp: new Date(cast.timestamp).getTime(),
        reactions: {
          likes_count: cast.reactions?.likes_count || 0,
          recasts_count: cast.reactions?.recasts_count || 0,
        },
        replies: {
          count: cast.replies?.count || 0,
        },
        embeds: cast.embeds || [],
        views: cast.views || 0,
      }));
    } catch (error) {
      console.error(`Failed to fetch casts for FID ${fid}:`, error);
      return [];
    }
  }

  /**
   * Get bulk user data for multiple creators
   */
  async getBulkCreators(fids: number[]) {
    try {
      const response = await this.client.fetchBulkUsers({ fids });
      return response.users;
    } catch (error) {
      console.error('Failed to fetch bulk users:', error);
      return [];
    }
  }

  /**
   * Search for trending creators
   */
  async searchTrendingCreators(limit = 20) {
    try {
      // Note: Implement actual trending logic based on your criteria
      // This is a placeholder that fetches popular users
      const response = await this.client.searchUser({
        q: '',
        limit,
      });
      return response.result.users;
    } catch (error) {
      console.error('Failed to search trending creators:', error);
      return [];
    }
  }

  /**
   * Detect if a cast is sponsored content
   */
  private isSponsoredContent(cast: NeynarCast): boolean {
    const sponsorKeywords = [
      'partner',
      'sponsored',
      'ad',
      '#ad',
      'collaboration',
      'collab with',
      'check out',
      'promo code',
    ];

    const text = cast.text.toLowerCase();
    const hasSponsorKeyword = sponsorKeywords.some(keyword => text.includes(keyword));
    const hasLink = cast.embeds.length > 0;

    return hasSponsorKeyword && hasLink;
  }

  /**
   * Aggregate metrics for a creator for a specific week
   */
  async aggregateWeeklyMetrics(
    handle: string,
    weekNumber: number,
    baselineFollowers?: number
  ): Promise<CreatorMetrics | null> {
    try {
      // 1. Get profile data
      const profile = await this.getCreatorProfile(handle);
      if (!profile) return null;

      // 2. Calculate week boundaries
      const weekStart = this.getWeekStartTimestamp(weekNumber);
      const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000;

      // 3. Fetch casts
      const allCasts = await this.getCreatorCasts(profile.fid, 100);
      const weekCasts = allCasts.filter(
        cast => cast.timestamp >= weekStart && cast.timestamp < weekEnd
      );

      // 4. Calculate aggregates
      const totalLikes = weekCasts.reduce(
        (sum, cast) => sum + cast.reactions.likes_count,
        0
      );
      const totalRecasts = weekCasts.reduce(
        (sum, cast) => sum + cast.reactions.recasts_count,
        0
      );
      const totalReplies = weekCasts.reduce(
        (sum, cast) => sum + cast.replies.count,
        0
      );
      const totalViews = weekCasts.reduce(
        (sum, cast) => sum + (cast.views || 0),
        0
      );
      const postsCount = weekCasts.length;

      // 5. Detect special events
      const viralPosts = weekCasts.filter(
        cast => cast.reactions.likes_count > 1000
      ).length;
      const sponsoredPosts = weekCasts.filter(cast =>
        this.isSponsoredContent(cast)
      ).length;

      // 6. Calculate derived metrics
      const avgLikesPerPost = postsCount > 0 ? totalLikes / postsCount : 0;
      const newFollowers = baselineFollowers
        ? profile.followerCount - baselineFollowers
        : 0;
      const engagementRate =
        profile.followerCount > 0
          ? (totalLikes + totalReplies) / profile.followerCount
          : 0;

      return {
        handle,
        fid: profile.fid,
        followerCount: profile.followerCount,
        followingCount: profile.followingCount,
        newFollowers,
        totalLikes,
        totalRecasts,
        totalReplies,
        totalViews,
        postsCount,
        avgLikesPerPost,
        engagementRate,
        viralPosts,
        sponsoredPosts,
        weekNumber,
        lastUpdated: Date.now(),
      };
    } catch (error) {
      console.error(`Failed to aggregate metrics for ${handle}:`, error);
      return null;
    }
  }

  /**
   * Get week start timestamp (Monday 00:00 UTC)
   */
  private getWeekStartTimestamp(weekNumber: number): number {
    // Assume season starts on a specific date
    const seasonStart = new Date('2025-01-13T00:00:00Z').getTime(); // Adjust to actual start
    return seasonStart + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000;
  }
}

// Export singleton instance
let oracleInstance: NeynarOracle | null = null;

export function getNeynarOracle(): NeynarOracle {
  if (!oracleInstance) {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      throw new Error('NEYNAR_API_KEY not configured');
    }
    oracleInstance = new NeynarOracle(apiKey);
  }
  return oracleInstance;
}

