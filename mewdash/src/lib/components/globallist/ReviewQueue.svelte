<script lang="ts">
  import { m } from "$lib/i18n";
  import type { GlobalListAppeal, GlobalListEntryItem } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { categoryLabel, formatDate } from "$lib/utils/globalList";
  import Card from "$lib/components/analytics/Card.svelte";

  interface Props {
    entries: GlobalListEntryItem[];
    appeals: GlobalListAppeal[];
    onopen: (entryId: number) => void;
  }

  let { entries, appeals, onopen }: Props = $props();
</script>

<div class="space-y-4">
  <Card title={m.globallist.ownerEntriesTitle()}>
    {#if entries.length === 0}
      <p class="py-4 text-center" style="color: {$colorStore.muted}">{m.globallist.ownerQueueEmpty()}</p>
    {:else}
      <ul class="divide-y" style="border-color: {$colorStore.primary}20;">
        {#each entries as entry (entry.id)}
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
  <Card title={m.globallist.ownerAppealsTitle()}>
    {#if appeals.length === 0}
      <p class="py-4 text-center" style="color: {$colorStore.muted}">{m.globallist.ownerQueueEmpty()}</p>
    {:else}
      <ul class="divide-y" style="border-color: {$colorStore.primary}20;">
        {#each appeals as appeal (appeal.id)}
          <li style="border-color: {$colorStore.primary}20;">
            <button type="button" class="w-full text-left min-h-[44px] py-3 flex flex-col gap-1" onclick={() => onopen(appeal.entryId)}>
              <span class="font-mono text-sm font-semibold truncate" style="color: {$colorStore.text}">{appeal.userId}</span>
              <span class="text-sm truncate" style="color: {$colorStore.muted}">{appeal.text}</span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </Card>
</div>
