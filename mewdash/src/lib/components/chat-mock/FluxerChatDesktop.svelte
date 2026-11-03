<!-- SPDX-License-Identifier: AGPL-3.0-or-later. Portions adapted from Fluxer (https://github.com/fluxerapp/fluxer). -->
<script lang="ts">
  import ScaledFrame from "./fluxer/ScaledFrame.svelte";
  import Conversation from "./fluxer/Conversation.svelte";
  import Composer from "./fluxer/Composer.svelte";
  import Avatar from "./fluxer/Avatar.svelte";
  import Icon, { type IconName } from "./fluxer/Icon.svelte";
  import type { ChatScene } from "./fluxer/types";

  interface Props {
    scene: ChatScene;
    label: string;
    /** Window width to draw at. Fluxer keeps its desktop layout down to 768px. */
    width?: number;
    height?: number;
    class?: string;
  }

  let { scene, label, width = 1024, height = 1030, class: className = "" }: Props = $props();

  const guilds = [
    { acronym: "BC", selected: false },
    { acronym: "TH", selected: true },
    { acronym: "PT", selected: false },
  ];

  const actions: { icon: IconName; gap: boolean }[] = [
    { icon: "compassFill", gap: true },
    { icon: "plusBold", gap: true },
    { icon: "downloadSimpleBold", gap: true },
    { icon: "questionMarkBold", gap: false },
  ];

  const textChannels = $derived(
    ["welcome", "general", "off-topic", "trades"].map((name) => ({ name, selected: name === scene.channel })),
  );

  const headerActions: IconName[] = ["bellFill", "pushPinFill", "starBold", "usersFill"];

  const me = $derived((scene.self && scene.users[scene.self]) || { name: "You" });
</script>

{#snippet category(name: string)}
  <div class="container channelReorderTarget channelCategoryReorderTarget">
    <div class="channelItem channelItemSurface channelItemCategory" role="button">
      <div class="categoryContent"><span class="categoryName">{name}</span></div>
      <div class="channelItemActions"><Icon name="caretDownBold" size={12} class="categoryIcon" /></div>
    </div>
  </div>
{/snippet}

{#snippet channel(name: string, icon: IconName, selected: boolean)}
  <div class="container channelReorderTarget">
    <div
      class="channelItem channelItemSurface channelItemRegular"
      class:channelItemSurfaceSelected={selected}
      class:channelItemSelected={selected}
      class:channelItemMuted={!selected}
      class:channelItemHoverable={!selected}
      role="button"
    >
      <div>
        <Icon
          name={icon}
          size={20}
          class="channelItemIcon {selected ? 'channelItemIconSelected' : 'channelItemIconUnselected'}"
        />
      </div>
      <span class="channelName">{name}</span>
      <div class="channelItemActions">
        <div class="hoverAffordance">
          <button type="button" tabindex="-1" class="iconButton" class:iconButtonSelected={selected} class:iconButtonDefault={!selected}>
            <Icon name="userPlusFill" size={16} class="icon" />
          </button>
        </div>
      </div>
    </div>
  </div>
{/snippet}

<ScaledFrame {width} {height} {label} class={className}>
  <div class="guildsLayoutContainer">
    <nav class="guildListScrollerWrapper">
      <div class="guildListScrollContainer">
        <div class="guildListContent" role="list">
          <div role="listitem" class="row rowGap">
            <button type="button" class="guildListItem">
              <div class="relative">
                <div class="guildIcon fluxerButtonIcon" style="border-radius: 50%;">
                  <Icon name="chatCircleFill" size={28} />
                </div>
              </div>
            </button>
          </div>
          <div role="listitem" class="row">
            <button type="button" class="guildListItem">
              <div class="relative">
                <div class="guildIcon fluxerButtonIcon" style="border-radius: 50%;">
                  <Icon name="starFill" size={28} />
                </div>
              </div>
            </button>
          </div>
          <div role="presentation" class="row">
            <div class="guildDividerSlot"><div class="guildDivider"></div></div>
          </div>
          {#each guilds as guild, index (guild.acronym)}
            <div role="listitem" class="row" class:rowGap={index === guilds.length - 1}>
              <div class="guildListItemSlot">
                <div class="guildListItem guildListReorderTarget" role="button">
                  {#if guild.selected}
                    <div class="guildIndicator"><span class="guildIndicatorBar" style="opacity: 1; height: 40px;"></span></div>
                  {/if}
                  <div class="relative">
                    <div
                      class="guildIcon guildIconNoImage"
                      class:guildIconSelected={guild.selected}
                      style="border-radius: {guild.selected ? '30%' : '50%'};"
                    >
                      <span class="acronym"><span class="acronymText">{guild.acronym}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/each}
          {#each actions as action (action.icon)}
            <div role="listitem" class="row" class:rowGap={action.gap}>
              <div class="guildListItem">
                <button type="button" class="actionButton">
                  <div class="createGuildButtonIcon" style="border-radius: 50%;">
                    <Icon name={action.icon} size={20} class="iconText" />
                  </div>
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </nav>

    <div class="contentContainer">
      <div class="frame outlineFrame">
        <div class="contentWrapper">
          <div class="divider" aria-hidden="true"></div>
          <div class="body">
            <div class="contentInner">
              <div class="guildLayoutContainer">
                <div class="guildLayoutContent">
                  <div class="guildNavbarContainer">
                    <div class="headerWrapper">
                      <div class="headerContainer">
                        <div class="headerContent" role="button">
                          <span class="guildName">Trainer Hangout</span>
                          <Icon name="caretDownBold" size={16} class="caretIcon" />
                        </div>
                      </div>
                    </div>
                    <div class="channelListScrollerWrapper">
                      <div class="channelListScroller">
                        <div class="navigationContainer" role="navigation">
                          <div class="topDropZone"></div>
                          <div class="channelGroupsContainer">
                            <div class="channelGroup">
                              {@render category("Text Channels")}
                              {#each textChannels as item (item.name)}
                                {@render channel(item.name, "textChannel", item.selected)}
                              {/each}
                            </div>
                            <div class="channelGroup">
                              {@render category("Voice Channels")}
                              {@render channel("Lounge", "voiceChannel", false)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="guildMainContent">
                    <div class="channelGrid">
                      <div>
                        <header class="channelHeaderWrapper">
                          <div class="channelHeaderContainer">
                            <div class="headerLeftSection">
                              <div class="leftContentContainer">
                                <div class="channelInfoContainer" role="group">
                                  <Icon name="textChannel" size={24} class="channelIcon" />
                                  <span class="headerChannelName">{scene.channel}</span>
                                </div>
                              </div>
                            </div>
                            <div class="headerRightSection" role="group">
                              {#each headerActions as icon (icon)}
                                <div class="iconButtonWrapper">
                                  <button type="button" class="headerIconButton">
                                    <Icon name={icon} size={24} class="buttonIcon" />
                                  </button>
                                </div>
                              {/each}
                              <div class="messageSearchFocusWrapper">
                                <div class="anchor">
                                  <div class="inputContainer">
                                    <button type="button" class="scopeButton">
                                      <Icon name="magnifyingGlassBold" size={16} class="searchIcon" />
                                      <span class="scopeBadge"><Icon name="hashBold" size={8} /></span>
                                    </button>
                                    <div class="editorShell">
                                      <div class="searchEditable"></div>
                                      <div class="searchPlaceholder">Search messages</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <button type="button" class="headerIconButton">
                                <Icon name="inbox" size={24} class="buttonIcon" />
                              </button>
                            </div>
                          </div>
                        </header>
                      </div>
                      <div class="contentGrid">
                        <div class="chatAreaSlot">
                          <div class="chatContainer">
                            <section class="messagesArea">
                              <Conversation messages={scene.messages} users={scene.users} />
                            </section>
                            <section class="textareaArea">
                              <Composer placeholder="Message #{scene.channel}" />
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

    <div class="userAreaWrapper">
      <div class="userAreaInnerWrapper">
        <div class="userAreaContainer">
          <div class="userInfo" role="button">
            <Avatar size={32} src={me.avatar} fill={me.color} online />
            <div class="userInfoText">
              <div class="userName">{me.name}</div>
              <div class="userStatus">
                <div class="hoverRoll">
                  <div class="hovered">{me.name}#0001</div>
                  <div class="defaultState"><span class="userStatus">Online</span></div>
                </div>
              </div>
            </div>
          </div>
          <div class="controlsContainer">
            <button type="button" class="controlButton"><Icon name="microphoneFill" size={20} class="controlIcon" /></button>
            <button type="button" class="controlButton"><Icon name="speakerHighFill" size={20} class="controlIcon" /></button>
            <button type="button" class="controlButton"><Icon name="gearFill" size={20} class="controlIcon" /></button>
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
    grid-template-columns: 72px minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr);
    height: 100%;
    width: 100%;
    background-color: var(--background-secondary);
  }

  .guildListScrollerWrapper {
    grid-column: 1;
    grid-row: 1;
    min-height: 0;
    height: 100%;
    width: 72px;
    min-width: 0;
    background-color: var(--background-secondary);
    position: relative;
    z-index: 10;
  }

  .guildListScrollContainer {
    height: 100%;
    width: 100%;
    min-width: 0;
    overflow: hidden;
    background-color: var(--background-secondary);
    padding-top: 4px;
    padding-bottom: 8px;
  }

  .guildListContent {
    position: relative;
    display: block;
    width: 100%;
    min-width: 0;
  }

  .row {
    width: 100%;
    padding-bottom: 0;
  }

  .rowGap {
    padding-bottom: 6px;
  }

  .guildListItemSlot {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .guildListItem {
    position: relative;
    display: flex;
    height: 48px;
    width: 100%;
    align-items: center;
    justify-content: center;
    padding: 2px;
    box-sizing: border-box;
    z-index: 0;
    background: transparent;
  }

  .guildListReorderTarget {
    height: 54px;
  }

  .relative {
    position: relative;
  }

  .guildIcon {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 44px;
    width: 44px;
    flex-shrink: 0;
    border-radius: 9999px;
    background-color: transparent;
    color: var(--text-primary);
    overflow: hidden;
  }

  .guildIconNoImage {
    background-color: var(--guilds-layout-item-bg);
  }

  .guildIconSelected.guildIconNoImage {
    border-radius: 30%;
    background-color: var(--brand-primary);
    color: var(--brand-primary-fill);
  }

  .fluxerButtonIcon {
    background-color: var(--guilds-layout-item-bg);
    color: var(--text-primary);
  }

  .fluxerButtonIcon :global(svg) {
    height: 28px;
    width: 28px;
    color: currentColor;
  }

  .guildIndicator {
    position: absolute;
    inset-inline-start: -2.4px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 44px;
    width: 8px;
    pointer-events: none;
    z-index: 2;
  }

  .guildIndicatorBar {
    display: block;
    width: 5.6px;
    border-radius: 0 9999px 9999px 0;
    background-color: var(--text-primary);
  }

  .acronym {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: inherit;
    container-type: inline-size;
    user-select: none;
  }

  .acronymText {
    flex: 0 0 auto;
    font-size: max(8px, calc(0.375 * 100cqi));
    font-style: normal;
    font-weight: 500;
    letter-spacing: normal;
    line-height: 1;
    text-align: center;
    text-transform: none;
    white-space: nowrap;
  }

  .guildDividerSlot {
    display: grid;
    grid-template-rows: calc(6px + 3px) 2px 6px;
    justify-items: center;
    width: 100%;
    flex-shrink: 0;
  }

  .guildDivider {
    grid-row: 2;
    height: 2px;
    width: 32px;
    flex-shrink: 0;
    border-radius: 1px;
    background-color: var(--background-modifier-hover);
  }

  .actionButton {
    position: relative;
    display: flex;
    width: 100%;
    justify-content: center;
    border: none;
    background-color: transparent;
    padding: 0;
  }

  .createGuildButtonIcon {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 44px;
    width: 44px;
    flex-shrink: 0;
    border-radius: 9999px;
    border: 2px dashed var(--background-modifier-accent);
    background-color: transparent;
    color: var(--text-primary);
  }

  .createGuildButtonIcon :global(.iconText) {
    height: 20px;
    width: 20px;
    color: var(--text-primary);
  }

  .contentContainer {
    grid-column: 2;
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
    border-start-start-radius: 0;
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

  .divider {
    position: absolute;
    top: 0;
    bottom: 0;
    inset-inline-start: 320px;
    width: 1px;
    pointer-events: none;
    background: var(--user-area-divider-color);
    z-index: 2;
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

  .guildLayoutContent {
    display: grid;
    grid-template-columns: 320px minmax(0, 1fr);
    align-items: stretch;
    height: 100%;
    min-height: 0;
    width: 100%;
    min-width: 0;
  }

  .guildNavbarContainer {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100%;
    min-height: 0;
    width: 320px;
    min-width: 0;
    user-select: none;
    overflow: hidden;
    background-color: var(--background-secondary);
    position: relative;
  }

  .headerWrapper {
    position: relative;
    min-width: 0;
  }

  .headerContainer {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: flex-start;
    overflow: hidden;
    height: 56px;
    min-height: 56px;
    min-width: 0;
    border-bottom: 1px solid var(--user-area-divider-color);
    background-color: var(--background-secondary);
  }

  .headerContent {
    position: relative;
    z-index: 30;
    display: flex;
    align-items: center;
    gap: 4px;
    height: 56px;
    width: 100%;
    min-width: 0;
    padding: 0 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .guildName {
    flex: 1;
    min-width: 0;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 20px;
    max-height: 20px;
    color: var(--text-primary);
  }

  .headerContent :global(.caretIcon) {
    margin-inline-start: auto;
    height: 16px;
    width: 16px;
    flex-shrink: 0;
    color: var(--text-primary);
  }

  .channelListScrollerWrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    min-height: 0;
    min-width: 0;
    max-height: 100%;
    overflow: hidden;
  }

  .channelListScroller {
    display: flex;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
    width: 100%;
    height: 100%;
    flex: 1 1 auto;
    overflow: hidden;
    background-color: var(--background-secondary);
  }

  .navigationContainer {
    width: 100%;
    min-width: 0;
    min-height: 100%;
    padding-inline-end: 8px;
  }

  .topDropZone {
    position: relative;
    height: 10px;
  }

  .channelGroupsContainer,
  .channelGroup {
    display: flex;
    width: 100%;
    min-width: 0;
    flex-direction: column;
    gap: 0;
  }

  .container {
    position: relative;
    width: 100%;
  }

  .channelReorderTarget {
    box-sizing: border-box;
    padding-top: 1px;
  }

  .channelCategoryReorderTarget {
    padding-top: 4px;
  }

  .channelItemSurface {
    --background-modifier-hover: var(--surface-interactive-hover-bg);
    --background-modifier-selected: var(--surface-interactive-selected-bg);
  }

  .channelItemSurfaceSelected {
    color: var(--surface-interactive-selected-color);
  }

  .channelItem {
    position: relative;
    margin-inline-start: 8px;
    margin-inline-end: 0;
    display: flex;
    min-width: 0;
    flex: 1;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-radius: 6px;
    padding-inline-start: 8px;
    padding-inline-end: 8px;
  }

  .channelItemCategory {
    margin-top: 0;
    margin-bottom: 0;
    gap: 4px;
    padding-top: 6px;
    padding-bottom: 6px;
    color: var(--text-tertiary-muted);
  }

  .channelItemRegular {
    gap: 6px;
    padding-top: 6px;
    padding-bottom: 6px;
    color: var(--text-tertiary-muted);
  }

  .channelItemMuted {
    color: var(--text-tertiary-muted);
  }

  .channelItemSelected {
    background-color: var(--background-modifier-selected);
    color: var(--text-primary);
  }

  .channelItem :global(.channelItemIcon) {
    height: 20px;
    width: 20px;
  }

  .channelItem :global(.channelItemIconSelected) {
    color: var(--surface-interactive-selected-color);
  }

  .channelItem :global(.channelItemIconUnselected) {
    color: var(--text-tertiary-muted);
  }

  .channelName {
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
    font-size: 16px;
    line-height: 20px;
    max-height: 20px;
    min-width: 0;
  }

  .categoryContent {
    display: flex;
    min-width: 0;
    flex: 1;
    align-items: center;
    gap: 4px;
  }

  .categoryName {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
    max-height: 20px;
    min-width: 0;
  }

  .channelItemActions {
    margin-inline-start: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .channelItemActions :global(.categoryIcon) {
    height: 12px;
    width: 12px;
    flex-shrink: 0;
    color: var(--text-tertiary-muted);
  }

  .hoverAffordance {
    display: none;
  }

  .channelItemSelected .hoverAffordance {
    display: flex;
  }

  .iconButton {
    display: flex;
    height: 16px;
    width: 16px;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    border: none;
    background-color: transparent;
    padding: 0;
  }

  .iconButtonDefault {
    color: var(--text-primary-muted);
  }

  .iconButtonSelected {
    color: var(--surface-interactive-selected-color);
  }

  .iconButton :global(.icon) {
    height: 16px;
    width: 16px;
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
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, auto);
    align-items: center;
    gap: 16px;
    height: 56px;
    min-height: 56px;
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

  .leftContentContainer {
    position: relative;
    min-width: 0;
    flex: 1;
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: 8px;
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

  .headerRightSection {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex-shrink: 0;
    min-width: 0;
  }

  .iconButtonWrapper {
    position: relative;
    display: inline-flex;
  }

  .headerIconButton {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    width: 32px;
    flex-shrink: 0;
    border-radius: 9999px;
    border: none;
    background-color: transparent;
    color: var(--text-primary-muted);
    opacity: 1;
  }

  .headerIconButton :global(.buttonIcon) {
    height: 24px;
    width: 24px;
  }

  .messageSearchFocusWrapper {
    display: flex;
    flex: 0 0 244px;
    width: 244px;
    min-width: 244px;
    max-width: 244px;
  }

  .anchor {
    position: relative;
    display: flex;
    align-items: center;
    width: 244px;
    min-width: 244px;
    max-width: 244px;
  }

  .inputContainer {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    padding-inline-start: 10px;
    padding-inline-end: 10px;
    min-height: 36px;
    border-radius: 12px;
    border: 1px solid var(--background-modifier-accent);
    background-color: var(--background-textarea);
  }

  .scopeButton {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-inline-end: 8px;
    padding: 0;
    border: none;
    background: transparent;
    flex-shrink: 0;
  }

  .scopeButton :global(.searchIcon) {
    height: 16px;
    width: 16px;
    flex-shrink: 0;
    color: var(--text-tertiary);
  }

  .scopeBadge {
    position: absolute;
    bottom: -4px;
    inset-inline-start: -4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 12px;
    height: 12px;
    border-radius: 4px;
    background-color: var(--background-secondary);
    color: var(--text-primary-muted);
    border: 1px solid var(--background-modifier-accent);
  }

  .editorShell {
    position: relative;
    display: flex;
    align-items: center;
    align-self: stretch;
    flex: 1 1 auto;
    min-width: 0;
    min-height: 36px;
  }

  .searchEditable {
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
    min-height: 22px;
    color: var(--text-primary);
    font-size: 14px;
    line-height: 22px;
  }

  .searchPlaceholder {
    position: absolute;
    top: 50%;
    inset-inline-start: 0;
    transform: translateY(-50%);
    pointer-events: none;
    user-select: none;
    color: var(--text-tertiary);
    font-size: 14px;
    line-height: 22px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
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

  .userAreaWrapper {
    position: absolute;
    bottom: 0;
    inset-inline-start: 0;
    width: calc(72px + 320px + 1px);
    display: flex;
    align-items: flex-end;
    padding: 0 6px 7px;
    background-color: var(--background-secondary);
    z-index: 10;
  }

  .userAreaInnerWrapper {
    display: flex;
    flex-direction: column;
    gap: 0;
    width: 100%;
    background-color: var(--panel-control-bg);
    border-radius: 8px;
    box-shadow: inset 0 0 0 1px var(--floating-surface-ring-color);
    overflow: hidden;
    position: relative;
  }

  .userAreaContainer {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
    padding-block: 13px;
    padding-inline: 14px 8px;
    background-color: transparent;
    width: 100%;
    min-height: 58px;
  }

  .userInfo {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
    padding: 0;
    margin: 0;
    border-radius: 6px;
    height: 32px;
    position: relative;
    isolation: isolate;
  }

  .userInfoText {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    gap: 1px;
  }

  .userName {
    font-weight: 500;
    font-size: 14px;
    line-height: 18px;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .userStatus {
    font-size: 11px;
    line-height: 14px;
    color: color-mix(in srgb, var(--text-primary-muted) 85%, transparent);
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
    margin-top: -1px;
  }

  .hoverRoll {
    display: inline-block;
    vertical-align: top;
    position: relative;
    width: 100%;
    contain: paint;
    overflow: hidden;
  }

  .defaultState,
  .hovered {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    display: block;
    transform-style: preserve-3d;
    pointer-events: none;
    width: 100%;
  }

  .hovered {
    opacity: 0;
    transform: translate3d(0, 107%, 0);
    position: absolute;
    top: 0;
    inset-inline-start: 0;
    inset-inline-end: 0;
  }

  .controlsContainer {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    padding-inline-start: 12px;
  }

  .controlButton {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    width: 32px;
    background-color: transparent;
    color: var(--control-button-normal-text);
    border: none;
    border-radius: 6px;
    position: relative;
    padding: 0;
  }

  .controlButton :global(.controlIcon) {
    height: 20px;
    width: 20px;
  }
</style>
