<!-- routes/commands/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { createSearchStore, searchHandler } from "$lib/stores/commandSearch";
  import { onDestroy, onMount, tick, untrack } from "svelte";
  import { fade, fly, slide } from "svelte/transition";
  import Portal from "$lib/components/ui/Portal.svelte";
  import { page } from "$app/state";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import type { Command, Module } from "$lib/types/mewdekoModules";
  import type { PageData } from "./$types";
  import ReplyModal from "./ReplyModal.svelte";
  import { PREFIX, previews } from "./previews";
  import { moduleLabel, submoduleLabel } from "./labels";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  interface Group {
    key: string;
    label: string;
    commands: Command[];
  }

  const requestedCommand = page.url.searchParams.get("command")?.toLowerCase() ?? "";
  const requestedModule = page.url.searchParams.get("module")?.toLowerCase() ?? "";

  let activeModuleName = $state(untrack(() => data.modules[0]?.Name ?? ""));
  let expanded = $state(new Set<string>());
  let openGroups = $state(new Set<string>());
  let previewing = $state<string | null>(null);
  let sheet = $state<Command | null>(null);
  let searchValue = $state("");
  let showShortcuts = $state(false);

  const searchStore = createSearchStore(untrack(() => data.modules));
  const unsubscribe = searchStore.subscribe((model) => searchHandler(model));

  const searching = $derived(searchValue.trim().length > 0);
  const searchResults = $derived(searching ? $searchStore.filtered : []);
  const searchResultCount = $derived(searchResults.reduce((count, module) => count + module.Commands.length, 0));
  const activeModule = $derived(data.modules.find((module) => module.Name === activeModuleName) ?? data.modules[0]);
  const activeGroups = $derived(activeModule ? groupsOf(activeModule) : []);

  $effect(() => {
    if (searchValue !== $searchStore.search) {
      searchStore.update((store) => ({ ...store, search: searchValue }));
    }
  });

  /** Splits a module's commands into its submodules, with the commands outside any submodule first. */
  function groupsOf(module: Module): Group[] {
    const groups = new Map<string, Group>();
    for (const command of module.Commands) {
      const key = command.Submodule ?? "";
      if (!groups.has(key)) {
        groups.set(key, { key, label: key ? submoduleLabel(key) : m.common.general(), commands: [] });
      }
      groups.get(key)!.commands.push(command);
    }
    return [...groups.values()].sort((a, b) => (a.key === "" ? -1 : b.key === "" ? 1 : a.label.localeCompare(b.label)));
  }

  function commandAnchor(name: string): string {
    return `cmd-${name.toLowerCase()}`;
  }

  /** The description as one line of plain text for the collapsed row. */
  function summary(command: Command): string {
    return command.Description.replace(/[*_`~]/g, "").replace(/\s+/g, " ").trim();
  }

  function isPhone(): boolean {
    return window.matchMedia("(max-width: 639px)").matches;
  }

  function toggleGroup(key: string) {
    const next = new Set(openGroups);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    openGroups = next;
  }

  function toggle(name: string) {
    const next = new Set(expanded);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    expanded = next;
  }

  function selectModule(name: string) {
    activeModuleName = name;
    openGroups = new Set();
    const url = new URL(location.href);
    url.searchParams.set("module", name.toLowerCase());
    url.searchParams.delete("command");
    url.hash = "";
    history.replaceState(history.state, "", url);
  }

  function linkCommand(name: string) {
    const url = new URL(location.href);
    url.searchParams.set("command", name.toLowerCase());
    url.searchParams.delete("module");
    url.hash = commandAnchor(name);
    history.replaceState(history.state, "", url);
  }

  async function openRequested() {
    const name = requestedCommand || location.hash.replace(/^#cmd-/, "");
    if (!name) {
      const module = data.modules.find((mod) => mod.Name.toLowerCase() === requestedModule);
      if (module) activeModuleName = module.Name;
      return;
    }
    const module = data.modules.find((mod) => mod.Commands.some((c) => c.CommandName.toLowerCase() === name));
    if (!module) return;
    activeModuleName = module.Name;
    expanded = new Set([name]);
    await tick();
    const command = module.Commands.find((c) => c.CommandName.toLowerCase() === name);
    openGroups = new Set([command?.Submodule ?? ""]);
    if (isPhone()) {
      sheet = command ?? null;
      return;
    }
    document.getElementById(commandAnchor(name))?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handleGlobalKeydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === "k") {
      event.preventDefault();
      document.getElementById("search")?.focus();
    }
    if (event.key === "Escape" && !previewing && sheet) {
      sheet = null;
      return;
    }
    if (event.key === "Escape" && !previewing) {
      searchValue = "";
      document.getElementById("search")?.blur();
    }
  }

  onMount(() => {
    window.addEventListener("keydown", handleGlobalKeydown);
    void openRequested();
  });

  onDestroy(() => {
    unsubscribe();
    if (typeof window !== "undefined") window.removeEventListener("keydown", handleGlobalKeydown);
  });
</script>

<svelte:head>
  <title>{m.public.commandsMewdekoCommands()}</title>
  <meta content={m.public.commandsOgTitle()} property="og:title" />
  <meta content={m.public.commandsDescription()} name="description">
  <meta content={m.public.commandsDescription()} property="og:description">
  <meta content={m.public.commandsDescription()} name="twitter:description">
</svelte:head>

{#snippet commandRow(command: Command)}
  {@const name = command.CommandName.toLowerCase()}
  {@const open = expanded.has(name)}
  <div id={commandAnchor(name)} class="scroll-mt-24">
    <button
      type="button"
      class="row-button w-full text-left px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"
      aria-expanded={open}
      onclick={() => (isPhone() ? (sheet = command) : toggle(name))}
    >
      <span class="flex items-center gap-2 sm:w-56 shrink-0 min-w-0">
        <i class="fa-solid fa-chevron-right text-[10px] transition-transform {open ? 'rotate-90' : ''}"
           style="color: {$colorStore.muted};" aria-hidden="true"></i>
        <span class="font-mono text-sm font-semibold truncate" style="color: {$colorStore.text};">{PREFIX}{name}</span>
        {#if previews[name]}
          <i class="fa-solid fa-comment text-[10px] shrink-0" style="color: {$colorStore.muted};"
             title={m.public.commandsShowReply()} aria-hidden="true"></i>
        {/if}
      </span>
      {#if !open}
        <span class="text-sm min-w-0 flex-1 line-clamp-1 pl-5 sm:pl-0" style="color: {$colorStore.muted};">
          {summary(command)}
        </span>
      {/if}
    </button>

    {#if open}
      <div class="px-4 pb-4 pl-9" transition:slide={{ duration: 150 }}>
        {@render details(command)}
      </div>
    {/if}
  </div>
{/snippet}

{#snippet details(command: Command)}
  {@const name = command.CommandName.toLowerCase()}
      <div class="space-y-3">
        <div class="text-sm leading-relaxed prose prose-sm max-w-none overflow-x-auto" style="color: {$colorStore.text};">
          {@html command.HtmlDescription ?? command.Description}
        </div>

        {#if command.Example?.length}
          <div class="space-y-1.5">
            {#each command.Example as example}
              <code class="block text-xs p-2 border rounded-lg font-mono whitespace-pre-wrap break-all"
                    style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}25; color: {$colorStore.text};">
                {example}
              </code>
            {/each}
          </div>
        {/if}

        {#if command.GuildUserPermissions || command.ChannelUserPermissions || command.GuildBotPermissions || command.ChannelBotPermissions}
          <dl class="text-xs grid grid-cols-[auto_1fr] gap-x-3 gap-y-1" style="color: {$colorStore.muted};">
            {#if command.GuildUserPermissions}
              <dt class="font-semibold" style="color: {$colorStore.text};">{m.public.commandsUserServer()}</dt>
              <dd class="break-words">{command.GuildUserPermissions}</dd>
            {/if}
            {#if command.ChannelUserPermissions}
              <dt class="font-semibold" style="color: {$colorStore.text};">{m.public.commandsUserChannel()}</dt>
              <dd class="break-words">{command.ChannelUserPermissions}</dd>
            {/if}
            {#if command.GuildBotPermissions}
              <dt class="font-semibold" style="color: {$colorStore.text};">{m.public.commandsBotServer()}</dt>
              <dd class="break-words">{command.GuildBotPermissions}</dd>
            {/if}
            {#if command.ChannelBotPermissions}
              <dt class="font-semibold" style="color: {$colorStore.text};">{m.public.commandsBotChannel()}</dt>
              <dd class="break-words">{command.ChannelBotPermissions}</dd>
            {/if}
          </dl>
        {/if}

        <div class="flex flex-wrap gap-2">
          {#if previews[name]}
            <button type="button"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-opacity hover:opacity-80"
                    style="background: {$colorStore.primary}15; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                    onclick={() => (previewing = name)}>
              <i class="fa-solid fa-comment" aria-hidden="true"></i>
              {m.public.commandsShowReply()}
            </button>
          {/if}
          <a href="?command={name}#{commandAnchor(name)}"
             class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-opacity hover:opacity-80"
             style="color: {$colorStore.muted}; border: 1px solid {$colorStore.primary}20;"
             onclick={(event) => { event.preventDefault(); linkCommand(name); }}>
            <i class="fa-solid fa-link" aria-hidden="true"></i>
            {m.public.commandsLinkToThisCommand()}
          </a>
        </div>
      </div>
{/snippet}

{#snippet group(key: string, label: string, commands: Command[], collapsible: boolean)}
  {@const collapsed = collapsible && !openGroups.has(key)}
  <section class="rounded-xl border overflow-hidden"
           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}25; --row-divider: {$colorStore.primary}15;">
    <h3>
      <button type="button"
              class="group-button w-full flex items-center gap-3 px-4 py-3 text-left"
              style="background: {$colorStore.primary}12; color: {$colorStore.text};"
              aria-expanded={!collapsed}
              disabled={!collapsible}
              onclick={() => toggleGroup(key)}>
        <span class="flex-1 font-semibold">{label}</span>
        <span class="text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}20; color: {$colorStore.muted};">{commands.length}</span>
        {#if collapsible}
          <i class="fa-solid fa-chevron-down text-xs transition-transform {collapsed ? '' : 'rotate-180'}"
             style="color: {$colorStore.muted};" aria-hidden="true"></i>
        {/if}
      </button>
    </h3>
    {#if !collapsed}
      <div class="rows border-t" style="border-color: {$colorStore.primary}20;" transition:slide={{ duration: 150 }}>
        {#each commands as command (command.CommandName)}
          {@render commandRow(command)}
        {/each}
      </div>
    {/if}
  </section>
{/snippet}

<main
  class="min-h-screen"
  style="--color-primary: {$colorStore.primary};
         --color-secondary: {$colorStore.secondary};
         --color-accent: {$colorStore.accent};
         --color-text: {$colorStore.text};
         --color-muted: {$colorStore.muted};"
>
  <div class="py-4 border-b" style="border-color: {$colorStore.primary}20;">
    <div class="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 class="text-lg lg:text-xl font-bold mb-1" in:fade={{ duration: 300 }} style="color: {$colorStore.text};">
            {m.common.commandReference()}
          </h1>
          <p class="text-sm opacity-80" style="color: {$colorStore.text};">
            {m.public.commandsExploreAllAvailableCommandsAnd()}
          </p>
        </div>
        <div class="shrink-0 lg:max-w-md lg:w-full">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <i class="fa-solid fa-magnifying-glass" style="color: {$colorStore.muted}; font-size: 20px;"></i>
            </div>
            <input
              aria-label={m.public.commandsSearchCommandsAndModules()}
              bind:value={searchValue}
              class="block w-full pl-12 pr-12 py-2 sm:py-3 rounded-xl transition-all duration-300 focus:ring-2 focus:outline-hidden"
              id="search"
              onblur={() => setTimeout(() => (showShortcuts = false), 100)}
              onfocus={() => (showShortcuts = true)}
              placeholder={m.public.commandsSearchModulesOrCommands()}
              style="background: {$colorStore.primary}20;
                     color: {$colorStore.text};
                     border: 1px solid {$colorStore.primary}30;
                     --tw-ring-color: {$colorStore.accent};"
              type="search"
            >
            {#if searchValue}
              <button aria-label={m.common.ariaClearSearch()}
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-sm transition-colors duration-200 hover:opacity-70"
                style="color: {$colorStore.muted};"
                onclick={() => (searchValue = "")}
              ><i class="fa-solid fa-xmark" style="font-size: 16px;"></i></button>
            {:else if showShortcuts}
              <div class="absolute inset-y-0 right-0 pr-4 flex items-center text-xs" style="color: {$colorStore.muted};">
                <kbd class="px-2 py-1 rounded-sm border"
                     style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30;">Ctrl+K</kbd>
              </div>
            {/if}
          </div>

          {#if searching}
            <div class="mt-2 text-sm" style="color: {$colorStore.muted};" in:fade={{ duration: 200 }}>
              {#if searchResultCount > 0}
                {m.public.commandsShowingCounts({
                  commands: searchResultCount === 1 ? m.public.commandsCountOne({ count: searchResultCount }) : m.public.commandsCountOther({ count: searchResultCount }),
                  modules: searchResults.length === 1 ? m.public.commandsModuleCountOne({ count: searchResults.length }) : m.public.commandsModuleCountOther({ count: searchResults.length })
                })}
              {:else}
                {m.public.commandsNoCommandsFor({ query: searchValue })}
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <div class="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
    {#if searching}
      {#if searchResults.length === 0}
        <div class="text-center max-w-md mx-auto py-16" in:fade={{ duration: 200 }}>
          <h3 class="text-xl font-bold mb-2" style="color: {$colorStore.text};">{m.public.commandsNoCommandsFound()}</h3>
          <p class="mb-4" style="color: {$colorStore.muted};">{m.placeholders.pageNoResults({ query: searchValue })}</p>
          <p class="text-sm mb-2" style="color: {$colorStore.muted};">{m.public.commandsTrySearchingFor()}</p>
          <div class="flex flex-wrap gap-2 justify-center">
            {#each [m.public.commandsMusic(), m.public.commandsModeration(), m.public.commandsFun()] as suggestion}
              <button class="px-3 py-1 rounded-full text-sm"
                      style="background: {$colorStore.primary}20; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
                      onclick={() => (searchValue = suggestion)}>{suggestion}</button>
            {/each}
          </div>
        </div>
      {:else}
        <div class="space-y-3 max-w-4xl">
          {#each searchResults as module (module.Name)}
            {@render group(module.Name, moduleLabel(module.Name), module.Commands, false)}
          {/each}
        </div>
      {/if}
    {:else}
      <div class="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
        <nav class="hidden lg:block" aria-label={m.public.commandsCommandModules()}>
          <div class="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1 space-y-0.5">
            {#each data.modules as module (module.Name)}
              {@const active = module.Name === activeModule?.Name}
              <button type="button"
                      class="module-button w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-sm text-left"
                      style="{active ? `background: ${$colorStore.primary}20; color: ${$colorStore.text};` : `color: ${$colorStore.muted};`}"
                      aria-current={active ? "page" : undefined}
                      onclick={() => selectModule(module.Name)}>
                <span class="truncate">{moduleLabel(module.Name)}</span>
                <span class="text-xs shrink-0" style="color: {$colorStore.muted};">{module.Commands.length}</span>
              </button>
            {/each}
          </div>
        </nav>

        <div class="lg:hidden mb-5">
          <DiscordSelector
            type="custom"
            id="module-select"
            options={data.modules.map((module) => ({
              id: module.Name,
              name: m.public.commandsModuleOption({ module: moduleLabel(module.Name), count: module.Commands.length })
            }))}
            selected={activeModule?.Name}
            ariaLabel={m.public.commandsSelectModule()}
            onchange={(e) => { if (typeof e.selected === "string") selectModule(e.selected); }}
          />
        </div>

        {#if activeModule}
          <div class="min-w-0 space-y-3" in:fade={{ duration: 150 }}>
            <div class="pb-2">
              <h2 class="text-2xl font-bold" style="color: {$colorStore.text};">{moduleLabel(activeModule.Name)}</h2>
              <p class="text-sm" style="color: {$colorStore.muted};">
                {m.public.commandsAvailable({ count: activeModule.Commands.length })}
              </p>
            </div>
            {#each activeGroups as entry (entry.key)}
              {@render group(entry.key, entry.label, entry.commands, activeGroups.length > 1)}
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</main>

{#if sheet}
  {@const sheetName = sheet.CommandName.toLowerCase()}
  <Portal>
    <div class="fixed inset-0 z-40 flex items-end sm:hidden backdrop-blur-md"
         onclick={(e) => { if (e.target === e.currentTarget) sheet = null; }}
         role="presentation"
         transition:fade={{ duration: 150 }}>
      <div class="w-full max-h-[85vh] overflow-y-auto rounded-t-2xl border-t p-4 pb-8"
           style="background: {$colorStore.background}; border-color: {$colorStore.primary}20;
                  --color-primary: {$colorStore.primary}; --color-text: {$colorStore.text};"
           role="dialog"
           aria-modal="true"
           aria-labelledby="sheet-title"
           transition:fly={{ y: 300, duration: 200 }}>
        <div class="mx-auto mb-3 h-1 w-10 rounded-full" style="background: {$colorStore.muted}60;"></div>
        <div class="flex items-center justify-between gap-3 mb-3">
          <h2 id="sheet-title" class="font-mono text-lg font-semibold break-all" style="color: {$colorStore.text};">{PREFIX}{sheetName}</h2>
          <button type="button" aria-label={m.public.commandsReplyClose()}
                  class="p-2 rounded-lg shrink-0"
                  style="background: {$colorStore.primary}10; color: {$colorStore.muted};"
                  onclick={() => (sheet = null)}><i class="fa-solid fa-xmark"></i></button>
        </div>
        {@render details(sheet)}
      </div>
    </div>
  </Portal>
{/if}

{#if previewing && previews[previewing]}
  <ReplyModal name={previewing} scene={previews[previewing]} onclose={() => (previewing = null)} />
{/if}

<style lang="postcss">
  @reference '../../app.css';

  .rows > :global(* + *) {
    border-top: 1px solid var(--row-divider);
  }

  .group-button:disabled {
    cursor: default;
  }

  .group-button:not(:disabled):hover,
  .row-button:hover,
  .module-button:hover,
  .row-button:active {
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  }

  .row-button:focus-visible,
  .module-button:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: -2px;
  }

  :global(.prose) code {
    background: color-mix(in srgb, var(--color-primary) 15%, transparent);
    color: var(--color-text);
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
  }

  :global(.prose strong) {
    color: var(--color-text);
    font-weight: 600;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
</style>
