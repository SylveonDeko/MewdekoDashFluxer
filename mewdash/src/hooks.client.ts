import { env } from "$env/dynamic/public";
import * as Sentry from "@sentry/sveltekit";

const dsn = env.PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: env.PUBLIC_SENTRY_ENVIRONMENT ?? "production",
  tracesSampleRate: 0.1,
});

const STALE_BUILD = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/;
const RELOAD_KEY = "stale-build-reload";

function reloadOnStaleBuild(error: unknown): boolean {
  if (!STALE_BUILD.test(error instanceof Error ? error.message : String(error))) return false;
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
    if (Date.now() - last < 30_000) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    return false;
  }
  location.reload();
  return true;
}

const reportError = Sentry.handleErrorWithSentry();

/** Reloads once when a deploy removed the chunk a page needs, and reports other client-side errors to Sentry. */
export const handleError: typeof reportError = (input) => {
  if (reloadOnStaleBuild(input.error)) return;
  return reportError(input);
};
