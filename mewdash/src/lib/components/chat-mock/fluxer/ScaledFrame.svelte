<!-- SPDX-License-Identifier: AGPL-3.0-or-later. Portions adapted from Fluxer (https://github.com/fluxerapp/fluxer). -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { fluxerTheme } from "./theme";

  interface Props {
    width: number;
    height: number;
    label: string;
    radius?: number;
    class?: string;
    children: Snippet;
  }

  let { width, height, label, radius = 12, class: className = "", children }: Props = $props();

  let measured = $state(0);
  const scale = $derived(measured > 0 ? `scale(${measured / width})` : `scale(calc(100cqw / ${width}px))`);
</script>

<div
  class="fx-frame relative w-full overflow-hidden select-none {className}"
  style="aspect-ratio: {width} / {height}; border-radius: {radius}px;"
  role="img"
  aria-label={label}
  bind:clientWidth={measured}
>
  <div
    class="fx-root absolute top-0 left-0 origin-top-left overflow-hidden"
    style="width: {width}px; height: {height}px; transform: {scale}; {fluxerTheme};"
    aria-hidden="true"
    inert
  >
    {@render children()}
  </div>
</div>

<style>
  @font-face {
    font-family: "Fluxer Sans";
    src: url("/assets/fonts/fluxer/FluxerSans-Regular.woff2") format("woff2");
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: "Fluxer Sans";
    src: url("/assets/fonts/fluxer/FluxerSans-Medium.woff2") format("woff2");
    font-weight: 500;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: "Fluxer Sans";
    src: url("/assets/fonts/fluxer/FluxerSans-SemiBold.woff2") format("woff2");
    font-weight: 600;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: "Fluxer Mono";
    src: url("/assets/fonts/fluxer/FluxerMono-Regular.woff2") format("woff2");
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }

  .fx-frame {
    container-type: inline-size;
  }

  .fx-root {
    background-color: var(--background-secondary);
    color: var(--text-primary);
    font-family: var(--font-sans);
    font-size: 16px;
    line-height: 1.5;
    font-optical-sizing: auto;
    font-feature-settings: normal;
    font-variation-settings: normal;
    text-align: start;
    letter-spacing: normal;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }

  :global(:where(.fx-root *, .fx-root *::before, .fx-root *::after)) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    border: 0 solid;
  }

  :global(:where(.fx-root svg, .fx-root img)) {
    display: block;
  }

  :global(:where(.fx-root strong)) {
    font-weight: 600;
  }
</style>
