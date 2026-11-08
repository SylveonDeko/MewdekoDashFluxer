<script lang="ts">
  import { m } from "$lib/i18n";
  import {
    GLOBAL_LIST_CATEGORIES,
    type GlobalListCategory,
    type GlobalListEntryDetail,
    type GlobalListReviewApi
  } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { categoryLabel, formatDate } from "$lib/utils/globalList";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";

  interface Props {
    entryId: number;
    /** The review API to use; owners pass one with remove, which unlocks removing and overturning */
    api: GlobalListReviewApi;
    isOwner: boolean;
    onclose: () => void;
    onchanged: () => void | Promise<void>;
    onerror: (message: string) => void;
  }

  let { entryId, api, isOwner, onclose, onchanged, onerror }: Props = $props();

  let detail = $state<GlobalListEntryDetail | null>(null);
  let images = $state<Record<number, string>>({});
  let note = $state("");
  let category = $state<GlobalListCategory | null>(null);
  let sending = $state(false);
  let confirmRemove = $state(false);

  const status = $derived(detail?.entry.status);
  const canDecide = $derived(status === "Pending" || (isOwner && status === "Rejected"));
  const canRemove = $derived(isOwner && status === "Live" && !!api.remove);
  const openAppeals =$derived((detail?.appeals ?? []).filter((a) => a.status === "Open"));
  const categoryOptions = $derived(GLOBAL_LIST_CATEGORIES.map((c) => ({ id: c, name: categoryLabel(c) })));
  const buttonStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );
  const solidStyle = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);

  async function load() {
    try {
      detail = await api.getEntry(entryId);
      category = detail.entry.category;
      for (const id of detail.reports.flatMap((r) => r.imageIds)) {
        api.getImage(entryId, id).then(
          (result) => (images = { ...images, [id]: result.image }),
          (err) => logger.error("Failed to load a screenshot", err)
        );
      }
    } catch (err) {
      logger.error("Failed to load the entry", err);
      onerror(err instanceof Error ? err.message : m.globallist.errorLoad());
      onclose();
    }
  }

  async function run(action: () => Promise<unknown>) {
    sending = true;
    try {
      await action();
      await onchanged();
      onclose();
    } catch (err) {
      logger.error("Global list review failed", err);
      onerror(err instanceof Error && err.message ? err.message : m.globallist.errorSave());
    } finally {
      sending = false;
    }
  }

  const review = (approve: boolean) =>
    run(() => api.review(entryId, { approve, note: note.trim() || undefined, category: approve && category ? category : undefined }));

  const reviewAppeal = (appealId: number, approve: boolean) =>
    run(() => api.reviewAppeal(appealId, { approve, note: note.trim() || undefined }));

  $effect(() => {
    void load();
  });
</script>

<Sheet title={m.globallist.entryTitle({ id: entryId })} {onclose}>
  {#if detail}
    <div>
      <p class="font-mono font-semibold" style="color: {$colorStore.text}">{detail.entry.userId}</p>
      <p class="text-sm" style="color: {$colorStore.muted}">
        {categoryLabel(detail.entry.category)} / {m.globallist.voteConfirmCount({ count: detail.entry.confirmVotes })} / {m.globallist.voteDisputeCount({ count: detail.entry.disputeVotes })}
      </p>
      {#if detail.entry.decidedAt}
        <p class="text-sm" style="color: {$colorStore.muted}">
          {m.globallist.ownerDecided({ date: formatDate(detail.entry.decidedAt) })}{detail.entry.decisionNote ? `: ${detail.entry.decisionNote}` : ""}
        </p>
      {/if}
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

    {#if openAppeals.length > 0}
      <h4 class="text-sm font-semibold pt-4 border-t" style="color: {$colorStore.text}; border-color: {$colorStore.primary}20;">
        {m.globallist.ownerAppealsTitle()}
      </h4>
      {#each openAppeals as appeal (appeal.id)}
        <div class="space-y-2">
          <p class="text-xs" style="color: {$colorStore.muted}">{m.globallist.ownerAppealTitle({ id: appeal.id })} / {formatDate(appeal.dateAdded)}</p>
          <p class="whitespace-pre-wrap break-words" style="color: {$colorStore.text}">{appeal.text}</p>
          <div class="flex flex-col sm:flex-row gap-2">
            <button type="button" class="grow px-5 rounded-xl min-h-[50px] font-medium" style={solidStyle} disabled={sending} onclick={() => reviewAppeal(appeal.id, true)}>
              {m.globallist.ownerAppealApprove()}
            </button>
            <button type="button" class="grow px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} disabled={sending} onclick={() => reviewAppeal(appeal.id, false)}>
              {m.globallist.ownerAppealReject()}
            </button>
          </div>
        </div>
      {/each}
    {/if}

    {#if canDecide || canRemove || openAppeals.length > 0}
      <div class="space-y-3 pt-4 border-t" style="border-color: {$colorStore.primary}20;">
        <input
          type="text"
          maxlength="1000"
          bind:value={note}
          aria-label={m.globallist.reviewNoteLabel()}
          placeholder={m.globallist.voteNotePlaceholder()}
          class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
        >
        {#if canDecide}
          <SettingField label={m.globallist.ownerListAsLabel()} id="gl-list-as">
            <DiscordSelector
              id="gl-list-as"
              type="custom"
              options={categoryOptions}
              selected={category}
              searchable={false}
              clearable={false}
              customIcon="fa-flag"
              onchange={(d) => typeof d.selected === "string" && (category = d.selected as GlobalListCategory)}
            />
          </SettingField>
          <div class="flex flex-col sm:flex-row gap-2">
            <button type="button" class="grow px-5 rounded-xl min-h-[50px] font-medium" style={solidStyle} disabled={sending} onclick={() => review(true)}>
              {m.common.approve()}
            </button>
            {#if status === "Pending"}
              <button type="button" class="grow px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} disabled={sending} onclick={() => review(false)}>
                {m.globallist.reject()}
              </button>
            {/if}
          </div>
        {:else if canRemove}
          <button type="button" class="w-full px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} disabled={sending} onclick={() => (confirmRemove = true)}>
            {m.common.remove()}
          </button>
        {/if}
      </div>
    {/if}
  {/if}
</Sheet>

<ConfirmationModal
  bind:isOpen={confirmRemove}
  title={m.globallist.ownerRemoveTitle()}
  message={m.globallist.ownerRemoveMessage({ user: detail?.entry.userId.toString() ?? "" })}
  confirmText={m.common.remove()}
  variant="danger"
  onconfirm={() => run(() => api.remove!(entryId, note.trim() || undefined))}
  oncancel={() => (confirmRemove = false)}
/>
