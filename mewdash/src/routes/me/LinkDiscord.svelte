<!-- routes/me/LinkDiscord.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { colorStore } from "$lib/stores/colorStore";
  import {
    discordSignInUrl,
    migrationApi,
    type DiscordIdentitySummary,
    type LinkResult,
    type LinkState
  } from "$lib/api/index.ts";
  import { ApiError } from "$lib/api/core";
  import { logger } from "$lib/logger";

  let link = $state<LinkState | null>(null);
  let identity = $state<DiscordIdentitySummary | null>(null);
  let result = $state<LinkResult | null>(null);
  let error = $state("");
  let linking = $state(false);

  async function load() {
    try {
      [link, identity] = await Promise.all([migrationApi.getLink(), migrationApi.getIdentity()]);
    } catch (err) {
      logger.error("Failed to load the Discord link:", err);
    }
    const outcome = page.url.searchParams.get("discord_link");
    if (outcome === "denied") error = m.migration.connectDenied();
    else if (outcome === "error") error = m.migration.connectError();
  }

  async function finishLinking() {
    linking = true;
    error = "";
    try {
      result = await migrationApi.link();
      link = { linked: true, discordUserId: identity?.discordUserId ?? null };
      identity = null;
    } catch (err) {
      logger.error("Failed to link Discord:", err);
      if (err instanceof ApiError && err.status === 409) error = m.migration.linkConflict();
      else if (err instanceof ApiError && err.status === 401) identity = null;
      else error = m.migration.linkFailed();
    } finally {
      linking = false;
    }
  }

  onMount(load);
</script>

<div class="rounded-2xl p-6 border space-y-4"
     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30;">
  <h2 class="text-xl font-bold flex items-center gap-2" style="color: {$colorStore.text}">
    <i class="fa-brands fa-discord text-xl" style="color: {$colorStore.primary};" aria-hidden="true"></i>
    {m.migration.linkButton()}
  </h2>
  <p class="text-sm" style="color: {$colorStore.muted}">{m.migration.linkHint()}</p>

  {#if error}
    <div class="p-4 rounded-xl flex items-center gap-3" role="alert"
         style="background: #ef444415; border: 1px solid #ef444430; color: #ef4444;">
      <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
      <span class="text-sm">{error}</span>
    </div>
  {/if}

  {#if result}
    <p class="text-sm font-medium" style="color: {$colorStore.text}" aria-live="polite">
      {result.rows > 0
        ? m.migration.linkResult({ rows: Number(result.rows).toLocaleString(), servers: Number(result.servers).toLocaleString() })
        : m.migration.linkResultNothing()}
    </p>
  {:else if link?.linked}
    <p class="text-sm font-medium flex items-center gap-2" style="color: {$colorStore.text}">
      <i class="fa-solid fa-circle-check" style="color: {$colorStore.primary};" aria-hidden="true"></i>
      {m.migration.linkLinked({ id: link.discordUserId ?? "" })}
    </p>
  {:else if identity}
    <p class="text-sm" style="color: {$colorStore.text}">{m.migration.linkReady({ name: identity.username })}</p>
    <button type="button"
            class="px-6 py-3 rounded-xl font-medium flex items-center gap-2 min-h-[44px] disabled:opacity-50"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            disabled={linking}
            onclick={finishLinking}>
      <i class="fa-solid {linking ? 'fa-spinner fa-spin' : 'fa-link'}" aria-hidden="true"></i>
      {m.migration.linkConfirmButton()}
    </button>
  {:else}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.migration.linkNotLinked()}</p>
    <a href={discordSignInUrl("/me")}
       data-sveltekit-reload
       class="inline-flex px-6 py-3 rounded-xl font-medium items-center gap-2 min-h-[44px]"
       style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">
      <i class="fa-brands fa-discord" aria-hidden="true"></i>
      {m.migration.linkButton()}
    </a>
  {/if}
</div>
