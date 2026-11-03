<!-- SPDX-License-Identifier: AGPL-3.0-or-later. Portions adapted from Fluxer (https://github.com/fluxerapp/fluxer). -->
<script lang="ts">
  let { text }: { text: string } = $props();
</script>

<code class="inline">{text}</code>

<style>
  .inline {
    display: inline;
    direction: ltr;
    unicode-bidi: isolate;
    box-sizing: border-box;
    max-width: 100%;
    font-family: var(--font-mono);
    font-feature-settings: normal;
    font-variation-settings: normal;
    font-size: 85%;
    line-height: inherit;
    padding-inline: 0.25em;
    padding-block: 0;
    margin: 0;
    border-radius: 4px;
    border: 0;
    box-shadow: inset 0 0 0 1px var(--code-block-border);
    color: var(--text-code);
    background-color: var(--bg-code);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    vertical-align: baseline;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }
</style>
