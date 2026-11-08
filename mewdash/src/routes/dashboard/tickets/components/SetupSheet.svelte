<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { ticketApi } from "$lib/api/index.ts";
  import type { AddButtonRequest, TicketPanel } from "$lib/api/ticket/models";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { errorText, idBigints, idOrNull, type Named } from "../ticketModel";

  interface Props {
    guildId: bigint;
    panels: TicketPanel[];
    channels: Named[];
    categories: Named[];
    threadChannels: Named[];
    roles: Named[];
    emojis: GuildEmojiInfo[];
    onclose: () => void;
    onreload: () => Promise<void>;
    oncreated: (panelId: string) => void;
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let { guildId, panels, channels, categories, threadChannels, roles, emojis, onclose, onreload, oncreated, onerror, onsuccess }: Props = $props();

  interface TypeRow {
    key: number;
    label: string;
    emoji: string | null;
  }

  let nextKey = 1;
  let channel = $state<string | null>(null);
  let categoryId = $state<string | null>(null);
  let threadId = $state<string | null>(null);
  let staffRoles = $state<string[]>([]);
  let types = $state<TypeRow[]>([{ key: 0, label: m.tickets.setupDefaultType(), emoji: "🎫" }]);
  let busy = $state(false);

  const ready = $derived(Boolean(channel) && types.length > 0 && types.every(t => t.label.trim()));

  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);
  const quietStyle = $derived(`background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`);

  function addType() {
    types = [...types, { key: nextKey++, label: "", emoji: null }];
  }

  function removeType(key: number) {
    if (types.length > 1) types = types.filter(t => t.key !== key);
  }

  function patchType(key: number, patch: Partial<TypeRow>) {
    types = types.map(t => (t.key === key ? { ...t, ...patch } : t));
  }

  async function create() {
    if (!ready || busy || !channel) return;
    busy = true;
    try {
      const before = new Set(panels.map(p => String(p.messageId)));
      await ticketApi.createTicketPanel(guildId, { channelId: BigInt(channel) });
      await onreload();
      const created = panels.find(p => !before.has(String(p.messageId))) ?? panels[panels.length - 1];
      if (!created) throw new Error(m.tickets.createPanelFailed());

      const shared: Partial<AddButtonRequest> = {};
      if (categoryId) shared.categoryId = BigInt(categoryId);
      if (threadId) shared.threadChannelId = BigInt(threadId);
      if (staffRoles.length > 0) shared.supportRoles = idBigints(staffRoles);

      for (const type of types)
        await ticketApi.addPanelButton(guildId, created.messageId, { ...shared, label: type.label.trim(), emoji: type.emoji, maxActiveTickets: 1 });

      await ticketApi.recreateTicketPanel(guildId, created.messageId);
      await onreload();
      oncreated(String(created.messageId));
      onsuccess(m.tickets.setupDone());
      onclose();
    } catch (err) {
      logger.error("Failed to set up tickets:", err);
      onerror(errorText(err, m.tickets.createPanelFailed()));
    } finally {
      busy = false;
    }
  }
</script>

<Sheet title={m.tickets.setUpTickets()} size="md" {onclose}>
  <div class="space-y-5">
    <SettingField label={m.common.channel()} id="setup-channel">
      <DiscordSelector id="setup-channel" type="channel" options={channels} selected={channel} placeholder={m.common.selectChannelPlaceholder()} onchange={(d) => (channel = idOrNull(d.selected))} />
    </SettingField>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <SettingField label={m.common.ticketCategory()} id="setup-category">
        <DiscordSelector id="setup-category" type="channel" options={categories} selected={categoryId} placeholder={m.common.selectCategoryPlaceholder()} onchange={(d) => (categoryId = idOrNull(d.selected))} />
      </SettingField>
      <SettingField label={m.tickets.threadChannel()} id="setup-thread">
        <DiscordSelector id="setup-thread" type="channel" options={threadChannels} selected={threadId} placeholder={m.common.pickChannelPlaceholder()} onchange={(d) => (threadId = idOrNull(d.selected))} />
      </SettingField>
    </div>

    <SettingField label={m.common.supportRoles()} id="setup-roles">
      <DiscordSelector
        id="setup-roles"
        type="role"
        multiple={true}
        options={roles}
        selected={staffRoles}
        placeholder={m.common.selectRolesPlaceholder()}
        onchange={(d) => (staffRoles = Array.isArray(d.selected) ? d.selected : [])}
      />
    </SettingField>

    <div class="space-y-2">
      <p class="text-sm font-medium" style="color: {$colorStore.text}">{m.tickets.ticketTypes()}</p>
      {#each types as type, i (type.key)}
        <div class="grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_14rem_auto] gap-2 items-start">
          <input
            type="text"
            maxlength="80"
            value={type.label}
            oninput={(e) => patchType(type.key, { label: e.currentTarget.value })}
            placeholder={m.tickets.setupTypeNamePlaceholder()}
            aria-label={m.tickets.ticketType()}
            class="col-span-2 sm:col-span-1 w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
            style={inputStyle}
          >
          <div class="min-w-0">
            <EmojiPicker
              id="setup-emoji-{type.key}"
              guildEmojis={emojis}
              selected={type.emoji}
              multiple={false}
              placeholder={m.common.selectEmojiPlaceholder()}
              onchange={(d) => patchType(type.key, { emoji: typeof d.selected === "string" ? d.selected : null })}
            />
          </div>
          <button
            type="button"
            class="flex items-center justify-center rounded-xl min-h-[50px] min-w-[50px] disabled:opacity-40"
            style={quietStyle}
            disabled={types.length === 1}
            aria-label={m.tickets.removeTypeAria({ name: type.label || String(i + 1) })}
            onclick={() => removeType(type.key)}
          >
            <i class="fa-solid fa-trash" aria-hidden="true"></i>
          </button>
        </div>
      {/each}
      <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={quietStyle} onclick={addType}>
        <i class="fa-solid fa-plus" aria-hidden="true"></i>
        {m.tickets.addButton()}
      </button>
    </div>
  </div>

  {#snippet footer()}
    <button type="button" class="px-5 rounded-xl min-h-[44px] font-medium" style={quietStyle} disabled={busy} onclick={onclose}>{m.common.cancel()}</button>
    <button
      type="button"
      class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[44px] font-medium disabled:opacity-60"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={busy || !ready}
      onclick={create}
    >
      <i class="fa-solid {busy ? 'fa-spinner fa-spin' : 'fa-ticket'}" aria-hidden="true"></i>
      {busy ? m.tickets.setupCreating() : m.common.create()}
    </button>
  {/snippet}
</Sheet>
