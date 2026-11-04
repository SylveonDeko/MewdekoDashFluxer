<!-- SPDX-License-Identifier: AGPL-3.0-or-later. Portions adapted from Fluxer (https://github.com/fluxerapp/fluxer). -->
<script lang="ts">
  import MessageGroup from "./MessageGroup.svelte";
  import Embed from "./Embed.svelte";
  import Markup from "./Markup.svelte";
  import Reactions from "./Reactions.svelte";
  import Components from "./Components.svelte";
  import PinSystemMessage from "./PinSystemMessage.svelte";
  import { setContext } from "svelte";
  import { chatUsersKey, type ChatMessage, type ChatUser } from "./types";

  let {
    messages,
    users,
    mobile = false,
    contentHeight = $bindable(0),
  }: { messages: ChatMessage[]; users: Record<string, ChatUser>; mobile?: boolean; contentHeight?: number } = $props();

  setContext(chatUsersKey, () => users);

  const groupedWithPrevious = (index: number) => {
    const message = messages[index];
    const previous = messages[index - 1];
    return (
      !!previous &&
      message.kind !== "pin" &&
      previous.kind !== "pin" &&
      !message.interaction &&
      previous.author === message.author &&
      previous.time === message.time
    );
  };
</script>

<div class="messagesWrapper">
  <div class="scrollerContainer">
    <div class="scrollerWrap">
      <div class="scroller">
        <div class="scrollerContent">
          <div class="scrollerInner" class:scrollerInnerMobile={mobile} role="log">
            <div class="measured" bind:offsetHeight={contentHeight}>
            {#each messages as message, index (index)}
              {@const user = users[message.author] ?? { name: message.author }}
              {@const grouped = groupedWithPrevious(index)}
              {#if index > 0 && !grouped}<div class="groupSpacer"></div>{/if}
              {#if message.kind === "pin"}
                <PinSystemMessage name={user.name} time={message.time} {mobile} />
              {:else}
                {@const hasAccessories =
                  !!message.embeds?.length || !!message.attachments?.length || !!message.components?.length || !!message.reactions?.length}
                <MessageGroup
                  name={user.name}
                  avatar={user.avatar}
                  avatarColor={user.color}
                  bot={user.bot}
                  time={message.time}
                  {grouped}
                  {mobile}
                  text={message.text ? textSnippet : undefined}
                  accessories={hasAccessories ? accessorySnippet : undefined}
                  interaction={message.interaction ? {
                    name: users[message.interaction.user]?.name ?? message.interaction.user,
                    avatar: users[message.interaction.user]?.avatar,
                    avatarColor: users[message.interaction.user]?.color,
                    command: message.interaction.command,
                  } : undefined}
                  ephemeral={message.ephemeral}
                />
                {#snippet textSnippet()}<Markup text={message.text ?? ""} />{/snippet}
                {#snippet accessorySnippet()}
                  {#each message.attachments ?? [] as image, a (a)}
                    <div class="attachment" style="width: {image.width}px; aspect-ratio: {image.width} / {image.height};">
                      <img src={image.src} alt="" width={image.width} height={image.height} loading="lazy" decoding="async" />
                    </div>
                  {/each}
                  {#each message.embeds ?? [] as embed, e (e)}
                    <Embed {embed} />
                  {/each}
                  {#if message.components?.length}
                    <Components rows={message.components} />
                  {/if}
                  {#if message.reactions?.length}
                    <Reactions reactions={message.reactions} />
                  {/if}
                {/snippet}
              {/if}
            {/each}
            <div class="scrollerSpacer"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .messagesWrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1 1 0%;
    min-height: 0;
    min-width: 0;
    height: 100%;
    font-size: 16px;
  }

  .scrollerContainer {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
    height: 100%;
    width: 100%;
  }

  .scrollerWrap {
    position: relative;
    display: flex;
    min-height: 0;
    min-width: 0;
    width: 100%;
    height: 100%;
    flex: 1 1 auto;
  }

  .scroller {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    min-height: 0;
    min-width: 0;
    width: 100%;
    height: 100%;
    flex: 1 1 auto;
    overflow: hidden;
    clip-path: inset(0);
  }

  .scrollerContent {
    display: flex;
    flex-direction: column;
    flex: 1 0 auto;
    min-height: 100%;
  }

  .scrollerInner {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    min-height: 100%;
    padding-inline-start: 16px;
    padding-inline-end: 16px;
    position: relative;
  }

  .scrollerInnerMobile {
    padding-inline-start: 12px;
    padding-inline-end: 12px;
  }

  .measured {
    display: flex;
    flex-direction: column;
    flex: none;
    padding-block-start: 16px;
  }

  .groupSpacer {
    flex: 0 0 auto;
    height: 16px;
  }

  .attachment {
    max-width: min(100%, 400px);
    margin-top: 4px;
    border-radius: 8px;
    overflow: hidden;
  }

  .attachment img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .scrollerSpacer {
    display: block;
    height: 24px;
    width: 100%;
    flex-shrink: 0;
  }
</style>
