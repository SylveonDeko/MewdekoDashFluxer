<script lang="ts">
  import { m } from "$lib/i18n";
  import {
    GLOBAL_LIST_CATEGORIES,
    GLOBAL_LIST_MAX_SCREENSHOTS,
    globalListApi,
    type GlobalListCategory
  } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { categoryLabel, errorText, readAsDataUrl } from "$lib/utils/globalList";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";

  interface Props {
    guildId: bigint;
    onclose: () => void;
    ondone: () => void | Promise<void>;
  }

  let { guildId, onclose, ondone }: Props = $props();

  let userId = $state("");
  let category = $state<GlobalListCategory>("Scamming");
  let reason = $state("");
  let links = $state("");
  let screenshots = $state<string[]>([]);
  let sending = $state(false);
  let error = $state<string | null>(null);

  const categoryOptions = $derived(GLOBAL_LIST_CATEGORIES.map((c) => ({ id: c, name: categoryLabel(c) })));
  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
  const buttonStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );

  function parseLinks(): string[] {
    return links.split(/\s+/).map((x) => x.trim()).filter(Boolean);
  }

  async function addScreenshots(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const files = [...(input.files ?? [])].slice(0, GLOBAL_LIST_MAX_SCREENSHOTS - screenshots.length);
    input.value = "";
    try {
      const added = await Promise.all(files.map(readAsDataUrl));
      screenshots = [...screenshots, ...added];
    } catch (err) {
      logger.error("Failed to read a screenshot", err);
      error = m.globallist.errorInvalidImage();
    }
  }

  async function send() {
    error = null;
    if (!/^\d{17,20}$/.test(userId.trim())) {
      error = m.globallist.errorInvalidTarget();
      return;
    }
    if (!reason.trim()) {
      error = m.globallist.errorNoReason();
      return;
    }
    if (parseLinks().length === 0 && screenshots.length === 0) {
      error = m.globallist.errorNoEvidence();
      return;
    }

    sending = true;
    try {
      await globalListApi.report(guildId, {
        targetUserId: BigInt(userId.trim()),
        category,
        reason: reason.trim(),
        links: parseLinks(),
        screenshots
      });
      await ondone();
    } catch (err) {
      logger.error("Failed to send the report", err);
      error = errorText(err, err instanceof Error && err.message ? err.message : m.common.somethingWentWrong());
    } finally {
      sending = false;
    }
  }
</script>

<Sheet title={m.globallist.reportButton()} {onclose}>
  <SettingField label={m.common.userId()} id="gl-report-user">
    <input
      id="gl-report-user"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      bind:value={userId}
      class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px] font-mono"
      style={inputStyle}
    >
  </SettingField>

  <SettingField label={m.common.category()} id="gl-report-category">
    <DiscordSelector
      id="gl-report-category"
      type="custom"
      options={categoryOptions}
      selected={category}
      searchable={false}
      clearable={false}
      customIcon="fa-flag"
      onchange={(detail) => typeof detail.selected === "string" && (category = detail.selected as GlobalListCategory)}
    />
  </SettingField>

  <SettingField label={m.common.reason()} id="gl-report-reason">
    <textarea
      id="gl-report-reason"
      bind:value={reason}
      rows="3"
      maxlength="1000"
      placeholder={m.globallist.reportReasonPlaceholder()}
      class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
      style={inputStyle}
    ></textarea>
  </SettingField>

  <SettingField label={m.globallist.evidenceLinksLabel()} id="gl-report-links">
    <textarea
      id="gl-report-links"
      bind:value={links}
      rows="3"
      autocapitalize="none"
      placeholder={m.globallist.evidenceLinksPlaceholder()}
      class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px] font-mono text-sm"
      style={inputStyle}
    ></textarea>
  </SettingField>

  <div>
    <span class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.globallist.evidenceScreenshotsLabel()}</span>
    <div class="flex flex-wrap gap-3 items-center">
      {#each screenshots as shot, index (index)}
        <div class="relative">
          <img src={shot} alt={m.globallist.entryScreenshotAlt({ number: index + 1 })} class="h-20 w-20 object-cover rounded-lg">
          <button
            type="button"
            class="absolute -top-2 -right-2 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center"
            style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
            aria-label={m.globallist.screenshotRemoveAria({ number: index + 1 })}
            onclick={() => (screenshots = screenshots.filter((_, i) => i !== index))}
          >
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>
      {/each}
      {#if screenshots.length < GLOBAL_LIST_MAX_SCREENSHOTS}
        <label class="inline-flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium cursor-pointer" style={buttonStyle}>
          <i class="fa-solid fa-image" aria-hidden="true"></i>
          {m.globallist.addScreenshot()}
          <input type="file" accept="image/*" multiple class="sr-only" onchange={addScreenshots}>
        </label>
      {/if}
    </div>
  </div>

  {#if error}
    <p class="text-sm" role="alert" style="color: {$colorStore.accent}">{error}</p>
  {/if}

  {#snippet footer()}
    <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={onclose}>
      {m.common.cancel()}
    </button>
    <button
      type="button"
      class="px-5 rounded-xl min-h-[50px] font-medium"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={sending}
      onclick={send}
    >
      {m.globallist.reportSubmit()}
    </button>
  {/snippet}
</Sheet>
