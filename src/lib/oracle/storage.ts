import { Redis } from '@upstash/redis';
import type { CreatorMetrics, PointsBreakdown, OracleSubmission } from './types';

// Initialize Redis client (or use in-memory fallback)
const useRedis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
const redis = useRedis
  ? new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    })
  : null;

// In-memory fallback
const memoryStore = new Map<string, any>();

/**
 * Storage abstraction layer
 */
class OracleStorage {
  /**
   * Store creator metrics for a specific week
   */
  async storeCreatorMetrics(
    handle: string,
    weekNumber: number,
    metrics: CreatorMetrics
  ): Promise<void> {
    const key = `creator:${handle}:week:${weekNumber}`;
    if (redis) {
      await redis.hset(key, metrics as any);
    } else {
      memoryStore.set(key, metrics);
    }
  }

  /**
   * Get creator metrics for a specific week
   */
  async getCreatorMetrics(
    handle: string,
    weekNumber: number
  ): Promise<CreatorMetrics | null> {
    const key = `creator:${handle}:week:${weekNumber}`;
    if (redis) {
      const data = await redis.hgetall(key);
      return data ? (data as unknown as CreatorMetrics) : null;
    } else {
      return memoryStore.get(key) || null;
    }
  }

  /**
   * Store baseline follower count at week start
   */
  async storeBaseline(
    handle: string,
    weekNumber: number,
    followerCount: number
  ): Promise<void> {
    const key = `creator:${handle}:week:${weekNumber}:baseline`;
    if (redis) {
      await redis.set(key, followerCount);
    } else {
      memoryStore.set(key, followerCount);
    }
  }

  /**
   * Get baseline follower count
   */
  async getBaseline(handle: string, weekNumber: number): Promise<number | null> {
    const key = `creator:${handle}:week:${weekNumber}:baseline`;
    if (redis) {
      return await redis.get(key);
    } else {
      return memoryStore.get(key) || null;
    }
  }

  /**
   * Store points breakdown
   */
  async storePointsBreakdown(
    handle: string,
    weekNumber: number,
    breakdown: PointsBreakdown
  ): Promise<void> {
    const key = `creator:${handle}:week:${weekNumber}:points`;
    if (redis) {
      await redis.hset(key, breakdown as any);
    } else {
      memoryStore.set(key, breakdown);
    }
  }

  /**
   * Get points breakdown
   */
  async getPointsBreakdown(
    handle: string,
    weekNumber: number
  ): Promise<PointsBreakdown | null> {
    const key = `creator:${handle}:week:${weekNumber}:points`;
    if (redis) {
      const data = await redis.hgetall(key);
      return data ? (data as unknown as PointsBreakdown) : null;
    } else {
      return memoryStore.get(key) || null;
    }
  }

  /**
   * Store oracle submission (with signature)
   */
  async storeOracleSubmission(submission: OracleSubmission): Promise<void> {
    const key = `oracle:submission:${submission.handle}:week:${submission.weekNumber}`;
    if (redis) {
      await redis.set(key, JSON.stringify(submission));
    } else {
      memoryStore.set(key, submission);
    }
  }

  /**
   * Get oracle submission
   */
  async getOracleSubmission(
    handle: string,
    weekNumber: number
  ): Promise<OracleSubmission | null> {
    const key = `oracle:submission:${handle}:week:${weekNumber}`;
    if (redis) {
      const data = await redis.get(key);
      return data ? JSON.parse(data as string) : null;
    } else {
      return memoryStore.get(key) || null;
    }
  }

  /**
   * Get all active creators (handles currently drafted)
   */
  async getActiveCreators(): Promise<string[]> {
    const key = 'active:creators';
    if (redis) {
      const data = await redis.smembers(key);
      return data || [];
    } else {
      return Array.from(memoryStore.get(key) || new Set());
    }
  }

  /**
   * Add creator to active list
   */
  async addActiveCreator(handle: string): Promise<void> {
    const key = 'active:creators';
    if (redis) {
      await redis.sadd(key, handle);
    } else {
      const set = memoryStore.get(key) || new Set();
      set.add(handle);
      memoryStore.set(key, set);
    }
  }

  /**
   * Get current week number
   */
  async getCurrentWeek(): Promise<number> {
    const key = 'game:currentWeek';
    if (redis) {
      const week = await redis.get(key);
      return week ? Number(week) : 1;
    } else {
      return memoryStore.get(key) || 1;
    }
  }

  /**
   * Update current week
   */
  async setCurrentWeek(weekNumber: number): Promise<void> {
    const key = 'game:currentWeek';
    if (redis) {
      await redis.set(key, weekNumber);
    } else {
      memoryStore.set(key, weekNumber);
    }
  }

  /**
   * Update squad points (sum of all creator points)
   */
  async updateSquadPoints(
    passTokenId: number,
    weekNumber: number,
    totalPoints: number
  ): Promise<void> {
    const key = `squad:${passTokenId}:week:${weekNumber}`;
    if (redis) {
      await redis.set(key, totalPoints);
    } else {
      memoryStore.set(key, totalPoints);
    }
  }

  /**
   * Get squad points
   */
  async getSquadPoints(
    passTokenId: number,
    weekNumber: number
  ): Promise<number> {
    const key = `squad:${passTokenId}:week:${weekNumber}`;
    if (redis) {
      const points = await redis.get(key);
      return points ? Number(points) : 0;
    } else {
      return memoryStore.get(key) || 0;
    }
  }
}

// Export singleton
export const oracleStorage = new OracleStorage();

