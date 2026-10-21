// routes/api/auth/fluxerAuth.ts
import { env } from "$env/dynamic/private";
import type { Cookies } from "@sveltejs/kit";
import CryptoJS from "crypto-js";
import { logger } from "$lib/logger";
import { sessionManager } from "$lib/server/redisSession";
import { toFluxerUser, type FluxerUser } from "$lib/types/fluxer";

const ACCESS_TOKEN_COOKIE = "fluxer_access_token",
  REFRESH_TOKEN_COOKIE = "fluxer_refresh_token",
  ACCESS_EXPIRY_COOKIE = "fluxer_access_expiry",
  SESSION_ID_COOKIE = "fluxer_session_id",
  TOKEN_REFRESH_THRESHOLD = 0.8; // Refresh when 80% of token lifetime has passed

/** Lifetime of a Fluxer access token in milliseconds (7 days). */
export const ACCESS_TOKEN_LIFETIME_MS = 604800 * 1000;

/** How long the refresh token cookie and session cookie are kept (30 days). */
export const REFRESH_TOKEN_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

const DEFAULT_API_URL = "https://api.fluxer.app/v1",
  DEFAULT_AUTHORIZE_URL = "https://web.fluxer.app/oauth2/authorize";

export const fluxerApiUrl = (): string => env.FLUXER_API_URL || DEFAULT_API_URL;

export const fluxerAuthorizeUrl = (): string => env.FLUXER_AUTHORIZE_URL || DEFAULT_AUTHORIZE_URL;

export const fluxerScopes = (): string => env.FLUXER_SCOPES || "identify";

export const requestFluxerToken = async (
  searchParams: URLSearchParams,
  cookies?: Cookies, // Make cookies optional
): Promise<Tokens> => {
  // performing a Fetch request to Fluxer's token endpoint
  const request = await fetch(`${fluxerApiUrl()}/oauth2/token`, {
    method: "POST",
    body: searchParams,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const response = await request?.json();

  // Handle different error types appropriately
  if (request.status == 400) {
    // Bad request - likely invalid refresh token
    logger.error("Token refresh failed with 400:", response);
    // Don't delete cookies here - let caller handle it
    throw new Error("Invalid refresh token");
  } else if (request.status == 401) {
    // Unauthorized - refresh token expired
    logger.error("Token refresh failed with 401:", response);
    // Don't delete cookies here - let caller handle it
    throw new Error("Refresh token expired");
  } else if (!request.ok) {
    // Other errors - don't immediately delete cookies
    logger.error(`Token request failed with status ${request.status}:`, response);
    throw new Error(`Token request failed: ${request.statusText}`);
  }

  if (response.error) {
    throw new Error(response.error);
  }

  // Calculate expiry times
  const access_expire = new Date(Date.now() + (response.expires_in * 1000)); // Fluxer returns seconds
  const refresh_expire = new Date(Date.now() + REFRESH_TOKEN_LIFETIME_MS);

  return {
    access_token: response.access_token,
    refresh_token: response.refresh_token,
    access_valid_until: access_expire,
    refresh_valid_until: refresh_expire,
  };
};

export async function getUserData(accessToken: string): Promise<FluxerUser> {
  const response = await fetch(`${fluxerApiUrl()}/users/@me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user data: ${response.statusText}`);
  }

  return toFluxerUser(await response.json());
}

/**
 * Revokes a refresh token at Fluxer so it cannot be used again.
 */
export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  const response = await fetch(`${fluxerApiUrl()}/oauth2/token/revoke`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.FLUXER_CLIENT_ID,
      client_secret: env.FLUXER_CLIENT_SECRET,
      token: refreshToken,
      token_type_hint: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error(`Token revocation failed: ${response.status}`);
  }
}

export function buildSearchParams(
  type: "callback" | "refresh",
  code: string,
): URLSearchParams {
  const searchParams = new URLSearchParams();
  searchParams.append("client_id", env.FLUXER_CLIENT_ID);
  searchParams.append("client_secret", env.FLUXER_CLIENT_SECRET);
  searchParams.append(
    "grant_type",
    type == "callback" ? "authorization_code" : "refresh_token",
  );
  searchParams.append(type == "callback" ? "code" : "refresh_token", code);
  if (type == "callback") {
    searchParams.append("redirect_uri", env.FLUXER_REDIRECT_URI);
  }
  return searchParams;
}

export async function setCookies(tokens: Tokens, cookies: Cookies, user?: FluxerUser) {
  try {
    const encryptedAccessToken = CryptoJS.AES.encrypt(
      tokens.access_token,
      env.COOKIE_ENCRYPTION_PASSWORD,
    ).toString();
    const encryptedRefreshToken = CryptoJS.AES.encrypt(
      tokens.refresh_token,
      env.COOKIE_ENCRYPTION_PASSWORD,
    ).toString();

    const accessMaxAge = Math.floor(
      (tokens.access_valid_until.getTime() - Date.now()) / 1000,
    );
    cookies.set(ACCESS_TOKEN_COOKIE, encryptedAccessToken, {
      path: "/",
      maxAge: accessMaxAge,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production" || false,
    });

    // Store the expiry time as well for proactive refresh
    cookies.set(ACCESS_EXPIRY_COOKIE, tokens.access_valid_until.toISOString(), {
      path: "/",
      maxAge: accessMaxAge,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production" || false,
    });

    // Create or update Redis session if user is provided
    if (user) {
      const sessionId = cookies.get(SESSION_ID_COOKIE) || null;
      if (sessionId) {
        // Update existing session
        await sessionManager.updateSession(sessionId, {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          accessExpiry: tokens.access_valid_until,
        });
      } else {
        // Create new session
        const newSessionId = await sessionManager.createSession(user, {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          accessExpiry: tokens.access_valid_until,
        });

        if (newSessionId) {
          const refreshMaxAge = Math.floor(
            (tokens.refresh_valid_until.getTime() - Date.now()) / 1000,
          );
          cookies.set(SESSION_ID_COOKIE, newSessionId, {
            path: "/",
            maxAge: refreshMaxAge, // Same as refresh token
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production" || false,
          });
        }
      }
    }
    const refreshMaxAge = Math.floor(
      (tokens.refresh_valid_until.getTime() - Date.now()) / 1000,
    );
    cookies.set(REFRESH_TOKEN_COOKIE, encryptedRefreshToken, {
      path: "/",
      maxAge: refreshMaxAge,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production" || false,
    });
  } catch (e) {
    logger.error("could not set cookies:" + e);
  }
}

/**
 * Revokes the refresh token held in the cookies at Fluxer. Failures are logged and ignored so
 * signing out always completes locally.
 */
export async function revokeStoredRefreshToken(cookies: Cookies): Promise<void> {
  const encrypted = cookies.get(REFRESH_TOKEN_COOKIE);
  if (!encrypted) return;

  try {
    const refreshToken = CryptoJS.AES.decrypt(
      encrypted,
      env.COOKIE_ENCRYPTION_PASSWORD,
    ).toString(CryptoJS.enc.Utf8);
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
  } catch (e) {
    logger.warn("Could not revoke refresh token:", e instanceof Error ? e.message : String(e));
  }
}

export async function deleteCookies(cookies: Cookies) {
  try {
    // Delete session from Redis if exists
    const sessionId = cookies.get(SESSION_ID_COOKIE);
    if (sessionId) {
      await sessionManager.deleteSession(sessionId);
    }
    
    // Try to delete cookies, but catch errors if response has already been sent
    try {
      cookies.delete(ACCESS_TOKEN_COOKIE, { path: "/" });
    } catch (e) {
      logger.warn("Could not delete access token cookie:", e instanceof Error ? e.message : String(e));
    }
    
    try {
      cookies.delete(REFRESH_TOKEN_COOKIE, { path: "/" });
    } catch (e) {
      logger.warn("Could not delete refresh token cookie:", e instanceof Error ? e.message : String(e));
    }
    
    try {
      cookies.delete(ACCESS_EXPIRY_COOKIE, { path: "/" });
    } catch (e) {
      logger.warn("Could not delete access expiry cookie:", e instanceof Error ? e.message : String(e));
    }
    
    try {
      cookies.delete(SESSION_ID_COOKIE, { path: "/" });
    } catch (e) {
      logger.warn("Could not delete session ID cookie:", e instanceof Error ? e.message : String(e));
    }
  } catch (error) {
    logger.error("Error deleting cookies:", error);
  }
}

export function shouldRefreshToken(cookies: Cookies): boolean {
  const expiryStr = cookies.get(ACCESS_EXPIRY_COOKIE);
  if (!expiryStr) return true;
  
  try {
    const expiry = new Date(expiryStr);
    const now = new Date();
    const tokenLifetime = expiry.getTime() - now.getTime();
    const totalLifetime = ACCESS_TOKEN_LIFETIME_MS;
    
    // Refresh if we've used 80% of the token lifetime
    return tokenLifetime < (totalLifetime * (1 - TOKEN_REFRESH_THRESHOLD));
  } catch (e) {
    logger.error("Error parsing token expiry:", e);
    return true;
  }
}

export type Tokens = {
  access_token: string;
  refresh_token: string;
  access_valid_until: Date;
  refresh_valid_until: Date;
};
