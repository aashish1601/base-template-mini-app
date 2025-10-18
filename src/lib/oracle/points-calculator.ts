import type { CreatorMetrics, PointsBreakdown } from './types';

/**
 * Point values configuration
 */
const POINTS_CONFIG = {
  newFollower: 0.1,
  like: 0.2,
  viewsPer1k: 2,
  reply: 0.5,
  post: 1,
  recast: 0.3,
  viralBonus: 50,
  sponsorBonus: 20,
  consistencyBonus: 10,      // 5+ posts in a week
  engagementBonus: 15,       // >10% engagement rate
  captainMultiplier: 1.5,
};

/**
 * Calculate weekly points for a creator
 */
export function calculateWeeklyPoints(
  metrics: CreatorMetrics,
  isCaptain: boolean = false
): PointsBreakdown {
  // Base point calculations
  const followerPoints = metrics.newFollowers * POINTS_CONFIG.newFollower;
  const likePoints = metrics.totalLikes * POINTS_CONFIG.like;
  const viewPoints = (metrics.totalViews / 1000) * POINTS_CONFIG.viewsPer1k;
  const replyPoints = metrics.totalReplies * POINTS_CONFIG.reply;
  const postPoints = metrics.postsCount * POINTS_CONFIG.post;
  const recastPoints = metrics.totalRecasts * POINTS_CONFIG.recast;

  // Bonus points
  const viralBonus = metrics.viralPosts * POINTS_CONFIG.viralBonus;
  const sponsorBonus = metrics.sponsoredPosts * POINTS_CONFIG.sponsorBonus;

  // Consistency bonus (5+ posts in a week)
  const consistencyBonus =
    metrics.postsCount >= 5 ? POINTS_CONFIG.consistencyBonus : 0;

  // Engagement rate bonus (>10% engagement)
  const engagementBonus =
    metrics.engagementRate > 0.1 ? POINTS_CONFIG.engagementBonus : 0;

  // Sum base points
  const basePoints =
    followerPoints +
    likePoints +
    viewPoints +
    replyPoints +
    postPoints +
    recastPoints +
    viralBonus +
    sponsorBonus +
    consistencyBonus +
    engagementBonus;

  // Apply captain multiplier
  const captainMultiplier = isCaptain ? POINTS_CONFIG.captainMultiplier : 1.0;
  const finalPoints = Math.floor(basePoints * captainMultiplier);

  return {
    basePoints: Math.floor(basePoints),
    followerPoints: Math.floor(followerPoints),
    likePoints: Math.floor(likePoints),
    viewPoints: Math.floor(viewPoints),
    replyPoints: Math.floor(replyPoints),
    postPoints: Math.floor(postPoints),
    recastPoints: Math.floor(recastPoints),
    viralBonus: Math.floor(viralBonus),
    sponsorBonus: Math.floor(sponsorBonus),
    consistencyBonus,
    engagementBonus,
    captainMultiplier,
    finalPoints,
  };
}

/**
 * Validate metrics to detect anomalies
 */
export function validateMetrics(
  current: CreatorMetrics,
  previous?: CreatorMetrics
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Check for impossible growth
  if (previous && current.followerCount > previous.followerCount * 2) {
    warnings.push(
      `Suspicious follower spike: ${previous.followerCount} → ${current.followerCount}`
    );
  }

  // Check for negative values
  if (
    current.totalLikes < 0 ||
    current.totalViews < 0 ||
    current.postsCount < 0
  ) {
    warnings.push('Negative metric values detected');
  }

  // Check engagement rate sanity
  if (current.engagementRate > 0.5) {
    warnings.push(
      `Unusually high engagement rate: ${(current.engagementRate * 100).toFixed(1)}%`
    );
  }

  // Check for zero activity with high followers
  if (current.followerCount > 10000 && current.postsCount === 0) {
    warnings.push('No posts this week despite high follower count');
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

/**
 * Compare two sets of metrics to detect significant changes
 */
export function detectSignificantChanges(
  current: CreatorMetrics,
  previous: CreatorMetrics
): string[] {
  const changes: string[] = [];

  // Follower growth
  const followerGrowth =
    ((current.followerCount - previous.followerCount) /
      previous.followerCount) *
    100;
  if (followerGrowth > 10) {
    changes.push(`Follower growth: +${followerGrowth.toFixed(1)}%`);
  }

  // Engagement spike
  const engagementDelta = current.totalLikes - previous.totalLikes;
  if (engagementDelta > previous.totalLikes * 0.5) {
    changes.push(`Engagement spike: +${engagementDelta} likes`);
  }

  // Viral content
  if (current.viralPosts > 0) {
    changes.push(`${current.viralPosts} viral post(s) this week`);
  }

  return changes;
}

/**
 * Export point configuration for transparency
 */
export function getPointsConfig() {
  return POINTS_CONFIG;
}

