<!-- routes/dashboard/embedbuilder/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import type { PageData } from "./$types";
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { embedsApi } from "$lib/api/index.ts";
  import type {
    EmbedPersona,
    SavedEmbed,
    SendableChannel,
    SendEmbedResult
  } from "$lib/api/embeds/models";
  import { fade, fly } from "svelte/transition";
  import { logger } from "$lib/logger.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";

  import TemplateGallery from "$lib/components/specialized/TemplateGallery.svelte";
  import EmbedEditor from "$lib/components/specialized/EmbedEditor.svelte";
  import LinkButtonEditor from "$lib/components/specialized/LinkButtonEditor.svelte";
  import {
    isValidLinkUrl,
    linkButtonsFromComponents,
    linkButtonsToComponents,
    linkButtonsToPreviewRows,
    MAX_LINK_BUTTONS,
    newLinkButton,
    type LinkButton
  } from "$lib/utils/linkButtons";
  import PlaceholderPicker from "$lib/components/forms/PlaceholderPicker.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PersonaManager from "$lib/components/specialized/PersonaManager.svelte";
  import ValidationCard from "$lib/components/specialized/ValidationCard.svelte";
  import PreviewCard from "$lib/components/specialized/PreviewCard.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";

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
  let linkButtons: LinkButton[] = $state([]);


  // Main navigation state
    let activeMainTab = $state("templates");

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
  let embedPendingDelete: SavedEmbed | null = $state(null);

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
    { id: "components", label: m.embedbuilder.tabLinks(), icon: "fa-link" },
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

    const components = linkButtonsToComponents(linkButtons);
    if (components.length > 0) {
      exportData.components = components;
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
    JSON.stringify({ content, embeds, linkButtons });

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

    linkButtons = isFullPayload ? linkButtonsFromComponents(parsed.components) : [];

    jsonParseError = "";
    validateEmbeds();
    validateComponents();
    if (notify) {
      showNotificationMessage(m.embedbuilder.fullscreenNotifyJsonApplied());
      activeMainTab = "editor";
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
      await embedsApi.createEmbed({
        userId: data.user.id,
        guildId: saveAsGuildShared ? guildId : undefined,
        embedName: name,
        jsonCode: JSON.stringify(exportData),
        isGuildShared: saveAsGuildShared
      });

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
    showNotificationMessage(m.embedbuilder.fullscreenNotifyLoadedNamed({ name: saved.embedName ?? m.embedbuilder.fullscreenSavedNameFallback() }));
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

    // Apply template to first embed
    embeds[0] = { ...template.embed };
    embeds = [...embeds];

    // Switch to editor tab
    activeMainTab = "editor";
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

  function addLinkButton() {
    if (linkButtons.length >= MAX_LINK_BUTTONS) {
      showNotificationMessage(m.embedbuilder.linksNotifyMax(), "error");
      return;
    }
    linkButtons = [...linkButtons, newLinkButton()];
  }

  function handleLinkButtonUpdate(detail: { button: LinkButton }) {
    linkButtons = linkButtons.map(b => (b.key === detail.button.key ? detail.button : b));
    validateComponents();
  }

  function handleLinkButtonRemove(detail: { key: string }) {
    linkButtons = linkButtons.filter(b => b.key !== detail.key);
    validateComponents();
    showNotificationMessage(m.embedbuilder.linksNotifyRemoved());
  }

  function handleLinkButtonDuplicate(detail: { key: string }) {
    if (linkButtons.length >= MAX_LINK_BUTTONS) {
      showNotificationMessage(m.embedbuilder.linksNotifyMax(), "error");
      return;
    }
    const index = linkButtons.findIndex(b => b.key === detail.key);
    if (index === -1) return;
    const copy = { ...linkButtons[index], key: newLinkButton().key };
    linkButtons = [...linkButtons.slice(0, index + 1), copy, ...linkButtons.slice(index + 1)];
    showNotificationMessage(m.embedbuilder.linksNotifyDuplicated());
  }

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

    linkButtons.forEach((button, index) => {
      if (!button.displayName.trim()) {
        validationErrors.push({
          id: `component-${button.key}-label`,
          message: m.embedbuilder.fullscreenValidationButtonNeedsLabel(),
          field: `components[${index}]`
        });
      }

      if (!button.url.trim()) {
        validationErrors.push({
          id: `component-${button.key}-url`,
          message: m.embedbuilder.fullscreenValidationLinkNeedsUrl({ name: button.displayName }),
          field: `components[${index}].url`
        });
      } else if (!isValidLinkUrl(button.url)) {
        validationErrors.push({
          id: `component-${button.key}-url`,
          message: m.embedbuilder.componentsErrorLinkUrl(),
          field: `components[${index}].url`
        });
      }
    });
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


  // Tab change handler for DashboardPageLayout
  function handleMainTabChange(detail: { tabId: string }) {
    activeMainTab = detail.tabId;

    // Validate when switching tabs
    validateEmbeds();
    validateComponents();

    if (activeMainTab === "json") {
      refreshJsonPreview();
    } else if (activeMainTab === "saved") {
      const guild = get(currentGuild);
      loadSavedEmbeds(guild ? BigInt(guild.id) : undefined);
    } else if (activeMainTab === "send") {
      const guild = get(currentGuild);
      if (guild) loadSendableChannels(BigInt(guild.id));
      loadPersonas(guild ? BigInt(guild.id) : undefined);
    }
  }

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
      label: jsonCopied ? m.embedbuilder.pageActionCopied() : m.embedbuilder.pageActionCopyJson(),
      icon: "fa-copy",
      action: copyJson,
      disabled: !canCopyJson,
      loading: false,
      style: `background: linear-gradient(to right, ${$colorStore.primary}, ${$colorStore.secondary}); color: ${$colorStore.text};`
    }
    ]);
</script>

{#snippet statusMessageContent()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-50" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  title={m.embedbuilder.pageTitle()}
  subtitle={m.embedbuilder.pageSubtitle()}
  icon="fa-layer-group"
  guildName={m.common.embedBuilder()}
  {tabs}
  activeTab={activeMainTab}
  {actionButtons}
  ontabChange={handleMainTabChange}
  statusMessages={statusMessageContent}
>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full w-full">
    <!-- Editor Side -->
    <section
      class="rounded-2xl border shadow-2xl"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
    >
      <div class="p-6 min-h-[600px]">
        {#if activeMainTab === "templates"}
          <!-- Templates Tab -->
          <div class="space-y-6">
            <div class="text-center mb-6">
              <h2 class="text-xl font-semibold mb-2" style="color: {$colorStore.text};">{m.embedbuilder.pageTemplatesHeading()}</h2>
              <p class="text-sm" style="color: {$colorStore.muted};">
                {m.embedbuilder.pageTemplatesHint()}
              </p>
            </div>

            <TemplateGallery
              onselect={handleTemplateSelect}
            />
            
            <div class="text-center pt-6 border-t" style="border-color: {$colorStore.primary}20;">
              <button
                aria-label={m.embedbuilder.pageStartFromScratch()}
                class="px-6 py-3 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center gap-2 mx-auto"
                style="background: {$colorStore.primary}20;
                       color: {$colorStore.primary};
                       border: 1px solid {$colorStore.primary}30;"
                onclick={() => activeMainTab = "editor"}
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
                ></textarea>
                <button
                  class="absolute right-2 top-2 p-1 rounded-sm hover:bg-black/10"
                  style="color: {$colorStore.muted};"
                  onclick={(e) => showPlaceholderFromButton(e.currentTarget, 'content')}
                  title={m.embedbuilder.editorInsertPlaceholder()}
                >
                  %
                </button>
              </div>
              <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                {m.embedbuilder.pageContentHint()}
              </p>
            </div>

            <!-- Embeds List -->
            <div class="space-y-4">
              <div class="flex justify-between items-center z-50">
                <h3 class="text-lg font-semibold" style="color: {$colorStore.text};">
                  {m.embedbuilder.fullscreenEmbedsHeading({ count: embeds.length, max: 10 })}
                </h3>
                <button
                  aria-label={m.embedbuilder.fullscreenAddEmbed()}
                  class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
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
                  {m.embedbuilder.tabLinks()} <span class="text-xs sm:text-sm font-normal">({linkButtons.length}/{MAX_LINK_BUTTONS})</span>
                </h3>
                <p class="text-xs sm:text-sm" style="color: {$colorStore.muted};">
                  {m.embedbuilder.linksHint()}
                </p>
              </div>

              <button
                aria-label={m.common.addButton()}
                class="px-2 sm:px-4 py-1 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-base font-medium transition-all hover:scale-[1.02] flex items-center gap-1 sm:gap-2 disabled:opacity-50"
                style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                disabled={linkButtons.length >= MAX_LINK_BUTTONS}
                onclick={addLinkButton}
              >
                <i class="fa-solid fa-plus" style="font-size: 12px;"></i>
                <span>{m.common.addButton()}</span>
              </button>
            </div>

            {#if linkButtons.length === 0}
              <div class="text-center py-6 sm:py-12">
                <i class="fa-utility-duo fa-regular fa-link"
                   style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 36px; opacity: 0.5; display: block; margin: 0 auto 12px;"></i>
                <h4 class="text-base sm:text-lg font-semibold mb-1 sm:mb-2" style="color: {$colorStore.text};">{m.embedbuilder.linksEmptyTitle()}</h4>
                <p class="text-xs sm:text-sm mb-2 sm:mb-4" style="color: {$colorStore.muted};">
                  {m.embedbuilder.linksEmptyHint()}
                </p>
              </div>
            {:else}
              <div class="space-y-3 sm:space-y-4" role="list">
                {#each linkButtons as button (button.key)}
                  <div
                    class="p-2 sm:p-4 border rounded-lg"
                    style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;"
                    role="listitem"
                  >
                    <LinkButtonEditor
                      {button}
                      user={data.user}
                      onupdate={handleLinkButtonUpdate}
                      onremove={handleLinkButtonRemove}
                      onduplicate={handleLinkButtonDuplicate}
                    />
                  </div>
                {/each}
              </div>
            {/if}
          </div>

        {:else if activeMainTab === "json"}
          <!-- JSON Tab -->
          <div class="space-y-4">
            <div class="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 class="text-lg font-semibold" style="color: {$colorStore.text};">{m.embedbuilder.fullscreenJsonHeading()}</h3>
                <p class="text-sm" style="color: {$colorStore.muted};">
                  {m.embedbuilder.fullscreenJsonHint()}
                </p>
              </div>
              <div class="flex gap-2">
                <button
                  aria-label={m.embedbuilder.pageJsonRefreshAria()}
                  class="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                  onclick={refreshJsonPreview}
                >
                  <i class="fa-solid fa-rotate" style="font-size: 14px;"></i>
                  {m.embedbuilder.pageJsonRefresh()}
                </button>
                <button
                  aria-label={m.embedbuilder.pageJsonApplyAria()}
                  class="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                  onclick={applyJsonText}
                >
                  <i class="fa-solid fa-check" style="font-size: 14px;"></i>
                  {m.embedbuilder.pageJsonApply()}
                </button>
              </div>
            </div>

            <textarea
              rows="20"
              spellcheck="false"
              class="w-full px-3 py-2 rounded-lg border font-mono text-xs resize-y"
              style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              placeholder={m.embedbuilder.fullscreenJsonPlaceholder()}
              bind:value={jsonText}
            ></textarea>

            {#if jsonParseError}
              <p class="text-sm" style="color: #ED4245;">{jsonParseError}</p>
            {/if}

            <p class="text-xs" style="color: {$colorStore.muted};">
              {m.embedbuilder.pageJsonFooter({ payload: "{ content, embeds, components }" })}
            </p>
          </div>

        {:else if activeMainTab === "saved"}
          <!-- Saved Embeds Tab -->
          <div class="space-y-6">
            <!-- Save current embed -->
            <div
              class="p-4 rounded-lg border space-y-3"
              style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30;"
            >
              <h3 class="text-base font-semibold" style="color: {$colorStore.text};">{m.embedbuilder.fullscreenSaveHeading()}</h3>
              <div class="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  class="flex-1 px-3 py-2 rounded-lg border min-h-[44px]"
                  style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                  placeholder={m.embedbuilder.fullscreenSaveNamePlaceholder()}
                  bind:value={saveEmbedName}
                />
                <button
                  aria-label={m.common.saveEmbed()}
                  class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                  disabled={savingEmbed || !saveEmbedName.trim()}
                  onclick={saveCurrentEmbed}
                >
                  <i class="fa-solid fa-floppy-disk" style="font-size: 14px;"></i>
                  {savingEmbed ? m.common.saving() : m.common.save()}
                </button>
              </div>
              {#if $currentGuild}
                <label class="flex items-center gap-2 text-sm min-h-[44px]" style="color: {$colorStore.muted};">
                  <input type="checkbox" bind:checked={saveAsGuildShared} />
                  {m.embedbuilder.personaShareWithEveryone({ server: $currentGuild.name })}
                </label>
              {/if}
            </div>

            <!-- Guild-shared embeds -->
            {#if $currentGuild}
              <div class="space-y-2">
                <h3 class="text-base font-semibold" style="color: {$colorStore.text};">
                  {m.embedbuilder.pageSavedSharedHeading({ server: $currentGuild.name, count: savedGuildEmbeds.length })}
                </h3>
                {#if loadingSavedEmbeds}
                  <p class="text-sm" style="color: {$colorStore.muted};">{m.common.loading()}</p>
                {:else if savedGuildEmbeds.length === 0}
                  <p class="text-sm" style="color: {$colorStore.muted};">{m.embedbuilder.pageSavedSharedEmpty()}</p>
                {:else}
                  {#each savedGuildEmbeds as saved (saved.id)}
                    <div
                      class="flex items-center justify-between gap-2 p-3 rounded-lg border"
                      style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;"
                    >
                      <span class="text-sm font-medium truncate" style="color: {$colorStore.text};">
                        {saved.embedName}
                      </span>
                      <div class="flex gap-2 shrink-0">
                        <button
                          aria-label={m.embedbuilder.pageSavedLoadAria()}
                          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] min-h-[44px]"
                          style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                          onclick={() => loadSavedEmbed(saved)}
                        >
                          {m.common.load()}
                        </button>
                        <button
                          aria-label={m.embedbuilder.pageSavedDeleteAria()}
                          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] min-h-[44px]"
                          style="background: #ED424520; color: #ED4245; border: 1px solid #ED424530;"
                          onclick={() => requestDeleteSavedEmbed(saved)}
                        >
                          {m.common.delete()}
                        </button>
                      </div>
                    </div>
                  {/each}
                {/if}
              </div>
            {/if}

            <!-- Personal embeds -->
            <div class="space-y-2">
              <h3 class="text-base font-semibold" style="color: {$colorStore.text};">
                {m.embedbuilder.fullscreenMineHeading({ count: savedUserEmbeds.length })}
              </h3>
              {#if !data.user}
                <p class="text-sm" style="color: {$colorStore.muted};">{m.embedbuilder.pageSavedLogin()}</p>
              {:else if loadingSavedEmbeds}
                <p class="text-sm" style="color: {$colorStore.muted};">{m.common.loading()}</p>
              {:else if savedUserEmbeds.length === 0}
                <p class="text-sm" style="color: {$colorStore.muted};">{m.embedbuilder.fullscreenMineEmpty()}</p>
              {:else}
                {#each savedUserEmbeds as saved (saved.id)}
                  <div
                    class="flex items-center justify-between gap-2 p-3 rounded-lg border"
                    style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;"
                  >
                    <span class="text-sm font-medium truncate" style="color: {$colorStore.text};">
                      {saved.embedName}
                    </span>
                    <div class="flex gap-2 shrink-0">
                      <button
                        aria-label={m.embedbuilder.pageSavedLoadAria()}
                        class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] min-h-[44px]"
                        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                        onclick={() => loadSavedEmbed(saved)}
                      >
                        {m.common.load()}
                      </button>
                      <button
                        aria-label={m.embedbuilder.pageSavedDeleteAria()}
                        class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] min-h-[44px]"
                        style="background: #ED424520; color: #ED4245; border: 1px solid #ED424530;"
                        onclick={() => requestDeleteSavedEmbed(saved)}
                      >
                        {m.common.delete()}
                      </button>
                    </div>
                  </div>
                {/each}
              {/if}
            </div>
          </div>

        {:else if activeMainTab === "send"}
          <!-- Send Tab -->
          <div class="space-y-6">
            {#if !$currentGuild}
              <p class="text-sm" style="color: {$colorStore.muted};">
                {m.embedbuilder.pageSendNoGuild()}
              </p>
            {:else}
              <div class="space-y-2">
                <h3 class="text-base font-semibold" style="color: {$colorStore.text};">
                  {m.embedbuilder.pageSendHeading({ server: $currentGuild.name })}
                </h3>
                <p class="text-xs" style="color: {$colorStore.muted};">
                  {m.embedbuilder.pageSendAuditHint()}
                </p>
              </div>

              <!-- Channel picker -->
              <div class="space-y-2">
                <span class="block text-sm font-medium" style="color: {$colorStore.text};">{m.common.channel()}</span>
                {#if loadingSendChannels}
                  <p class="text-sm" style="color: {$colorStore.muted};">{m.common.loadingChannels()}</p>
                {:else if sendChannelsError}
                  <p class="text-sm" style="color: #ED4245;">{sendChannelsError}</p>
                {:else if sendableChannelOptions.length === 0}
                  <p class="text-sm" style="color: #ED4245;">
                    {m.embedbuilder.pageSendNoChannels()}
                  </p>
                {:else}
                  <DiscordSelector
                    type="channel"
                    options={sendableChannelOptions}
                    bind:selected={selectedSendChannelId}
                    placeholder={m.common.selectAChannelPlaceholder()}
                    ariaLabel={m.embedbuilder.pageSendChannelAria()}
                  />
                {/if}
              </div>

              <!-- Permissions for the selected channel -->
              {#if selectedSendChannel}
                <div
                  class="p-4 rounded-lg border space-y-2"
                  style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30;"
                  transition:fly={{ y: -8, duration: 200 }}
                >
                  <h4 class="text-sm font-semibold" style="color: {$colorStore.text};">
                    {m.embedbuilder.pageSendPermissionsHeading({ channel: selectedSendChannel.name })}
                  </h4>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs" style="color: {$colorStore.muted};">
                    <span>{selectedSendChannel.canSend ? "✓" : "✕"} {m.common.sendMessages()}</span>
                    <span>{selectedSendChannel.canEmbed ? "✓" : "✕"} {m.embedbuilder.pageSendPermEmbeds()}</span>
                    <span>{selectedSendChannel.canMentionEveryone ? "✓" : "✕"} {m.embedbuilder.pageSendPermMentions()}</span>
                    <span>{selectedSendChannel.canUseWebhooks ? "✓" : "✕"} {m.common.manageWebhooks()}</span>
                  </div>
                  {#if !selectedSendChannel.canMentionEveryone}
                    <p class="text-xs" style="color: {$colorStore.muted};">
                      {m.embedbuilder.pageSendMentionsStripped()}
                    </p>
                  {/if}
                  {#if embedPermissionBlock}
                    <p class="text-xs" style="color: #ED4245;">{embedPermissionBlock}</p>
                  {/if}
                </div>
              {/if}

              <!-- Webhook options, revealed once a channel is chosen -->
              {#if selectedSendChannel}
                <div
                  class="p-4 rounded-lg border space-y-3"
                  style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30;"
                  transition:fly={{ y: -8, duration: 200 }}
                >
                  <label class="flex items-center gap-2 text-sm min-h-[44px]" style="color: {$colorStore.text};">
                    <input
                      type="checkbox"
                      bind:checked={sendAsWebhook}
                      disabled={!webhookAvailable}
                    />
                    {m.embedbuilder.pageSendWebhookToggle()}
                  </label>

                  {#if !webhookAvailable}
                    <p class="text-xs" style="color: #ED4245;">
                      {selectedSendChannel.canUseWebhooks
                        ? m.embedbuilder.pageSendWebhookNeedBot()
                        : m.embedbuilder.pageSendWebhookNeedUser()}
                    </p>
                  {/if}

                  {#if sendAsWebhook}
                    <div class="space-y-2" transition:fly={{ y: -8, duration: 200 }}>
                      <!-- Send as: a saved persona, or a one-off name and avatar -->
                      <span class="block text-sm font-medium" style="color: {$colorStore.text};">{m.embedbuilder.pageSendAs()}</span>

                      <div class="flex flex-wrap items-center gap-2">
                        <button
                          aria-label={m.embedbuilder.pageSendCustomAria()}
                          class="px-3 py-2 rounded-lg text-xs font-medium transition-all min-h-[44px]"
                          style="background: {$colorStore.primary}{selectedPersonaId === null ? '30' : '10'};
                                 color: {$colorStore.primary};
                                 border: 1px solid {$colorStore.primary}{selectedPersonaId === null ? '60' : '30'};"
                          onclick={() => (selectedPersonaId = null)}
                        >
                          {m.common.custom()}
                        </button>
                        {#each personas as persona (persona.id)}
                          <button
                            aria-label={m.embedbuilder.pageSendAsPersonaAria({ name: persona.name })}
                            class="px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 min-h-[44px]"
                            style="background: {$colorStore.primary}{selectedPersonaId === persona.id ? '30' : '10'};
                                   color: {$colorStore.primary};
                                   border: 1px solid {$colorStore.primary}{selectedPersonaId === persona.id ? '60' : '30'};"
                            onclick={() => (selectedPersonaId = persona.id)}
                          >
                            {#if persona.avatarUrl}
                              <img alt="" class="w-5 h-5 rounded-full object-cover" src={persona.avatarUrl} />
                            {/if}
                            {persona.name}
                            {#if persona.isGuildShared}
                              <i class="fa-solid fa-users" style="font-size: 10px;"></i>
                            {/if}
                          </button>
                        {/each}
                        {#if loadingPersonas}
                          <span class="text-xs" style="color: {$colorStore.muted};">{m.common.loading()}</span>
                        {/if}

                        <!-- Trailing action, dashed so it does not read as another persona to pick -->
                        <button
                          aria-label={m.embedbuilder.pageSendManageAria()}
                          class="px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 min-h-[44px]"
                          style="color: {$colorStore.muted}; border: 1px dashed {$colorStore.primary}40;"
                          onclick={() => (showPersonaManager = true)}
                        >
                          <i class="fa-solid fa-gear" style="font-size: 12px;"></i>
                          {m.common.manage()}
                        </button>
                      </div>

                    </div>

                    <!-- One-off name and avatar, used when no persona is picked -->
                    {#if selectedPersonaId === null}
                      <div class="space-y-2" transition:fly={{ y: -8, duration: 200 }}>
                        <input
                          type="text"
                          class="w-full px-3 py-2 rounded-lg border min-h-[44px]"
                          style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          placeholder={m.embedbuilder.pageSendWebhookNamePlaceholder()}
                          maxlength="80"
                          bind:value={webhookUsername}
                        />

                        <input
                          type="url"
                          class="w-full px-3 py-2 rounded-lg border min-h-[44px]"
                          style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          placeholder={m.embedbuilder.pageSendWebhookAvatarPlaceholder()}
                          bind:value={webhookAvatarUrl}
                        />

                        <p class="text-xs" style="color: {$colorStore.muted};">
                          {m.embedbuilder.pageSendLinksOnly()}
                          <button
                            class="underline"
                            style="color: {$colorStore.primary};"
                            onclick={() => (showPersonaManager = true)}
                          >
                            {m.embedbuilder.pageSendSavePersona()}
                          </button>
                        </p>
                      </div>
                    {/if}
                  {/if}
                </div>
              {/if}

              <!-- Send button -->
              <button
                aria-label={m.embedbuilder.pageSendButton()}
                class="w-full px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
                style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                disabled={sending || !selectedSendChannelId || !canCopyJson || !!embedPermissionBlock}
                onclick={() => (showSendConfirm = true)}
              >
                <i class="fa-solid fa-paper-plane" style="font-size: 14px;"></i>
                {sending ? m.common.sending() : m.embedbuilder.pageSendButton()}
              </button>

              {#if lastSendResult}
                <div
                  class="p-3 rounded-lg border text-sm"
                  style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20; color: {$colorStore.text};"
                >
                  {lastSendResult.personaName
                    ? m.embedbuilder.pageSendResultPersona({ channel: lastSendResult.channelName, persona: lastSendResult.personaName })
                    : lastSendResult.sentViaWebhook
                      ? m.embedbuilder.pageSendResultWebhook({ channel: lastSendResult.channelName })
                      : m.embedbuilder.pageSendResultBot({ channel: lastSendResult.channelName })}
                  <a
                    class="underline"
                    href={lastSendResult.messageLink}
                    rel="noopener noreferrer"
                    style="color: {$colorStore.primary};"
                    target="_blank"
                  >
                    {m.embedbuilder.pageSendJump()}
                  </a>
                </div>
              {/if}

              <!-- Channels that exist but cannot be used -->
              {#if blockedChannels.length > 0}
                <div class="space-y-2">
                  <h4 class="text-sm font-semibold" style="color: {$colorStore.text};">
                    {m.embedbuilder.pageSendUnavailable({ count: blockedChannels.length })}
                  </h4>
                  {#each blockedChannels as channel (channel.id)}
                    <div
                      class="flex items-center justify-between gap-2 p-2 rounded-lg border text-xs"
                      style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;"
                    >
                      <span class="truncate" style="color: {$colorStore.text};">#{channel.name}</span>
                      <span class="shrink-0" style="color: {$colorStore.muted};">{channel.restriction}</span>
                    </div>
                  {/each}
                </div>
              {/if}
            {/if}
          </div>

        {/if}
      </div>
    </section>

    <!-- Preview Side -->
    <section
      class="hidden lg:block rounded-2xl border shadow-2xl sticky top-4 self-start"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
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
          componentRows={linkButtonsToPreviewRows(linkButtons)}
          emptyMessage={m.embedbuilder.previewEmptyMessage()}
        />
      </div>
    </section>
  </div>
</DashboardPageLayout>

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
</style>
