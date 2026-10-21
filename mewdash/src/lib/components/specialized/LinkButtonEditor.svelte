<!-- LinkButtonEditor.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import { clientApi } from "$lib/api/client/client";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import type { DiscordUser } from "$lib/types/discord";
  import { isValidLinkUrl, MAX_LINK_LABEL_LENGTH, type LinkButton } from "$lib/utils/linkButtons";

  interface Props {
    button: LinkButton;
    user?: DiscordUser | null;
    onupdate?: (detail: { button: LinkButton }) => void;
    onremove?: (detail: { key: string }) => void;
    onduplicate?: (detail: { key: string }) => void;
  }

  let { button = $bindable(), user, onupdate, onremove, onduplicate }: Props = $props();

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

  function updateButton(field: keyof LinkButton, value: string) {
    button = { ...button, [field]: value };
    onupdate?.({ button });
  }

  function handleInput(event: Event, field: keyof LinkButton) {
    const target = event.target;
    if (target && "value" in target) {
      updateButton(field, target.value as string);
    }
  }

  let urlValid = $derived(isValidLinkUrl(button.url));
  let isValid = $derived(!!button.displayName.trim() && !!button.url.trim() && urlValid);
</script>

<div class="space-y-3 sm:space-y-4" style="color: {$colorStore.text};">
  <div class="flex justify-between items-center">
    <h3 class="text-base sm:text-lg font-semibold" style="color: {$colorStore.text};">
      {m.embedbuilder.linksEditTitle()}
    </h3>

    <div class="flex items-center gap-1 sm:gap-2">
      <div class="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full"
           style="background: {isValid ? '#57F287' : '#ED4245'};"
           title={isValid ? m.embedbuilder.componentsStatusValid() : m.embedbuilder.componentsStatusInvalid()}>
      </div>

      <button
        aria-label={m.embedbuilder.componentsDuplicateComponent()}
        class="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs rounded-md sm:rounded-lg transition-all hover:scale-[1.02] font-medium"
        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
        onclick={() => onduplicate?.({ key: button.key })}
      >
        <i class="fa-solid fa-copy" style="font-size: 10px;"></i>
        <span class="hidden sm:inline">{m.common.duplicate()}</span>
      </button>

      <button
        aria-label={m.embedbuilder.componentsDeleteComponent()}
        class="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs rounded-md sm:rounded-lg transition-all hover:scale-[1.02] font-medium"
        style="background: #ED424520; color: #ED4245; border: 1px solid #ED424530;"
        onclick={() => onremove?.({ key: button.key })}
      >
        <i class="fa-solid fa-trash" style="font-size: 10px;"></i>
        <span class="hidden sm:inline">{m.common.delete()}</span>
      </button>
    </div>
  </div>

  <div>
    <label for="link-label-{button.key}" class="block text-xs sm:text-sm font-medium mb-1 sm:mb-2"
           style="color: {$colorStore.text};">
      {m.common.displayName()}
      <span class="text-[10px] sm:text-xs ml-1 sm:ml-2" style="color: {$colorStore.muted};">
        {button.displayName?.length || 0}/{MAX_LINK_LABEL_LENGTH}
      </span>
    </label>
    <input id="link-label-{button.key}"
           type="text"
           class="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg border text-sm"
           style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
           placeholder={m.embedbuilder.linksLabelPlaceholder()}
           value={button.displayName || ''}
           maxlength={MAX_LINK_LABEL_LENGTH}
           oninput={(e) => handleInput(e, 'displayName')}
    >
  </div>

  <div>
    <label for="link-emoji-{button.key}" class="block text-xs sm:text-sm font-medium mb-1 sm:mb-2"
           style="color: {$colorStore.text};">
      {m.common.emoji()} <span class="text-[10px] sm:text-xs">{m.common.optionalSuffix()}</span>
    </label>
    <div id="link-emoji-{button.key}">
      <EmojiPicker
        {guildEmojis}
        selected={button.emoji || null}
        multiple={false}
        placeholder={m.common.selectEmojiPlaceholder()}
        searchable={true}
        groupByGuild={true}
        onchange={(detail) => {
          updateButton('emoji', typeof detail.selected === 'string' ? detail.selected : '');
        }}
      />
    </div>
  </div>

  <div>
    <label for="link-url-{button.key}" class="block text-xs sm:text-sm font-medium mb-1 sm:mb-2"
           style="color: {$colorStore.text};">
      {m.common.url()}
    </label>
    <input id="link-url-{button.key}"
           type="url"
           class="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg border text-sm"
           style="background: {$colorStore.primary}10; border-color: {urlValid ? $colorStore.primary + '30' : '#ED4245'}; color: {$colorStore.text};"
           placeholder={m.embedbuilder.editorUrlPlaceholder()}
           value={button.url || ''}
           oninput={(e) => handleInput(e, 'url')}
    >
    {#if button.url && !urlValid}
      <p class="text-[10px] sm:text-xs mt-0.5 sm:mt-1 text-red-400">{m.embedbuilder.editorUrlInvalid()}</p>
    {/if}
  </div>
</div>
