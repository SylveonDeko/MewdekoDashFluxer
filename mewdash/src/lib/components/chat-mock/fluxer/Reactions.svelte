<!-- SPDX-License-Identifier: AGPL-3.0-or-later. Portions adapted from Fluxer (https://github.com/fluxerapp/fluxer). -->
<script lang="ts">
  import { emojiUrl } from "./markup";
  import type { ChatReaction } from "./types";

  let { reactions }: { reactions: ChatReaction[] } = $props();
</script>

<div class="reactionsGrid">
  {#each reactions as reaction (reaction.emoji)}
    <div class="reactionContainer" class:reactionMe={reaction.me}>
      <button type="button" class="reactionButton" tabindex="-1">
        <div class="reactionInner">
          <img class="emoji" src={emojiUrl(reaction.emoji)} alt={reaction.emoji} draggable="false" />
          <div class="countWrapper"><div>{reaction.count}</div></div>
        </div>
      </button>
    </div>
  {/each}
</div>

<style>
  .reactionsGrid {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    padding-top: 4px;
    user-select: none;
  }

  .reactionContainer {
    position: relative;
    border-radius: 8px;
    margin-bottom: 0;
    margin-inline-end: 4px;
  }

  .reactionButton {
    appearance: none;
    background: var(--background-secondary);
    border: 1px solid transparent;
    border-radius: 8px;
    padding: 0;
    color: var(--text-tertiary);
  }

  .reactionMe .reactionButton {
    background-color: var(--brand-tint);
    border-color: var(--brand-tint-border);
    color: var(--text-on-brand-tint);
  }

  .reactionInner {
    display: flex;
    align-items: center;
    padding: 2px 6px;
  }

  .emoji {
    height: 20px;
    width: 20px;
    margin: 2px 0;
    object-fit: contain;
    display: block;
    flex-shrink: 0;
  }

  .countWrapper {
    color: var(--text-tertiary);
    font-weight: 600;
    font-size: 16px;
    min-width: 12px;
    line-height: 1;
    position: relative;
    overflow: hidden;
    height: 16px;
    margin-inline-start: 6px;
    text-align: center;
  }

  .reactionMe .countWrapper {
    color: var(--text-on-brand-tint);
  }
</style>
