<!-- SPDX-License-Identifier: AGPL-3.0-or-later. Portions adapted from Fluxer (https://github.com/fluxerapp/fluxer). -->
<script lang="ts">
  import Markup from "./Markup.svelte";
  import type { ChatEmbed, ChatEmbedField } from "./types";

  let { embed }: { embed: ChatEmbed } = $props();

  const THUMBNAIL_SIZE = 80;
  const MAX_INLINE_PER_ROW = 3;

  function groupFields(fields: ChatEmbedField[] = []): ChatEmbedField[][] {
    const groups: ChatEmbedField[][] = [];
    let current: ChatEmbedField[] = [];
    for (const field of fields) {
      if (field.inline) {
        current.push(field);
        if (current.length === MAX_INLINE_PER_ROW) {
          groups.push(current);
          current = [];
        }
      } else {
        if (current.length) groups.push(current);
        current = [];
        groups.push([field]);
      }
    }
    if (current.length) groups.push(current);
    return groups;
  }

  const groups = $derived(groupFields(embed.fields));
  const inlineThumbnail = $derived(!!embed.thumbnail && !embed.image);
  const thumbWidth = $derived(
    embed.thumbnail ? Math.min(THUMBNAIL_SIZE, Math.round((THUMBNAIL_SIZE * embed.thumbnail.width) / embed.thumbnail.height)) : 0,
  );
</script>

<article
  class="embed embedFull markup"
  style="border-left: 4px solid {embed.color}; max-width: min(100%, {embed.image ? 432 : 516}px);"
>
  <div class="gridContainer">
    <div class="grid" class:hasThumbnail={inlineThumbnail}>
      <div class="embedContent">
        {#if embed.author}
          <div class="embedAuthor"><span class="embedAuthorName">{embed.author}</span></div>
        {/if}
        {#if embed.title}
          <div class="embedTitle"><Markup text={embed.title} inline /></div>
        {/if}
        {#if embed.description}
          <div class="embedDescription"><Markup text={embed.description} /></div>
        {/if}
        {#if groups.length}
          <div class="embedFields">
            {#each groups as group, g (g)}
              {#each group as field, index (index)}
                {@const span = 12 / group.length}
                <div class="embedField" style="grid-column: {index * span + 1} / {index * span + 1 + span};">
                  <div class="embedFieldName"><Markup text={field.name} inline /></div><div class="embedFieldValue"
                    ><Markup text={field.value} /></div>
                </div>
              {/each}
            {/each}
          </div>
        {/if}
        {#if embed.image && "component" in embed.image}
          {@const Drawn = embed.image.component}
          <div
            class="embedMedia"
            style="width: {embed.image.width}px; max-width: 100%; aspect-ratio: {embed.image.width} / {embed.image.height};"
          >
            <Drawn {...embed.image.props} />
          </div>
        {:else if embed.image}
          <div class="embedMedia">
            <img
              class="imageElement"
              src={embed.image.src}
              alt=""
              width={embed.image.width}
              height={embed.image.height}
              style="width: {embed.image.width}px; aspect-ratio: {embed.image.width} / {embed.image.height};"
              loading="lazy"
              decoding="async"
            />
          </div>
        {/if}
        {#if embed.footer || embed.timestamp}
          <div class="embedFooter">
            <div class="embedFooterText"
              >{embed.footer ?? ""}{#if embed.footer && embed.timestamp}{"​"}<div class="embedFooterSeparator"></div>{"​"}{/if}{embed.timestamp ?? ""}</div
            >
          </div>
        {/if}
      </div>
      {#if inlineThumbnail && embed.thumbnail}
        <div class="embedThumbnail">
          <img
            class="thumbnailElement"
            src={embed.thumbnail.src}
            alt=""
            width={thumbWidth}
            height={THUMBNAIL_SIZE}
            style="width: {thumbWidth}px; height: {THUMBNAIL_SIZE}px;"
            loading="lazy"
            decoding="async"
          />
        </div>
      {/if}
    </div>
  </div>
</article>

<style>
  .markup {
    font-size: inherit;
    line-height: 1.5;
    color: inherit;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: none;
    white-space: break-spaces;
    text-align: start;
  }

  .embed {
    position: relative;
    display: inline-grid;
    inline-size: fit-content;
    max-inline-size: 100%;
    box-sizing: border-box;
    border-radius: 8px;
  }

  .embedFull {
    background: var(--background-primary);
    border: 1px solid var(--background-modifier-accent);
  }

  .gridContainer {
    width: 100%;
  }

  .grid {
    overflow: hidden;
    padding: 12px 12px 14px 12px;
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
  }

  .grid.hasThumbnail {
    grid-template-columns: auto min-content;
  }

  .embedContent {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .embedContent > :first-child {
    margin-top: 4px;
  }

  .embedAuthor {
    display: flex;
    align-items: center;
    grid-column: 1 / 1;
    min-width: 0;
    overflow: hidden;
  }

  .embedAuthorName {
    font-size: 0.875em;
    font-weight: 600;
    color: var(--text-primary);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .embedTitle {
    font-size: 1em;
    font-weight: 600;
    display: inline-block;
    grid-column: 1 / 1;
    color: var(--text-primary);
  }

  .embedDescription {
    font-size: 0.875em;
    line-height: 1.285714;
    white-space: pre-line;
    grid-column: 1 / 1;
    color: var(--text-primary);
  }

  .embedFields {
    display: grid;
    grid-column: 1 / 1;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 8px;
    min-width: 0;
    margin-top: 8px;
  }

  .embedField {
    min-width: 0;
  }

  .embedFieldName {
    font-size: 0.875em;
    line-height: 1.285714;
    font-weight: 600;
    margin-bottom: 2px;
    min-width: 0;
    overflow-wrap: anywhere;
    color: var(--text-primary);
  }

  .embedFieldValue {
    font-size: 0.875em;
    line-height: 1.285714;
    white-space: pre-line;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .embedAuthorName,
  .embedDescription,
  .embedFieldName,
  .embedFieldValue,
  .embedFooterText,
  .embedTitle {
    text-align: start;
    unicode-bidi: plaintext;
  }

  .embedMedia {
    grid-column: 1 / 1;
    border-radius: 4px;
    contain: paint;
    margin-top: 4px;
    overflow: hidden;
  }

  .imageElement {
    display: block;
    max-width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: 4px;
  }

  .embedThumbnail {
    grid-row: 1 / 8;
    grid-column: 2 / 2;
    margin-inline-start: 16px;
    margin-top: 8px;
    flex-shrink: 0;
    justify-self: end;
    max-width: 80px;
    height: 80px;
    border-radius: 4px;
    overflow: hidden;
  }

  .thumbnailElement {
    display: block;
    max-width: none;
    object-fit: contain;
    border-radius: 4px;
  }

  .embedFooter {
    display: flex;
    align-items: center;
    grid-column: 1 / 1;
  }

  .hasThumbnail .embedFooter {
    grid-column: 1 / 3;
  }

  .embedFooterText {
    font-size: 0.75em;
    line-height: 1.333333;
    font-weight: 600;
    color: var(--text-chat);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .embedFooterSeparator {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: var(--text-chat);
    margin: 0 4px;
    display: inline-block;
    vertical-align: middle;
  }
</style>
