<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import PreviewCard from "$lib/components/specialized/PreviewCard.svelte";
  import type { FluxerUser } from "$lib/types/fluxer";
  import {
    buildDefaultEmbed,
    buildOptionsEmbed,
    DEFAULT_NAME,
    hasMessageContent,
    messageParts,
    type PreviewOption
  } from "../roleMenuDefaults";

  /** Inputs for the live preview of a role menu's message. */
  interface Props {
    /** The embed builder value, empty for the default message */
    message: unknown;
    /** The menu name */
    name: string;
    /** Options in display order */
    options: PreviewOption[];
    /** Whether the menu is paused */
    paused?: boolean;
    /** The signed in user, for placeholder previews */
    user?: FluxerUser | null;
    /** The guild ID, for placeholder previews */
    guildId?: bigint | string | null;
  }

  let { message, name, options, paused = false, user = null, guildId = null }: Props = $props();

  /** The text and embeds the bot posts: the custom message followed by the option list, or the default message. */
  let parts = $derived.by(() => {
    if (hasMessageContent(message)) {
      const custom = messageParts(message);
      const embeds = custom.embeds.length < 10 ? [...custom.embeds, buildOptionsEmbed(options)] : custom.embeds;
      return { content: custom.content, embeds };
    }
    return { content: "", embeds: [buildDefaultEmbed(name || DEFAULT_NAME, options)] };
  });
</script>

<div class:opacity-60={paused}>
  <PreviewCard
    content={parts.content}
    embeds={parts.embeds}
    {user}
    {guildId}
    emptyMessage={m.roleMenus.previewEmpty()}
  />
</div>

{#if paused}
  <p class="text-xs mt-3" style="color: {$colorStore.muted}">
    {m.roleMenus.previewPaused()}
  </p>
{/if}
