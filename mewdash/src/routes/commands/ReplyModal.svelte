<script lang="ts">
  import { m } from "$lib/i18n";
  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import Portal from "$lib/components/ui/Portal.svelte";
  import FluxerChatCompact from "$lib/components/chat-mock/FluxerChatCompact.svelte";
  import type { ChatScene } from "$lib/components/chat-mock/fluxer/types";
  import { PREFIX, asSlashCommand, asTextCommand } from "./previews";

  interface Props {
    name: string;
    scene: ChatScene;
    onclose: () => void;
  }

  let { name, scene, onclose }: Props = $props();

  /** Whether Fluxer has shipped slash commands; until then the slash previews stay greyed out. */
  const SLASH_COMMANDS_LIVE = false;

  let slashMode = $state(false);
  const command = $derived(slashMode ? `/${name}` : `${PREFIX}${name}`);
  const preview = $derived(slashMode ? asSlashCommand(scene, name) : asTextCommand(scene));

  /** Switches the preview between text and slash commands and remembers the choice. */
  function setSlashMode(value: boolean) {
    if (!SLASH_COMMANDS_LIVE) return;
    slashMode = value;
    try {
      localStorage.setItem("commands-reply-style", value ? "slash" : "text");
    } catch {
      return;
    }
  }

  $effect(() => {
    if (!SLASH_COMMANDS_LIVE) return;
    try {
      slashMode = localStorage.getItem("commands-reply-style") === "slash";
    } catch {
      slashMode = false;
    }
  });

  let dialogEl = $state<HTMLElement>();

  /** Closes on Escape and hands focus back to the button that opened the dialog. */
  $effect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => dialogEl?.focus());
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onclose();
      }
    };
    window.addEventListener("keydown", onKeydown);
    return () => {
      window.removeEventListener("keydown", onKeydown);
      previouslyFocused?.focus?.();
    };
  });
</script>

<Portal>
  <div
    class="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4"
    onclick={(e) => { if (e.target === e.currentTarget) onclose(); }}
    role="presentation"
  >
    <div
      bind:this={dialogEl}
      class="rounded-2xl border w-full max-w-[600px] max-h-[90vh] flex flex-col"
      style="background: {$colorStore.background}; border-color: {$colorStore.primary}20;"
      in:fly={{ y: 20, duration: 200 }}
      out:fly={{ y: -20, duration: 150 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reply-title"
      tabindex="-1"
    >
      <div class="flex items-center justify-between p-4 sm:p-5 border-b" style="border-color: {$colorStore.primary}20;">
        <h2 id="reply-title" class="text-lg font-semibold font-mono" style="color: {$colorStore.text}">{command}</h2>
        <button type="button" aria-label={m.public.commandsReplyClose()}
          class="p-2 rounded-lg transition-colors hover:opacity-70"
          style="background: {$colorStore.primary}10; color: {$colorStore.muted}"
          onclick={onclose}
        ><i class="fa-solid fa-xmark" style="font-size: 16px;"></i></button>
      </div>
      <div class="p-4 sm:p-5 overflow-y-auto">
        <div class="mx-auto w-full max-w-[520px] space-y-3">
          <div class="inline-flex rounded-lg border p-0.5 text-xs" style="border-color: {$colorStore.primary}20;"
               role="group" aria-label={m.public.commandsReplyStyle()}>
            <button type="button" aria-pressed={!slashMode}
              class="px-3 py-1.5 rounded-md cursor-pointer transition-colors"
              style="background: {slashMode ? 'transparent' : `${$colorStore.primary}20`}; color: {slashMode ? $colorStore.muted : $colorStore.text};"
              onclick={() => setSlashMode(false)}>{m.public.commandsReplyStyleText()}</button>
            <button type="button" aria-pressed={slashMode} disabled={!SLASH_COMMANDS_LIVE}
              title={SLASH_COMMANDS_LIVE ? undefined : m.public.commandsReplyStyleSlashSoon()}
              class="px-3 py-1.5 rounded-md transition-colors {SLASH_COMMANDS_LIVE ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'}"
              style="background: {slashMode ? `${$colorStore.primary}20` : 'transparent'}; color: {slashMode ? $colorStore.text : $colorStore.muted};"
              onclick={() => setSlashMode(true)}>{m.public.commandsReplyStyleSlash()}</button>
          </div>
          <FluxerChatCompact scene={preview} label={m.public.commandsReplyLabel({ command })} width={520} />
        </div>
      </div>
    </div>
  </div>
</Portal>
