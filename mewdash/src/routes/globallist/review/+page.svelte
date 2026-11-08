<!-- routes/globallist/review/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { browser } from "$app/environment";
  import {
    globalListReviewApi,
    type GlobalListAppeal,
    type GlobalListEntryItem
  } from "$lib/api/index.ts";
  import { currentInstance } from "$lib/stores/instanceStore";
  import { colorStore } from "$lib/stores/colorStore";
  import { safeLocalStorage } from "$lib/safeStorage";
  import { logger } from "$lib/logger";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import AsyncState from "$lib/components/stats/AsyncState.svelte";
  import EntryReviewSheet from "$lib/components/globallist/EntryReviewSheet.svelte";
  import LiveList from "$lib/components/globallist/LiveList.svelte";
  import ReviewQueue from "$lib/components/globallist/ReviewQueue.svelte";

  let { data } = $props();

  let activeTab = $state("queue");
  let loading = $state(true);
  let error = $state<string | null>(null);
  let pending = $state<GlobalListEntryItem[]>([]);
  let appeals = $state<GlobalListAppeal[]>([]);
  let live = $state<GlobalListEntryItem[]>([]);
  let openEntry = $state<number | null>(null);
  let message = $state<{ text: string; type: "success" | "error" } | null>(null);

  const tabs = $derived([
    { id: "queue", label: m.globallist.ownerTabQueue(), icon: "fa-clipboard" },
    { id: "live", label: m.globallist.ownerTabLive(), icon: "fa-user-xmark" }
  ]);

  if (browser && !$currentInstance) {
    const saved = safeLocalStorage.getItem("selectedInstance");
    if (saved) {
      try {
        currentInstance.set(JSON.parse(saved));
      } catch (err) {
        logger.error("Failed to parse saved instance:", err);
      }
    }
  }

  function notify(text: string, type: "success" | "error" = "error") {
    message = { text, type };
    setTimeout(() => (message = null), 3000);
  }

  async function loadAll() {
    try {
      error = null;
      const [queue, liveList] = await Promise.all([globalListReviewApi.getQueue(), globalListReviewApi.getLive()]);
      pending = queue.entries;
      appeals = queue.appeals;
      live = liveList;
    } catch (err) {
      logger.error("Failed to load the global list review data", err);
      error = err instanceof Error && err.message ? err.message : m.globallist.errorLoad();
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    if (data.status === "allowed") void loadAll();
  });
</script>

{#if message}
  <div class="fixed top-4 right-4 z-[10001]" transition:fade>
    <Notification message={message.text} type={message.type} />
  </div>
{/if}

{#if data.status === "allowed"}
  <DashboardPageLayout
    category="Analytics"
    guildName={m.features.globallistName()}
    icon="fa-clipboard"
    subtitle={m.features.globallistReviewDescription()}
    title={m.features.globallistReviewName()}
    basePath="/globallist/review"
    {tabs}
    bind:activeTab
  >
    <AsyncState {loading} {error} empty={false}>
      {#if activeTab === "queue"}
        <ReviewQueue entries={pending} {appeals} onopen={(id) => (openEntry = id)} />
      {:else}
        <LiveList entries={live} onopen={(id) => (openEntry = id)} />
      {/if}
    </AsyncState>
  </DashboardPageLayout>

  {#if openEntry !== null}
    <EntryReviewSheet
      entryId={openEntry}
      api={globalListReviewApi}
      isOwner={data.isOwner}
      onclose={() => (openEntry = null)}
      onchanged={loadAll}
      onerror={(text) => notify(text)}
    />
  {/if}
{:else}
  <div class="flex flex-col items-center justify-center gap-4 min-h-[60vh] px-4 text-center">
    <i class="fa-solid fa-lock text-3xl" style="color: {$colorStore.muted}" aria-hidden="true"></i>
    <p class="text-lg font-semibold" style="color: {$colorStore.text}">
      {data.status === "denied" ? m.globallist.reviewNotReviewer() : m.globallist.reviewUnavailable()}
    </p>
    <a
      href="/dashboard"
      class="inline-flex items-center justify-center px-5 rounded-xl min-h-[50px] font-medium"
      style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
    >
      {m.common.back()}
    </a>
  </div>
{/if}
