<!-- routes/dashboard/embedbuilder/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import type { PageData } from "./$types";
  import { onDestroy, onMount, untrack } from "svelte";
  import { get } from "svelte/store";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { embedsApi } from "$lib/api/index.ts";
  import type {
    EmbedPersona,
    SavedEmbed,
    SendableChannel,
    SendEmbedResult
  } from "$lib/api/embeds/models";
  import { fade } from "svelte/transition";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { logger } from "$lib/logger.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";

  import TemplateGallery from "$lib/components/specialized/TemplateGallery.svelte";
  import EmbedEditor from "$lib/components/specialized/EmbedEditor.svelte";
  import ComponentEditor from "$lib/components/specialized/ComponentEditor.svelte";
  import PlaceholderPicker from "$lib/components/forms/PlaceholderPicker.svelte";
  import ImagePlaceholderChip from "$lib/components/specialized/ImagePlaceholderChip.svelte";
  import { newImagePlaceholder, removePlaceholder } from "$lib/utils/imagePlaceholders";
  import PersonaManager from "$lib/components/specialized/PersonaManager.svelte";
  import ValidationCard from "$lib/components/specialized/ValidationCard.svelte";
  import PreviewCard from "$lib/components/specialized/PreviewCard.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import JsonTab from "./components/JsonTab.svelte";
  import SavedTab from "./components/SavedTab.svelte";
  import SendTab from "./components/SendTab.svelte";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  interface Author {
    name: string;
    url: string;
    icon_url: string;
  }

  interface Thumbnail {
    url: string;
  }

  interface Image {
    url: string;
  }

  interface Footer {
    text: string;
    icon_url: string;
  }

  interface Field {
    name: string;
    value: string;
    inline: boolean;
    id: number;
  }

  interface Embed {
    title: string;
    description: string;
    color: string;
    url: string;
    author: Author;
    thumbnail: Thumbnail;
    image: Image;
    footer: Footer;
    fields: Field[];
  }

  interface NewEmbedComponent {
    componentKey: string;
    rowIndex: number;
    displayName: string;
    style: number;
    url: string;
    emoji: string;
  }

  interface ComponentRow {
    componentKey: string;
    rowKey: string;
    components: NewEmbedComponent[];
  }


  interface Placeholder {
    category: string;
    name: string;
    description: string;
  }

  // State management
    let embeds: Embed[] = $state([{
    title: "",
    description: "",
    color: "#5865F2",
    url: "",
    author: { name: "", url: "", icon_url: "" },
    thumbnail: { url: "" },
    image: { url: "" },
    footer: { text: "", icon_url: "" },
    fields: []
    }]);

    let content = $state("");
  let componentRows: ComponentRow[] = $state([]);


  // Main navigation state
  const TAB_IDS = ["templates", "editor", "components", "json", "saved", "send"];
  const activeMainTab = $derived(
    TAB_IDS.find(id => id === page.url.searchParams.get("tab")) ?? "templates"
  );

  function selectTab(id: string) {
    if (id === activeMainTab) return;
    const url = new URL(page.url);
    url.searchParams.set("tab", id);
    void goto(url, { replaceState: true, noScroll: true, keepFocus: true });
  }

  let contentImageToken: string | null = $state(null);
  let lastCheckedContent = "";

  $effect(() => {
    lastCheckedContent = content;
  });

  function checkContentImage(next: string) {
    const token = newImagePlaceholder(lastCheckedContent, next);
    if (token) {
      contentImageToken = token;
    } else if (contentImageToken && !next.includes(contentImageToken)) {
      contentImageToken = null;
    }
  }

  function moveContentImage(mediaField: "thumbnail" | "image") {
    const token = contentImageToken;
    if (!token) return;
    if (embeds.length === 0) addEmbed();
    if (embeds.length === 0) return;
    embeds[0] = { ...embeds[0], [mediaField]: { url: token } };
    embeds = [...embeds];
    content = removePlaceholder(content, token);
    contentImageToken = null;
  }

  // UI state
    let showNotification = $state(false);
    let notificationMessage = $state("");
    let notificationType: "success" | "error" = $state("success");
    let jsonCopied = $state(false);

  // Placeholder picker state
    let showPlaceholderPicker = $state(false);
    let placeholderPosition = $state({x: 0, y: 0});
    let placeholderSearchTerm = $state("");
  let currentEditingElement: HTMLInputElement | HTMLTextAreaElement | null = null;
  let currentEditingField: string | null = null;

    let editingComponent: NewEmbedComponent | null = $state(null);

  let draggedComponent: NewEmbedComponent | null = $state(null);
  let draggedFromRow: string | null = $state(null);
  let dragOverRow: string | null = $state(null);
  let dragOverIndex: number = $state(-1);
  let isDragging = $state(false);

  let draggedRow: ComponentRow | null = $state(null);
  let dragOverRowIndex: number = $state(-1);
  let isDraggingRow = $state(false);

  // Validation state
    let validationErrors: any[] = $state([]);
    let validationWarnings: any[] = $state([]);

  // JSON tab state
  let jsonText = $state("");
  let jsonParseError = $state("");
  let editHistory = $state<string[]>([]);
  let historyIndex = $state(-1);
  let initialSnapshot = $state("");
  let historyReady = $state(false);
  let restoringHistory = false;
  let historyDebounce: ReturnType<typeof setTimeout> | null = null;

  // Saved embeds state
  let savedUserEmbeds: SavedEmbed[] = $state([]);
  let savedGuildEmbeds: SavedEmbed[] = $state([]);
  let loadingSavedEmbeds = $state(false);
  let saveEmbedName = $state("");
  let saveAsGuildShared = $state(false);
  let savingEmbed = $state(false);
  let showDeleteConfirm = $state(false);
  let showOverwriteConfirm = $state(false);
  let embedPendingOverwrite: SavedEmbed | null = $state(null);
  let embedPendingDelete: SavedEmbed | null = $state(null);
  let openSavedEmbed: SavedEmbed | null = $state(null);

  // Send tab state
  let sendChannels: SendableChannel[] = $state([]);
  let loadingSendChannels = $state(false);
  let sendChannelsError = $state("");
  let selectedSendChannelId: string | null = $state(null);
  let sendAsWebhook = $state(false);
  let webhookUsername = $state("");
  let webhookAvatarUrl = $state("");

  // Saved "send as" personas
  let personas: EmbedPersona[] = $state([]);
  let loadingPersonas = $state(false);
  let selectedPersonaId: number | null = $state(null);
  let showPersonaManager = $state(false);
  let sending = $state(false);
  let lastSendResult: SendEmbedResult | null = $state(null);
  let showSendConfirm = $state(false);

  // Main tab configuration for DashboardPageLayout
  const tabs = $derived([
    { id: "templates", label: m.common.templates(), icon: "fa-sparkles" },
    { id: "editor", label: m.common.editor(), icon: "fa-layer-group" },
    { id: "components", label: m.embedbuilder.tabComponents(), icon: "fa-comment" },
    { id: "json", label: m.embedbuilder.tabJson(), icon: "fa-code" },
    { id: "saved", label: m.common.saved(), icon: "fa-floppy-disk" },
    { id: "send", label: m.common.send(), icon: "fa-paper-plane" }
  ]);


  // Notification helper
  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  // Component initialization
  onMount(() => {
    validateEmbeds();
    validateComponents();
    queueMicrotask(() => {
      initialSnapshot = serializeDraft();
      editHistory = [initialSnapshot];
      historyIndex = 0;
      historyReady = true;
    });
    if (data.user?.id) {
      loadSavedEmbeds();
    }
  });

  onDestroy(() => {
    if (isDragging || isDraggingRow) {
      unlockBodyScroll();
    }
  });

  // Load saved embeds (personal for the current user, plus guild-shared if a guild is selected)
  async function loadSavedEmbeds(guildId?: bigint) {
    loadingSavedEmbeds = true;
    try {
      if (data.user?.id) {
        savedUserEmbeds = await embedsApi.getUserEmbeds(data.user.id);
      }
      savedGuildEmbeds = guildId ? await embedsApi.getGuildEmbeds(guildId) : [];
    } catch (error) {
      logger.error('Failed to load saved embeds:', error);
      showNotificationMessage(m.embedbuilder.fullscreenNotifyLoadSavedFailed(), "error");
    } finally {
      loadingSavedEmbeds = false;
    }
  }

  // Builds the export payload shared by JSON copy/preview and saved-embed persistence
  function buildExportData() {
    const cleanedEmbeds = embeds
      .map(cleanEmbed)
      .filter((cleaned: any) => !!(cleaned.title || cleaned.description || cleaned.fields?.length || cleaned.image ||
        cleaned.thumbnail || cleaned.author?.name || cleaned.footer?.text));

    const exportData: any = {};

    if (content.trim()) {
      exportData.content = content.trim();
    }

    if (cleanedEmbeds.length > 0) {
      exportData.embeds = cleanedEmbeds;
    }

    if (componentRows.length > 0) {
      const cleanedComponents: any[] = [];
      componentRows.forEach(row => {
        row.components.forEach(component => {
          cleanedComponents.push(cleanComponent(component));
        });
      });

      if (cleanedComponents.length > 0) {
        exportData.components = cleanedComponents;
      }
    }

    return exportData;
  }

  function serializeDraft(): string {
    const output = buildExportData();
    return Object.keys(output).length === 0 ? "" : JSON.stringify(output);
  }

  function restoreSnapshot(snapshot: string) {
    if (historyDebounce) clearTimeout(historyDebounce);
    restoringHistory = true;
    applyImportedJson(snapshot || "{}", false);
    queueMicrotask(() => {
      restoringHistory = false;
    });
  }

  function undo() {
    if (historyIndex <= 0) return;
    historyIndex -= 1;
    restoreSnapshot(editHistory[historyIndex]);
  }

  function redo() {
    if (historyIndex >= editHistory.length - 1) return;
    historyIndex += 1;
    restoreSnapshot(editHistory[historyIndex]);
  }

  function cancelEdits() {
    restoreSnapshot(initialSnapshot);
    historyIndex = 0;
  }

  $effect(() => {
    JSON.stringify({ content, embeds, componentRows });

    if (!historyReady || restoringHistory) return;

    if (historyDebounce) clearTimeout(historyDebounce);
    historyDebounce = setTimeout(() => {
      const snapshot = serializeDraft();
      if (snapshot === editHistory[historyIndex]) return;

      const nextHistory = [...editHistory.slice(0, historyIndex + 1), snapshot].slice(-50);
      editHistory = nextHistory;
      historyIndex = nextHistory.length - 1;
    }, 350);
  });

  // Refreshes the editable JSON textarea from the current builder state
  function refreshJsonPreview() {
    jsonText = JSON.stringify(buildExportData(), null, 2);
    jsonParseError = "";
  }

  // Parses embed JSON (either { content, embeds, components } or a bare embed) and loads it into the builder
  function applyImportedJson(text: string, notify = true) {
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      jsonParseError = m.embedbuilder.fullscreenJsonParseError();
      if (notify) showNotificationMessage(m.embedbuilder.fullscreenNotifyJsonInvalid(), "error");
      return;
    }

    // Allow pasting a bare embed object as well as the full { content, embeds, components } shape
    const isFullPayload = "content" in parsed || "embeds" in parsed || "components" in parsed;
    const parsedEmbeds = isFullPayload ? parsed.embeds : [parsed];

    content = isFullPayload && parsed.content ? String(parsed.content) : "";

    if (Array.isArray(parsedEmbeds) && parsedEmbeds.length > 0) {
      embeds = parsedEmbeds.map((e: any) => ({
        title: e.title ?? "",
        description: e.description ?? "",
        color: e.color ?? "#5865F2",
        url: e.url ?? "",
        author: { name: e.author?.name ?? "", url: e.author?.url ?? "", icon_url: e.author?.icon_url ?? "" },
        thumbnail: { url: e.thumbnail?.url ?? "" },
        image: { url: e.image?.url ?? "" },
        footer: { text: e.footer?.text ?? "", icon_url: e.footer?.icon_url ?? "" },
        fields: (e.fields ?? []).map((f: any, fieldIndex: number) => ({
          name: f.name ?? "",
          value: f.value ?? "",
          inline: !!f.inline,
          id: typeof f.id === "number" ? f.id : Date.now() + fieldIndex
        }))
      }));
    } else {
      embeds = [{
        title: "", description: "", color: "#5865F2", url: "",
        author: { name: "", url: "", icon_url: "" },
        thumbnail: { url: "" }, image: { url: "" },
        footer: { text: "", icon_url: "" }, fields: []
      }];
    }

    if (isFullPayload && Array.isArray(parsed.components) && parsed.components.length > 0) {
      const rowsByIndex = new Map<number, ComponentRow>();
      parsed.components.forEach((c: any, componentIndex: number) => {
        if (c.isSelect || c.style !== 5) return;
        const rowIndex = typeof c.row === "number" ? c.row : 0;
        let row = rowsByIndex.get(rowIndex);
        if (!row) {
          const rowKey = `row-${Date.now()}-${rowIndex}-${Math.random().toString(36).substr(2, 9)}`;
          row = { componentKey: rowKey, rowKey, components: [] };
          rowsByIndex.set(rowIndex, row);
        }

        row.components.push({
          componentKey: `comp-${Date.now()}-${componentIndex}-${Math.random().toString(36).substr(2, 9)}`,
          rowIndex,
          displayName: c.displayName ?? "",
          style: 5,
          url: c.url ?? "",
          emoji: c.emoji ?? ""
        });
      });

      componentRows = Array.from(rowsByIndex.keys())
        .sort((a, b) => a - b)
        .map(key => rowsByIndex.get(key)!);
    } else {
      componentRows = [];
    }

    jsonParseError = "";
    validateEmbeds();
    validateComponents();
    if (notify) {
      showNotificationMessage(m.embedbuilder.fullscreenNotifyJsonApplied());
      selectTab("editor");
    }
  }

  function applyJsonText() {
    applyImportedJson(jsonText);
  }

  // Saves the current builder state as a reusable embed template
  async function saveCurrentEmbed() {
    if (!data.user?.id) {
      showNotificationMessage(m.embedbuilder.fullscreenNotifyLoginRequired(), "error");
      return;
    }

    const name = saveEmbedName.trim();
    if (!name) {
      showNotificationMessage(m.embedbuilder.fullscreenNotifyNameRequired(), "error");
      return;
    }

    const exportData = buildExportData();
    if (Object.keys(exportData).length === 0) {
      showNotificationMessage(m.embedbuilder.fullscreenNotifyNothingToSave(), "error");
      return;
    }

    const guild = get(currentGuild);
    const guildId = guild ? BigInt(guild.id) : undefined;

    if (saveAsGuildShared && !guildId) {
      showNotificationMessage(m.embedbuilder.pageNotifyServerForShared(), "error");
      return;
    }

    savingEmbed = true;
    try {
      openSavedEmbed = await embedsApi.createEmbed({
        userId: data.user.id,
        guildId: saveAsGuildShared ? guildId : undefined,
        embedName: name,
        jsonCode: JSON.stringify(exportData),
        isGuildShared: saveAsGuildShared
      }) ?? null;

      showNotificationMessage(m.embedbuilder.fullscreenNotifySavedNamed({ name }));
      saveEmbedName = "";
      await loadSavedEmbeds(guildId);
    } catch (error) {
      logger.error('Failed to save embed:', error);
      showNotificationMessage(m.embedbuilder.fullscreenNotifySaveFailed(), "error");
    } finally {
      savingEmbed = false;
    }
  }

  function loadSavedEmbed(saved: SavedEmbed) {
    applyImportedJson(saved.jsonCode);
    openSavedEmbed = saved;
    showNotificationMessage(m.embedbuilder.fullscreenNotifyLoadedNamed({ name: saved.embedName ?? m.embedbuilder.fullscreenSavedNameFallback() }));
    selectTab("editor");
  }

  function requestOverwriteSavedEmbed(saved: SavedEmbed) {
    embedPendingOverwrite = saved;
    showOverwriteConfirm = true;
  }

  async function confirmOverwriteSavedEmbed() {
    const saved = embedPendingOverwrite;
    embedPendingOverwrite = null;
    await writeSavedEmbed(saved);
  }

  async function writeSavedEmbed(saved: SavedEmbed | null) {
    if (!saved || !data.user?.id) return;

    const exportData = buildExportData();
    if (Object.keys(exportData).length === 0) {
      showNotificationMessage(m.embedbuilder.fullscreenNotifyNothingToSave(), "error");
      return;
    }

    savingEmbed = true;
    try {
      await embedsApi.updateEmbed(saved.id, {
        userId: data.user.id,
        jsonCode: JSON.stringify(exportData)
      });
      openSavedEmbed = saved;
      showNotificationMessage(m.embedbuilder.fullscreenNotifySavedNamed({ name: saved.embedName ?? m.embedbuilder.fullscreenSavedNameFallback() }));
      const guild = get(currentGuild);
      await loadSavedEmbeds(guild ? BigInt(guild.id) : undefined);
    } catch (error) {
      logger.error("Failed to overwrite embed:", error);
      showNotificationMessage(m.embedbuilder.fullscreenNotifySaveFailed(), "error");
    } finally {
      savingEmbed = false;
    }
  }

  function requestDeleteSavedEmbed(saved: SavedEmbed) {
    embedPendingDelete = saved;
    showDeleteConfirm = true;
  }

  async function confirmDeleteSavedEmbed() {
    const saved = embedPendingDelete;
    embedPendingDelete = null;
    if (!saved || !data.user?.id) return;

    try {
      await embedsApi.deleteEmbed(saved.id, data.user.id);
      if (openSavedEmbed?.id === saved.id) openSavedEmbed = null;
      showNotificationMessage(m.embedbuilder.personaDeleted({ name: saved.embedName ?? m.embedbuilder.fullscreenSavedNameFallback() }));
      const guild = get(currentGuild);
      await loadSavedEmbeds(guild ? BigInt(guild.id) : undefined);
    } catch (error) {
      logger.error('Failed to delete embed:', error);
      showNotificationMessage(m.embedbuilder.fullscreenNotifyDeleteFailed(), "error");
    }
  }

  /**
   * Loads the channels the logged-in user can actually see in the current guild. The bot resolves the
   * permissions, so a user who was granted dashboard access but lacks Discord permissions gets a
   * filtered list rather than every channel in the server.
   */
  async function loadSendableChannels(guildId: bigint) {
    if (!data.user?.id) {
      sendChannels = [];
      sendChannelsError = m.embedbuilder.pageSendErrorLogin();
      return;
    }

    loadingSendChannels = true;
    sendChannelsError = "";
    try {
      sendChannels = await embedsApi.getSendableChannels(guildId, data.user.id);
      if (selectedSendChannelId && !sendChannels.some(channel => channel.id.toString() === selectedSendChannelId)) {
        selectedSendChannelId = null;
      }
    } catch (error) {
      logger.error("Failed to load sendable channels:", error);
      sendChannels = [];
      sendChannelsError = m.embedbuilder.pageSendErrorChannels();
    } finally {
      loadingSendChannels = false;
    }
  }

  /**
   * Loads the personas available for the current context: the user's own, plus any shared with the guild.
   */
  async function loadPersonas(guildId?: bigint) {
    loadingPersonas = true;
    try {
      const [mine, shared] = await Promise.all([
        data.user?.id ? embedsApi.getUserPersonas(data.user.id) : Promise.resolve([]),
        guildId ? embedsApi.getGuildPersonas(guildId) : Promise.resolve([])
      ]);

      personas = [...shared, ...mine];
      if (selectedPersonaId !== null && !personas.some(persona => persona.id === selectedPersonaId)) {
        selectedPersonaId = null;
      }
    } catch (error) {
      logger.error("Failed to load personas:", error);
      personas = [];
    } finally {
      loadingPersonas = false;
    }
  }

  /**
   * Sends the current builder state to the selected channel, either as the bot or through a webhook.
   * The bot re-checks every permission, so a rejection here is authoritative.
   */
  async function sendCurrentEmbed() {
    showSendConfirm = false;

    const guild = get(currentGuild);
    if (!guild) {
      showNotificationMessage(m.common.selectAServerFirstPlaceholder(), "error");
      return;
    }

    if (!data.user?.id) {
      showNotificationMessage(m.embedbuilder.pageNotifySendLogin(), "error");
      return;
    }

    if (!selectedSendChannelId) {
      showNotificationMessage(m.embedbuilder.pageNotifyPickChannel(), "error");
      return;
    }

    const exportData = buildExportData();
    if (Object.keys(exportData).length === 0) {
      showNotificationMessage(m.embedbuilder.pageNotifyNothingToSend(), "error");
      return;
    }

    sending = true;
    try {
      lastSendResult = await embedsApi.sendEmbed(BigInt(guild.id), {
        userId: data.user.id,
        channelId: BigInt(selectedSendChannelId),
        jsonCode: JSON.stringify(exportData),
        useWebhook: sendAsWebhook,
        personaId: sendAsWebhook ? selectedPersonaId : null,
        webhookUsername:
          sendAsWebhook && !selectedPersonaId && webhookUsername.trim() ? webhookUsername.trim() : null,
        webhookAvatarUrl:
          sendAsWebhook && !selectedPersonaId && webhookAvatarUrl.trim() ? webhookAvatarUrl.trim() : null
      });

      showNotificationMessage(
        lastSendResult.mentionsSuppressed
          ? m.embedbuilder.pageNotifySentStripped({ channel: lastSendResult.channelName })
          : m.embedbuilder.pageNotifySent({ channel: lastSendResult.channelName })
      );
    } catch (error: any) {
      logger.error("Failed to send embed:", error);
      showNotificationMessage(error?.message || m.embedbuilder.pageNotifySendFailed(), "error");
    } finally {
      sending = false;
    }
  }

  // Template handling
  function handleTemplateSelect(detail: { template: any }) {
    const template = detail.template;
    openSavedEmbed = null;

    // Apply template to first embed
    embeds[0] = { ...template.embed };
    embeds = [...embeds];

    // Switch to editor tab
    selectTab("editor");
    showNotificationMessage(m.embedbuilder.pageNotifyTemplateApplied({ name: template.name }));
  }

  // Embed management
  function addEmbed() {
    const newEmbed: Embed = {
      title: "",
      description: "",
      color: "#5865F2",
      url: "",
      author: { name: "", url: "", icon_url: "" },
      thumbnail: { url: "" },
      image: { url: "" },
      footer: { text: "", icon_url: "" },
      fields: []
    };
    
    embeds = [...embeds, newEmbed];
    showNotificationMessage(m.embedbuilder.fullscreenNotifyEmbedAdded());
  }

  function removeEmbed(index: number) {
    if (embeds.length > 1) {
      embeds = embeds.filter((_, i) => i !== index);
      showNotificationMessage(m.embedbuilder.fullscreenNotifyEmbedRemoved());
    }
  }

  function duplicateEmbed(index: number) {
    const duplicated = JSON.parse(JSON.stringify(embeds[index]));
    embeds.splice(index + 1, 0, duplicated);
    embeds = [...embeds];
    showNotificationMessage(m.embedbuilder.fullscreenNotifyEmbedDuplicated());
  }

  function handleEmbedUpdate(detail: { embed: any; index: number }) {
    const { embed, index } = detail;
    embeds[index] = embed;
    embeds = [...embeds];
    validateEmbeds();
  }

  function addRow() {
    if (getTotalComponentCount() >= 25) return;

    const rowKey = `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newRow: ComponentRow = {
      componentKey: rowKey,
      rowKey,
      components: []
    };

    componentRows = [...componentRows, newRow];
    showNotificationMessage(m.embedbuilder.fullscreenNotifyRowAdded());
  }

  function addComponentToRow(rowKey: string) {
    const rowIndex = componentRows.findIndex(r => r.rowKey === rowKey);
    if (rowIndex === -1) return;

    const row = componentRows[rowIndex];

    if (getTotalComponentCount() >= 25) {
      showNotificationMessage(m.embedbuilder.fullscreenNotifyMaxComponents(), "error");
      return;
    }

    if (row.components.length >= 5) {
      showNotificationMessage(m.embedbuilder.fullscreenNotifyMaxButtons(), "error");
      return;
    }

    const componentKey = `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newComponent: NewEmbedComponent = {
      componentKey,
      rowIndex,
      displayName: m.common.newButton(),
      style: 5,
      url: "",
      emoji: ""
    };

    row.components = [...row.components, newComponent];
    componentRows = [...componentRows];
    showNotificationMessage(m.embedbuilder.fullscreenNotifyButtonAdded());
  }

  function removeRow(rowKey: string) {
    componentRows = componentRows.filter(r => r.rowKey !== rowKey);

    componentRows = componentRows.map((r, idx) => ({
      ...r,
      components: r.components.map(c => ({
        ...c,
        rowIndex: idx
      }))
    }));

    showNotificationMessage(m.embedbuilder.fullscreenNotifyRowRemoved());
  }

  function duplicateRow(rowKey: string) {
    const row = componentRows.find(r => r.rowKey === rowKey);
    if (!row) return;

    if (componentRows.length >= 5) {
      showNotificationMessage(m.embedbuilder.pageNotifyMaxRows(), "error");
      return;
    }

    const timestamp = Date.now();
    const newRowKey = `row-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;

    const sourceRowIndex = componentRows.indexOf(row);
    const newRowIndex = sourceRowIndex + 1;

    const duplicatedComponents = row.components.map((comp, idx) => ({
      ...JSON.parse(JSON.stringify(comp)),
      componentKey: `component-${timestamp}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
      rowIndex: newRowIndex
    }));

    const newRow: ComponentRow = {
      componentKey: newRowKey,
      rowKey: newRowKey,
      components: duplicatedComponents
    };

    componentRows.splice(newRowIndex, 0, newRow);

    componentRows = componentRows.map((r, idx) => ({
      ...r,
      components: r.components.map(c => ({
        ...c,
        rowIndex: idx
      }))
    }));

    showNotificationMessage(m.embedbuilder.pageNotifyRowDuplicated());
  }

  function duplicateComponent(componentKey: string) {
    for (let rowIdx = 0; rowIdx < componentRows.length; rowIdx++) {
      const row = componentRows[rowIdx];
      const component = row.components.find(c => c.componentKey === componentKey);
      if (component) {
        if (row.components.length >= 5) {
          showNotificationMessage(m.embedbuilder.pageNotifyRowFull(), "error");
          return;
        }

        const duplicated = {
          ...JSON.parse(JSON.stringify(component)),
          componentKey: `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          rowIndex: rowIdx
        };

        const index = row.components.indexOf(component);
        row.components.splice(index + 1, 0, duplicated);
        componentRows = [...componentRows];
        showNotificationMessage(m.embedbuilder.fullscreenNotifyComponentDuplicated());
        return;
      }
    }
  }

  function handleDragStart(e: DragEvent | TouchEvent, component: NewEmbedComponent, fromRow: string) {
    draggedComponent = component;
    draggedFromRow = fromRow;
    isDragging = true;

    document.body.classList.add("dragging");

    if (e instanceof DragEvent && e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", component.componentKey);
    }
  }

  function handleDragEnd() {
    draggedComponent = null;
    draggedFromRow = null;
    dragOverRow = null;
    dragOverIndex = -1;
    isDragging = false;

    document.body.classList.remove("dragging");
  }

  function handleDragOver(e: DragEvent | TouchEvent, rowKey: string, index: number) {
    e.preventDefault();

    if (!isDragging) return;

    if (index === -1 && e instanceof DragEvent) {
      const dropZone = e.currentTarget as HTMLElement;
      const components = dropZone.querySelectorAll("[data-component]");
      let calculatedIndex = components.length;

      for (let i = 0; i < components.length; i++) {
        const rect = (components[i] as HTMLElement).getBoundingClientRect();
        if (e.clientX < rect.left + rect.width / 2) {
          calculatedIndex = i;
          break;
        }
      }

      dragOverRow = rowKey;
      dragOverIndex = calculatedIndex;
    } else {
      dragOverRow = rowKey;
      dragOverIndex = index >= 0 ? index : 0;
    }
  }

  function handleDrop(e: DragEvent | TouchEvent, targetRowKey: string) {
    e.preventDefault();

    if (!draggedComponent || !draggedFromRow) return;
    const dragged = draggedComponent;

    const targetRowIndex = componentRows.findIndex(r => r.rowKey === targetRowKey);
    const sourceRowIndex = componentRows.findIndex(r => r.rowKey === draggedFromRow);

    if (targetRowIndex === -1 || sourceRowIndex === -1) return;

    const targetRow = componentRows[targetRowIndex];

    if (targetRow.components.length >= 5 && draggedFromRow !== targetRowKey) {
      showNotificationMessage(m.embedbuilder.fullscreenNotifyMaxButtons(), "error");
      handleDragEnd();
      return;
    }

    if (sourceRowIndex !== targetRowIndex) {
      componentRows[sourceRowIndex].components = componentRows[sourceRowIndex].components.filter(
        c => c.componentKey !== dragged.componentKey
      );
    }

    const insertIndex = dragOverIndex >= 0 ? dragOverIndex : targetRow.components.length;

    const updatedComponent = { ...dragged, rowIndex: targetRowIndex };

    if (sourceRowIndex === targetRowIndex) {
      targetRow.components = targetRow.components.filter(c => c.componentKey !== dragged.componentKey);
    }

    targetRow.components.splice(insertIndex, 0, updatedComponent);

    componentRows = [...componentRows];

    handleDragEnd();
  }

  function handleRowDragStart(e: DragEvent | TouchEvent, row: ComponentRow) {
    draggedRow = row;
    isDraggingRow = true;

    document.body.classList.add("dragging-row");

    if (e instanceof DragEvent && e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", row.rowKey);
    }
  }

  function handleRowDragEnd() {
    draggedRow = null;
    dragOverRowIndex = -1;
    isDraggingRow = false;

    document.body.classList.remove("dragging-row");
  }

  function handleRowDragOver(e: DragEvent | TouchEvent, targetIndex: number) {
    e.preventDefault();

    if (!isDraggingRow || !draggedRow) return;

    dragOverRowIndex = targetIndex;
  }

  function handleRowDrop(e: DragEvent | TouchEvent, targetIndex: number) {
    e.preventDefault();

    if (!draggedRow || !isDraggingRow) return;

    const sourceIndex = componentRows.findIndex(r => draggedRow !== null && r.rowKey === draggedRow.rowKey);

    if (sourceIndex === -1 || sourceIndex === targetIndex) {
      handleRowDragEnd();
      return;
    }

    const [movedRow] = componentRows.splice(sourceIndex, 1);

    componentRows.splice(targetIndex, 0, movedRow);

    componentRows = componentRows.map((row, idx) => ({
      ...row,
      components: row.components.map(c => ({
        ...c,
        rowIndex: idx
      }))
    }));

    handleRowDragEnd();
  }

  const TOUCH_DRAG_THRESHOLD = 8;
  let touchStartPoint = { x: 0, y: 0 };
  let pendingTouchRow: ComponentRow | null = null;
  let pendingTouchComponent: { component: NewEmbedComponent; fromRow: string } | null = null;

  function movedPastThreshold(touch: Touch): boolean {
    return Math.hypot(touch.clientX - touchStartPoint.x, touch.clientY - touchStartPoint.y) >= TOUCH_DRAG_THRESHOLD;
  }

  function lockBodyScroll() {
    scrollPosition.x = window.pageXOffset;
    scrollPosition.y = window.pageYOffset;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.body.style.webkitUserSelect = "none";
    (document.body.style as any).webkitTouchCallout = "none";
    document.body.classList.add("dragging-active");

    document.addEventListener("touchmove", preventScroll, { passive: false });

    // Safari needs the body fixed in place
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPosition.y}px`;
    document.body.style.width = "100%";
  }

  function unlockBodyScroll() {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
    document.body.style.webkitUserSelect = "";
    (document.body.style as any).webkitTouchCallout = "";
    document.body.classList.remove("dragging-active");

    window.scrollTo(scrollPosition.x, scrollPosition.y);

    document.removeEventListener("touchmove", preventScroll);
  }

  function handleRowTouchStart(e: TouchEvent, row: ComponentRow) {
    const touch = e.touches[0];
    touchStartPoint = { x: touch.clientX, y: touch.clientY };
    pendingTouchRow = row;
  }

  function handleRowTouchMove(e: TouchEvent) {
    const touch = e.touches[0];

    if (!isDraggingRow && pendingTouchRow) {
      if (!movedPastThreshold(touch)) return;

      handleRowDragStart(e, pendingTouchRow);
      pendingTouchRow = null;
      (e.currentTarget as HTMLElement).style.opacity = "0.5";
      lockBodyScroll();
    }

    if (!isDraggingRow || !draggedRow) return;

    e.stopPropagation();

    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    if (elementBelow) {
      const rowElement = elementBelow.closest("[aria-label^=\"Row \"]");
      if (rowElement) {
        const allRows = document.querySelectorAll("[aria-label^=\"Row \"]");
        const index = Array.from(allRows).indexOf(rowElement);
        if (index !== -1) {
          dragOverRowIndex = index;
        }
      }
    }
  }

  function handleRowTouchEnd(e: TouchEvent) {
    pendingTouchRow = null;
    if (!isDraggingRow) return;

    e.preventDefault();
    unlockBodyScroll();

    (e.currentTarget as HTMLElement).style.opacity = "";

    if (dragOverRowIndex >= 0) {
      handleRowDrop(e, dragOverRowIndex);
    } else {
      handleRowDragEnd();
    }
  }

  function preventScroll(e: TouchEvent) {
    e.preventDefault();
    return false;
  }

  let scrollPosition = { x: 0, y: 0 };

  let touchItem: HTMLElement | null = null;
  let touchOffset = { x: 0, y: 0 };

  function handleTouchStart(e: TouchEvent, component: NewEmbedComponent, fromRow: string) {
    const touch = e.touches[0];
    touchStartPoint = { x: touch.clientX, y: touch.clientY };
    pendingTouchComponent = { component, fromRow };
    touchItem = e.currentTarget as HTMLElement;

    const rect = touchItem.getBoundingClientRect();
    touchOffset.x = touch.clientX - rect.left;
    touchOffset.y = touch.clientY - rect.top;
  }

  function handleTouchMove(e: TouchEvent) {
    const touch = e.touches[0];

    if (!isDragging && pendingTouchComponent) {
      if (!movedPastThreshold(touch)) return;

      handleDragStart(e, pendingTouchComponent.component, pendingTouchComponent.fromRow);
      pendingTouchComponent = null;
      lockBodyScroll();
    }

    if (!isDragging || !touchItem) return;

    e.stopPropagation();

    if (touchItem) {
      touchItem.style.position = "fixed";
      touchItem.style.zIndex = "9999";
      touchItem.style.left = `${touch.clientX - touchOffset.x}px`;
      touchItem.style.top = `${touch.clientY - touchOffset.y}px`;
      touchItem.style.opacity = "0.8";
      touchItem.style.pointerEvents = "none";
    }

    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    if (elementBelow) {
      const dropZone = elementBelow.closest("[data-drop-zone]");
      if (dropZone) {
        const rowKey = dropZone.getAttribute("data-row-key");
        if (rowKey) {
          const components = dropZone.querySelectorAll("[data-component]");
          let index = components.length;

          for (let i = 0; i < components.length; i++) {
            const rect = components[i].getBoundingClientRect();
            if (touch.clientX < rect.left + rect.width / 2) {
              index = i;
              break;
            }
          }

          dragOverRow = rowKey;
          dragOverIndex = index;
        }
      }
    }
  }

  function handleTouchEnd(e: TouchEvent) {
    pendingTouchComponent = null;
    if (!isDragging) {
      touchItem = null;
      return;
    }

    e.preventDefault();
    unlockBodyScroll();

    if (touchItem) {
      touchItem.style.position = "";
      touchItem.style.zIndex = "";
      touchItem.style.left = "";
      touchItem.style.top = "";
      touchItem.style.opacity = "";
      touchItem.style.pointerEvents = "";
    }

    if (dragOverRow) {
      handleDrop(e, dragOverRow);
    } else {
      handleDragEnd();
    }

    touchItem = null;
  }

  function handleComponentUpdate(detail: { component: NewEmbedComponent }) {
    const { component } = detail;

    for (const row of componentRows) {
      const index = row.components.findIndex(c => c.componentKey === component.componentKey);
      if (index !== -1) {
        row.components[index] = component;
        componentRows = [...componentRows];
        validateComponents();
        return;
      }
    }
  }

  function handleComponentRemove(detail: { componentKey: string }) {
    const { componentKey } = detail;

    for (const row of componentRows) {
      const initialLength = row.components.length;
      row.components = row.components.filter(c => c.componentKey !== componentKey);

      if (row.components.length !== initialLength) {
        componentRows = [...componentRows];
        showNotificationMessage(m.embedbuilder.fullscreenNotifyComponentRemoved());
        return;
      }
    }
  }

  function handleComponentEdit(detail: { component: NewEmbedComponent }) {
    const { component } = detail;
    editingComponent = JSON.parse(JSON.stringify(component));
  }

  function getTotalComponentCount(): number {
    return componentRows.reduce((sum, row) => sum + row.components.length, 0);
  }

  let flattenedComponents = $derived(
    componentRows.flatMap(row => row.components)
  );

  let componentsByRow = $derived(() => {
    const grouped = new Map<string, NewEmbedComponent[]>();
    componentRows.forEach(row => {
      grouped.set(row.rowKey, row.components);
    });
    return grouped;
  });

  // Placeholder handling
  function showPlaceholderFromButton(buttonElement: HTMLButtonElement, field: string) {
    const inputElement = buttonElement.previousElementSibling as HTMLInputElement | HTMLTextAreaElement;
    if (inputElement) {
      currentEditingElement = inputElement;
      currentEditingField = field;

      const rect = inputElement.getBoundingClientRect();
      placeholderPosition = {
        x: rect.left,
        y: rect.bottom + 8
      };

      showPlaceholderPicker = true;
    }
  }

  function handlePlaceholderSelect(detail: { placeholder: Placeholder }) {
    const { placeholder } = detail;
    insertPlaceholder(placeholder);
  }

  function insertPlaceholder(placeholder: Placeholder) {
    if (!currentEditingElement) return;

    const start = currentEditingElement.selectionStart || 0;
    const end = currentEditingElement.selectionEnd || 0;
    const text = currentEditingElement.value;

    currentEditingElement.value = text.substring(0, start) + placeholder.name + text.substring(end);
    currentEditingElement.selectionStart = currentEditingElement.selectionEnd = start + placeholder.name.length;

    // Update the corresponding data
    if (currentEditingField) {
      const changeEvent = new Event('input', { bubbles: true });
      currentEditingElement.dispatchEvent(changeEvent);
    }

    showPlaceholderPicker = false;
  }

  // Validation
  function validateEmbeds() {
    validationErrors = [];
    validationWarnings = [];
    
    embeds.forEach((embed, index) => {
      // Check embed limits
      if (embed.title && embed.title.length > 256) {
        validationErrors.push({
          id: `embed-${index}-title`,
          message: m.embedbuilder.fullscreenValidationTitleTooLong({ number: index + 1 }),
          field: `embeds[${index}].title`
        });
      }
      
      if (embed.description && embed.description.length > 4096) {
        validationErrors.push({
          id: `embed-${index}-description`,
          message: m.embedbuilder.fullscreenValidationDescriptionTooLong({ number: index + 1 }),
          field: `embeds[${index}].description`
        });
      }
      
      // Warn about empty embeds
      if (!embed.title && !embed.description && embed.fields.length === 0) {
        validationWarnings.push({
          id: `embed-${index}-empty`,
          message: m.embedbuilder.pageValidationEmbedEmpty({ number: index + 1 }),
          field: `embeds[${index}]`
        });
      }
    });
  }

  function validateComponents() {
    validationErrors = validationErrors.filter(err => !err.id.startsWith("component-"));

  }

  // Clean up empty embed properties
  function cleanEmbed(embed: Embed) {
    const cleaned: any = {};

    // Only include non-empty string properties
    if (embed.title?.trim()) cleaned.title = embed.title;
    if (embed.description?.trim()) cleaned.description = embed.description;
    if (embed.color) cleaned.color = embed.color;
    if (embed.url?.trim()) cleaned.url = embed.url;

    // Only include author if any field is populated
    if (embed.author?.name?.trim() || embed.author?.url?.trim() || embed.author?.icon_url?.trim()) {
      cleaned.author = {};
      if (embed.author.name?.trim()) cleaned.author.name = embed.author.name;
      if (embed.author.url?.trim()) cleaned.author.url = embed.author.url;
      if (embed.author.icon_url?.trim()) cleaned.author.icon_url = embed.author.icon_url;
    }

    // Only include footer if any field is populated
    if (embed.footer?.text?.trim() || embed.footer?.icon_url?.trim()) {
      cleaned.footer = {};
      if (embed.footer.text?.trim()) cleaned.footer.text = embed.footer.text;
      if (embed.footer.icon_url?.trim()) cleaned.footer.icon_url = embed.footer.icon_url;
    }

    // Only include thumbnail/image if URL is populated
    if (embed.thumbnail?.url?.trim()) {
      cleaned.thumbnail = { url: embed.thumbnail.url };
    }
    if (embed.image?.url?.trim()) {
      cleaned.image = { url: embed.image.url };
    }

    // Only include fields if there are any
    if (embed.fields?.length > 0) {
      cleaned.fields = embed.fields;
    }

    return cleaned;
  }

  function cleanComponent(component: NewEmbedComponent) {
    const cleaned: any = {
      row: component.rowIndex,
      displayName: component.displayName,
      style: 5
    };

    if (component.url?.trim()) {
      cleaned.url = component.url;
    }

    if (component.emoji?.trim()) {
      cleaned.emoji = component.emoji;
    }

    return cleaned;
  }

  // JSON export
  async function copyJson() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(buildExportData(), null, 2));
      jsonCopied = true;
      showNotificationMessage(m.embedbuilder.pageNotifyJsonCopied());
      setTimeout(() => jsonCopied = false, 2000);
    } catch (error) {
      logger.error('Failed to copy JSON:', error);
      showNotificationMessage(m.embedbuilder.pageNotifyCopyFailed(), "error");
    }
  }



  // Complete placeholders data from placeholders page
  const placeholders: Placeholder[] = $derived([
    // AFK placeholders
    { category: "AFK", name: "%afk.message%", description: m.placeholders.afkMessage() },
    { category: "AFK", name: "%afk.user%", description: m.placeholders.afkUser() },
    { category: "AFK", name: "%afk.user.mention%", description: m.placeholders.afkUserMention() },
    { category: "AFK", name: "%afk.user.avatar%", description: m.placeholders.afkUserAvatar() },
    { category: "AFK", name: "%afk.user.id%", description: m.placeholders.afkUserId() },
    { category: "AFK", name: "%afk.triggeruser%", description: m.placeholders.afkTriggeruser() },
    { category: "AFK", name: "%afk.triggeruser.avatar%", description: m.placeholders.afkTriggeruserAvatar() },
    { category: "AFK", name: "%afk.triggeruser.mention%", description: m.placeholders.afkTriggeruserMention() },
    { category: "AFK", name: "%afk.triggeruser.id%", description: m.placeholders.afkTriggeruserId() },
    { category: "AFK", name: "%afk.time%", description: m.placeholders.afkTime() },
    
    // Suggestions placeholders
    { category: "Suggestions", name: "%suggest.user%", description: m.placeholders.suggestUser() },
    { category: "Suggestions", name: "%suggest.user.id%", description: m.placeholders.suggestUserId() },
    { category: "Suggestions", name: "%suggest.message%", description: m.placeholders.suggestMessage() },
    { category: "Suggestions", name: "%suggest.number%", description: m.placeholders.suggestNumber() },
    { category: "Suggestions", name: "%suggest.user.name%", description: m.placeholders.suggestUserName() },
    { category: "Suggestions", name: "%suggest.user.avatar%", description: m.placeholders.suggestUserAvatar() },
    { category: "Suggestions", name: "%suggest.mod.user%", description: m.placeholders.suggestModUser() },
    { category: "Suggestions", name: "%suggest.mod.avatar%", description: m.placeholders.suggestModAvatar() },
    { category: "Suggestions", name: "%suggest.mod.name%", description: m.placeholders.suggestModName() },
    { category: "Suggestions", name: "%suggest.mod.message%", description: m.placeholders.suggestModMessage() },
    
    // User placeholders
    { category: "User", name: "%user%", description: m.placeholders.user() },
    { category: "User", name: "%user.mention%", description: m.placeholders.userMention() },
    { category: "User", name: "%user.id%", description: m.placeholders.userId() },
    { category: "User", name: "%user.avatar%", description: m.placeholders.userAvatar() },
    { category: "User", name: "%user.name%", description: m.placeholders.userName() },
    { category: "User", name: "%user.nick%", description: m.placeholders.userNick() },
    
    // Server placeholders
    { category: "Server", name: "%server%", description: m.placeholders.server() },
    { category: "Server", name: "%server.id%", description: m.placeholders.serverId() },
    { category: "Server", name: "%server.members%", description: m.placeholders.serverMembers() },
    { category: "Server", name: "%server.owner%", description: m.placeholders.serverOwner() },
    { category: "Server", name: "%server.icon%", description: m.placeholders.mcFavicon() },
    
    // Random placeholders
    { category: "Random", name: "%rng%", description: m.placeholders.rng() },
    { category: "Random", name: "%rng(1,10)%", description: m.placeholders.rngRange() },
    { category: "Random", name: "%choose(a|b|c)%", description: m.placeholders.choose() },
    { category: "Random", name: "%target%", description: m.placeholders.target() },
    { category: "Random", name: "%img:stuff%", description: m.placeholders.img() }
  ]);


  function handleMainTabChange(tab: string) {
    validateEmbeds();
    validateComponents();

    if (tab === "json") {
      refreshJsonPreview();
    } else if (tab === "saved") {
      const guild = get(currentGuild);
      loadSavedEmbeds(guild ? BigInt(guild.id) : undefined);
    } else if (tab === "send") {
      const guild = get(currentGuild);
      if (guild) loadSendableChannels(BigInt(guild.id));
      loadPersonas(guild ? BigInt(guild.id) : undefined);
    }
  }

  $effect(() => {
    const tab = activeMainTab;
    untrack(() => handleMainTabChange(tab));
  });

  let selectedPersona = $derived(personas.find(persona => persona.id === selectedPersonaId) ?? null);

  // Only channels both the user and the bot can post to are selectable
  let sendableChannelOptions = $derived(
    sendChannels
      .filter(channel => !channel.restriction)
      .map(channel => ({
        id: channel.id.toString(),
        name: channel.categoryName ? `${channel.categoryName} / ${channel.name}` : channel.name
      }))
  );

  // Channels the user can see but nobody can post to, shown so the gap is explained rather than hidden
  let blockedChannels = $derived(sendChannels.filter(channel => channel.restriction));

  let selectedSendChannel = $derived(
    sendChannels.find(channel => channel.id.toString() === selectedSendChannelId) ?? null
  );

  // Webhook delivery needs Manage Webhooks for the user and the bot in the target channel
  let webhookAvailable = $derived(
    !!selectedSendChannel && selectedSendChannel.canUseWebhooks && selectedSendChannel.botCanUseWebhooks
  );

  // Missing Embed Links only blocks a send when the message actually carries an embed
  let hasEmbedContent = $derived(
    embeds.some(embed => embed.title || embed.description || embed.fields.length > 0)
  );

  let embedPermissionBlock = $derived(
    !hasEmbedContent || !selectedSendChannel
      ? null
      : !selectedSendChannel.canEmbed
        ? m.embedbuilder.pageSendEmbedBlockedUser()
        : !selectedSendChannel.botCanEmbed
          ? m.embedbuilder.pageSendEmbedBlockedBot()
          : null
  );

  let sendConfirmMessage = $derived.by(() => {
    const args = {
      channel: selectedSendChannel ? `#${selectedSendChannel.name}` : m.embedbuilder.pageSendConfirmChannelFallback(),
      server: $currentGuild?.name ?? m.common.thisServer()
    };
    if (!sendAsWebhook) return m.embedbuilder.pageSendConfirmMessageBot(args);
    return selectedPersona
      ? m.embedbuilder.pageSendConfirmMessagePersona({ ...args, persona: selectedPersona.name })
      : m.embedbuilder.pageSendConfirmMessageWebhook(args);
  });

  // Switching to a channel without webhook permissions must not leave webhook delivery armed
  $effect(() => {
    if (!webhookAvailable && sendAsWebhook) {
      sendAsWebhook = false;
    }
  });


  $effect(() => {
        currentGuild.subscribe((guild) => {
            if (guild) {
              loadSavedEmbeds(BigInt(guild.id));
              selectedSendChannelId = null;
              loadSendableChannels(BigInt(guild.id));
              loadPersonas(BigInt(guild.id));
            }
        });
    });
    // Can copy validation
    let canCopyJson = $derived(embeds.some(embed =>
        embed.title || embed.description || embed.fields.length > 0
    ) || content.trim().length > 0);
  // Action buttons for DashboardPageLayout
    let actionButtons = $derived([
    {
      label: m.common.undo(),
      icon: "fa-rotate-left",
      action: undo,
      disabled: historyIndex <= 0,
      loading: false
    },
    {
      label: m.common.redo(),
      icon: "fa-rotate-right",
      action: redo,
      disabled: historyIndex >= editHistory.length - 1,
      loading: false
    },
    {
      label: m.embedbuilder.pageActionCancelEdits(),
      icon: "fa-xmark",
      action: cancelEdits,
      disabled: historyIndex <= 0,
      loading: false
    },
    {
      label: jsonCopied ? m.common.copied() : m.embedbuilder.pageActionCopyJson(),
      icon: "fa-copy",
      action: copyJson,
      disabled: !canCopyJson,
      loading: false,
      style: `background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`
    }
    ]);
</script>

{#snippet statusMessageContent()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-[10001]" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

<PluginPage
  title={m.embedbuilder.pageTitle()}
  subtitle={m.embedbuilder.pageSubtitle()}
  icon="fa-layer-group"
  guildName={$currentGuild?.name ?? m.common.embedBuilder()}
  {actionButtons}
  statusMessages={statusMessageContent}
>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 [&>:last-child:nth-child(odd)]:col-span-2 sm:[&>:last-child:nth-child(odd)]:col-span-1" role="group" aria-label={m.embedbuilder.pageTabsAria()}>
    {#each tabs as tab (tab.id)}
      {@const selected = activeMainTab === tab.id}
      <button
        type="button"
        class="min-h-[44px] px-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2"
        style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
        aria-pressed={selected}
        onclick={() => selectTab(tab.id)}
      >
        <i class="fa-solid {tab.icon}" aria-hidden="true"></i>
        {tab.label}
      </button>
    {/each}
  </div>

  {#if openSavedEmbed}
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border"
      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
    >
      <span class="text-sm font-medium truncate" style="color: {$colorStore.text};">
        <i class="fa-solid fa-pen mr-2" aria-hidden="true"></i>{m.embedbuilder.pageSavedEditing({ name: openSavedEmbed.embedName ?? m.embedbuilder.fullscreenSavedNameFallback() })}
      </span>
      <button
        type="button"
        class="min-h-[44px] px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        disabled={savingEmbed}
        onclick={() => writeSavedEmbed(openSavedEmbed)}
      >
        <i class="fa-solid fa-floppy-disk" aria-hidden="true"></i>
        {savingEmbed ? m.common.saving() : m.embedbuilder.pageSavedSaveChanges()}
      </button>
    </div>
  {/if}

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
    <section
      class="rounded-2xl border min-w-0"
      style="background: {$colorStore.surface}; border-color: {$colorStore.primary}30;"
    >
      <div class="p-4 sm:p-6 lg:min-h-[600px]">
        {#if activeMainTab === "templates"}
          <div class="space-y-6">
            <h2 class="text-xl font-semibold" style="color: {$colorStore.text};">{m.embedbuilder.pageTemplatesHeading()}</h2>

            <TemplateGallery
              onselect={handleTemplateSelect}
            />

            <div class="pt-6 border-t" style="border-color: {$colorStore.primary}20;">
              <button
                type="button"
                aria-label={m.embedbuilder.pageStartFromScratch()}
                class="w-full sm:w-auto px-6 min-h-[44px] rounded-lg font-medium flex items-center justify-center gap-2"
                style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
                onclick={() => selectTab("editor")}
              >
                <i class="fa-solid fa-layer-group" style="font-size: 16px;"></i>
                {m.embedbuilder.pageStartFromScratch()}
              </button>
            </div>
          </div>

        {:else if activeMainTab === "editor"}
          <!-- Editor Tab -->
          <div class="space-y-6">
            <!-- Message Content -->
            <div>
              <label for="embed-title" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                {m.embedbuilder.pageContentLabel()}
              </label>
              <div class="relative">
                <textarea id="embed-title"
                          rows="3"
                          class="w-full px-3 py-2 pr-10 rounded-lg border resize-y"
                          style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          placeholder={m.embedbuilder.pageContentPlaceholder()}
                          bind:value={content}
                          oninput={(e) => checkContentImage(e.currentTarget.value)}
                ></textarea>
                <button
                  type="button"
                  class="absolute right-1 top-1 min-h-[44px] min-w-[44px] rounded-sm hover:bg-black/10"
                  style="color: {$colorStore.muted};"
                  onclick={(e) => showPlaceholderFromButton(e.currentTarget, 'content')}
                  title={m.embedbuilder.editorInsertPlaceholder()}
                  aria-label={m.embedbuilder.editorInsertPlaceholder()}
                >
                  %
                </button>
              </div>
              {#if contentImageToken}
                <ImagePlaceholderChip
                  token={contentImageToken}
                  onthumbnail={() => moveContentImage("thumbnail")}
                  onimage={() => moveContentImage("image")}
                  ondismiss={() => (contentImageToken = null)}
                />
              {/if}
            </div>

            <!-- Embeds List -->
            <div class="space-y-4">
              <div class="flex justify-between items-center gap-2">
                <h3 class="text-lg font-semibold" style="color: {$colorStore.text};">
                  {m.embedbuilder.fullscreenEmbedsHeading({ count: embeds.length, max: 10 })}
                </h3>
                <button
                  type="button"
                  aria-label={m.embedbuilder.fullscreenAddEmbed()}
                  class="px-4 min-h-[44px] rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                  style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
                  disabled={embeds.length >= 10}
                  onclick={addEmbed}
                >
                  <i class="fa-solid fa-plus" style="font-size: 16px;"></i>
                  {m.embedbuilder.fullscreenAddEmbed()}
                </button>
              </div>

              {#each embeds as embed, index}
                <EmbedEditor
                  {embed}
                  {index}
                  {placeholders}
                  onupdate={handleEmbedUpdate}
                  onremove={(detail) => removeEmbed(detail.index)}
                  onduplicate={(detail) => duplicateEmbed(detail.index)}
                />
              {/each}
            </div>
          </div>

        {:else if activeMainTab === "components"}
          <div class="space-y-4 sm:space-y-6">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-base sm:text-lg font-semibold" style="color: {$colorStore.text};">
                  {m.embedbuilder.tabComponents()} <span class="text-xs sm:text-sm font-normal">({getTotalComponentCount()}/25)</span>
                </h3>
                <p class="text-xs sm:text-sm" style="color: {$colorStore.muted};">
                  <span class="hidden sm:inline">{m.embedbuilder.fullscreenComponentsLimits({ rows: componentRows.length })}</span>
                  <span class="sm:hidden">{m.embedbuilder.pageComponentsLimitsShort({ rows: componentRows.length })}</span>
                </p>
              </div>

              <button
                type="button"
                aria-label={m.embedbuilder.fullscreenAddRow()}
                class="px-4 min-h-[44px] rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
                disabled={componentRows.length >= 5 || getTotalComponentCount() >= 25}
                onclick={addRow}
              >
                <i class="fa-solid fa-plus" style="font-size: 12px;"></i>
                <span class="hidden sm:inline">{m.embedbuilder.fullscreenAddRow()}</span>
                <span class="sm:hidden">{m.embedbuilder.pageAddRowShort()}</span>
              </button>
            </div>

            {#if componentRows.length === 0}
              <div class="text-center py-6 sm:py-12">
                <i class="fa-utility-duo fa-regular fa-comment"
                   style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 36px; opacity: 0.5; display: block; margin: 0 auto 12px;"></i>
                <h4 class="text-base sm:text-lg font-semibold mb-1 sm:mb-2" style="color: {$colorStore.text};">{m.embedbuilder.pageRowsEmptyTitle()}</h4>
                <p class="text-xs sm:text-sm mb-2 sm:mb-4" style="color: {$colorStore.muted};">
                  {m.embedbuilder.fullscreenComponentsEmptyHint()}
                </p>
              </div>
            {:else}
              <div class="sm:hidden text-center mb-3">
                <p class="text-[10px] flex items-center justify-center gap-1" style="color: {$colorStore.muted};">
                  <i class="fa-solid fa-grip-vertical" style="font-size: 10px;"></i>
                  {m.embedbuilder.pageRowsDragHint()}
                </p>
              </div>
              <div
                class="space-y-4"
                role="list"
                ondragover={(e) => {
                  if (isDraggingRow) {
                    e.preventDefault();
                    handleRowDragOver(e, componentRows.length);
                  }
                }}
                ondrop={(e) => {
                  if (isDraggingRow && dragOverRowIndex === componentRows.length) {
                    handleRowDrop(e, componentRows.length);
                  }
                }}
              >
                {#each componentRows as row, rowIndex (row.componentKey)}
                  {#if isDraggingRow && dragOverRowIndex === rowIndex}
                    <div
                      class="h-2 rounded transition-all"
                      style="background: {$colorStore.primary}50;"
                    ></div>
                  {/if}

                  <div
                    class="relative p-2 sm:p-4 border rounded-lg transition-all"
                    class:opacity-50={isDraggingRow && draggedRow?.rowKey === row.rowKey}
                    style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;"
                    role="listitem"
                    aria-label={m.common.rowNumber({ number: rowIndex + 1 })}
                    ondragover={(e) => handleRowDragOver(e, rowIndex)}
                    ondrop={(e) => handleRowDrop(e, rowIndex)}
                  >
                    <div class="flex items-center justify-between mb-2 sm:mb-3">
                      <div class="flex items-center gap-1 sm:gap-2">
                        <div
                          class="cursor-grab min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md transition-colors"
                          style="touch-action: none; background: {$colorStore.primary}10;"
                          role="button"
                          tabindex="0"
                          draggable="true"
                          ondragstart={(e) => handleRowDragStart(e, row)}
                          ondragend={handleRowDragEnd}
                          ontouchstart={(e) => handleRowTouchStart(e, row)}
                          ontouchmove={(e) => handleRowTouchMove(e)}
                          ontouchend={(e) => handleRowTouchEnd(e)}
                          ontouchcancel={(e) => handleRowTouchEnd(e)}
                          title={m.embedbuilder.pageRowDragTitle()}
                          aria-label={m.embedbuilder.pageRowDragAria({ number: componentRows.indexOf(row) + 1 })}
                        >
                          <i
                            class="fa-solid fa-grip-vertical"
                            style="color: {$colorStore.primary}; font-size: 12px; pointer-events: none;"
                          ></i>
                        </div>
                        <span class="text-xs sm:text-sm font-medium" style="color: {$colorStore.text};">
                          <span class="hidden sm:inline">{row.components.length === 1 ? m.embedbuilder.fullscreenRowHeaderOne({ number: componentRows.indexOf(row) + 1, count: 1 }) : m.embedbuilder.fullscreenRowHeaderOther({ number: componentRows.indexOf(row) + 1, count: row.components.length })}</span>
                          <span class="sm:hidden">{m.embedbuilder.pageRowHeaderShort({ number: componentRows.indexOf(row) + 1, count: row.components.length })}</span>
                        </span>
                      </div>
                      <div class="flex gap-1 sm:gap-2">
                        <button
                          aria-label={m.embedbuilder.pageRowDuplicateAria()}
                          class="px-3 min-h-[44px] min-w-[44px] text-sm rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                          disabled={row.components.length === 0}
                          onclick={(e) => {
                            e.stopPropagation();
                            duplicateRow(row.rowKey);
                          }}
                        >
                          <i class="fa-solid fa-copy" style="font-size: 10px;"></i>
                          <span class="hidden sm:inline">{m.common.duplicate()}</span>
                        </button>
                        <button
                          aria-label={m.embedbuilder.pageRowRemoveAria()}
                          class="px-3 min-h-[44px] min-w-[44px] text-sm rounded-lg font-medium flex items-center justify-center gap-2"
                          style="background: #ED424520; color: #ED4245; border: 1px solid #ED424530;"
                          onclick={(e) => {
                            e.stopPropagation();
                            removeRow(row.rowKey);
                          }}
                        >
                          <i class="fa-solid fa-trash" style="font-size: 10px;"></i>
                          <span class="hidden sm:inline">{m.embedbuilder.pageRowRemoveAria()}</span>
                        </button>
                      </div>
                    </div>

                    {#if row.components.length === 0}
                      <div class="text-center py-3 sm:py-6">
                        <p class="text-xs sm:text-sm mb-2 sm:mb-3" style="color: {$colorStore.muted};">
                          {m.embedbuilder.fullscreenRowEmpty()}
                        </p>
                        <div class="flex gap-1 sm:gap-2 justify-center">
                          <button
                            aria-label={m.common.addButton()}
                            class="px-3 min-h-[44px] rounded-lg text-sm font-medium flex items-center gap-2"
                            style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                            onclick={(e) => {
                              e.stopPropagation();
                              addComponentToRow(row.rowKey);
                            }}
                          >
                            <i class="fa-solid fa-plus" style="font-size: 11px;"></i>
                            {m.common.addButton()}
                          </button>
                        </div>
                      </div>
                    {:else}
                      {#if editingComponent && row.components.some(c => c.componentKey === editingComponent!.componentKey)}
                        <div class="p-2 sm:p-3 border rounded-lg mb-2 sm:mb-3"
                             style="background: {$colorStore.secondary}05; border-color: {$colorStore.secondary}30;">
                          <ComponentEditor
                            component={editingComponent}
                            isEditing={true}
                            user={data.user}
                            onupdate={(detail) => {
                              editingComponent = detail.component;
                            }}
                            onremove={handleComponentRemove}
                            onedit={handleComponentEdit}
                            onduplicate={(detail) => {
                              duplicateComponent(detail.componentKey);
                              editingComponent = null;
                            }}
                          />

                          <div class="flex justify-end gap-1 sm:gap-2 mt-2 sm:mt-4 pt-2 sm:pt-4 border-t"
                               style="border-color: {$colorStore.secondary}20;">
                            <button
                              aria-label={m.common.cancel()}
                              class="px-4 min-h-[44px] rounded-lg font-medium"
                              style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                              onclick={(e) => {
                                e.stopPropagation();
                                editingComponent = null;
                              }}
                            >
                              {m.common.cancel()}
                            </button>
                            <button
                              aria-label={m.common.done()}
                              class="px-4 min-h-[44px] rounded-lg font-medium"
                              style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
                              onclick={(e) => {
                                e.stopPropagation();
                                if (editingComponent) {
                                  handleComponentUpdate({ component: editingComponent });
                                }
                                editingComponent = null;
                              }}
                            >
                              {m.common.done()}
                            </button>
                          </div>
                        </div>
                      {/if}

                      <div
                        class="flex gap-2 flex-wrap min-h-[50px] relative"
                        data-drop-zone
                        data-row-key={row.rowKey}
                        ondragover={(e) => handleDragOver(e, row.rowKey, -1)}
                        ondrop={(e) => handleDrop(e, row.rowKey)}
                        role="list"
                        aria-label={m.embedbuilder.pageRowComponentsAria({ number: rowIndex + 1 })}
                      >
                        {#each row.components as component, idx (component.componentKey)}
                          {#if isDragging && dragOverRow === row.rowKey && dragOverIndex === idx}
                            <div
                              class="w-2 h-10 rounded transition-all"
                              style="background: {$colorStore.primary}50;"
                            ></div>
                          {/if}

                          <div
                            class="transition-all cursor-grab"
                            class:opacity-50={isDragging && draggedComponent?.componentKey === component.componentKey}
                            style="touch-action: none;"
                            aria-label={m.embedbuilder.pageComponentAriaButton({ name: component.displayName })}
                            draggable="true"
                            data-component
                            ondragstart={(e) => handleDragStart(e, component, row.rowKey)}
                            ondragend={handleDragEnd}
                            ondragover={(e) => handleDragOver(e, row.rowKey, idx)}
                            ontouchstart={(e) => handleTouchStart(e, component, row.rowKey)}
                            ontouchmove={(e) => handleTouchMove(e)}
                            ontouchend={(e) => handleTouchEnd(e)}
                            ontouchcancel={(e) => handleTouchEnd(e)}
                            onclick={() => !isDragging && handleComponentEdit({ component })}
                            onkeydown={(e) => { if (e.key === 'Enter' && !isDragging) handleComponentEdit({ component }); }}
                            role="button"
                            tabindex="0"
                          >
                            <ComponentEditor
                              {component}
                              isEditing={false}
                              user={data.user}
                              onupdate={handleComponentUpdate}
                              onremove={handleComponentRemove}
                              onedit={handleComponentEdit}
                              onduplicate={(detail) => duplicateComponent(detail.componentKey)}
                            />
                          </div>
                        {/each}

                        {#if isDragging && dragOverRow === row.rowKey && dragOverIndex === row.components.length}
                          <div
                            class="w-2 h-10 rounded transition-all"
                            style="background: {$colorStore.primary}50;"
                          ></div>
                        {/if}
                      </div>

                      {#if row.components.length < 5}
                        <div class="flex gap-1 sm:gap-2 justify-center pt-2 sm:pt-3 border-t mt-2 sm:mt-3"
                             style="border-color: {$colorStore.primary}20;">
                          <button
                            aria-label={m.embedbuilder.pageRowAddButtonAria()}
                            class="px-3 min-h-[44px] rounded-lg text-sm font-medium flex items-center gap-2"
                            style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                            onclick={(e) => {
                              e.stopPropagation();
                              addComponentToRow(row.rowKey);
                            }}
                          >
                            <i class="fa-solid fa-plus" style="font-size: 10px;"></i>
                            {m.common.button()}
                          </button>
                        </div>
                      {/if}
                    {/if}
                  </div>
                {/each}

                {#if isDraggingRow && dragOverRowIndex === componentRows.length}
                  <div
                    class="h-2 rounded transition-all"
                    style="background: {$colorStore.primary}50;"
                  ></div>
                {/if}
              </div>
            {/if}
          </div>

        {:else if activeMainTab === "json"}
          <JsonTab bind:jsonText {jsonParseError} onrefresh={refreshJsonPreview} onapply={applyJsonText} />

        {:else if activeMainTab === "saved"}
          <SavedTab
            guildName={$currentGuild?.name ?? null}
            loggedIn={!!data.user}
            guildEmbeds={savedGuildEmbeds}
            userEmbeds={savedUserEmbeds}
            loading={loadingSavedEmbeds}
            bind:saveName={saveEmbedName}
            bind:saveShared={saveAsGuildShared}
            saving={savingEmbed}
            onsave={saveCurrentEmbed}
            onload={loadSavedEmbed}
            onoverwrite={requestOverwriteSavedEmbed}
            ondelete={requestDeleteSavedEmbed}
          />

        {:else if activeMainTab === "send"}
          <SendTab
            guildName={$currentGuild?.name ?? null}
            channelOptions={sendableChannelOptions}
            loadingChannels={loadingSendChannels}
            channelsError={sendChannelsError}
            bind:selectedChannelId={selectedSendChannelId}
            selectedChannel={selectedSendChannel}
            {blockedChannels}
            {embedPermissionBlock}
            bind:sendAsWebhook
            {webhookAvailable}
            {personas}
            {loadingPersonas}
            bind:selectedPersonaId
            bind:webhookUsername
            bind:webhookAvatarUrl
            {sending}
            canSend={!sending && !!selectedSendChannelId && canCopyJson && !embedPermissionBlock && validationErrors.length === 0}
            hasValidationErrors={validationErrors.length > 0}
            lastResult={lastSendResult}
            onmanage={() => (showPersonaManager = true)}
            onsend={() => (showSendConfirm = true)}
          />
        {/if}
      </div>
    </section>

    <!-- Preview Side -->
    <section
      class="rounded-2xl border lg:sticky lg:top-4 self-start min-w-0"
      style="background: {$colorStore.surface}; border-color: {$colorStore.primary}30;"
    >
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-4" style="color: {$colorStore.text};">{m.embedbuilder.fullscreenLivePreview()}</h3>

        <!-- Validation Card -->
        {#if validationErrors.length > 0 || validationWarnings.length > 0}
          <div class="mb-4">
            <ValidationCard
              errors={validationErrors}
              warnings={validationWarnings}
              title={m.embedbuilder.fullscreenIssues()}
              collapsible={true}
              compact={true}
            />
          </div>
        {/if}

        <PreviewCard
          {content}
          {embeds}
          {componentRows}
          emptyMessage={m.embedbuilder.previewEmptyMessage()}
        />
      </div>
    </section>
  </div>
</PluginPage>

<!-- Placeholder Picker -->
<PlaceholderPicker
  visible={showPlaceholderPicker}
  position={placeholderPosition}
  {placeholders}
  searchTerm={placeholderSearchTerm}
  onclose={() => showPlaceholderPicker = false}
  onsearch={(detail) => placeholderSearchTerm = detail.term}
  onselect={handlePlaceholderSelect}
/>

<!-- Delete Saved Embed Confirmation -->
<ConfirmationModal
  bind:isOpen={showDeleteConfirm}
  title={m.embedbuilder.pageSavedDeleteAria()}
  message={m.embedbuilder.fullscreenDeleteMessage({ name: embedPendingDelete?.embedName ?? m.embedbuilder.fullscreenSavedNameFallbackThis() })}
  confirmText={m.common.delete()}
  variant="danger"
  oncancel={() => embedPendingDelete = null}
  onconfirm={confirmDeleteSavedEmbed}
/>

<ConfirmationModal
  bind:isOpen={showOverwriteConfirm}
  title={m.embedbuilder.pageSavedOverwriteAria()}
  message={m.embedbuilder.pageSavedOverwriteMessage({ name: embedPendingOverwrite?.embedName ?? m.embedbuilder.fullscreenSavedNameFallbackThis() })}
  confirmText={m.embedbuilder.pageSavedOverwrite()}
  variant="warning"
  oncancel={() => embedPendingOverwrite = null}
  onconfirm={confirmOverwriteSavedEmbed}
/>

<ConfirmationModal
  bind:isOpen={showSendConfirm}
  title={m.embedbuilder.pageSendButton()}
  message={sendConfirmMessage}
  confirmText={m.common.send()}
  variant="warning"
  onconfirm={sendCurrentEmbed}
/>

<PersonaManager
  bind:isOpen={showPersonaManager}
  {personas}
  userId={data.user?.id ?? null}
  guildId={$currentGuild ? BigInt($currentGuild.id) : null}
  guildName={$currentGuild?.name ?? null}
  onchanged={() => loadPersonas($currentGuild ? BigInt($currentGuild.id) : undefined)}
  onnotify={showNotificationMessage}
/>

<style>
  /* Focus styles for accessibility */
  button:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  /* Smooth transitions */
  .transition-all {
    transition: all 0.2s ease;
  }

  .cursor-grab {
      cursor: grab;
  }

  .cursor-grab:active {
      cursor: grabbing;
  }

  .fa-grip-vertical {
      cursor: grab;
  }

  .fa-grip-vertical:active,
  :global(.dragging-row .fa-grip-vertical) {
      cursor: grabbing;
  }

  [draggable="true"] {
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
  }

  :global(.dragging *) {
      user-select: none !important;
      -webkit-user-select: none !important;
  }

  :global(body.dragging-active) {
      position: fixed !important;
      width: 100% !important;
      height: 100% !important;
      overflow: hidden !important;
      touch-action: none !important;
      -webkit-touch-callout: none !important;
      user-select: none !important;
      -webkit-user-select: none !important;
      -webkit-overflow-scrolling: touch !important;
  }

  :global(body.dragging-active *) {
      touch-action: none !important;
      -webkit-touch-callout: none !important;
      user-select: none !important;
      -webkit-user-select: none !important;
  }

  :global(html) {
      overscroll-behavior: none;
  }

  @media (max-width: 768px) {
      [data-drop-zone] {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: none;
      }
  }
</style>
