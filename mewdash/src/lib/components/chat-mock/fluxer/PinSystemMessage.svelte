<!-- SPDX-License-Identifier: AGPL-3.0-or-later. Portions adapted from Fluxer (https://github.com/fluxerapp/fluxer). -->
<script lang="ts">
  import Icon from "./Icon.svelte";

  let { name, time, mobile = false }: { name: string; time: string; mobile?: boolean } = $props();
</script>

<div class="message" class:mobileLayout={mobile}>
  <div class="messageGutterLeft"></div>
  <div class="systemMessageIconWrapper">
    <Icon name="pushPinFill" size={18} class="systemMessageIconSvg" />
  </div>
  <div class="messageGutterRight"></div>
  <div class="systemMessageContent">
    <span><span class="systemMessageLink" role="button">{name}</span> pinned <span class="systemMessageLink" role="button"
        >a message</span
      > to this channel. See <span class="systemMessageLink" role="button">all pinned messages</span>.</span
    > <span class="systemMessageTimestamp">{time}</span>
  </div>
</div>

<style>
  .message {
    text-align: start;
    position: relative;
    word-break: break-word;
    display: grid;
    grid-template-columns: 16px 40px 12px minmax(0, 1fr);
    grid-template-rows: auto auto auto;
    grid-template-areas: ". . . reply" "gutter-left avatar gutter-right content" ". . . container";
    padding-block: 2px;
    padding-inline-start: 0;
    margin-inline: -16px;
    padding-inline-end: 64px;
  }

  .message.mobileLayout {
    margin-inline: -12px;
    padding-inline-end: 16px;
  }

  .messageGutterLeft {
    grid-area: gutter-left;
  }

  .messageGutterRight {
    grid-area: gutter-right;
  }

  .systemMessageIconWrapper {
    grid-area: avatar;
    display: flex;
    align-self: flex-start;
    align-items: flex-start;
    justify-content: center;
    padding-block-start: 0.15em;
    color: var(--text-tertiary);
  }

  .systemMessageIconWrapper :global(.systemMessageIconSvg) {
    height: 18px;
    width: 18px;
    opacity: 0.6;
  }

  .systemMessageContent {
    grid-area: content;
    min-width: 0;
    overflow-wrap: break-word;
    position: relative;
    overflow: hidden;
    white-space: normal;
    word-break: break-word;
    color: var(--text-tertiary);
    line-height: 22px;
  }

  .systemMessageLink {
    position: relative;
    display: inline;
    overflow: hidden;
    vertical-align: baseline;
    font-weight: 500;
    color: var(--text-primary);
    line-height: 22px;
  }

  .systemMessageTimestamp {
    font-size: 12px;
    margin-inline-start: 4px;
    position: relative;
    top: -2px;
    color: color-mix(in srgb, var(--message-timestamp-color) 60%, transparent);
  }
</style>
