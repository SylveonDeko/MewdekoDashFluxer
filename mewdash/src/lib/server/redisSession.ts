import Redis from "ioredis";
import { env } from "$env/dynamic/private";
import { logger } from "$lib/logger";
import type { FluxerUser } from "$lib/types/fluxer";
import type { DiscordLinkIdentity } from "$lib/types/discordLink";
import { nanoid } from "nanoid";

// Session expiry time (24 hours)
const SESSION_TTL = 24 * 60 * 60; // seconds

/** How long a Discord sign in made for linking stays usable (15 minutes). */
export const DISCORD_LINK_TTL = 15 * 60;

export class RedisSessionManager {
  private redis: Redis | null = null;
  private enabled: boolean;

  constructor() {
    this.enabled = env.USE_REDIS === "true";
    if (this.enabled) {
      try {
        this.redis = new Redis(env.REDIS_URL);
        logger.info("Redis session manager initialized");
      } catch (error) {
        logger.error("Failed to initialize Redis:", error);
        this.enabled = false;
      }
    }
  }

  private memoryIdentities = new Map<string, { identity: DiscordLinkIdentity; expires: number }>();

  private getDiscordLinkKey(userId: string): string {
    return `${env.FLUXER_CLIENT_ID}_discord_link:${userId}`;
  }

  async setDiscordIdentity(userId: string, identity: DiscordLinkIdentity): Promise<void> {
    if (!this.enabled || !this.redis) {
      this.memoryIdentities.set(userId, { identity, expires: Date.parse(identity.expiresAt) });
      return;
    }
    await this.redis.setex(this.getDiscordLinkKey(userId), DISCORD_LINK_TTL, JSON.stringify(identity));
  }

  async getDiscordIdentity(userId: string): Promise<DiscordLinkIdentity | null> {
    if (!this.enabled || !this.redis) {
      const held = this.memoryIdentities.get(userId);
      if (!held) return null;
      if (held.expires <= Date.now()) {
        this.memoryIdentities.delete(userId);
        return null;
      }
      return held.identity;
    }
    try {
      const data = await this.redis.get(this.getDiscordLinkKey(userId));
      return data ? (JSON.parse(data) as DiscordLinkIdentity) : null;
    } catch (error) {
      logger.error("Failed to read Discord link identity:", error);
      return null;
    }
  }

  async clearDiscordIdentity(userId: string): Promise<void> {
    this.memoryIdentities.delete(userId);
    if (!this.enabled || !this.redis) return;
    try {
      await this.redis.del(this.getDiscordLinkKey(userId));
    } catch (error) {
      logger.error("Failed to clear Discord link identity:", error);
    }
  }

  private getSessionKey(sessionId: string): string {
    return `${env.FLUXER_CLIENT_ID}_session:${sessionId}`;
  }

  async createSession(user: FluxerUser, tokens: {
    accessToken: string;
    refreshToken: string;
    accessExpiry: Date;
  }): Promise<string | null> {
    if (!this.enabled || !this.redis) return null;

    try {
      const sessionId = nanoid(32);
      const sessionData = {
        user,
        tokens: {
          ...tokens,
          accessExpiry: tokens.accessExpiry.toISOString()
        },
        createdAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString()
      };

      await this.redis.setex(
        this.getSessionKey(sessionId),
        SESSION_TTL,
        JSON.stringify(sessionData)
      );

      return sessionId;
    } catch (error) {
      logger.error("Failed to create Redis session:", error);
      return null;
    }
  }

  async getSession(sessionId: string): Promise<{
    user: FluxerUser;
    tokens: {
      accessToken: string;
      refreshToken: string;
      accessExpiry: Date;
    };
  } | null> {
    if (!this.enabled || !this.redis || !sessionId) return null;

    try {
      const data = await this.redis.get(this.getSessionKey(sessionId));
      if (!data) return null;

      const sessionData = JSON.parse(data);
      
      // Update last accessed time and extend TTL
      sessionData.lastAccessed = new Date().toISOString();
      await this.redis.setex(
        this.getSessionKey(sessionId),
        SESSION_TTL,
        JSON.stringify(sessionData)
      );

      return {
        user: sessionData.user,
        tokens: {
          ...sessionData.tokens,
          accessExpiry: new Date(sessionData.tokens.accessExpiry)
        }
      };
    } catch (error) {
      logger.error("Failed to get Redis session:", error);
      return null;
    }
  }

  async updateSession(sessionId: string, tokens: {
    accessToken: string;
    refreshToken: string;
    accessExpiry: Date;
  }): Promise<boolean> {
    if (!this.enabled || !this.redis || !sessionId) return false;

    try {
      const data = await this.redis.get(this.getSessionKey(sessionId));
      if (!data) return false;

      const sessionData = JSON.parse(data);
      sessionData.tokens = {
        ...tokens,
        accessExpiry: tokens.accessExpiry.toISOString()
      };
      sessionData.lastAccessed = new Date().toISOString();

      await this.redis.setex(
        this.getSessionKey(sessionId),
        SESSION_TTL,
        JSON.stringify(sessionData)
      );

      return true;
    } catch (error) {
      logger.error("Failed to update Redis session:", error);
      return false;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!this.enabled || !this.redis || !sessionId) return;

    try {
      await this.redis.del(this.getSessionKey(sessionId));
    } catch (error) {
      logger.error("Failed to delete Redis session:", error);
    }
  }

  async disconnect(): Promise<void> {
    if (this.redis) {
      this.redis.disconnect();
    }
  }
}

// Singleton instance
export const sessionManager = new RedisSessionManager();