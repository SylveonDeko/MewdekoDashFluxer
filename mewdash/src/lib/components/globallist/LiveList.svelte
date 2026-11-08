<script lang="ts">
  import { m } from "$lib/i18n";
  import type { GlobalListEntryItem } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { categoryLabel, formatDate } from "$lib/utils/globalList";
  import Card from "$lib/components/analytics/Card.svelte";

  interface Props {
    entries: GlobalListEntryItem[];
    onopen: (entryId: number) => void;
  }

  let { entries, onopen }: Props = $props();

  let search = $state("");

  const shown = $derived(
    entries.filter((entry) => !search.trim() || entry.userId.toString().includes(search.trim()))
  );
</script>

<Card title={m.globallist.ownerTabLive()}>
  <input
    type="search"
    inputmode="numeric"
    bind:value={search}
    aria-label={m.globallist.ownerLiveSearch()}
    placeholder={m.globallist.ownerLiveSearch()}
    class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
    style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
  >
  {#if shown.length === 0}
    <p class="py-4 text-center" style="color: {$colorStore.muted}">{m.globallist.ownerLiveEmpty()}</p>
  {:else}
    <ul class="divide-y" style="border-color: {$colorStore.primary}20;">
      {#each shown as entry (entry.id)}
        <li style="border-color: {$colorStore.primary}20;">
          <button type="button" class="w-full text-left min-h-[44px] py-3 flex flex-col gap-1" onclick={() => onopen(entry.id)}>
            <span class="font-mono text-sm font-semibold truncate" style="color: {$colorStore.text}">{entry.userId}</span>
            <span class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style="color: {$colorStore.muted}">
              <span>{categoryLabel(entry.category)}</span>
              <span>{m.globallist.voteConfirmCount({ count: entry.confirmVotes })}</span>
              <span>{m.globallist.voteDisputeCount({ count: entry.disputeVotes })}</span>
              <span>{formatDate(entry.decidedAt ?? entry.dateAdded)}</span>
            </span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</Card>
