<script lang="ts">
  import { m } from "$lib/i18n";
  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import Portal from "$lib/components/ui/Portal.svelte";
  import FluxerChatCompact from "$lib/components/chat-mock/FluxerChatCompact.svelte";
  import type { ChatScene } from "$lib/components/chat-mock/fluxer/types";

  interface Props {
    command: string;
    scene: ChatScene;
    onclose: () => void;
  }

  let { command, scene, onclose }: Props = $props();

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
      class="rounded-2xl border shadow-2xl w-full max-w-[600px] max-h-[90vh] flex flex-col"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30;"
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
        <div class="mx-auto w-full max-w-[520px]">
          <FluxerChatCompact {scene} label={m.public.commandsReplyLabel({ command })} width={520} />
        </div>
      </div>
    </div>
  </div>
</Portal>
