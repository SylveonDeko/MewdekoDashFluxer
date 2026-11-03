<!-- SPDX-License-Identifier: AGPL-3.0-or-later. Portions adapted from Fluxer (https://github.com/fluxerapp/fluxer). -->
<script lang="ts">
  import ScaledFrame from "./fluxer/ScaledFrame.svelte";
  import Conversation from "./fluxer/Conversation.svelte";
  import Composer from "./fluxer/Composer.svelte";
  import Icon from "./fluxer/Icon.svelte";
  import type { ChatScene } from "./fluxer/types";

  interface Props {
    scene: ChatScene;
    label: string;
    height?: number;
    class?: string;
  }

  let { scene, label, height = 780, class: className = "" }: Props = $props();
</script>

<ScaledFrame width={390} {height} radius={28} {label} class={className}>
  <div class="guildsLayoutContainer">
    <div class="contentContainer">
      <div class="frame outlineFrame">
        <div class="contentWrapper">
          <div class="body">
            <div class="contentInner">
              <div class="guildLayoutContainer">
                <div class="guildMainContent">
                  <div class="channelGrid">
                    <div>
                      <header class="headerWrapper">
                        <div class="headerContainer">
                          <div class="headerLeftSection">
                            <button type="button" class="backButton">
                              <Icon name="arrowLeftBold" size={24} class="backIcon" />
                            </button>
                            <div class="leftContentContainer">
                              <button type="button" class="mobileButton">
                                <Icon name="textChannel" size={24} class="channelIcon" />
                                <span class="channelName">{scene.channel}</span>
                                <Icon name="caretRightBold" size={16} class="caretRight" />
                              </button>
                            </div>
                          </div>
                          <div class="headerRightSection" role="group">
                            <button type="button" class="iconButtonMobile">
                              <Icon name="starBold" size={20} class="buttonIconMobile" />
                            </button>
                            <button type="button" class="iconButtonMobile">
                              <Icon name="magnifyingGlassBold" size={20} class="buttonIconMobile" />
                            </button>
                          </div>
                        </div>
                      </header>
                    </div>
                    <div class="contentGrid">
                      <div class="chatAreaSlot">
                        <div class="chatContainer">
                          <section class="messagesArea">
                            <Conversation messages={scene.messages} users={scene.users} mobile />
                          </section>
                          <section class="textareaArea">
                            <Composer placeholder="Message #{scene.channel}" mobile />
                          </section>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</ScaledFrame>

<style>
  .guildsLayoutContainer {
    position: relative;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 1fr);
    height: 100%;
    width: 100%;
    background-color: var(--background-secondary);
  }

  .contentContainer {
    grid-column: 1 / -1;
    grid-row: 1;
    display: grid;
    grid-template-rows: minmax(0, 1fr);
    min-height: 0;
    min-width: 0;
    background-color: var(--background-secondary);
    position: relative;
    height: 100%;
    width: 100%;
  }

  .frame {
    position: relative;
    height: 100%;
    width: 100%;
    border: 1px solid var(--user-area-divider-color);
    border-top: none;
    background: var(--background-secondary-lighter);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .contentWrapper {
    position: relative;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .body {
    position: relative;
    flex: 1;
    min-height: 0;
    width: 100%;
    overflow: hidden;
    z-index: 1;
    display: flex;
    flex-direction: column;
  }

  .contentInner {
    height: 100%;
    min-height: 0;
    width: 100%;
    min-width: 0;
    background-color: var(--background-secondary);
  }

  .guildLayoutContainer {
    display: grid;
    grid-template-rows: minmax(0, 1fr);
    align-content: stretch;
    height: 100%;
    min-height: 0;
    width: 100%;
    min-width: 0;
    background-color: var(--background-secondary);
  }

  .guildMainContent {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    height: 100%;
    min-height: 0;
    width: 100%;
    min-width: 0;
    overflow: hidden;
    background-color: var(--background-secondary);
  }

  .channelGrid {
    display: grid;
    height: 100%;
    min-height: 0;
    width: 100%;
    min-width: 0;
    grid-template-rows: 64px minmax(0, 1fr);
    background: var(--background-secondary-lighter);
    overflow: hidden;
  }

  .headerWrapper {
    background-color: var(--background-secondary-lighter);
    display: flex;
    flex-direction: column;
  }

  .headerContainer {
    z-index: 3;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, auto);
    align-items: center;
    gap: 16px;
    height: 64px;
    min-height: 64px;
    border-bottom: 1px solid var(--user-area-divider-color);
    background-color: var(--background-secondary-lighter);
    padding: 0 16px;
    color: var(--text-primary);
  }

  .headerLeftSection {
    position: relative;
    display: flex;
    align-items: center;
    min-width: 0;
    overflow: hidden;
  }

  .backButton {
    margin-inline-end: 12px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    width: 32px;
    border-radius: 9999px;
    background-color: transparent;
    color: var(--text-primary-muted);
  }

  .backButton :global(.backIcon) {
    height: 24px;
    width: 24px;
  }

  .leftContentContainer {
    position: relative;
    min-width: 0;
    flex: 1;
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .mobileButton {
    display: flex;
    align-items: center;
    border: none;
    background-color: transparent;
    padding: 0;
    text-align: start;
    color: inherit;
  }

  .mobileButton :global(.channelIcon) {
    height: 24px;
    width: 24px;
    flex-shrink: 0;
    color: var(--text-primary-muted);
  }

  .channelName {
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

  .mobileButton :global(.caretRight) {
    margin-inline-start: 4px;
    height: 16px;
    width: 16px;
    flex-shrink: 0;
    color: var(--text-primary-muted);
  }

  .headerRightSection {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex-shrink: 0;
    min-width: 0;
  }

  .iconButtonMobile {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    width: 40px;
    flex-shrink: 0;
    border-radius: 9999px;
    background-color: var(--background-tertiary);
    color: var(--text-primary);
  }

  .iconButtonMobile :global(.buttonIconMobile) {
    height: 20px;
    width: 20px;
  }

  .contentGrid {
    display: grid;
    height: 100%;
    min-height: 0;
    width: 100%;
    min-width: 0;
    grid-template-columns: minmax(0, 1fr) auto;
    position: relative;
    contain: layout style;
    overflow: hidden;
  }

  .chatAreaSlot {
    height: 100%;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
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
