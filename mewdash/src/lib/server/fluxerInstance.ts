import { env } from "$env/dynamic/private";
import { logger } from "$lib/logger";
import { DEFAULT_FLUXER_HOSTS, setFluxerHosts, type FluxerHosts } from "$lib/utils/cdn";

/** The hosts of the Fluxer instance this dashboard signs in with. */
export interface FluxerInstance extends FluxerHosts {
  /** The versioned API base, such as `https://api.fluxer.app/v1`. */
  api: string;
}

const DEFAULT_INSTANCE: FluxerInstance = { ...DEFAULT_FLUXER_HOSTS, api: "https://api.fluxer.app/v1" };

let current: FluxerInstance = DEFAULT_INSTANCE;

const trim = (url: unknown): string | null =>
  typeof url === "string" && url.trim() ? url.trim().replace(/\/+$/, "") : null;

/**
 * Reads the instance named by `FLUXER_INSTANCE_URL` from its `/.well-known/fluxer` document.
 * Leaves the main instance in place when the variable is empty or the document cannot be read.
 */
export async function resolveFluxerInstance(): Promise<FluxerInstance> {
  const configured = trim(env.FLUXER_INSTANCE_URL);
  if (!configured) return current;

  try {
    const origin = new URL(configured).origin;
    const response = await fetch(`${origin}/.well-known/fluxer`, { signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const endpoints = (await response.json())?.endpoints ?? {};
    const api = trim(endpoints.api_public) ?? origin;
    const web = trim(endpoints.webapp) ?? DEFAULT_INSTANCE.web;

    current = {
      api: /\/v\d+$/.test(api) ? api : `${api}/v1`,
      web,
      media: trim(endpoints.media) ?? DEFAULT_INSTANCE.media,
      static: trim(endpoints.static_cdn) ?? DEFAULT_INSTANCE.static,
      invite: trim(endpoints.invite) ?? DEFAULT_INSTANCE.invite
    };
    setFluxerHosts(current);
    logger.info(`Using the Fluxer instance at ${current.api}`);
  } catch (error) {
    logger.error(`Could not read the Fluxer instance at ${configured}, using the main instance:`, error);
  }

  return current;
}

/** The instance resolved at startup. */
export const fluxerInstance = (): FluxerInstance => current;

/** The hosts the browser needs to build image and link URLs. */
export const fluxerHosts = (): FluxerHosts => ({
  web: current.web,
  media: current.media,
  static: current.static,
  invite: current.invite
});
