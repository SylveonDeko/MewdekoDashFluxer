<!-- ComponentEditor.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import * as cdn from "$lib/utils/cdn";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import { clientApi } from "$lib/api/client/client";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import type { FluxerUser } from "$lib/types/fluxer";


  interface Props {
    component: any;
    isEditing?: boolean;
      user?: FluxerUser | null;
      onupdate?: (detail: { component: any }) => void;
      onremove?: (detail: { componentKey: string }) => void;
      onedit?: (detail: { component: any }) => void;
      onduplicate?: (detail: { componentKey: string }) => void;
  }

    let {
      component = $bindable(),
      isEditing = false,
      user,
      onupdate,
      onremove,
      onedit,
      onduplicate
    }: Props = $props();

    let guildEmojis = $state<GuildEmojiInfo[]>([]);
    let emojisLoading = $state(false);

    $effect(() => {
      if (user?.id && !emojisLoading && guildEmojis.length === 0) {
        emojisLoading = true;
        clientApi.getEmojis(BigInt(user.id), false)
          .then(data => {
            guildEmojis = data;
          })
          .catch(err => {
            logger.error("Failed to load guild emojis:", err);
          })
          .finally(() => {
            emojisLoading = false;
          });
      }
    });

  function updateComponent(field: string, value: any) {
    const updatedComponent = { ...component, [field]: value };

    component = updatedComponent;
    onupdate?.({ component: updatedComponent });
  }

    function handleInput(event: Event, field: string) {
      const target = event.target;
      if (target && ("value" in target)) {
        updateComponent(field, target.value);
      }
    }

  function isValidUrl(url: string): boolean {
    if (!url) return true;

    if (url.includes("%")) return true;

    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

    function parseEmojiForDisplay(emojiString: string): { url: string; name: string } | null {
      if (!emojiString) return null;
      const match = emojiString.match(/<(a?):([^:]+):(\d+)>/);
      if (!match) return null;

      const [, , name, id] = match;
      const url = cdn.emojiUrl(id, 32);

      return { url, name };
    }

  let isValid = $derived(isValidUrl(component.url));
</script>

{#if isEditing}
  <div class="space-y-4 sm:space-y-6"
       style="color: {$colorStore.text};">

    <div class="flex justify-between items-center">
      <h3 class="text-base sm:text-lg font-semibold" style="color: {$colorStore.text};">
        {m.embedbuilder.componentsEditButton()}
      </h3>

      <div class="flex items-center gap-1 sm:gap-2">
        <div class="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full"
             style="background: {isValid ? '#57F287' : '#ED4245'};"
             title={isValid ? m.embedbuilder.componentsStatusValid() : m.embedbuilder.componentsStatusInvalid()}>
        </div>

        <button
          aria-label={m.common.doneEditing()}
          class="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs rounded-md sm:rounded-lg transition-all font-medium"
          style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
          onclick={() => onedit?.({ component })}
        >
          <i class="fa-solid fa-check" style="font-size: 10px;"></i>
          <span class="hidden sm:inline">{m.common.done()}</span>
        </button>

        <button
          aria-label={m.embedbuilder.componentsDuplicateComponent()}
          class="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs rounded-md sm:rounded-lg transition-all font-medium"
          style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
          onclick={() => onduplicate?.({ componentKey: component.componentKey })}
        >
          <i class="fa-solid fa-copy" style="font-size: 10px;"></i>
          <span class="hidden sm:inline">{m.common.duplicate()}</span>
        </button>

        <button
          aria-label={m.embedbuilder.componentsDeleteComponent()}
          class="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs rounded-md sm:rounded-lg transition-all font-medium"
          style="background: #ED424520; color: #ED4245; border: 1px solid #ED424530;"
          onclick={() => onremove?.({ componentKey: component.componentKey })}
        >
          <i class="fa-solid fa-trash" style="font-size: 10px;"></i>
          <span class="hidden sm:inline">{m.common.delete()}</span>
        </button>
      </div>
    </div>

    <div class="space-y-3 sm:space-y-4">
      <div>
        <label for="input-6378" class="block text-xs sm:text-sm font-medium mb-1 sm:mb-2"
               style="color: {$colorStore.text};">
          {m.common.displayName()}
          <span class="text-[10px] sm:text-xs ml-1 sm:ml-2" style="color: {$colorStore.muted};">
            {component.displayName?.length || 0}/80
          </span>
        </label>
        <input id="input-6378"
          type="text"
               class="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg border text-sm"
          style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
          placeholder={m.embedbuilder.componentsButtonTextPlaceholder()}
          value={component.displayName || ''}
          maxlength="80"
               oninput={(e) => handleInput(e, 'displayName')}
        >
      </div>

      <div>
        <label for="button-emoji-picker" class="block text-xs sm:text-sm font-medium mb-1 sm:mb-2"
               style="color: {$colorStore.text};">
          {m.common.emoji()} <span class="text-[10px] sm:text-xs">{m.common.optionalSuffix()}</span>
        </label>
        <EmojiPicker
          {guildEmojis}
          selected={component.emoji || null}
          multiple={false}
          placeholder={m.common.selectEmojiPlaceholder()}
          searchable={true}
          groupByGuild={true}
          onchange={(detail) => {
            updateComponent('emoji', detail.selected || '');
          }}
        />
      </div>

      <div>
        <label for="input-4138" class="block text-xs sm:text-sm font-medium mb-1 sm:mb-2"
               style="color: {$colorStore.text};">
          {m.common.url()}
        </label>
        <input id="input-4138"
          type="url"
               class="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg border text-sm"
               style="background: {$colorStore.primary}10;
                 border-color: {isValidUrl(component.url) ? $colorStore.primary + '30' : '#ED4245'};
                 color: {$colorStore.text};"
          placeholder={m.embedbuilder.editorUrlPlaceholder()}
          value={component.url || ''}
               oninput={(e) => handleInput(e, 'url')}
        >
        {#if component.url && !isValidUrl(component.url)}
          <p class="text-[10px] sm:text-xs mt-0.5 sm:mt-1 text-red-400">{m.embedbuilder.editorUrlInvalid()}</p>
        {/if}
      </div>
    </div>

    {#if !isValid}
      <div class="p-2 sm:p-3 rounded-md sm:rounded-lg border-l-4 border-red-400 bg-red-50 dark:bg-red-900/20">
        <div class="text-xs sm:text-sm text-red-700 dark:text-red-300">
          <p class="font-medium mb-0.5 sm:mb-1">{m.embedbuilder.componentsValidationErrors()}</p>
          <ul class="list-disc list-inside space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs">
            <li>{m.embedbuilder.componentsErrorLinkUrl()}</li>
          </ul>
        </div>
      </div>
    {/if}
  </div>

{:else}
  <div class="group relative cursor-pointer transition-all"
       onclick={() => onedit?.({ component })}
       role="button"
       tabindex="0"
       onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onedit?.({ component }); } }}>

    <button
      class="bg-transparent hover:bg-[#5865F2]/10 text-[#00AFF4] relative discord-button button-content pointer-events-none flex justify-center grow-0 items-center box-border border-0 rounded-sm px-2 sm:px-4 py-[1px] sm:py-[2px] min-h-[24px] sm:min-h-[32px] text-[11px] sm:text-sm font-medium leading-[14px] sm:leading-[16px] transition-colors duration-200 select-none gap-1 sm:gap-2"
      disabled
      aria-label={m.embedbuilder.componentsButtonPreviewAria()}
    >
      {#if component.emoji}
        {@const parsedEmoji = parseEmojiForDisplay(component.emoji)}
        {#if parsedEmoji}
          <img src={parsedEmoji.url} alt={parsedEmoji.name}
               class="w-[1em] sm:w-[1.2em] h-[1em] sm:h-[1.2em] inline-flex items-center justify-center align-[-0.1em]" />
        {:else}
          <span
            class="emoji w-[1em] sm:w-[1.2em] h-[1em] sm:h-[1.2em] inline-flex items-center justify-center align-[-0.1em] text-[10px] sm:text-xs">
            {component.emoji}
          </span>
        {/if}
      {/if}
      <span class="truncate">{component.displayName}</span>
      <i class="fa-solid fa-arrow-up-right-from-square text-[9px] sm:text-xs"></i>
    </button>

    <div
      class="absolute inset-0 rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
      style="background: {$colorStore.primary}20;">
      <span class="text-xs font-medium px-2 py-1 rounded-sm"
            style="background: {$colorStore.primary}40; color: {$colorStore.text};">
        <i class="fa-solid fa-pen-to-square mr-1"></i>
        {m.embedbuilder.componentsClickToEdit()}
      </span>
    </div>
  </div>
{/if}

<style>
  .discord-button {
    transition: transform 0.1s ease;
  }

  .discord-button:hover:not(:disabled) {
    transform: translateY(-1px);
  }
</style>
