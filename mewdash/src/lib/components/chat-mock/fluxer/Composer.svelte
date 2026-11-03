<!-- SPDX-License-Identifier: AGPL-3.0-or-later. Portions adapted from Fluxer (https://github.com/fluxerapp/fluxer). -->
<script lang="ts">
  import Icon, { type IconName } from "./Icon.svelte";

  let { placeholder, mobile = false }: { placeholder: string; mobile?: boolean } = $props();

  const desktopButtons: IconName[] = ["gifFill", "imageSquareFill", "stickerFill", "smileyFill"];
</script>

<div
  class="box composerRoot wrapperSides textareaOuter roundedAll"
  class:textareaOuterMobile={mobile}
  class:textareaOuterRow={!mobile}
>
  <div class="statusRail"><div class="statusRailLeft"></div></div>
  <div class="stackSection inputSection">
    <div class="mainWrapperDense">
      <div class="uploadButtonColumn sideButtonPadding">
        <button type="button" class="button"><Icon name="plusBold" size={22} class="icon" /></button>
      </div>
      <div class="contentAreaDense">
        <div class="composerHost">
          <div class="editable composerEditable" role="textbox" aria-multiline="true" aria-placeholder={placeholder}>
            <p class="paragraph"><br /></p>
          </div>
          <div class="placeholder">{placeholder}</div>
        </div>
      </div>
      <div class="buttonContainerDense sideButtonPadding">
        {#if mobile}
          <button type="button" class="button"><Icon name="smileyFill" size={22} class="icon" /></button>
          <div class="invisibleTrigger"></div>
          <div class="mobileRightButtonContainer">
            <div class="mobileRightButtonSlot">
              <div class="voiceButtonWrapper">
                <button type="button" class="voiceButton"><Icon name="microphoneFill" size={22} class="voiceButtonIcon" /></button>
              </div>
            </div>
          </div>
        {:else}
          {#each desktopButtons as icon (icon)}
            <button type="button" class="button"><Icon name={icon} size={22} class="icon" /></button>
          {/each}
          <div class="invisibleTrigger"></div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .wrapperSides {
    max-width: 100%;
    box-sizing: border-box;
  }

  .box {
    position: relative;
    max-width: 100%;
    box-sizing: border-box;
  }

  .composerRoot {
    --textarea-min-height: 58px;
    --textarea-padding-y: 13px;
    --composer-box-inset: 6px;
    --composer-box-inset-inline: 6px;
    --composer-box-padding-inline: 10px;
  }

  .roundedAll {
    border-radius: var(--composer-box-radius, 0px);
  }

  .textareaOuter {
    display: flex;
    flex-direction: column;
    flex: 0 1 auto;
    padding-inline: var(--composer-box-padding-inline);
    box-sizing: border-box;
    max-width: 100%;
    min-width: 0;
    contain: inline-size;
    overflow: visible;
  }

  .textareaOuterMobile {
    padding: 0;
    min-height: 0;
    --textarea-min-height: 48px;
    --textarea-padding-y: 8px;
    --composer-box-inset: 0px;
    --composer-box-inset-inline: 0px;
    --composer-box-padding-inline: 0px;
  }

  .textareaOuterRow {
    min-height: var(--textarea-min-height);
    margin-block-start: 0;
    margin-block-end: var(--composer-box-inset);
    margin-inline: var(--composer-box-inset-inline);
    background-color: var(--background-textarea);
    --composer-box-radius: 8px;
    --composer-box-ring-color: var(--floating-surface-ring-color);
  }

  .textareaOuterRow::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    box-shadow: inset 0 0 0 1px var(--composer-box-ring-color);
    pointer-events: none;
  }

  .statusRail {
    position: absolute;
    inset-inline: var(--composer-box-padding-inline, 0px);
    bottom: 100%;
    z-index: 3;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, auto);
    align-items: center;
    gap: 8px;
    min-width: 0;
    max-width: 100%;
    height: 24px;
    box-sizing: border-box;
    pointer-events: none;
  }

  .statusRailLeft {
    display: flex;
    align-items: center;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
  }

  .stackSection {
    width: 100%;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    min-width: 0;
    box-sizing: border-box;
  }

  .inputSection {
    flex-shrink: 1000;
  }

  .mainWrapperDense {
    display: grid;
    grid-template-columns: minmax(0, auto) minmax(0, 1fr) minmax(0, auto);
    align-items: start;
    position: relative;
    min-height: var(--textarea-min-height);
    box-sizing: border-box;
    padding: var(--textarea-padding-y) 0;
    column-gap: 12px;
    min-width: 0;
    width: 100%;
    max-width: 100%;
  }

  .uploadButtonColumn {
    grid-column: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 32px;
    min-width: 0;
    flex-shrink: 1;
  }

  .sideButtonPadding {
    padding-inline: 4px;
  }

  .contentAreaDense {
    grid-column: 2;
    display: flex;
    flex-direction: column;
    min-height: 32px;
    min-width: 0;
    padding-top: 5px;
  }

  .contentAreaDense > * {
    flex: 0 1 auto;
    min-height: 0;
  }

  .composerHost {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    width: 100%;
  }

  .editable {
    min-height: 22px;
    overflow: hidden;
    outline: none;
    padding: 0;
    margin: 0;
    color: var(--text-chat);
    font-size: 16px;
    line-height: 22px;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .composerEditable {
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }

  .paragraph {
    margin: 0;
  }

  .placeholder {
    position: absolute;
    top: 0;
    inset-inline-end: 0;
    inset-inline-start: 0;
    pointer-events: none;
    user-select: none;
    color: var(--text-tertiary-secondary);
    font-size: 16px;
    line-height: 22px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow-wrap: anywhere;
    max-width: none;
  }

  .buttonContainerDense {
    grid-column: 3;
    display: flex;
    align-items: center;
    gap: 4px;
    min-height: 32px;
    min-width: 0;
    flex-shrink: 1;
  }

  .button {
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: flex-start;
    min-width: 32px;
    height: 32px;
    padding: 0;
    color: var(--text-primary-muted);
    border-radius: 6px;
    background: transparent;
    border: none;
    outline: none;
    flex-shrink: 0;
  }

  .button :global(.icon) {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
  }

  .invisibleTrigger {
    position: absolute;
    pointer-events: none;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .mobileRightButtonContainer {
    position: relative;
    flex-shrink: 0;
    width: 32px;
    height: 32px;
  }

  .mobileRightButtonSlot {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .voiceButtonWrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .voiceButton {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    padding: 0;
    color: var(--text-primary-muted);
    border-radius: 6px;
    background: transparent;
    border: none;
    outline: none;
    flex-shrink: 0;
  }

  .voiceButton :global(.voiceButtonIcon) {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
  }
</style>
