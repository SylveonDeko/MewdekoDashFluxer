<!-- routes/dashboard/bridges/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onDestroy, onMount, untrack } from "svelte";
  import { goto } from "$app/navigation";
  import { ApiError } from "$lib/api/core";
  import {
    bridgeApi,
    clientApi,
    type Bridge,
    type BridgeCode,
    type Pair
  } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger.ts";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import SettingToggle from "$lib/components/forms/SettingToggle.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import Card from "$lib/components/analytics/Card.svelte";
  import AsyncState from "$lib/components/stats/AsyncState.svelte";
  import BridgeSettingsPanel from "$lib/components/forms/BridgeSettingsPanel.svelte";
  import BridgePairs from "$lib/components/forms/BridgePairs.svelte";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";

  let { data } = $props();

  const POLL_MS = 4000;

  let bridges = $state<Bridge[]>([]);
  let pairs = $state<Pair[]>([]);
  let channels = $state<Array<{ id: string; name: string }>>([]);
  let roles = $state<Array<{ id: string; name: string; color?: number }>>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let notificationMessage = $state("");
  let notificationType = $state<"success" | "error">("success");

  let channelId = $state<string | null>(null);
  let entering = $state(false);
  let codeInput = $state("");
  let busy = $state(false);
  let code = $state<BridgeCode | null>(null);
  let codeChannelId = $state<string | null>(null);
  let now = $state(Date.now());

  let removing = $state<Bridge | null>(null);
  let showRemoveConfirm = $state(false);

  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let tickTimer: ReturnType<typeof setInterval> | null = null;

  const remainingMs = $derived(code ? new Date(code.expiresAt).getTime() - now : 0);
  const countdown = $derived.by(() => {
    const total = Math.max(0, Math.ceil(remainingMs / 1000));
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
  });

  function notify(message: string, type: "success" | "error" = "error") {
    notificationMessage = message;
    notificationType = type;
    setTimeout(() => (notificationMessage = ""), 4000);
  }

  const autoSave = createAutoSave({
    onError: (err) => notify(errorText(err), "error")
  });

  function errorText(err: unknown) {
    if (err instanceof ApiError) {
      switch ((err.body as { details?: { error?: string } } | null)?.details?.error ?? err.error) {
        case "already_bridged":
          return m.bridge.errorAlreadyBridged();
        case "channel_invalid":
          return m.bridge.errorChannelInvalid();
        case "code_invalid":
          return m.bridge.errorCodeInvalid();
        case "code_wrong_platform":
          return m.bridge.errorCodeWrongPlatform();
        case "missing_permission":
          return m.bridge.errorMissingPermission();
        case "invalid_name_format":
          return m.bridge.errorNameFormat({ name: "{name}" });
        case "invalid_min_age":
          return m.bridge.errorMinAge();
        case "not_found":
          return m.bridge.errorNotFound();
        case "already_paired":
          return m.bridge.errorAlreadyPaired();
        case "channel_not_shared":
          return m.bridge.errorChannelNotShared();
      }
    }
    return m.bridge.errorGeneric();
  }

  async function load(quiet = false) {
    if (!$currentGuild?.id) return;
    if (!quiet) {
      loading = true;
      error = null;
    }
    try {
      bridges = await bridgeApi.getBridges($currentGuild.id);
    } catch (err) {
      if (!quiet) error = err instanceof Error ? err.message : m.bridge.errorLoad();
      logger.error("Failed to load bridges", err);
    } finally {
      if (!quiet) loading = false;
    }
  }

  async function loadChannels() {
    if (!$currentGuild?.id) return;
    try {
      channels = await clientApi.getTextChannels($currentGuild.id);
    } catch (err) {
      logger.error("Failed to load channels", err);
    }
  }

  async function loadRoles() {
    if (!$currentGuild?.id) return;
    try {
      const list = await clientApi.getRoles($currentGuild.id);
      roles = list.map((r: any) => ({ id: r.id.toString(), name: r.name, color: r.color }));
    } catch (err) {
      logger.error("Failed to load roles", err);
    }
  }

  function stopCode() {
    code = null;
    codeChannelId = null;
    if (pollTimer) clearInterval(pollTimer);
    if (tickTimer) clearInterval(tickTimer);
    pollTimer = null;
    tickTimer = null;
  }

  async function poll() {
    await load(true);
    if (codeChannelId && bridges.some((b) => String(b.channelId) === codeChannelId)) {
      stopCode();
      channelId = null;
      notify(m.bridge.linked(), "success");
      return;
    }
    if (code && remainingMs <= 0) {
      stopCode();
      notify(m.bridge.codeExpired(), "error");
    }
  }

  async function createCode() {
    if (!$currentGuild?.id || !data.user?.id) return;
    if (!channelId) {
      notify(m.common.pickChannelFirstPlaceholder(), "error");
      return;
    }
    entering = false;
    busy = true;
    try {
      stopCode();
      code = await bridgeApi.createCode($currentGuild.id, BigInt(channelId), data.user.id);
      codeChannelId = channelId;
      now = Date.now();
      tickTimer = setInterval(() => (now = Date.now()), 1000);
      pollTimer = setInterval(poll, POLL_MS);
    } catch (err) {
      notify(errorText(err), "error");
    } finally {
      busy = false;
    }
  }

  async function linkCode() {
    if (!$currentGuild?.id || !data.user?.id) return;
    if (!channelId) {
      notify(m.common.pickChannelFirstPlaceholder(), "error");
      return;
    }
    if (!codeInput.trim()) {
      notify(m.bridge.errorNoCode(), "error");
      return;
    }
    busy = true;
    try {
      await bridgeApi.link($currentGuild.id, codeInput.trim(), BigInt(channelId), data.user.id);
      codeInput = "";
      channelId = null;
      entering = false;
      notify(m.bridge.linked(), "success");
      await load(true);
    } catch (err) {
      notify(errorText(err), "error");
    } finally {
      busy = false;
    }
  }

  async function copyCode() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code.code);
      notify(m.bridge.codeCopied(), "success");
    } catch (err) {
      logger.error("Failed to copy code", err);
    }
  }

  async function setPaused(bridge: Bridge, paused: boolean) {
    if (!$currentGuild?.id) return;
    const previous = bridge.paused;
    bridge.paused = paused;
    try {
      if (paused) await bridgeApi.pause($currentGuild.id, bridge.bridgeId);
      else await bridgeApi.resume($currentGuild.id, bridge.bridgeId);
    } catch (err) {
      bridge.paused = previous;
      notify(m.bridge.errorSave(), "error");
      logger.error("Failed to change bridge state", err);
    }
  }

  async function setAllowBots(bridge: Bridge, allow: boolean) {
    if (!$currentGuild?.id) return;
    const previous = bridge.allowBots;
    bridge.allowBots = allow;
    try {
      await bridgeApi.setAllowBots($currentGuild.id, bridge.bridgeId, allow);
    } catch (err) {
      bridge.allowBots = previous;
      notify(m.bridge.errorSave(), "error");
      logger.error("Failed to change bridge setting", err);
    }
  }

  function askRemove(bridge: Bridge) {
    removing = bridge;
    showRemoveConfirm = true;
  }

  async function confirmRemove() {
    if (!$currentGuild?.id || !removing) return;
    const target = removing;
    removing = null;
    try {
      await bridgeApi.remove($currentGuild.id, target.bridgeId);
      bridges = bridges.filter((b) => b.bridgeId !== target.bridgeId);
      notify(m.bridge.removed(), "success");
    } catch (err) {
      notify(m.bridge.errorSave(), "error");
      logger.error("Failed to remove bridge", err);
    }
  }

  function channelLabel(bridge: Bridge) {
    return bridge.channelName ? `#${bridge.channelName}` : m.common.channelDeleted();
  }

  function viaName(bridge: Bridge) {
    if (!bridge.pairId) return null;
    return pairs.find((p) => p.pairId === bridge.pairId)?.remoteGuildName ?? bridge.remoteGuildName;
  }

  function remoteLabel(bridge: Bridge) {
    return `${bridge.remoteGuildName} / #${bridge.remoteChannelName}`;
  }

  let loadedFor = $state("");

  async function loadAll() {
    if (!$currentGuild?.id) return;
    const key = `${$currentGuild.id}:${$currentInstance?.port ?? ""}`;
    if (loadedFor === key) return;
    loadedFor = key;
    stopCode();
    await Promise.all([load(), loadChannels(), loadRoles()]);
  }

  onMount(async () => {
    if (!$currentGuild) {
      await goto("/dashboard");
      return;
    }
    await loadAll();
  });

  onDestroy(stopCode);

  $effect(() => {
    if ($currentGuild && $currentInstance) untrack(() => loadAll());
  });

  const inputStyle = $derived(`background: ${$colorStore.primary}10; color: ${$colorStore.text};`);
  const primaryStyle = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);
  const secondaryStyle = $derived(`background: ${$colorStore.primary}14; color: ${$colorStore.text};`);
</script>

<DashboardPageLayout
  title={m.features.bridgesName()}
  subtitle={m.bridge.pageSubtitle()}
  icon="fa-link"
  guildName={$currentGuild?.name || "Dashboard"}
  bind:notificationMessage
  {notificationType}
  {autoSave}
>
  <AsyncState {loading} {error}>
    <div class="space-y-6">
      {#if $currentGuild}
        <BridgePairs
          guildId={$currentGuild.id}
          userId={data.user?.id}
          bind:pairs
          {autoSave}
          {notify}
          {errorText}
          onrefresh={() => load(true)} />
      {/if}

      <Card title={m.bridge.connectTitle()}>
        <div class="space-y-4">
          <div>
            <span class="block text-sm mb-2" id="bridge-channel-label" style="color: {$colorStore.muted}">{m.bridge.connectChannelLabel()}</span>
            <DiscordSelector
              type="channel"
              options={channels}
              selected={channelId}
              ariaLabelledby="bridge-channel-label"
              placeholder={m.common.selectAChannelPlaceholder()}
              onchange={(detail) => (channelId = typeof detail.selected === "string" ? detail.selected : null)} />
          </div>

          {#if code}
            <div class="rounded-lg p-4 space-y-3" style="background: {$colorStore.primary}10;">
              <span class="block text-sm" style="color: {$colorStore.muted}">{m.bridge.codeLabel()}</span>
              <div class="flex flex-wrap items-center gap-3">
                <span class="text-3xl font-bold font-mono tracking-widest select-all" style="color: {$colorStore.text}">{code.code}</span>
                <button type="button" class="px-3 min-h-[44px] rounded-lg text-sm font-medium" style={secondaryStyle} onclick={copyCode}>{m.bridge.codeCopy()}</button>
              </div>
              <p class="text-sm" style="color: {$colorStore.muted}">{m.bridge.codeExpiresIn({ time: countdown })}</p>
              <p class="text-sm" style="color: {$colorStore.text}">{m.bridge.codeInstructions({ command: `.bridge link ${code.code}` })}</p>
            </div>
          {:else if entering}
            <div class="flex flex-col sm:flex-row gap-2">
              <input type="text" bind:value={codeInput} placeholder={m.bridge.codePlaceholder()} aria-label={m.bridge.codeLabel()} autocomplete="off" class="w-full rounded-lg p-2 min-h-[44px] font-mono uppercase" style={inputStyle} onkeydown={(e) => e.key === "Enter" && linkCode()} />
              <button type="button" class="px-4 min-h-[44px] rounded-lg text-sm font-medium whitespace-nowrap disabled:opacity-50" style={primaryStyle} disabled={busy || !channelId || !codeInput.trim()} onclick={linkCode}>{m.bridge.connectLink()}</button>
              <button type="button" class="px-4 min-h-[44px] rounded-lg text-sm font-medium whitespace-nowrap" style={secondaryStyle} onclick={() => (entering = false)}>{m.common.cancel()}</button>
            </div>
          {:else}
            <div class="flex flex-wrap gap-2">
              <button type="button" class="px-4 min-h-[44px] rounded-lg text-sm font-medium disabled:opacity-50" style={primaryStyle} disabled={busy || !channelId} onclick={createCode}>{m.bridge.connectCreate()}</button>
              <button type="button" class="px-4 min-h-[44px] rounded-lg text-sm font-medium" style={secondaryStyle} onclick={() => (entering = true)}>{m.bridge.connectHaveCode()}</button>
            </div>
          {/if}
        </div>
      </Card>

      {#if bridges.length === 0}
        <p class="text-sm px-1" style="color: {$colorStore.muted}">{m.bridge.emptyMessage()}</p>
      {:else}
        <section class="space-y-3">
          <h2 class="text-base font-semibold px-1" style="color: {$colorStore.text}">{m.bridge.listTitle()}</h2>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {#each bridges as bridge (bridge.bridgeId)}
              <Card title={channelLabel(bridge)}>
                <div class="space-y-4">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <p class="text-sm font-medium truncate" style="color: {$colorStore.text}">{remoteLabel(bridge)}</p>
                      <p class="text-xs" style="color: {$colorStore.muted}">
                        {bridge.paused ? m.common.paused() : m.common.active()} · {m.bridge.since({ date: new Date(bridge.dateAdded).toLocaleDateString() })}
                      </p>
                      {#if viaName(bridge)}
                        <p class="text-xs" style="color: {$colorStore.muted}">{m.bridge.pairVia({ community: viaName(bridge) ?? "" })}</p>
                      {/if}
                    </div>
                    <button type="button" class="px-3 min-h-[44px] rounded-lg text-sm font-medium whitespace-nowrap" style="background: {$colorStore.primary}20; color: {$colorStore.text};" onclick={() => askRemove(bridge)}>{m.common.remove()}</button>
                  </div>
                  <SettingToggle id="bridge-paused-{bridge.bridgeId}" label={m.common.paused()} checked={bridge.paused} onchange={(v) => setPaused(bridge, v)} />
                  <SettingToggle id="bridge-bots-{bridge.bridgeId}" label={m.bridge.allowBotsLabel()} checked={bridge.allowBots} onchange={(v) => setAllowBots(bridge, v)} />
                  <BridgeSettingsPanel
                    {bridge}
                    {roles}
                    {autoSave}
                    examplePlatform={m.bridge.examplePlatform()}
                    save={(settings) => bridgeApi.updateSettings($currentGuild!.id, bridge.bridgeId, settings)}
                    onupdate={(next) => (bridges = bridges.map((b) => (b.bridgeId === next.bridgeId ? next : b)))}
                    notify={(message) => notify(message, "error")} />
                </div>
              </Card>
            {/each}
          </div>
        </section>
      {/if}
    </div>
  </AsyncState>
</DashboardPageLayout>

<ConfirmationModal
  bind:isOpen={showRemoveConfirm}
  title={m.bridge.removeTitle()}
  message={m.bridge.removeMessage({ channel: removing ? channelLabel(removing) : "", remote: removing ? remoteLabel(removing) : "" })}
  confirmText={m.common.remove()}
  variant="danger"
  oncancel={() => (removing = null)}
  onconfirm={confirmRemove}
/>
