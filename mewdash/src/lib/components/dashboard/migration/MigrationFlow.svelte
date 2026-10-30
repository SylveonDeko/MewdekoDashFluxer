<!-- lib/components/dashboard/migration/MigrationFlow.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import {
    clientApi,
    discordSignInUrl,
    migrationApi,
    type DiscordIdentitySummary,
    type DiscordServer,
    type MigrationPreview,
    type MigrationResult,
    type MigrationStatus,
    type PairOverrides
  } from "$lib/api/index.ts";
  import DiscordSelector, { type OptionType } from "$lib/components/forms/DiscordSelector.svelte";
  import { ApiError } from "$lib/api/core";
  import { logger } from "$lib/logger";

  interface Props {
    guildId: bigint;
    /** Hides the longer explanations, for the setup wizard. */
    compact?: boolean;
    /** Query parameters added to the page the Discord sign in returns to. */
    returnParams?: Record<string, string>;
    /** Called after a server was moved over. */
    onmigrated?: () => void;
    /** Whether a server has been moved over, before or during this visit. */
    migrated?: boolean;
  }

  let {
    guildId,
    compact = false,
    returnParams = {},
    onmigrated,
    migrated = $bindable(false)
  }: Props = $props();

  const frame = $derived(compact ? "" : "rounded-2xl border p-6");
  const frameStyle = $derived(
    compact ? "" : `background: ${$colorStore.primary}05; border-color: ${$colorStore.primary}30;`
  );

  type Step = "connect" | "servers" | "exporting" | "preview" | "applying" | "done";

  interface FluxerChannel {
    id: string;
    name: string;
    type: string;
  }

  let step = $state<Step>("connect");
  let status = $state<MigrationStatus | null>(null);
  let identity = $state<DiscordIdentitySummary | null>(null);
  let servers = $state<DiscordServer[]>([]);
  let serversLoading = $state(false);
  let error = $state("");
  let code = $state("");
  let preview = $state<MigrationPreview | null>(null);
  let previewLoading = $state(false);
  let channelOverrides = $state<PairOverrides>({});
  let roleOverrides = $state<PairOverrides>({});
  let fluxerChannels = $state<FluxerChannel[]>([]);
  let fluxerRoles = $state<Array<{ id: string; name: string }>>([]);
  let acknowledged = $state(false);
  let copyExpressions = $state(true);
  let progress = $state<{ stage: string; done: number; total: number } | null>(null);
  let applying = $state(false);
  let result = $state<MigrationResult | null>(null);
  let started = $state(false);

  const flowVisible = $derived(!status?.migrated || started || step === "done");

  const signInReturn = $derived.by(() => {
    const target = new URL(page.url);
    target.searchParams.delete("discord_link");
    for (const [key, value] of Object.entries(returnParams)) target.searchParams.set(key, value);
    return `${target.pathname}${target.search}`;
  });

  const channelTypeLabels: Record<number, () => string> = {
    0: m.common.text,
    2: m.features.categoryVoice,
    4: m.common.category,
    5: m.migration.typeAnnouncement,
    13: m.migration.typeStage,
    15: m.migration.typeForum
  };

  const compatibleTypes: Record<number, string[]> = {
    0: ["text", "announcement"],
    5: ["text", "announcement"],
    2: ["voice", "stage"],
    13: ["voice", "stage"],
    4: ["category"],
    15: ["forum"]
  };

  /**
   * Formats a UTC time from the bot in the viewer's locale.
   * @param value The time, with or without a zone suffix
   */
  function when(value: string): string {
    return new Date(/[zZ]|[+-]\d\d:\d\d$/.test(value) ? value : `${value}Z`).toLocaleString();
  }

  function waitingText(count: number): string {
    const formatted = count.toLocaleString();
    return count === 1 ? m.migration.statusWaitingOne({ count: formatted }) : m.migration.statusWaitingOther({ count: formatted });
  }

  function imageUrl(kind: "icons" | "avatars", id: string, value: string | null): string | null {
    if (!value) return null;
    return value.startsWith("http") ? value : `https://cdn.discordapp.com/${kind}/${id}/${value}.png`;
  }

  function roleColor(color: number): string | null {
    return color ? `#${color.toString(16).padStart(6, "0")}` : null;
  }

  function channelOptions(discordType: number): OptionType[] {
    const allowed = compatibleTypes[discordType];
    return fluxerChannels
      .filter((channel) => !allowed || allowed.includes(channel.type))
      .map((channel) => ({ id: channel.id, name: channel.name }));
  }

  async function loadStatus() {
    try {
      status = await migrationApi.getStatus(guildId);
      if (status?.migrated) migrated = true;
    } catch (err) {
      logger.error("Failed to load migration status:", err);
      status = null;
    }
  }

  async function loadServers() {
    serversLoading = true;
    error = "";
    try {
      servers = await migrationApi.getDiscordServers();
      step = "servers";
    } catch (err) {
      logger.error("Failed to load Discord servers:", err);
      if (err instanceof ApiError && err.status === 401) {
        identity = null;
        step = "connect";
      } else {
        error = m.migration.discordUnavailable();
        step = "servers";
        servers = [];
      }
    } finally {
      serversLoading = false;
    }
  }

  async function disconnect() {
    try {
      await migrationApi.clearIdentity();
    } catch (err) {
      logger.error("Failed to clear the Discord sign in:", err);
    }
    identity = null;
    servers = [];
    step = "connect";
  }

  async function loadFluxerTargets() {
    try {
      const [channels, roles] = await Promise.all([
        clientApi.getGuildChannels(guildId).catch(() => []),
        clientApi.getRoles(guildId).catch(() => [])
      ]);
      fluxerChannels = channels.map((channel) => ({ id: String(channel.id), name: channel.name, type: channel.type }));
      fluxerRoles = roles.map((role) => ({ id: String(role.id), name: role.name }));
    } catch (err) {
      logger.error("Failed to load this server's channels and roles:", err);
    }
  }

  async function runPreview() {
    previewLoading = true;
    error = "";
    try {
      preview = await migrationApi.preview(guildId, code, channelOverrides, roleOverrides);
    } catch (err) {
      logger.error("Failed to preview the move:", err);
      error = err instanceof ApiError && err.status === 404 ? m.migration.previewExpired() : m.migration.previewFailed();
      if (err instanceof ApiError && err.status === 404) preview = null;
    } finally {
      previewLoading = false;
    }
  }

  function exportError(err: unknown): string {
    if (err instanceof ApiError) {
      switch (err.status) {
        case 403: return m.migration.exportNotAdmin();
        case 404: return m.migration.exportNotFound();
        case 503: return m.migration.discordUnavailable();
      }
    }
    return m.migration.exportFailed();
  }

  async function startExport(server: DiscordServer) {
    error = "";
    step = "exporting";
    try {
      const exported = await migrationApi.exportServer(guildId, server.id, server.botId);
      code = exported.code;
      channelOverrides = {};
      roleOverrides = {};
      acknowledged = false;
      await Promise.all([loadFluxerTargets(), runPreview()]);
      step = preview ? "preview" : "servers";
    } catch (err) {
      logger.error("Failed to export the Discord server:", err);
      error = exportError(err);
      step = "servers";
    }
  }

  function pairChannel(discordId: string, selected: string | string[] | null) {
    const next = { ...channelOverrides };
    if (typeof selected === "string" && selected) next[discordId] = selected;
    else delete next[discordId];
    channelOverrides = next;
    runPreview();
  }

  function pairRole(discordId: string, selected: string | string[] | null) {
    const next = { ...roleOverrides };
    if (typeof selected === "string" && selected) next[discordId] = selected;
    else delete next[discordId];
    roleOverrides = next;
    runPreview();
  }

  /**
   * Waits for the background move to finish. Copying emojis can take a few minutes, longer than one
   * request may stay open, so the bot runs it on its own and this checks on it every two seconds.
   */
  async function waitForApply(): Promise<MigrationResult> {
    progress = null;
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const status = await migrationApi.getApplyStatus(guildId);
      if (status.state === "done") return status.outcome;
      if (status.state === "failed" || status.state === "none") throw new Error(status.state);
      progress = { stage: status.stage, done: Number(status.done), total: Number(status.total) };
    }
  }

  const stageLabels: Record<string, () => string> = {
    starting: m.migration.progressStageStarting,
    emoji_download: m.migration.progressStageEmojiDownload,
    emoji_upload: m.migration.progressStageEmojiUpload,
    stickers: m.migration.progressStageStickers,
    settings: m.migration.progressStageSettings,
    refreshing: m.migration.progressStageRefreshing,
    panels: m.migration.progressStagePanels
  };

  async function apply() {
    if (!acknowledged || applying) return;
    applying = true;
    error = "";
    try {
      await migrationApi.apply(guildId, code, channelOverrides, roleOverrides, copyExpressions);
    } catch (err) {
      applying = false;
      if (err instanceof ApiError && err.status === 409) {
        await followApply();
        return;
      }
      logger.error("Failed to apply the move:", err);
      error = err instanceof ApiError && err.status === 404 ? m.migration.previewExpired() : m.migration.exportFailed();
      return;
    }
    applying = false;
    await followApply();
  }

  /**
   * Shows a move that is running in the bot and waits for its result. The move keeps going in the
   * bot when the page is closed, so this is also how a reopened page picks it up again.
   */
  async function followApply() {
    started = true;
    error = "";
    step = "applying";
    try {
      result = await waitForApply();
      step = "done";
      migrated = true;
      onmigrated?.();
      loadStatus();
    } catch (err) {
      logger.error("Failed to follow the move:", err);
      error = m.migration.exportFailed();
      step = "servers";
    }
  }

  function restart() {
    result = null;
    preview = null;
    code = "";
    error = "";
    step = "servers";
  }

  onMount(async () => {
    const outcome = page.url.searchParams.get("discord_link");
    if (outcome) started = true;
    if (outcome === "denied") error = m.migration.connectDenied();
    else if (outcome === "error") error = m.migration.connectError();

    loadStatus();
    try {
      const running = await migrationApi.getApplyStatus(guildId);
      if (running.state === "running") {
        followApply();
        return;
      }
    } catch (err) {
      logger.error("Failed to check for a running move:", err);
    }
    try {
      identity = await migrationApi.getIdentity();
    } catch (err) {
      logger.error("Failed to read the Discord sign in:", err);
    }
    if (identity) {
      started = true;
      await loadServers();
    }
  });
</script>

<div class="space-y-4">
  {#if error}
    <div class="p-4 rounded-xl flex items-center gap-3" role="alert"
         style="background: #ef444415; border: 1px solid #ef444430; color: #ef4444;">
      <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
      <span class="text-sm">{error}</span>
    </div>
  {/if}

  {#if status && step !== "done"}
    <div class="p-4 rounded-xl flex items-center gap-3"
         style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}20;">
      <i class="fa-solid {status.migrated ? 'fa-circle-check' : 'fa-circle-info'}" style="color: {$colorStore.primary};" aria-hidden="true"></i>
      <div class="text-sm min-w-0" style="color: {$colorStore.text}">
        {#if status.migrated}
          <p class="font-medium">{m.migration.statusMigrated({ date: when(status.migratedAt) })}</p>
          <p style="color: {$colorStore.muted}">
            {waitingText(Number(status.waitingMembers))}
          </p>
        {:else}
          <p>{m.migration.statusNotMigrated()}</p>
        {/if}
      </div>
    </div>
  {/if}

  {#if status?.migrated && !flowVisible}
    <button type="button"
            class="px-4 py-3 rounded-xl font-medium min-h-[44px] flex items-center gap-2"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            onclick={() => (started = true)}>
      <i class="fa-solid fa-rotate" aria-hidden="true"></i>
      {m.migration.statusMigrateAgain()}
    </button>
  {/if}

  {#if flowVisible && step === "connect"}
    <section class="{frame} space-y-4" in:fly={{ y: 10, duration: 200 }}
             style={frameStyle}>
      <h3 class="text-lg font-bold flex items-center gap-2" style="color: {$colorStore.text}">
        <i class="fa-brands fa-discord" style="color: {$colorStore.primary};" aria-hidden="true"></i>
        {m.migration.connectTitle()}
      </h3>
      <p class="text-sm" style="color: {$colorStore.muted}">{m.migration.connectHint()}</p>
      {#if !compact}
        <p class="text-xs" style="color: {$colorStore.muted}">{m.migration.connectKeepNote()}</p>
      {/if}
      <a
        href={discordSignInUrl(signInReturn)}
        data-sveltekit-reload
        class="inline-flex px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] items-center gap-2 min-h-[44px]"
        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
      >
        <i class="fa-brands fa-discord" aria-hidden="true"></i>
        {m.migration.connectButton()}
      </a>
    </section>
  {/if}

  {#if flowVisible && step === "servers"}
    <section class="{frame} space-y-4" in:fly={{ y: 10, duration: 200 }}
             style={frameStyle}>
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <h3 class="text-lg font-bold" style="color: {$colorStore.text}">{m.migration.serversTitle()}</h3>
        {#if identity}
          <div class="flex items-center gap-3 text-sm" style="color: {$colorStore.muted}">
            <span>{m.migration.connectedAs({ name: identity.username })}</span>
            <button type="button" class="px-3 rounded-lg min-h-[44px] text-sm"
                    style="background: {$colorStore.muted}20; color: {$colorStore.muted}; border: 1px solid {$colorStore.muted}30;"
                    onclick={disconnect}>
              {m.migration.disconnectButton()}
            </button>
          </div>
        {/if}
      </div>

      {#if serversLoading}
        <div class="flex items-center gap-3 py-6" style="color: {$colorStore.muted}">
          <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
          <span class="text-sm">{m.migration.serversLoading()}</span>
        </div>
      {:else if servers.length === 0}
        <p class="text-sm py-4" style="color: {$colorStore.muted}">{m.migration.serversEmpty()}</p>
      {:else}
        <ul class="grid grid-cols-1 md:grid-cols-2 gap-3">
          {#each servers as server (`${server.id}:${server.botId}`)}
            {@const serverIcon = imageUrl("icons", server.id, server.icon)}
            {@const botIcon = imageUrl("avatars", server.botId, server.botAvatar)}
            <li>
              <button type="button"
                      class="w-full text-left p-3 rounded-xl flex items-center gap-3 min-h-[44px] transition-all hover:scale-[1.01]"
                      style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}20; color: {$colorStore.text};"
                      onclick={() => startExport(server)}>
                {#if serverIcon}
                  <img src={serverIcon} alt="" class="w-10 h-10 rounded-full shrink-0" />
                {:else}
                  <span class="w-10 h-10 rounded-full shrink-0 flex items-center justify-center"
                        style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
                    <i class="fa-brands fa-discord" aria-hidden="true"></i>
                  </span>
                {/if}
                <span class="min-w-0 flex-1">
                  <span class="block text-sm font-medium truncate">{server.name}</span>
                  <span class="block text-xs" style="color: {$colorStore.muted}">
                    {m.common.membersCount({ count: Number(server.memberCount).toLocaleString() })}
                  </span>
                  <span class="flex items-center gap-1.5 text-xs mt-1" style="color: {$colorStore.muted}">
                    {#if botIcon}
                      <img src={botIcon} alt="" class="w-4 h-4 rounded-full" />
                    {/if}
                    <span class="truncate">{m.migration.serversVia({ bot: server.botName })}</span>
                  </span>
                </span>
                <i class="fa-solid fa-chevron-right" style="color: {$colorStore.muted};" aria-hidden="true"></i>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  {/if}

  {#if flowVisible && step === "exporting"}
    <section class="{compact ? 'py-8' : 'rounded-2xl border p-8'} flex flex-col items-center gap-3 text-center" in:fly={{ y: 10, duration: 200 }}
             style={frameStyle} aria-live="polite">
      <i class="fa-solid fa-spinner fa-spin text-2xl" style="color: {$colorStore.primary};" aria-hidden="true"></i>
      <p class="font-medium" style="color: {$colorStore.text}">{m.migration.exportWorking()}</p>
      <p class="text-sm" style="color: {$colorStore.muted}">{m.migration.exportWorkingHint()}</p>
    </section>
  {/if}

  {#if flowVisible && step === "applying"}
    <section class="{compact ? 'py-8' : 'rounded-2xl border p-8'} flex flex-col items-center gap-3 text-center" in:fly={{ y: 10, duration: 200 }}
             style={frameStyle} aria-live="polite">
      <i class="fa-solid fa-spinner fa-spin text-2xl" style="color: {$colorStore.primary};" aria-hidden="true"></i>
      <p class="font-medium" style="color: {$colorStore.text}">{m.migration.applyRunning()}</p>
      {#if progress}
        <div class="w-full max-w-md space-y-1">
          <div class="flex justify-between text-sm" style="color: {$colorStore.text}">
            <span>{stageLabels[progress.stage]?.() ?? progress.stage}</span>
            {#if progress.total > 1}
              <span class="tabular-nums" style="color: {$colorStore.muted}">
                {m.migration.progressCount({ done: progress.done.toLocaleString(), total: progress.total.toLocaleString() })}
              </span>
            {/if}
          </div>
          <div class="h-2 w-full rounded-full overflow-hidden" style="background: {$colorStore.primary}15;"
               role="progressbar" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.done}>
            <div class="h-full rounded-full transition-all duration-500"
                 style="width: {progress.total > 0 ? Math.min(100, (progress.done / progress.total) * 100) : 100}%; background: {$colorStore.primary};"></div>
          </div>
        </div>
      {/if}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.migration.applyRunningHint()}</p>
    </section>
  {/if}

  {#if flowVisible && step === "preview" && preview}
    <section class="{frame} space-y-6" in:fly={{ y: 10, duration: 200 }}
             style={frameStyle}>
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-lg font-bold" style="color: {$colorStore.text}">
          {m.migration.previewTitle({ name: preview.discordGuildName })}
        </h3>
        {#if previewLoading}
          <span class="text-sm flex items-center gap-2" style="color: {$colorStore.muted}" aria-live="polite">
            <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
            {m.migration.previewLoading()}
          </span>
        {/if}
      </div>

      <ul class="flex flex-wrap gap-2 text-sm">
        {#each [
          m.migration.previewStatTables({ count: preview.tables.toLocaleString() }),
          m.migration.previewStatSettings({ count: preview.settingRows.toLocaleString() }),
          m.migration.previewStatMembers({ count: preview.members.toLocaleString() }),
          m.migration.previewStatLinked({ count: preview.linkedMembers.toLocaleString() }),
          m.migration.previewStatEmojis({ matched: preview.emojisMatched.toLocaleString(), total: preview.emojisTotal.toLocaleString() }),
          m.migration.previewStatStickers({ count: preview.stickersTotal.toLocaleString() })
        ] as stat}
          <li class="px-3 py-1.5 rounded-lg"
              style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;">
            {stat}
          </li>
        {/each}
      </ul>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div class="space-y-3">
          <h4 class="font-semibold" style="color: {$colorStore.text}">{m.common.channels()}</h4>
          {#if !compact}
            <p class="text-xs" style="color: {$colorStore.muted}">{m.migration.channelsHint()}</p>
          {/if}
          <ul class="space-y-2 max-h-[32rem] overflow-y-auto pr-1">
            {#each preview.channels as channel (channel.id)}
              {@const paired = channelOverrides[channel.id] ?? channel.fluxerId}
              <li class="p-3 rounded-xl flex flex-col sm:flex-row sm:items-center gap-2"
                  style="background: {paired ? `${$colorStore.primary}08` : '#f59e0b15'}; border: 1px solid {paired ? `${$colorStore.primary}20` : '#f59e0b50'};">
                <div class="min-w-0 sm:w-1/2">
                  <p class="text-sm font-medium truncate" style="color: {$colorStore.text}">{channel.name}</p>
                  <p class="text-xs truncate" style="color: {$colorStore.muted}">
                    {channelTypeLabels[channel.type]?.() ?? ""}{channel.parentName ? ` · ${channel.parentName}` : ""}
                    {#if !paired}
                      <span class="ml-1 font-medium" style="color: #f59e0b;">{m.migration.unmatchedBadge()}</span>
                    {/if}
                  </p>
                </div>
                <div class="sm:w-1/2">
                  <DiscordSelector
                    type="channel"
                    options={channelOptions(channel.type)}
                    selected={paired}
                    placeholder={m.migration.pairNonePlaceholder()}
                    ariaLabel={channel.name}
                    onchange={({ selected }) => pairChannel(channel.id, selected)}
                  />
                </div>
              </li>
            {/each}
          </ul>
        </div>

        <div class="space-y-3">
          <h4 class="font-semibold" style="color: {$colorStore.text}">{m.common.roles()}</h4>
          {#if !compact}
            <p class="text-xs" style="color: {$colorStore.muted}">{m.migration.rolesHint()}</p>
          {/if}
          <ul class="space-y-2 max-h-[32rem] overflow-y-auto pr-1">
            {#each preview.roles as role (role.id)}
              {@const paired = roleOverrides[role.id] ?? role.fluxerId}
              {@const color = roleColor(role.color)}
              <li class="p-3 rounded-xl flex flex-col sm:flex-row sm:items-center gap-2"
                  style="background: {paired ? `${$colorStore.primary}08` : '#f59e0b15'}; border: 1px solid {paired ? `${$colorStore.primary}20` : '#f59e0b50'};">
                <div class="min-w-0 sm:w-1/2">
                  <p class="text-sm font-medium truncate" style="color: {color ?? $colorStore.text}">{role.name}</p>
                  {#if !paired}
                    <p class="text-xs font-medium" style="color: #f59e0b;">{m.migration.unmatchedBadge()}</p>
                  {/if}
                </div>
                <div class="sm:w-1/2">
                  <DiscordSelector
                    type="role"
                    options={fluxerRoles}
                    selected={paired}
                    placeholder={m.migration.pairNonePlaceholder()}
                    ariaLabel={role.name}
                    onchange={({ selected }) => pairRole(role.id, selected)}
                  />
                </div>
              </li>
            {/each}
          </ul>
        </div>
      </div>

      {#if preview.emojisToCopy + preview.stickersToCopy > 0}
        <label class="p-4 rounded-xl flex items-start gap-3 text-sm cursor-pointer min-h-[44px]"
               style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}20; color: {$colorStore.text};">
          <input type="checkbox" class="mt-1" bind:checked={copyExpressions} />
          <span class="space-y-1">
            <span class="block font-medium">
              {m.migration.copyExpressions({ emojis: preview.emojisToCopy.toLocaleString(), stickers: preview.stickersToCopy.toLocaleString() })}
            </span>
            <span class="block text-xs" style="color: {$colorStore.muted}">{m.migration.copyExpressionsHint()}</span>
          </span>
        </label>
      {/if}

      <div class="p-4 rounded-xl space-y-3" role="alert"
           style="background: #f59e0b15; border: 1px solid #f59e0b50;">
        <p class="font-semibold flex items-center gap-2" style="color: #f59e0b;">
          <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
          {m.migration.warningTitle()}
        </p>
        <p class="text-sm" style="color: {$colorStore.text}">{m.migration.warningBody()}</p>
        <label class="flex items-start gap-2 text-sm cursor-pointer min-h-[44px]" style="color: {$colorStore.text}">
          <input type="checkbox" class="mt-1" bind:checked={acknowledged} />
          <span>{m.migration.confirmCheck()}</span>
        </label>
      </div>

      <div class="flex items-center justify-between gap-3 flex-wrap">
        <button type="button"
                class="px-4 py-3 rounded-xl font-medium min-h-[44px]"
                style="background: {$colorStore.muted}20; color: {$colorStore.muted}; border: 1px solid {$colorStore.muted}30;"
                onclick={restart}>
          {m.common.back()}
        </button>
        <button type="button"
                class="px-6 py-3 rounded-xl font-medium flex items-center gap-2 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                disabled={!acknowledged || applying || previewLoading}
                onclick={apply}>
          <i class="fa-solid {applying ? 'fa-spinner fa-spin' : 'fa-arrow-right-arrow-left'}" aria-hidden="true"></i>
          {applying ? m.migration.applyRunning() : m.migration.confirmButton()}
        </button>
      </div>
    </section>
  {/if}

  {#if step === "done" && result}
    <section class="{frame} space-y-4" in:fly={{ y: 10, duration: 200 }}
             style={frameStyle}>
      <h3 class="text-lg font-bold flex items-center gap-2" style="color: {$colorStore.text}">
        <i class="fa-solid fa-circle-check" style="color: {$colorStore.primary};" aria-hidden="true"></i>
        {m.migration.resultTitle()}
      </h3>
      <dl class="grid grid-cols-1 md:grid-cols-2 gap-3">
        {#each [
          { label: m.migration.resultWritten(), hint: "", value: result.written },
          { label: m.migration.resultHeld(), hint: m.migration.resultHeldHint(), value: result.held },
          { label: m.migration.resultDropped(), hint: m.migration.resultDroppedHint(), value: result.dropped },
          { label: m.common.failed(), hint: m.migration.resultFailedHint(), value: result.failed },
          { label: m.migration.resultReposted(), hint: m.migration.resultRepostedHint(), value: result.reposted }
        ] as item}
          <div class="p-3 rounded-xl flex items-center gap-4"
               style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}20;">
            <dd class="text-2xl font-bold tabular-nums min-w-[5ch] text-right" style="color: {$colorStore.text}">
              {Number(item.value).toLocaleString()}
            </dd>
            <div class="min-w-0">
              <dt class="text-sm font-semibold" style="color: {$colorStore.text}">{item.label}</dt>
              {#if item.hint}
                <dd class="text-xs" style="color: {$colorStore.muted}">{item.hint}</dd>
              {/if}
            </div>
          </div>
        {/each}
      </dl>
      {#if result.expressions}
        <p class="text-sm" style="color: {result.expressions.missingPermission ? '#f59e0b' : $colorStore.text}">
          {result.expressions.missingPermission
            ? m.migration.resultExpressionsPermission()
            : m.migration.resultExpressions({
                emojis: Number(result.expressions.emojisCopied).toLocaleString(),
                stickers: Number(result.expressions.stickersCopied).toLocaleString(),
                failed: (Number(result.expressions.emojisFailed) + Number(result.expressions.stickersFailed)).toLocaleString()
              })}
        </p>
      {/if}
      <p class="text-sm" style="color: {$colorStore.text}">
        {waitingText(Number(result.waitingMembers))}
      </p>
      <p class="text-sm" style="color: {$colorStore.muted}">{m.migration.resultNext()}</p>
      <button type="button"
              class="px-4 py-3 rounded-xl font-medium min-h-[44px]"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              onclick={restart}>
        {m.migration.resultRestart()}
      </button>
    </section>
  {/if}
</div>
