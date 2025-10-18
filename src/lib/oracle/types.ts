// Type definitions for oracle system

export interface CreatorMetrics {
  handle: string;
  fid: number;
  
  // Current totals
  followerCount: number;
  followingCount: number;
  
  // Weekly deltas
  newFollowers: number;
  
  // Engagement (this week)
  totalLikes: number;
  totalRecasts: number;
  totalReplies: number;
  totalViews: number;
  postsCount: number;
  
  // Derived metrics
  avgLikesPerPost: number;
  engagementRate: number;
  
  // Special events
  viralPosts: number;      // Posts with >1000 likes
  sponsoredPosts: number;  // Detected brand deals
  
  // Timestamps
  weekNumber: number;
  lastUpdated: number;
}

export interface PointsBreakdown {
  basePoints: number;
  followerPoints: number;
  likePoints: number;
  viewPoints: number;
  replyPoints: number;
  postPoints: number;
  recastPoints: number;
  viralBonus: number;
  sponsorBonus: number;
  consistencyBonus: number;
  engagementBonus: number;
  captainMultiplier: number;
  finalPoints: number;
}

export interface OracleSubmission {
  handle: string;
  weekNumber: number;
  points: number;
  metrics: CreatorMetrics;
  breakdown: PointsBreakdown;
  signature: string;
  timestamp: number;
}

export interface NeynarCast {
  hash: string;
  author: {
    fid: number;
    username: string;
  };
  text: string;
  timestamp: number;
  reactions: {
    likes_count: number;
    recasts_count: number;
  };
  replies: {
    count: number;
  };
  embeds: any[];
  views?: number;
}

