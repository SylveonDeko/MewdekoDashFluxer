<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { ticketApi } from "$lib/api/index.ts";
  import { ApiError } from "$lib/api/core";
  import type { PanelButton, TicketPanel, TicketPriority } from "$lib/api/ticket/models";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import SaveStatus from "$lib/components/ui/SaveStatus.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import ListRow from "./ListRow.svelte";
  import ComponentEditor from "./ComponentEditor.svelte";
  import EditorGroup from "./editor/EditorGroup.svelte";
  import { emojiUrl, errorText, idOrNull, panelTitle, type Named } from "../ticketModel";

  interface Props {
    guildId: bigint;
    panel: TicketPanel;
    channels: Named[];
    categories: Named[];
    threadChannels: Named[];
    roles: Named[];
    emojis: GuildEmojiInfo[];
    priorities: TicketPriority[];
    user?: DiscordUser | null;
    autoSave: AutoSave;
    onpanelchange: (patch: Partial<TicketPanel>) => void;
    onreload: () => Promise<void>;
    onclose: () => void;
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let { guildId, panel, channels, categories, threadChannels, roles, emojis, priorities, user = null, autoSave, onpanelchange, onreload, onclose, onerror, onsuccess }: Props = $props();

  let buttons = $state<PanelButton[]>([]);
  let loading = $state(true);
  let panelState = $state<number | null>(null);
  let view = $state<number | null>(null);
  let newButtonLabel = $state("");
  let busy = $state(false);
  let moveTarget = $state<string | null>(null);
  let copyTarget = $state<string | null>(null);
  let locationOpen = $state(false);

  const embedKey = $derived(`panel-embed:${panel.messageId}`);

  async function load() {
    loading = true;
    const [b, st] = await Promise.allSettled([
      ticketApi.getPanelButtons(guildId, panel.messageId),
      ticketApi.getSinglePanelStatus(guildId, panel.messageId)
    ]);
    if (b.status === "fulfilled") buttons = b.value;
    else onerror(errorText(b.reason, m.tickets.loadPanelFailed()));
    panelState = st.status === "fulfilled" ? st.value.status : null;
    loading = false;
  }

  onMount(() => {
    void load();
    return () => {
      void autoSave.flush(embedKey);
    };
  });

  function syncCounts() {
    onpanelchange({ buttonCount: buttons.length });
  }

  function saveMessage(message: string) {
    onpanelchange({ embedJson: message });
    autoSave.schedule(embedKey, async () => {
      await ticketApi.updateTicketPanelEmbed(guildId, panel.messageId, { embedJson: message });
      panelState = 0;
    });
  }

  async function addButton() {
    const label = newButtonLabel.trim();
    if (!label || busy) return;
    busy = true;
    try {
      const created = await ticketApi.addPanelButton(guildId, panel.messageId, { label, maxActiveTickets: 1 });
      newButtonLabel = "";
      await load();
      syncCounts();
      view = created.id;
    } catch (err) {
      logger.error("Failed to add ticket button:", err);
      onerror(errorText(err, m.tickets.addButtonFailed()));
    } finally {
      busy = false;
    }
  }

  async function removeButton(button: PanelButton) {
    const ok = await requestConfirmation({ message: m.tickets.deleteComponentConfirm({ name: button.label }), confirmText: m.common.delete() });
    if (!ok) return;
    try {
      await ticketApi.deleteButton(guildId, button.id);
      buttons = buttons.filter(b => b.id !== button.id);
      syncCounts();
    } catch (err) {
      logger.error("Failed to delete ticket button:", err);
      onerror(errorText(err, m.tickets.deleteComponentFailed()));
    }
  }

  function summarise(patch: { label?: string; emoji?: string | null }) {
    const current = view;
    if (current === null) return;
    buttons = buttons.map(b =>
      b.id === current ? { ...b, ...(patch.label !== undefined ? { label: patch.label } : {}), ...(patch.emoji !== undefined ? { emoji: patch.emoji } : {}) } : b
    );
  }

  async function move() {
    if (!moveTarget || busy) return;
    busy = true;
    try {
      await ticketApi.moveTicketPanel(guildId, panel.messageId, BigInt(moveTarget));
      await onreload();
      onsuccess(m.tickets.panelMoved());
      moveTarget = null;
    } catch (err) {
      logger.error("Failed to move ticket panel:", err);
      onerror(errorText(err, m.tickets.panelMoveFailed()));
    } finally {
      busy = false;
    }
  }

  async function copy() {
    if (!copyTarget || busy) return;
    busy = true;
    try {
      await ticketApi.duplicateTicketPanel(guildId, panel.messageId, BigInt(copyTarget));
      await onreload();
      onsuccess(m.tickets.panelDuplicated());
      copyTarget = null;
    } catch (err) {
      logger.error("Failed to duplicate ticket panel:", err);
      onerror(errorText(err, m.tickets.panelDuplicateFailed()));
    } finally {
      busy = false;
    }
  }

  async function recreate() {
    if (busy) return;
    busy = true;
    try {
      await ticketApi.recreateTicketPanel(guildId, panel.messageId);
      await onreload();
      onsuccess(m.tickets.panelRecreated());
      panelState = 0;
    } catch (err) {
      logger.error("Failed to recreate ticket panel:", err);
      onerror(errorText(err, m.tickets.panelRecreateFailed()));
    } finally {
      busy = false;
    }
  }

  async function remove() {
    const ok = await requestConfirmation({ message: m.tickets.deletePanelConfirm(), confirmText: m.common.delete() });
    if (!ok) return;
    try {
      await ticketApi.deleteTicketPanel(guildId, panel.messageId, false);
    } catch (err) {
      const body = err instanceof ApiError ? (err.body as { activeTickets?: unknown[]; ActiveTickets?: unknown[] } | null) : null;
      const active = body && typeof body === "object" ? (body.activeTickets ?? body.ActiveTickets ?? []) : [];
      if (active.length === 0) {
        logger.error("Failed to delete ticket panel:", err);
        onerror(errorText(err, m.tickets.deletePanelFailed()));
        return;
      }
      const force = await requestConfirmation({ message: m.tickets.deletePanelActive({ count: active.length }), confirmText: m.tickets.deleteAnyway() });
      if (!force) return;
      try {
        await ticketApi.deleteTicketPanel(guildId, panel.messageId, true);
      } catch (inner) {
        logger.error("Failed to force delete ticket panel:", inner);
        onerror(errorText(inner, m.tickets.deletePanelFailed()));
        return;
      }
    }
    await onreload();
    onclose();
  }

  const viewTitle = $derived.by(() => {
    if (view === null) return panelTitle(panel.embedJson) || `#${panel.channelName}`;
    return buttons.find(b => b.id === view!)?.label ?? m.tickets.ticketType();
  });

  const buttonStyle = $derived(`background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`);
  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);
</script>

{#snippet glyph(emoji: string | null)}
  {#if emoji}
    {@const url = emojiUrl(emoji)}
    <span class="shrink-0 w-8 text-center text-lg" aria-hidden="true">
      {#if url}<img src={url} alt="" class="w-6 h-6 inline-block">{:else}{emoji}{/if}
    </span>
  {/if}
{/snippet}

{#snippet actions()}
  <SaveStatus {autoSave} />
{/snippet}

<Sheet title={viewTitle} size="xl" {onclose} onback={view !== null ? () => (view = null) : undefined} {actions}>
  {#if view !== null}
    {#key view}
      <ComponentEditor
        {guildId}
        id={view}
        {categories}
        {threadChannels}
        {roles}
        {emojis}
        {priorities}
        {user}
        {autoSave}
        onsummary={summarise}
        {onerror}
      />
    {/key}
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 [&>*]:min-w-0">
    {#if panelState === 1 || panelState === 2}
      <div class="lg:col-span-2 flex flex-wrap items-center gap-3 rounded-xl border p-3" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}08;" role="alert">
        <p class="grow basis-full sm:basis-0 text-sm" style="color: {$colorStore.text}">
          {panelState === 1 ? m.tickets.panelMessageMissing() : m.tickets.panelChannelMissing()}
        </p>
        {#if panelState === 1}
          <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} disabled={busy} onclick={recreate}>
            {m.tickets.recreate()}
          </button>
        {/if}
      </div>
    {/if}

    <div class="lg:col-span-2 space-y-2">
      <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.common.message()}</h4>
      <MessageField
        value={panel.embedJson}
        previewTitle={m.tickets.panelMessageTitle()}
        icon="fa-ticket"
        {user}
        placeholder={m.tickets.panelMessagePlaceholder()}
        onchange={saveMessage}
      />
    </div>

    {#if loading}
      <div class="lg:col-span-2 flex justify-center py-6">
        <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
      </div>
    {:else}
      <div class="lg:col-span-2 space-y-2">
        <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.tickets.ticketTypes()}</h4>
        {#each buttons as button (button.id)}
          <ListRow
            title={button.label}
            badges={[...(button.threadChannelId ? [m.common.threads()] : []), ...(button.hasCustomOpenMessage ? [m.tickets.badgeOpenMessage()] : [])]}
            onopen={() => (view = button.id)}
            menu={[
              { label: m.common.edit(), icon: "fa-pen", onclick: () => (view = button.id) },
              { label: m.common.delete(), icon: "fa-trash", onclick: () => removeButton(button) }
            ]}
            menuLabel={m.tickets.rowMoreAria({ name: button.label })}
          >
            {#snippet leading()}{@render glyph(button.emoji)}{/snippet}
          </ListRow>
        {/each}
        <div class="flex gap-3">
          <input
            type="text"
            maxlength="80"
            bind:value={newButtonLabel}
            onkeydown={(e) => e.key === "Enter" && addButton()}
            placeholder={m.tickets.newButtonPlaceholder()}
            aria-label={m.tickets.newButtonPlaceholder()}
            class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
            style={inputStyle}
          >
          <button type="button" class="shrink-0 flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} disabled={busy || !newButtonLabel.trim()} onclick={addButton}>
            <i class="fa-solid fa-plus" aria-hidden="true"></i>
            <span class="hidden sm:inline">{m.tickets.addButton()}</span>
          </button>
        </div>
      </div>
    {/if}

    <div class="lg:col-span-2">
    <EditorGroup title={m.tickets.sectionLocation()} bind:open={locationOpen}>
      <SettingField label={m.tickets.moveTo()} id="panel-move">
        <div class="flex gap-3">
          <div class="grow min-w-0">
            <DiscordSelector id="panel-move" type="channel" options={channels} selected={moveTarget} placeholder={m.common.selectChannelPlaceholder()} onchange={(d) => (moveTarget = idOrNull(d.selected))} />
          </div>
          <button type="button" class="shrink-0 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} disabled={busy || !moveTarget} onclick={move}>{m.tickets.move()}</button>
        </div>
      </SettingField>
      <SettingField label={m.tickets.copyTo()} id="panel-copy">
        <div class="flex gap-3">
          <div class="grow min-w-0">
            <DiscordSelector id="panel-copy" type="channel" options={channels} selected={copyTarget} placeholder={m.common.selectChannelPlaceholder()} onchange={(d) => (copyTarget = idOrNull(d.selected))} />
          </div>
          <button type="button" class="shrink-0 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} disabled={busy || !copyTarget} onclick={copy}>{m.common.duplicate()}</button>
        </div>
      </SettingField>
      <div class="flex flex-wrap gap-3">
        <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} disabled={busy} onclick={recreate}>{m.tickets.recreate()}</button>
        <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={remove}>{m.tickets.deletePanel()}</button>
      </div>
    </EditorGroup>
    </div>
    </div>
  {/if}
</Sheet>
