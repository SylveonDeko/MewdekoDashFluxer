<!-- SPDX-License-Identifier: AGPL-3.0-or-later. Portions adapted from Fluxer (https://github.com/fluxerapp/fluxer). -->
<script lang="ts">
  import ScaledFrame from "./fluxer/ScaledFrame.svelte";
  import Conversation from "./fluxer/Conversation.svelte";
  import Composer from "./fluxer/Composer.svelte";
  import Icon from "./fluxer/Icon.svelte";
  import Avatar from "./fluxer/Avatar.svelte";
  import type { ChatScene } from "./fluxer/types";

  interface Props {
    scene: ChatScene;
    label: string;
    width?: number;
    /** Leave out to size the frame to the messages. */
    height?: number;
    composer?: boolean;
    class?: string;
  }

  let { scene, label, width = 600, height, composer = false, class: className = "" }: Props = $props();

  let contentHeight = $state(0);
  const frameHeight = $derived(height ?? HEADER_HEIGHT + Math.max(contentHeight, 1));
</script>

<script lang="ts" module>
  const HEADER_HEIGHT = 56;
</script>

<ScaledFrame {width} height={frameHeight} radius={12} {label} class={className}>
  <div class="channelGrid">
    <div>
      <header class="channelHeaderWrapper">
        <div class="channelHeaderContainer">
          <div class="channelInfoContainer" role="group">
            {#if scene.dm}
              <Avatar size={32} src={scene.dm.avatar} online />
              <span class="dmNameWrapper">
                <span class="headerChannelName">{scene.dm.name}</span>
                {#if scene.dm.bot}
                  <span class="tag userTag"><span class="tagText">Bot</span></span>
                {/if}
              </span>
            {:else}
              <Icon name="textChannel" size={24} class="channelIcon" />
              <span class="headerChannelName">{scene.channel}</span>
            {/if}
          </div>
        </div>
      </header>
    </div>
    <div class="chatContainer">
      <section class="messagesArea">
        <Conversation messages={scene.messages} users={scene.users} bind:contentHeight />
      </section>
      {#if composer}
        <section class="textareaArea">
          <Composer placeholder={scene.dm ? `Message @${scene.dm.name}` : `Message #${scene.channel}`} />
        </section>
      {/if}
    </div>
  </div>
</ScaledFrame>

<style>
  .channelGrid {
    display: grid;
    height: 100%;
    min-height: 0;
    width: 100%;
    min-width: 0;
    grid-template-rows: 56px minmax(0, 1fr);
    background: var(--background-secondary-lighter);
    overflow: hidden;
  }

  .channelHeaderWrapper {
    background-color: var(--background-secondary-lighter);
    display: flex;
    flex-direction: column;
  }

  .channelHeaderContainer {
    z-index: 3;
    display: flex;
    align-items: center;
    height: 56px;
    min-height: 56px;
    border-bottom: 1px solid var(--user-area-divider-color);
    background-color: var(--background-secondary-lighter);
    padding: 0 16px;
    color: var(--text-primary);
  }

  .channelInfoContainer {
    display: flex;
    align-items: center;
    flex: 1 1 auto;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
  }

  .channelInfoContainer :global(.channelIcon) {
    height: 24px;
    width: 24px;
    flex-shrink: 0;
    color: var(--text-primary-muted);
  }

  .headerChannelName {
    margin-inline-start: 12px;
    min-width: 0;
    flex-shrink: 1;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 24px;
    max-height: 24px;
  }

  .dmNameWrapper {
    display: inline-flex;
    align-items: center;
    gap: 0.15rem;
    min-width: 0;
    max-width: 15rem;
    flex-shrink: 1;
  }

  .tag {
    display: inline-block;
    background-color: var(--brand-primary);
    text-transform: uppercase;
    color: var(--brand-primary-fill);
    padding: 2px 5.6px;
    min-height: 15px;
    line-height: 1;
    border-radius: 4px;
    font-size: 10px;
  }

  .userTag {
    margin-inline-start: 0.25rem;
  }

  .tagText {
    display: inline-block;
    font-weight: 600;
    font-size: 10px;
    line-height: 1;
  }

  .chatContainer {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    width: 100%;
    min-width: 0;
    overflow: hidden;
    background-color: var(--composer-surface-color);
    contain: layout style;
  }

  .messagesArea {
    display: flex;
    flex: 1 1 0%;
    min-height: 0;
    min-width: 0;
    position: relative;
    z-index: 0;
    overflow: hidden;
    contain: strict;
  }

  .textareaArea {
    flex: 0 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1;
    padding: 0;
    overflow: visible;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    contain: inline-size layout;
  }
</style>
