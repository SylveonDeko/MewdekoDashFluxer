<!-- routes/dashboard/globallist/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import {
    clientApi,
    globalListApi,
    globalListReviewApi,
    type GlobalListEntryItem,
    type GlobalListOverview,
    type GlobalListSettingsPatch
  } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger.ts";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import AsyncState from "$lib/components/stats/AsyncState.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import ActionsCard from "./components/ActionsCard.svelte";
  import OpenReportsCard from "./components/OpenReportsCard.svelte";
  import ReportSheet from "./components/ReportSheet.svelte";

  let overview = $state<GlobalListOverview | null>(null);
  let open = $state<GlobalListEntryItem[]>([]);
  let channels = $state<Array<{ id: string; name: string }>>([]);
  let roles = $state<Array<{ id: string; name: string; color?: number }>>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let reporting = $state(false);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType = $state<"success" | "error">("success");
  let loadedFor = "";
  let isReviewer = $state(false);

  onMount(() => {
    globalListReviewApi.getMe().then(
      (status) => (isReviewer = status.isReviewer),
      (err) => logger.debug("Reviewer check failed", err)
    );
  });

  const settings = $derived(overview?.settings ?? null);
  const standing = $derived(overview?.standing ?? null);

  function notify(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => (showNotification = false), 3000);
  }

  const autoSave = createAutoSave({
    onError: () => notify(m.globallist.errorSave(), "error")
  });

  async function loadOpen(guildId: bigint) {
    try {
      open = await globalListApi.getOpen(guildId);
    } catch (err) {
      logger.error("Failed to load open global list reports", err);
    }
  }

  async function load(guildId: bigint) {
    loading = true;
    error = null;
    try {
      const [loaded, loadedChannels, loadedRoles] = await Promise.all([
        globalListApi.get(guildId),
        clientApi.getTextChannels(guildId),
        clientApi.getRoles(guildId)
      ]);
      overview = loaded;
      channels = loadedChannels;
      roles = loadedRoles as typeof roles;
      if (loaded.settings.enabled) await loadOpen(guildId);
    } catch (err) {
      error = err instanceof Error ? err.message : m.globallist.errorLoad();
      logger.error("Failed to load the global list", err);
    } finally {
      loading = false;
    }
  }

  async function refresh(guildId: bigint) {
    try {
      overview = await globalListApi.get(guildId);
    } catch (err) {
      logger.error("Failed to refresh the global list", err);
    }
  }

  async function update(patch: GlobalListSettingsPatch) {
    if (!$currentGuild?.id || !overview) return;
    const previous = overview;
    try {
      overview = await globalListApi.update(BigInt($currentGuild.id), patch);
      if (patch.enabled) await loadOpen(BigInt($currentGuild.id));
    } catch (err) {
      overview = previous;
      throw err;
    }
  }

  $effect(() => {
    if (!$currentGuild) {
      void goto("/dashboard");
      return;
    }
    const id = $currentGuild.id.toString();
    if (loadedFor !== id) {
      loadedFor = id;
      void load(BigInt($currentGuild.id));
    }
  });
</script>

{#snippet statusMessages()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-[10001]" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

<PluginPage
  {statusMessages}
  {autoSave}
  icon="fa-user-xmark"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.globallistName()}
  subtitle={m.globallist.pageSubtitle()}
  enabled={settings?.enabled}
  onToggle={(value) => autoSave.now("enabled", () => update({ enabled: value }))}
>
  <AsyncState {loading} {error} empty={!settings}>
    {#if isReviewer}
      <a
        href="/globallist/review"
        class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
        style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
      >
        <i class="fa-solid fa-clipboard" aria-hidden="true"></i>
        {m.globallist.reviewLink()}
      </a>
    {/if}
    {#if settings && standing && $currentGuild?.id && settings.enabled}
      <ActionsCard {settings} {standing} {channels} {roles} {autoSave} onupdate={update} />
      <OpenReportsCard
        guildId={BigInt($currentGuild.id)}
        entries={open}
        canReport={!standing.blocked}
        onreport={() => (reporting = true)}
        onreload={() => loadOpen(BigInt($currentGuild.id))}
        onerror={(message) => notify(message, "error")}
        onsuccess={(message) => notify(message)}
      />
      {#if reporting}
        <ReportSheet
          guildId={BigInt($currentGuild.id)}
          onclose={() => (reporting = false)}
          ondone={async () => {
            reporting = false;
            notify(m.globallist.reportSent());
            await Promise.all([loadOpen(BigInt($currentGuild.id)), refresh(BigInt($currentGuild.id))]);
          }}
        />
      {/if}
    {/if}
  </AsyncState>
</PluginPage>
