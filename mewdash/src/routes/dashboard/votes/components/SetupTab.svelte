<script lang="ts">
  import { m } from "$lib/i18n";
  import { votesApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import type { FluxerListStatus } from "$lib/api/votes/models";
  import { errorText, formatDate, type Named, type Notify } from "./votesModel";

  interface Props {
    guildId: bigint;
    channels: Named[];
    autoSave: AutoSave;
    user?: DiscordUser | null;
    notify: Notify;
  }

  let { guildId, channels, autoSave, user = null, notify }: Props = $props();

  let loading = $state(true);
  let channelId: string | null = $state(null);
  let apiKey = $state("");
  let keyStatus: FluxerListStatus = $state({ hasKey: false, lastSyncAt: null, lastError: null });
  let replacing = $state(false);
  let keyBusy = $state(false);
  let message = $state("");
  let savedMessage = "";
  let messageVersion = $state(0);

  const placeholders = $derived([
    { category: m.votes.phCategory(), name: "%votestotalcount%", description: m.votes.phTotal() },
    { category: m.votes.phCategory(), name: "%votesmonthcount%", description: m.votes.phMonth() },
    { category: m.multigreets.placeholderCategoryJoin(), name: "%user%", description: m.placeholders.user() },
    { category: m.multigreets.placeholderCategoryJoin(), name: "%user.mention%", description: m.placeholders.userMention() },
    { category: m.multigreets.placeholderCategoryJoin(), name: "%user.id%", description: m.placeholders.userId() },
    { category: m.multigreets.placeholderCategoryJoin(), name: "%user.avatar%", description: m.placeholders.userAvatar() },
    { category: m.features.categoryServer(), name: "%server%", description: m.placeholders.server() },
    { category: m.features.categoryServer(), name: "%server.members%", description: m.placeholders.serverMembers() }
  ]);

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
  const buttonStyle = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  function unwrap(value: unknown): string {
    if (typeof value === "object" && value !== null && "data" in value) return String((value as { data: unknown }).data ?? "");
    return typeof value === "string" ? value : "";
  }

  async function load() {
    const results = await Promise.allSettled([
      votesApi.getVoteChannel(guildId),
      votesApi.getFluxerListStatus(guildId),
      votesApi.getVoteMessage(guildId)
    ]);
    if (results[0].status === "fulfilled") {
      const value = results[0].value;
      channelId = value && String(value) !== "0" ? String(value) : null;
    }
    if (results[1].status === "fulfilled") keyStatus = results[1].value;
    if (results[2].status === "fulfilled") message = savedMessage = unwrap(results[2].value);
    for (const result of results) {
      if (result.status === "rejected") {
        logger.error("Failed to load vote settings:", result.reason);
        notify(m.votes.pageErrorLoad(), "error");
        break;
      }
    }
    loading = false;
  }

  function saveChannel(selected: string | string[] | null) {
    const next = typeof selected === "string" ? selected : null;
    const previous = channelId;
    channelId = next;
    autoSave.now("votes:channel", async () => {
      try {
        await votesApi.setVoteChannel(guildId, next ? BigInt(next) : BigInt(0));
      } catch (err) {
        channelId = previous;
        throw err;
      }
    });
  }

  async function saveKey() {
    const value = apiKey.trim();
    if (!value || keyBusy) return;
    keyBusy = true;
    try {
      await votesApi.setFluxerListKey(guildId, value);
      apiKey = "";
      replacing = false;
      keyStatus = await votesApi.getFluxerListStatus(guildId);
      notify(m.votes.keySavedNotify(), "success");
    } catch (err) {
      notify(errorText(err, m.votes.errorKeySave()), "error");
    } finally {
      keyBusy = false;
    }
  }

  async function removeKey() {
    if (keyBusy) return;
    keyBusy = true;
    try {
      await votesApi.removeFluxerListKey(guildId);
      keyStatus = { hasKey: false, lastSyncAt: null, lastError: null };
      apiKey = "";
      replacing = false;
      notify(m.votes.keyRemovedNotify(), "success");
    } catch (err) {
      notify(errorText(err, m.votes.errorKeyRemove()), "error");
    } finally {
      keyBusy = false;
    }
  }

  function cancelReplace() {
    apiKey = "";
    replacing = false;
  }

  function saveMessage(next: string) {
    message = next;
    autoSave.schedule("votes:message", async () => {
      try {
        await votesApi.setVoteMessage(guildId, next);
        savedMessage = next;
      } catch (err) {
        message = savedMessage;
        messageVersion++;
        throw err;
      }
    });
  }

  function resetMessage() {
    const previous = savedMessage;
    message = "";
    messageVersion++;
    autoSave.now("votes:message", async () => {
      try {
        await votesApi.setVoteMessage(guildId, "");
        savedMessage = "";
      } catch (err) {
        message = previous;
        messageVersion++;
        throw err;
      }
    });
  }

  void load();
</script>

{#if loading}
  <div class="flex justify-center py-6">
    <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
  </div>
{:else}
  <PluginCard title={m.votes.deliveryTitle()} alwaysOpen>
    <SettingField label={m.common.voteAnnouncementChannel()} id="vote-channel">
      <DiscordSelector
        id="vote-channel"
        type="channel"
        options={channels}
        selected={channelId}
        placeholder={m.common.noChannelSelected()}
        onchange={({ selected }) => saveChannel(selected)}
      />
    </SettingField>

    <SettingField label={m.votes.keyLabel()} id="vote-key">
      {#if keyStatus.hasKey && !replacing}
        <div class="flex flex-col sm:flex-row gap-2">
          <input
            id="vote-key"
            type="text"
            readonly
            value={m.votes.keySaved()}
            class="grow min-w-0 p-3 rounded-lg border min-h-[50px]"
            style={inputStyle}
          >
          <div class="flex gap-2">
            <button
              type="button"
              class="grow sm:grow-0 px-4 rounded-lg min-h-[50px] text-sm font-medium"
              style={buttonStyle}
              onclick={() => (replacing = true)}
            >
              {m.votes.keyReplace()}
            </button>
            <button
              type="button"
              class="grow sm:grow-0 px-4 rounded-lg min-h-[50px] text-sm font-medium"
              style={buttonStyle}
              disabled={keyBusy}
              onclick={removeKey}
            >
              {m.common.remove()}
            </button>
          </div>
        </div>
      {:else}
        <form
          class="flex flex-col sm:flex-row gap-2"
          onsubmit={(event) => {
            event.preventDefault();
            void saveKey();
          }}
        >
          <input
            id="vote-key"
            type="password"
            autocomplete="off"
            bind:value={apiKey}
            placeholder={m.votes.keyPlaceholder()}
            class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
            style={inputStyle}
          >
          <div class="flex gap-2">
            <button
              type="submit"
              class="grow sm:grow-0 px-4 rounded-lg min-h-[50px] text-sm font-medium"
              style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
              disabled={keyBusy || !apiKey.trim()}
            >
              {m.votes.keySave()}
            </button>
            {#if replacing}
              <button
                type="button"
                class="grow sm:grow-0 px-4 rounded-lg min-h-[50px] text-sm font-medium"
                style={buttonStyle}
                onclick={cancelReplace}
              >
                {m.common.cancel()}
              </button>
            {/if}
          </div>
        </form>
      {/if}
    </SettingField>

    <p class="text-xs" style="color: {$colorStore.muted};">
      <a
        href="https://fluxerlist.com/dashboard"
        target="_blank"
        rel="noopener noreferrer"
        class="underline"
        style="color: {$colorStore.text};"
      >
        {m.votes.keyHint()}
      </a>
    </p>

    {#if keyStatus.hasKey}
      <p class="text-xs" style="color: {$colorStore.muted};">
        {keyStatus.lastSyncAt
          ? m.votes.syncLast({ time: formatDate(keyStatus.lastSyncAt) })
          : m.votes.syncNever()}
      </p>
      {#if keyStatus.lastError}
        <p class="text-xs" style="color: #ef4444;" role="status">
          {m.votes.syncError({ error: keyStatus.lastError })}
        </p>
      {/if}
    {/if}
  </PluginCard>

  <PluginCard title={m.votes.pageMessageTitle()} alwaysOpen>
    {#key messageVersion}
      <MessageField
        value={message}
        previewTitle={m.votes.pageMessageTitle()}
        icon="fa-circle-check"
        {user}
        {placeholders}
        placeholder={m.votes.pageMessagePlaceholder()}
        onchange={saveMessage}
      />
    {/key}
    {#if message}
      <button
        type="button"
        class="px-4 rounded-lg min-h-[44px] text-sm font-medium"
        style={buttonStyle}
        onclick={resetMessage}
      >
        {m.common.resetToDefault()}
      </button>
    {/if}
  </PluginCard>
{/if}
