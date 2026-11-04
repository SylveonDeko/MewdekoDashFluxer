<script lang="ts">
  import Markup from "./Markup.svelte";
  import type { ChatComponentRow } from "./types";

  let { rows }: { rows: ChatComponentRow[] } = $props();
</script>

<div class="components">
  {#each rows as row, r (r)}
    {#if "select" in row}
      <div class="select" class:disabled={row.select.disabled}>
        <span class="selectText">{row.select.placeholder}</span>
        <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M5.3 9.3a1 1 0 0 1 1.4 0l5.3 5.29 5.3-5.3a1 1 0 1 1 1.4 1.42l-6 6a1 1 0 0 1-1.4 0l-6-6a1 1 0 0 1 0-1.42Z" />
        </svg>
      </div>
    {:else}
      <div class="row">
        {#each row.buttons as button, b (b)}
          <span class="button {button.style}" class:disabled={button.disabled}>
            {#if button.emoji}<span class="emoji"><Markup text={button.emoji} inline /></span>{/if}
            {#if button.label}<span class="label">{button.label}</span>{/if}
            {#if button.style === "link"}
              <svg class="external" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M15 2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0V4.41l-7.3 7.3a1 1 0 1 1-1.4-1.42L19.58 3H16a1 1 0 0 1-1-1Z" />
                <path fill="currentColor" d="M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a1 1 0 1 0-2 0v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6a1 1 0 1 0 0-2H5Z" />
              </svg>
            {/if}
          </span>
        {/each}
      </div>
    {/if}
  {/each}
</div>

<style>
  .components {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    max-width: 516px;
    padding-block: 4px 2px;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-width: 60px;
    height: 32px;
    padding: 2px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    line-height: 16px;
    color: #fff;
    white-space: nowrap;
    user-select: none;
  }

  .primary {
    background: var(--brand-primary);
  }

  .secondary,
  .link {
    background: hsl(228, 6%, 33%);
  }

  .success {
    background: hsl(141, 56%, 32%);
  }

  .danger {
    background: hsl(358, 70%, 52%);
  }

  .disabled {
    opacity: 0.5;
  }

  .emoji {
    display: inline-flex;
    font-size: 18px;
    line-height: 1;
  }

  .external {
    width: 16px;
    height: 16px;
  }

  .select {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
    min-height: 40px;
    padding: 8px 8px 8px 12px;
    border-radius: 8px;
    border: 1px solid hsl(228, 6%, 22%);
    background: hsl(228, 7%, 12%);
    color: var(--text-primary-muted);
    font-size: 14px;
  }

  .selectText {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chevron {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }
</style>
