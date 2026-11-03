<!-- SPDX-License-Identifier: AGPL-3.0-or-later. Portions adapted from Fluxer (https://github.com/fluxerapp/fluxer). -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import Avatar from "./Avatar.svelte";

  interface Props {
    name: string;
    time: string;
    avatar?: string;
    avatarColor?: string;
    bot?: boolean;
    mobile?: boolean;
    grouped?: boolean;
    text?: Snippet;
    accessories?: Snippet;
  }

  let { name, time, avatar, avatarColor, bot = false, mobile = false, grouped = false, text, accessories }: Props = $props();
  const noText = $derived(!text);
</script>

{#snippet authorHeading()}
  <h3 class="messageAuthorInfo">
    <span class="messageAuthorRow">
      <span class="messageAuthorPart">
        <span class="messageAuthorName"><span class="messageUsername" role="button">{name}</span></span>
        {#if bot}
          <span class="tag tagSm userTagOffset"><span class="text textSm">Bot</span></span>
        {/if}
      </span>
      <span class="messageTimestamp"><span class="authorDashSeparator" aria-hidden="true"> - </span>{time}</span>
    </span>
  </h3>
{/snippet}

<div class="message" class:messageNoText={noText} class:messageGrouped={grouped} class:mobileLayout={mobile}>
  {#if text}
    <div class="messageContent">
      {#if !grouped}{@render authorHeading()}{/if}
      <div class="messageText messageSent">
        <div class="markup" dir="auto">{@render text()}</div>
      </div>
    </div>
  {/if}
  <div class="messageGutterLeft"></div>
  {#if !grouped}
    <Avatar size={40} src={avatar} fill={avatar ? avatarColor : undefined} defaultColor={avatarColor} class="messageAvatar" />
  {/if}
  <div class="messageGutterRight"></div>
  <div class="container">
    {#if noText && !grouped}{@render authorHeading()}{/if}
    {@render accessories?.()}
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

  .messageNoText {
    grid-template-areas: ". . . reply" ". . . ." "gutter-left avatar gutter-right container";
  }

  .messageGrouped {
    grid-template-areas: ". . . reply" "gutter-left timestamp gutter-right content" ". . . container";
  }

  .messageNoText.messageGrouped {
    grid-template-areas: ". . . reply" ". . . ." "gutter-left timestamp gutter-right container";
  }

  .messageGutterLeft {
    grid-area: gutter-left;
  }

  .messageGutterRight {
    grid-area: gutter-right;
  }

  .message :global(.messageAvatar) {
    grid-area: avatar;
    display: block;
    position: relative;
    z-index: 1;
    align-self: start;
    margin-block-start: calc(2px + clamp(0px, calc((22px * 2 - 40px) / 2), 8px));
    transform: none;
    inline-size: 40px;
    block-size: 40px;
  }

  .messageNoText :global(.messageAvatar) {
    margin-block-start: 2px;
  }

  .messageContent {
    grid-area: content;
    min-width: 0;
    overflow-wrap: break-word;
    align-self: start;
    display: flex;
    flex-direction: column;
    min-inline-size: 0;
  }

  .messageAuthorInfo {
    margin: 0;
    min-height: 22px;
    line-height: 22px;
    color: var(--text-chat-muted);
    font-size: 16px;
    font-weight: inherit;
    display: block;
    min-inline-size: 0;
  }

  .messageAuthorRow {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: baseline;
    row-gap: 0;
    max-inline-size: 100%;
    white-space: nowrap;
    line-height: 22px;
    min-inline-size: 0;
  }

  .messageAuthorPart {
    display: inline;
    vertical-align: baseline;
    line-height: 22px;
    min-inline-size: 0;
    max-inline-size: 100%;
  }

  .messageAuthorPart > :global(*) {
    vertical-align: baseline;
  }

  .messageAuthorName {
    display: inline-flex;
    align-items: center;
    min-inline-size: 0;
    white-space: nowrap;
    vertical-align: baseline;
  }

  .messageUsername {
    display: inline;
    position: relative;
    font-weight: 500;
    color: var(--text-primary);
    line-height: 22px;
    vertical-align: baseline;
    min-inline-size: 0;
    max-inline-size: none;
    overflow: visible;
    white-space: nowrap;
    unicode-bidi: plaintext;
  }

  .tag {
    display: inline-block;
    background-color: var(--brand-primary);
    text-indent: 0;
    text-transform: uppercase;
    color: var(--brand-primary-fill);
    padding: 0 5.6px;
    vertical-align: baseline;
    padding-block: var(--user-tag-padding-vertical, 2px);
    min-height: var(--user-tag-min-height, auto);
    height: var(--user-tag-height, auto);
    line-height: var(--user-tag-line-height, 1);
    border-radius: 4px;
  }

  .tagSm {
    border-radius: 4px;
    font-size: 10px;
    --user-tag-min-height: 15px;
    --user-tag-padding-vertical: 2px;
  }

  .text {
    display: inline-block;
    font-weight: 600;
    line-height: var(--user-tag-line-height, 1);
  }

  .textSm {
    font-size: 10px;
  }

  .messageAuthorPart > .userTagOffset {
    margin-inline-start: 5.6px;
    vertical-align: middle;
    display: inline-flex;
  }

  .messageTimestamp {
    display: inline;
    vertical-align: baseline;
    font-weight: 400;
    font-size: 12px;
    line-height: 22px;
    color: color-mix(in srgb, var(--message-timestamp-color) 60%, transparent);
    margin-inline-start: 2.4px;
    white-space: nowrap;
    unicode-bidi: isolate;
  }

  .authorDashSeparator {
    display: inline;
    vertical-align: baseline;
    color: transparent;
    font-size: 0;
    line-height: 0;
    white-space: nowrap;
    margin: 0 2.4px;
  }

  .messageText {
    position: relative;
    overflow: hidden;
    padding-block-end: 1px;
    line-height: 22px;
    white-space: break-spaces;
    word-break: break-word;
    min-inline-size: 0;
  }

  .messageSent {
    color: var(--text-chat);
  }

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

  .container {
    grid-area: container;
    height: fit-content;
    display: grid;
    grid-auto-flow: row;
    row-gap: 4px;
    grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
    text-indent: 0;
    min-height: 0;
    min-width: 0;
    max-width: 100%;
    padding-block: 2px;
    position: relative;
  }

  .container:empty {
    display: none;
  }

  .container > :global(*) {
    justify-self: start;
    align-self: start;
  }

  .messageNoText .container {
    padding-block-start: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
</style>
