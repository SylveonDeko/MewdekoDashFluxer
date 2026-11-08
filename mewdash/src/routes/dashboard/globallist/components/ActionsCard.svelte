<script lang="ts">
  import { m } from "$lib/i18n";
  import {
    GLOBAL_LIST_ACTIONS,
    GLOBAL_LIST_CATEGORIES,
    type GlobalListAction,
    type GlobalListCategory,
    type GlobalListSettings,
    type GlobalListSettingsPatch,
    type GlobalListStanding
  } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { actionLabel, categoryLabel } from "$lib/utils/globalList";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";

  interface Props {
    settings: GlobalListSettings;
    standing: GlobalListStanding;
    channels: Array<{ id: string; name: string }>;
    roles: Array<{ id: string; name: string; color?: number }>;
    autoSave: AutoSave;
    onupdate: (patch: GlobalListSettingsPatch) => Promise<void>;
  }

  let { settings, standing, channels, roles, autoSave, onupdate }: Props = $props();

  const actionOptions = $derived(GLOBAL_LIST_ACTIONS.map((action) => ({ id: action, name: actionLabel(action) })));

  function pick(detail: { selected: string | string[] | null }): string {
    return typeof detail.selected === "string" ? detail.selected : "";
  }

  function setAction(category: GlobalListCategory, action: GlobalListAction) {
    void autoSave.now(`action:${category}`, () => onupdate({ actions: { [category]: action } }));
  }
</script>

<PluginCard title={m.globallist.actionsTitle()} alwaysOpen>
  {#if standing.blocked}
    <p class="text-sm font-medium" style="color: {$colorStore.accent}">{m.globallist.standingBlocked()}</p>
  {/if}
  <p class="text-sm" style="color: {$colorStore.muted}">
    {m.globallist.standingSummary({ approved: standing.approved, rejected: standing.rejected, used: standing.reportsToday, cap: standing.dailyCap })}
  </p>

  <ul class="divide-y" style="--tw-divide-opacity: 1; border-color: {$colorStore.primary}20;">
    {#each GLOBAL_LIST_CATEGORIES as category (category)}
      <li class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 first:pt-0" style="border-color: {$colorStore.primary}20;">
        <span id="gl-cat-{category}" class="grow min-w-0 text-sm font-medium" style="color: {$colorStore.text}">{categoryLabel(category)}</span>
        <div class="w-full sm:w-64 shrink-0">
          <DiscordSelector
            type="custom"
            options={actionOptions}
            selected={settings.actions[category]}
            searchable={false}
            clearable={false}
            customIcon="fa-bolt"
            ariaLabelledby="gl-cat-{category}"
            onchange={(detail) => setAction(category, pick(detail) as GlobalListAction)}
          />
        </div>
      </li>
    {/each}
  </ul>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <SettingField label={m.common.logChannel()} id="gl-log-channel">
      <DiscordSelector
        id="gl-log-channel"
        type="channel"
        options={channels}
        selected={settings.logChannelId ? settings.logChannelId.toString() : null}
        placeholder={m.common.noLogChannel()}
        onchange={(detail) => {
          const id = pick(detail);
          void autoSave.now("logChannel", () => onupdate({ logChannelId: id ? BigInt(id) : 0n }));
        }}
      />
    </SettingField>
    <SettingField label={m.globallist.actionQuarantineRole()} id="gl-quarantine-role">
      <DiscordSelector
        id="gl-quarantine-role"
        type="role"
        options={roles}
        selected={settings.quarantineRoleId ? settings.quarantineRoleId.toString() : null}
        placeholder={m.common.noRole()}
        onchange={(detail) => {
          const id = pick(detail);
          void autoSave.now("quarantineRole", () => onupdate({ quarantineRoleId: id ? BigInt(id) : 0n }));
        }}
      />
    </SettingField>
  </div>

  <ToggleRow
    id="gl-apply-existing"
    title={m.globallist.applyExistingLabel()}
    checked={settings.applyToExisting}
    colors={$colorStore}
    onchange={(value) => autoSave.now("applyToExisting", () => onupdate({ applyToExisting: value }))}
  />
</PluginCard>
