<script lang="ts">
  import { m } from "$lib/i18n";
  import { globalListApi, type GlobalListEntryDetail } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { categoryLabel, errorText, formatDate } from "$lib/utils/globalList";
  import Sheet from "$lib/components/ui/Sheet.svelte";

  interface Props {
    guildId: bigint;
    entryId: number;
    onclose: () => void;
    onvoted: () => void | Promise<void>;
    onerror: (message: string) => void;
  }

  let { guildId, entryId, onclose, onvoted, onerror }: Props = $props();

  let detail = $state<GlobalListEntryDetail | null>(null);
  let images = $state<Record<number, string>>({});
  let note = $state("");
  let sending = $state(false);

  const canVote = $derived(!!detail && !detail.entry.reportedByMe && detail.entry.myVote === null);
  const buttonStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );

  async function load() {
    try {
      detail = await globalListApi.getEntry(guildId, entryId);
      for (const id of detail.reports.flatMap((r) => r.imageIds)) {
        globalListApi.getImage(guildId, entryId, id).then(
          (result) => (images = { ...images, [id]: result.image }),
          (err) => logger.error("Failed to load a screenshot", err)
        );
      }
    } catch (err) {
      logger.error("Failed to load the entry", err);
      onerror(errorText(err, m.globallist.errorLoad()));
      onclose();
    }
  }

  async function vote(confirm: boolean) {
    sending = true;
    try {
      await globalListApi.vote(guildId, entryId, confirm, note.trim() || undefined);
      await onvoted();
      onclose();
    } catch (err) {
      logger.error("Failed to vote", err);
      onerror(errorText(err, m.globallist.errorSave()));
    } finally {
      sending = false;
    }
  }

  $effect(() => {
    void load();
  });
</script>

<Sheet title={m.globallist.entryTitle({ id: entryId })} {onclose}>
  {#if detail}
    <div>
      <p class="font-mono font-semibold" style="color: {$colorStore.text}">{detail.entry.userId}</p>
      <p class="text-sm" style="color: {$colorStore.muted}">{categoryLabel(detail.entry.category)}</p>
    </div>

    <h4 class="text-sm font-semibold pt-4 border-t" style="color: {$colorStore.text}; border-color: {$colorStore.primary}20;">
      {m.globallist.entryReportsTitle()}
    </h4>
    {#each detail.reports as report (report.id)}
      <div class="space-y-2 pb-4 border-b last:border-b-0" style="border-color: {$colorStore.primary}20;">
        <p class="text-xs" style="color: {$colorStore.muted}">
          {report.guildName ?? report.guildId} / {categoryLabel(report.category)} / {formatDate(report.dateAdded)}
        </p>
        <p class="whitespace-pre-wrap break-words" style="color: {$colorStore.text}">{report.reason}</p>
        {#each report.links as link (link)}
          <a href={link} target="_blank" rel="noopener noreferrer" class="block min-h-[44px] py-2 text-sm break-all underline" style="color: {$colorStore.primary}">{link}</a>
        {/each}
        {#each report.imageIds as imageId, index (imageId)}
          {#if images[imageId]}
            <img src={images[imageId]} alt={m.globallist.entryScreenshotAlt({ number: index + 1 })} class="max-w-full rounded-lg">
          {/if}
        {/each}
      </div>
    {/each}

    {#if detail.votes.length > 0}
      <h4 class="text-sm font-semibold pt-4 border-t" style="color: {$colorStore.text}; border-color: {$colorStore.primary}20;">
        {m.globallist.votesTitle()}
      </h4>
      {#each detail.votes as vote (vote.guildId)}
        <p class="text-sm break-words" style="color: {$colorStore.text}">
          <span class="font-medium">{vote.confirm ? m.common.confirm() : m.globallist.voteDispute()}</span>
          <span style="color: {$colorStore.muted}">{vote.guildName ?? vote.guildId}</span>
          {#if vote.note}<span>: {vote.note}</span>{/if}
        </p>
      {/each}
    {/if}

    {#if canVote}
      <div class="space-y-3 pt-4 border-t" style="border-color: {$colorStore.primary}20;">
        <input
          type="text"
          maxlength="200"
          bind:value={note}
          aria-label={m.globallist.reviewNoteLabel()}
          placeholder={m.globallist.voteNotePlaceholder()}
          class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
        >
        <div class="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            class="grow px-5 rounded-xl min-h-[50px] font-medium"
            style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
            disabled={sending}
            onclick={() => vote(true)}
          >
            {m.common.confirm()}
          </button>
          <button type="button" class="grow px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} disabled={sending} onclick={() => vote(false)}>
            {m.globallist.voteDispute()}
          </button>
        </div>
      </div>
    {/if}
  {/if}
</Sheet>
