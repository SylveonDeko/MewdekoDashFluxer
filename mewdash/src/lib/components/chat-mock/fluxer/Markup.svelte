<!-- SPDX-License-Identifier: AGPL-3.0-or-later. Portions adapted from Fluxer (https://github.com/fluxerapp/fluxer). -->
<script lang="ts">
  import { getContext } from "svelte";
  import Code from "./Code.svelte";
  import Icon from "./Icon.svelte";
  import { parseInline, parseMarkup, type Inline } from "./markup";
  import { chatUsersKey, type ChatUser } from "./types";

  let { text, inline = false }: { text: string; inline?: boolean } = $props();

  const users = getContext<(() => Record<string, ChatUser>) | undefined>(chatUsersKey);
  const blocks = $derived(inline ? [{ t: "text" as const, c: parseInline(text) }] : parseMarkup(text));
  const mentionName = (key: string) => users?.()[key]?.name ?? key;
</script>

{#snippet inlines(items: Inline[])}{#each items as item, i (i)}{#if item.t === "text"}<span>{item.v}</span
    >{:else if item.t === "strong"}<strong>{@render inlines(item.c)}</strong
    >{:else if item.t === "em"}<em>{@render inlines(item.c)}</em
    >{:else if item.t === "del"}<del>{@render inlines(item.c)}</del
    >{:else if item.t === "u"}<u>{@render inlines(item.c)}</u
    >{:else if item.t === "code"}<Code text={item.v}
    />{:else if item.t === "time"}<span class="timestamp">{item.v}</span
    >{:else if item.t === "mention"}<span class="mention">@{mentionName(item.v)}</span
    >{:else if item.t === "channel"}<span class="mention"><Icon name="textChannel" size={16} class="channelIcon" />&#8288;<span
          class="label">{item.v}</span></span
    >{:else if item.t === "emoji"}<img class="emoji" src={item.src} alt={item.v} draggable="false"
    />{:else if item.t === "link"}<span class="link">{@render inlines(item.c)}</span
    >{/if}{/each}{/snippet}

<span class="markupRoot" class:inlineFormat={inline}
  >{#each blocks as block, i (i)}{#if block.t === "text"}{@render inlines(block.c)}{:else if block.t === "heading"}<svelte:element
        this={`h${block.level}`}>{@render inlines(block.c)}</svelte:element
      >{:else if block.t === "subtext"}<small>{@render inlines(block.c)}</small
      >{:else if block.t === "quote"}<div class="blockquoteContainer"><div class="blockquoteDivider"></div><blockquote
          class="blockquoteContent">{@render inlines(block.c)}</blockquote></div
      >{:else if block.ordered}<ol start={block.start} style="--totalCharacters: {String(block.start + block.items.length - 1).length};"
          >{#each block.items as item, j (j)}<li>{@render inlines(item)}</li>{/each}</ol
        >{:else}<ul>{#each block.items as item, j (j)}<li>{@render inlines(item)}</li>{/each}</ul>{/if}{/each}</span
>

<style>
  .markupRoot {
    display: contents;
    --markup-inline-emoji-size: 1.5em;
    --markup-inline-emoji-baseline-shift: -0.4em;
  }

  .inlineFormat {
    --markup-inline-emoji-size: 1.25em;
    --markup-inline-emoji-baseline-shift: -0.18em;
  }

  strong {
    font-weight: 600;
  }

  em {
    font-style: italic;
  }

  del {
    text-decoration: line-through;
  }

  .link {
    color: var(--text-link);
  }

  small {
    display: block;
    color: var(--text-chat-muted);
    font-size: 0.8125em;
    line-height: 1.375;
  }

  u {
    text-decoration: underline;
  }

  .blockquoteContainer {
    display: flex;
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
    width: 100%;
  }

  .blockquoteDivider {
    width: 0.25rem;
    border-radius: 0.25rem;
    background-color: var(--interactive-muted);
    flex-shrink: 0;
    margin-inline-end: 0.75rem;
  }

  .blockquoteContent {
    margin: 0;
    padding: 0.25rem 0;
    width: 100%;
    color: var(--text-chat-muted);
  }

  h1,
  h2,
  h3 {
    display: block;
    margin: 1.25rem 0 0.75rem;
    line-height: 1.2;
    font-weight: 600;
    color: var(--text-primary);
    white-space: break-spaces;
  }

  h1:first-child,
  h2:first-child,
  h3:first-child {
    margin-top: 0.25rem;
  }

  h1 {
    font-size: 1.375em;
  }

  h2 {
    font-size: 1.25em;
  }

  h3 {
    font-size: 1.125em;
  }

  ul,
  ol {
    display: block;
    margin-block: 0.25rem 0;
    margin-inline: 1.25rem 0;
    padding: 0;
    list-style-position: outside;
    list-style-type: disc;
    white-space: normal;
  }

  ol {
    list-style-type: decimal;
    margin-inline-start: calc(0.65em + var(--totalCharacters, 1) * 0.6em);
  }

  li {
    display: list-item;
    margin-bottom: 0.25rem;
  }

  li:last-child {
    margin-bottom: 0;
  }

  .emoji {
    display: inline;
    width: var(--markup-inline-emoji-size);
    height: var(--markup-inline-emoji-size);
    min-height: 0;
    margin-block: 0;
    vertical-align: var(--markup-inline-emoji-baseline-shift);
    object-fit: contain;
  }

  .timestamp {
    background-color: var(--background-modifier-hover);
    border-radius: 3px;
    padding: 0 2px;
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    color: inherit;
    overflow-wrap: anywhere;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }

  .mention {
    display: inline;
    border-radius: 3px;
    padding-inline: 2px;
    font-weight: 500;
    unicode-bidi: plaintext;
    color: var(--text-link);
    background-color: var(--markup-mention-fill);
    font-size: inherit;
    line-height: inherit;
    vertical-align: baseline;
    white-space: nowrap;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }

  .mention :global(.channelIcon) {
    display: inline-block;
    width: 1em;
    height: 1em;
    vertical-align: -0.125em;
    margin-inline-end: 0.125em;
    color: currentColor;
  }

  .label {
    line-height: inherit;
    vertical-align: baseline;
    white-space: normal;
  }
</style>
