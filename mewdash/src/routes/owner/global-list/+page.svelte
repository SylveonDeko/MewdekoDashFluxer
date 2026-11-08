<!-- routes/owner/global-list/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { goto } from "$app/navigation";
  import {
    globalListOwnerApi,
    ownershipApi,
    type GlobalListAppeal,
    type GlobalListCommunityStanding,
    type GlobalListEntryItem,
    type GlobalListReviewer
  } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { loadingStore } from "$lib/stores/loadingStore";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import Card from "$lib/components/analytics/Card.svelte";
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
  let reviewers = $state<GlobalListReviewer[]>([]);
  let standing = $state<GlobalListCommunityStanding[]>([]);
  let reviewerInput = $state("");
  let openEntry = $state<number | null>(null);
  let message = $state<{ text: string; type: "success" | "error" } | null>(null);

  const tabs = $derived([
    { id: "queue", label: m.globallist.ownerTabQueue(), icon: "fa-clipboard" },
    { id: "live", label: m.globallist.ownerTabLive(), icon: "fa-user-xmark" },
    { id: "reviewers", label: m.globallist.ownerTabReviewers(), icon: "fa-user" },
    { id: "standing", label: m.globallist.ownerTabStanding(), icon: "fa-flag" }
  ]);

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
  const buttonStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );

  function notify(text: string, type: "success" | "error" = "error") {
    message = { text, type };
    setTimeout(() => (message = null), 3000);
  }

  async function loadAll() {
    try {
      error = null;
      const [queue, liveList, reviewerList, standings] = await Promise.all([
        globalListOwnerApi.getQueue(),
        globalListOwnerApi.getLive(),
        globalListOwnerApi.getReviewers(),
        globalListOwnerApi.getStanding()
      ]);
      pending = queue.entries;
      appeals = queue.appeals;
      live = liveList;
      reviewers = reviewerList;
      standing = standings;
    } catch (err) {
      logger.error("Failed to load the global list review data", err);
      error = err instanceof Error && err.message ? err.message : m.globallist.errorLoad();
    } finally {
      loading = false;
    }
  }

  async function addReviewer() {
    if (!/^\d{17,20}$/.test(reviewerInput.trim())) {
      notify(m.globallist.errorInvalidTarget());
      return;
    }
    try {
      reviewers = await globalListOwnerApi.addReviewer(BigInt(reviewerInput.trim()));
      reviewerInput = "";
    } catch (err) {
      notify(err instanceof Error && err.message ? err.message : m.globallist.errorSave());
    }
  }

  async function removeReviewer(userId: bigint) {
    try {
      reviewers = await globalListOwnerApi.removeReviewer(userId);
    } catch (err) {
      notify(err instanceof Error && err.message ? err.message : m.globallist.errorSave());
    }
  }

  async function resetStanding(guildId: bigint) {
    try {
      standing = await globalListOwnerApi.resetStanding(guildId);
    } catch (err) {
      notify(err instanceof Error && err.message ? err.message : m.globallist.errorSave());
    }
  }

  onMount(async () => {
    const allowed = await loadingStore.wrap(
      "owner-check",
      async () => {
        try {
          return await ownershipApi.isOwner(BigInt(data.user.id));
        } catch (err) {
          logger.error("Owner check failed:", err);
          return false;
        }
      },
      "critical",
      m.common.checkingPermissions()
    );

    if (!allowed) {
      goto("/dashboard");
      return;
    }

    await loadAll();
  });
</script>

{#if message}
  <div class="fixed top-4 right-4 z-[10001]" transition:fade>
    <Notification message={message.text} type={message.type} />
  </div>
{/if}

<DashboardPageLayout
  category="Analytics"
  guildName={m.common.botOwnerTools()}
  icon="fa-clipboard"
  subtitle={m.features.globallistReviewDescription()}
  title={m.features.globallistReviewName()}
  basePath="/owner/global-list"
  {tabs}
  bind:activeTab
>
  <AsyncState {loading} {error} empty={false}>
    {#if activeTab === "queue"}
      <ReviewQueue entries={pending} {appeals} onopen={(id) => (openEntry = id)} />
    {:else if activeTab === "live"}
      <LiveList entries={live} onopen={(id) => (openEntry = id)} />
    {:else if activeTab === "reviewers"}
      <Card title={m.globallist.ownerTabReviewers()} note={m.globallist.ownerReviewersNote()}>
        <div class="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            inputmode="numeric"
            autocomplete="off"
            bind:value={reviewerInput}
            aria-label={m.globallist.ownerAddReviewerLabel()}
            placeholder={m.globallist.ownerAddReviewerLabel()}
            class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px] font-mono"
            style={inputStyle}
          >
          <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={addReviewer}>
            {m.common.add()}
          </button>
        </div>
        {#if reviewers.length === 0}
          <p class="py-4 text-center" style="color: {$colorStore.muted}">{m.globallist.ownerReviewersEmpty()}</p>
        {:else}
          <ul class="divide-y" style="border-color: {$colorStore.primary}20;">
            {#each reviewers as reviewer (reviewer.userId)}
              <li class="flex items-center gap-3 py-1" style="border-color: {$colorStore.primary}20;">
                <span class="grow min-w-0 font-mono text-sm truncate" style="color: {$colorStore.text}">{reviewer.userId}</span>
                <button
                  type="button"
                  class="min-h-[44px] min-w-[44px] rounded-lg"
                  style={buttonStyle}
                  aria-label={m.globallist.ownerReviewerRemoveAria({ user: reviewer.userId.toString() })}
                  onclick={() => removeReviewer(reviewer.userId)}
                >
                  <i class="fa-solid fa-trash" aria-hidden="true"></i>
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      </Card>
    {:else}
      <Card title={m.globallist.ownerTabStanding()}>
        {#if standing.length === 0}
          <p class="py-4 text-center" style="color: {$colorStore.muted}">{m.globallist.ownerStandingEmpty()}</p>
        {:else}
          <ul class="divide-y" style="border-color: {$colorStore.primary}20;">
            {#each standing as community (community.guildId)}
              <li class="flex items-center gap-3 py-2" style="border-color: {$colorStore.primary}20;">
                <div class="grow min-w-0">
                  <p class="text-sm font-medium truncate" style="color: {$colorStore.text}">{community.guildName ?? community.guildId}</p>
                  <p class="text-xs" style="color: {$colorStore.muted}">
                    {m.globallist.ownerStandingRecord({ approved: community.approved, rejected: community.rejected })}
                  </p>
                  <p class="text-xs font-medium" style="color: {community.blocked ? $colorStore.accent : $colorStore.muted}">
                    {community.blocked ? m.globallist.ownerStandingBlocked() : m.globallist.ownerStandingOk()}
                  </p>
                </div>
                <button type="button" class="px-4 rounded-lg min-h-[44px] shrink-0" style={buttonStyle} onclick={() => resetStanding(community.guildId)}>
                  {m.common.reset()}
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      </Card>
    {/if}
  </AsyncState>
</DashboardPageLayout>

{#if openEntry !== null}
  <EntryReviewSheet
    entryId={openEntry}
    api={globalListOwnerApi}
    isOwner={true}
    onclose={() => (openEntry = null)}
    onchanged={loadAll}
    onerror={(text) => notify(text)}
  />
{/if}
