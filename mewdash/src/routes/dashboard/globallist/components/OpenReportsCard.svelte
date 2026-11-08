<script lang="ts">
  import { m } from "$lib/i18n";
  import type { GlobalListEntryItem } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { categoryLabel } from "$lib/utils/globalList";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import EntrySheet from "./EntrySheet.svelte";

  interface Props {
    guildId: bigint;
    entries: GlobalListEntryItem[];
    canReport: boolean;
    onreport: () => void;
    onreload: () => Promise<void>;
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let { guildId, entries, canReport, onreport, onreload, onerror, onsuccess }: Props = $props();

  let openId = $state<number | null>(null);

  const buttonStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );

  function reportsText(count: number): string {
    return count === 1 ? m.globallist.reportsCountOne() : m.globallist.reportsCount({ count });
  }

  function badge(entry: GlobalListEntryItem): string | null {
    if (entry.reportedByMe) return m.globallist.badgeReportedByYou();
    if (entry.myVote === true) return m.globallist.badgeVotedConfirm();
    if (entry.myVote === false) return m.globallist.badgeVotedDispute();
    return null;
  }
</script>

{#snippet reportButton()}
  {#if canReport}
    <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={onreport}>
      <i class="fa-solid fa-flag" aria-hidden="true"></i>
      {m.globallist.reportButton()}
    </button>
  {/if}
{/snippet}

<PluginCard title={m.globallist.openTitle()} actions={reportButton} alwaysOpen>
  {#if entries.length === 0}
    <p class="py-4 text-center" style="color: {$colorStore.muted}">{m.globallist.openEmpty()}</p>
  {:else}
    <ul class="divide-y" style="border-color: {$colorStore.primary}20;">
      {#each entries as entry (entry.id)}
        <li style="border-color: {$colorStore.primary}20;">
          <button type="button" class="w-full text-left min-h-[44px] py-3 flex flex-col gap-1" onclick={() => (openId = entry.id)}>
            <span class="font-mono text-sm font-semibold truncate" style="color: {$colorStore.text}">{entry.userId}</span>
            <span class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style="color: {$colorStore.muted}">
              <span>{categoryLabel(entry.category)}</span>
              <span>{reportsText(entry.reportCount)}</span>
              <span>{m.globallist.voteConfirmCount({ count: entry.confirmVotes })}</span>
              <span>{m.globallist.voteDisputeCount({ count: entry.disputeVotes })}</span>
              {#if badge(entry)}
                <span class="px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{badge(entry)}</span>
              {/if}
            </span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</PluginCard>

{#if openId !== null}
  <EntrySheet
    {guildId}
    entryId={openId}
    onclose={() => (openId = null)}
    onvoted={async () => {
      onsuccess(m.globallist.voteSaved());
      await onreload();
    }}
    {onerror}
  />
{/if}
