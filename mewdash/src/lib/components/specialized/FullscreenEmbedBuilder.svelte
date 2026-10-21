<!-- FullscreenEmbedBuilder.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import Portal from "$lib/components/ui/Portal.svelte";
  import PreviewCard from "./PreviewCard.svelte";
  import EmbedEditor from "./EmbedEditor.svelte";
  import LinkButtonEditor from "./LinkButtonEditor.svelte";
  import {
    isValidLinkUrl,
    linkButtonsFromComponents,
    linkButtonsToComponents,
    linkButtonsToPreviewRows,
    MAX_LINK_BUTTONS,
    newLinkButton,
    type LinkButton
  } from "$lib/utils/linkButtons";
  import ValidationCard from "./ValidationCard.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PlaceholderPicker from "$lib/components/forms/PlaceholderPicker.svelte";
  import { fade, slide } from "svelte/transition";
  import { embedsApi } from "$lib/api/index.ts";
  import type { SavedEmbed } from "$lib/api/embeds/models";
  import { logger } from "$lib/logger.ts";
  import type { FluxerUser } from "$lib/types/fluxer";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";

  interface Props {
    // Bound value - the JSON output
    value?: any;
    // Preview settings
    previewTitle?: string;
    previewDescription?: string;
    // Customization options
    allowMultipleEmbeds?: boolean;
    maxEmbeds?: number;
    allowComponents?: boolean;
    allowContent?: boolean;
    // Placeholders
    placeholders?: Placeholder[];
    additionalPlaceholders?: Placeholder[];
    // Restrictions
    restrictedFields?: string[]; // Fields to hide in embed editor
    // Appearance
    placeholder?: string; // Placeholder text when empty
    icon?: string; // Icon to show in preview
    // Guild/User context
    guildId?: string | bigint | null;
    user?: FluxerUser | null;
    id?: string;
    ariaLabelledby?: string;
    // Events
    onchange?: (value: any) => void;
    onclose?: () => void;
  }

  interface Placeholder {
    category: string;
    name: string;
    description: string;
  }

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



  let {
    value = $bindable({}),
    previewTitle = m.common.embedBuilder(),
    previewDescription = m.embedbuilder.componentsClickToEdit(),
    allowMultipleEmbeds = true,
    maxEmbeds = 10,
    allowComponents = true,
    allowContent = true,
    placeholders = [],
    additionalPlaceholders = [],
    restrictedFields = [],
    placeholder = m.embedbuilder.fullscreenDefaultPlaceholder(),
    icon = "fa-layer-group",
    guildId = null,
    user = null,
    id,
    ariaLabelledby,
    onchange,
    onclose
  }: Props = $props();

  // State
  let isOpen = $state(false);
  let activeTab = $state("editor");
  let embeds: Embed[] = $state([]);
  let content = $state("");
  let showContentPlaceholders = $state(false);
  let contentPlaceholderSearch = $state("");
  let contentTextarea: HTMLTextAreaElement | null = $state(null);
  let linkButtons: LinkButton[] = $state([]);

  /**
   * Inserts a placeholder token into the message content at the caret,
   * mirroring the percent button every embed field already has.
   */
  function insertContentPlaceholder(placeholder: { name: string }) {
    const element = contentTextarea;
    const start = element?.selectionStart ?? content.length;
    const end = element?.selectionEnd ?? content.length;
    content = content.substring(0, start) + placeholder.name + content.substring(end);
    showContentPlaceholders = false;
    contentPlaceholderSearch = "";
    if (element) {
      const caret = start + placeholder.name.length;
      requestAnimationFrame(() => {
        element.focus();
        element.setSelectionRange(caret, caret);
      });
    }
  }
  let validationErrors: any[] = $state([]);
  let validationWarnings: any[] = $state([]);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let showMobilePreview = $state(false);
  let hasInitialized = $state(false);
  let editHistory = $state<string[]>([]);
  let historyIndex = $state(-1);
  let initialSnapshot = $state("");
  let restoringHistory = false;
  let historyDebounce: ReturnType<typeof setTimeout> | null = null;

  // JSON tab state
  let jsonText = $state("");
  let jsonParseError = $state("");

  // Saved embeds state
  let savedUserEmbeds: SavedEmbed[] = $state([]);
  let savedGuildEmbeds: SavedEmbed[] = $state([]);
  let loadingSavedEmbeds = $state(false);
  let saveEmbedName = $state("");
  let saveAsGuildShared = $state(false);
  let savingEmbed = $state(false);
  let showDeleteSavedConfirm = $state(false);
  let embedPendingDelete: SavedEmbed | null = $state(null);

  let guildIdBigInt = $derived.by(() => {
    if (!guildId) return null;
    return typeof guildId === "string" ? BigInt(guildId) : guildId;
  });

  // Default placeholders - comprehensive list from backend ReplacementBuilder
  const defaultPlaceholders: Placeholder[] = $derived([
    // User placeholders
    { category: "User", name: "%user%", description: m.placeholders.user() },
    { category: "User", name: "%user.mention%", description: m.placeholders.userMention() },
    { category: "User", name: "%user.id%", description: m.placeholders.userId() },
    { category: "User", name: "%user.name%", description: m.placeholders.userName() },
    { category: "User", name: "%user.fullname%", description: m.placeholders.userFullname() },
    { category: "User", name: "%user.avatar%", description: m.placeholders.userAvatar() },
    { category: "User", name: "%user.banner%", description: m.placeholders.userBanner() },
    { category: "User", name: "%user.created_time%", description: m.placeholders.userCreatedTime() },
    { category: "User", name: "%user.created_date%", description: m.placeholders.userCreatedDate() },
    { category: "User", name: "%user.joined_time%", description: m.placeholders.userJoinedTime() },
    { category: "User", name: "%user.joined_date%", description: m.placeholders.userJoinedDate() },

    // Server placeholders
    { category: "Server", name: "%server%", description: m.placeholders.server() },
    { category: "Server", name: "%server.name%", description: m.placeholders.serverName() },
    { category: "Server", name: "%server.id%", description: m.placeholders.serverId() },
    { category: "Server", name: "%server.icon%", description: m.placeholders.mcFavicon() },
    { category: "Server", name: "%server.banner%", description: m.placeholders.serverBanner() },
    { category: "Server", name: "%server.members%", description: m.placeholders.serverMembers() },
    { category: "Server", name: "%server.members.online%", description: m.placeholders.serverMembersOnline() },
    { category: "Server", name: "%server.members.offline%", description: m.placeholders.serverMembersOffline() },
    { category: "Server", name: "%server.members.dnd%", description: m.placeholders.serverMembersDnd() },
    { category: "Server", name: "%server.members.idle%", description: m.placeholders.serverMembersIdle() },
    { category: "Server", name: "%server.time%", description: m.placeholders.serverTime() },
    { category: "Server", name: "%server.timestamp.longdatetime%", description: m.placeholders.serverTimestampLongdatetime() },
    { category: "Server", name: "%server.timestamp.longtime%", description: m.placeholders.serverTimestampLongtime() },
    { category: "Server", name: "%server.timestamp.longdate%", description: m.placeholders.serverTimestampLongdate() },
    { category: "Server", name: "%server.timestamp.shortdatetime%", description: m.placeholders.serverTimestampShortdatetime() },

    // Channel placeholders
    { category: "Channel", name: "%channel%", description: m.placeholders.channel() },
    { category: "Channel", name: "%channel.mention%", description: m.placeholders.channel() },
    { category: "Channel", name: "%channel.name%", description: m.placeholders.channelName() },
    { category: "Channel", name: "%channel.id%", description: m.placeholders.channelId() },
    { category: "Channel", name: "%channel.created%", description: m.placeholders.channelCreated() },
    { category: "Channel", name: "%channel.nsfw%", description: m.placeholders.channelNsfw() },
    { category: "Channel", name: "%channel.topic%", description: m.placeholders.channelTopic() },

    // Bot placeholders
    { category: "Bot", name: "%bot.status%", description: m.placeholders.botStatus() },
    { category: "Bot", name: "%bot.latency%", description: m.placeholders.botLatency() },
    { category: "Bot", name: "%bot.name%", description: m.placeholders.botName() },
    { category: "Bot", name: "%bot.fullname%", description: m.placeholders.botFullname() },
    { category: "Bot", name: "%bot.id%", description: m.placeholders.botId() },
    { category: "Bot", name: "%bot.avatar%", description: m.placeholders.botAvatar() },
    { category: "Bot", name: "%bot.time%", description: m.placeholders.botTime() },

    // Shard/Stats placeholders
    { category: "Stats", name: "%shard.servercount%", description: m.placeholders.shardServercount() },
    { category: "Stats", name: "%shard.usercount%", description: m.placeholders.shardUsercount() },

    // Time/Date placeholders
    { category: "Time", name: "%time.month%", description: m.placeholders.month() },
    { category: "Time", name: "%time.day%", description: m.placeholders.timeDay() },
    { category: "Time", name: "%time.year%", description: m.placeholders.timeYear() },

    // Random placeholders
    { category: "Random", name: "%rng%", description: m.placeholders.rng() },
    { category: "Random", name: "%rng(1,100)%", description: m.placeholders.rngRange() },
    { category: "Random", name: "%choose(a|b|c)%", description: m.placeholders.choose() },
    { category: "Random", name: "%target%", description: m.placeholders.target() },
    { category: "Random", name: "%img:query%", description: m.placeholders.img() },

    // GIF placeholders (nekos.best API)
    { category: "GIFs", name: "%bakagif%", description: m.placeholders.gifBaka() },
    { category: "GIFs", name: "%bitegif%", description: m.placeholders.gifBite() },
    { category: "GIFs", name: "%blushgif%", description: m.placeholders.gifBlush() },
    { category: "GIFs", name: "%boredgif%", description: m.placeholders.gifBored() },
    { category: "GIFs", name: "%crygif%", description: m.placeholders.gifCry() },
    { category: "GIFs", name: "%cuddlegif%", description: m.placeholders.gifCuddle() },
    { category: "GIFs", name: "%dancegif%", description: m.placeholders.gifDance() },
    { category: "GIFs", name: "%facepalmgif%", description: m.placeholders.gifFacepalm() },
    { category: "GIFs", name: "%feedgif%", description: m.placeholders.gifFeed() },
    { category: "GIFs", name: "%handholdgif%", description: m.placeholders.gifHandhold() },
    { category: "GIFs", name: "%happygif%", description: m.placeholders.gifHappy() },
    { category: "GIFs", name: "%highfivegif%", description: m.placeholders.gifHighfive() },
    { category: "GIFs", name: "%huggif%", description: m.placeholders.gifHug() },
    { category: "GIFs", name: "%kickgif%", description: m.placeholders.gifKick() },
    { category: "GIFs", name: "%kissgif%", description: m.placeholders.gifKiss() },
    { category: "GIFs", name: "%laughgif%", description: m.placeholders.gifLaugh() },
    { category: "GIFs", name: "%patgif%", description: m.placeholders.gifPat() },
    { category: "GIFs", name: "%pokegif%", description: m.placeholders.gifPoke() },
    { category: "GIFs", name: "%poutgif%", description: m.placeholders.gifPout() },
    { category: "GIFs", name: "%punchgif%", description: m.placeholders.gifPunch() },
    { category: "GIFs", name: "%shootgif%", description: m.placeholders.gifShoot() },
    { category: "GIFs", name: "%shruggif%", description: m.placeholders.gifShrug() },
    { category: "GIFs", name: "%slapgif%", description: m.placeholders.gifSlap() },
    { category: "GIFs", name: "%sleepgif%", description: m.placeholders.gifSleep() },
    { category: "GIFs", name: "%smilegif%", description: m.placeholders.gifSmile() },
    { category: "GIFs", name: "%smuggif%", description: m.placeholders.gifSmug() },
    { category: "GIFs", name: "%staregif%", description: m.placeholders.gifStare() },
    { category: "GIFs", name: "%thinkgif%", description: m.placeholders.gifThink() },
    { category: "GIFs", name: "%thumbsupgif%", description: m.placeholders.gifThumbsup() },
    { category: "GIFs", name: "%ticklegif%", description: m.placeholders.gifTickle() },
    { category: "GIFs", name: "%wavegif%", description: m.placeholders.gifWave() },
    { category: "GIFs", name: "%winkgif%", description: m.placeholders.gifWink() }
  ]);

  // Combine all placeholders and filter duplicates by name
  let allPlaceholders = $derived((() => {
    const combined = [
      ...defaultPlaceholders,
      ...placeholders,
      ...additionalPlaceholders
    ];

    // Deduplicate by placeholder name (case-insensitive)
    const seen = new Map<string, Placeholder>();
    combined.forEach(placeholder => {
      const key = placeholder.name.toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, placeholder);
      }
    });

    return Array.from(seen.values());
  })());

  // Initialize from value
  $effect(() => {
    // Parse content
    content = typeof value?.content === "string" ? value.content : "";

    // Parse embeds
    if (value?.embeds && Array.isArray(value.embeds) && value.embeds.length > 0) {
      embeds = value.embeds.map((e: any) => ({
        title: e.title || "",
        description: e.description || "",
        color: e.color || "#5865F2",
        url: e.url || "",
        author: e.author || { name: "", url: "", icon_url: "" },
        thumbnail: e.thumbnail || { url: "" },
        image: e.image || { url: "" },
        footer: e.footer || { text: "", icon_url: "" },
        fields: e.fields || []
      }));
      hasInitialized = true;
    } else if (value === "" || value === null || value === undefined) {
      // Completely empty - don't auto-create embeds
      embeds = [];
    } else if (!hasInitialized) {
      // First time initialization with empty object - create one embed for editing
      embeds = [{
        title: "",
        description: "",
        color: "#5865F2",
        url: "",
        author: { name: "", url: "", icon_url: "" },
        thumbnail: { url: "" },
        image: { url: "" },
        footer: { text: "", icon_url: "" },
        fields: []
      }];
      hasInitialized = true;
    }

    linkButtons = allowComponents ? linkButtonsFromComponents(value?.components) : [];
  });

  function open() {
    if (historyDebounce) clearTimeout(historyDebounce);
    initialSnapshot = serializeDraft();
    editHistory = [initialSnapshot];
    historyIndex = 0;
    isOpen = true;
    loadSavedEmbeds();
    validateEmbeds();
    validateComponents();
    // Prevent body scrolling
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    }
  }

  function close() {
    if (historyDebounce) clearTimeout(historyDebounce);
    isOpen = false;
    onclose?.();
    // Restore body scrolling
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
  }

  function cancel() {
    restoreSnapshot(initialSnapshot);
    const restoredValue = initialSnapshot ? JSON.parse(initialSnapshot) : "";
    value = restoredValue;
    onchange?.(restoredValue);
    close();
  }

  function save() {
    validateEmbeds();
    validateComponents();
    if (validationErrors.length > 0) {
      showNotificationMessage(validationErrors.length === 1 ? m.embedbuilder.fullscreenNotifyFixProblemsOne({ count: 1 }) : m.embedbuilder.fullscreenNotifyFixProblemsOther({ count: validationErrors.length }), "error");
      return;
    }

    const outputData = cleanOutput();
    value = outputData;
    onchange?.(outputData);
    showNotificationMessage(m.embedbuilder.fullscreenNotifySaved());
    close();
  }

  // Clean output for export
  function cleanOutput() {
    const cleanedEmbeds = embeds.map(cleanEmbed).filter(hasVisibleContent);

    const exportData: any = {};

    // Only include content if allowed and not empty
    if (allowContent && content.trim()) {
      exportData.content = content.trim();
    }

    // Only include embeds if there are any
    if (cleanedEmbeds.length > 0) {
      exportData.embeds = cleanedEmbeds;
    }

    // Clean and flatten components if allowed
    if (allowComponents) {
      const components = linkButtonsToComponents(linkButtons);
      if (components.length > 0) {
        exportData.components = components;
      }
    }

    // If nothing was added, return empty string instead of empty object
    if (Object.keys(exportData).length === 0) {
      return "";
    }

    return exportData;
  }

  function serializeDraft(): string {
    const output = cleanOutput();
    return typeof output === "string" ? "" : JSON.stringify(output);
  }

  function restoreSnapshot(snapshot: string) {
    if (historyDebounce) clearTimeout(historyDebounce);
    restoringHistory = true;

    if (!snapshot) {
      content = "";
      embeds = [];
      linkButtons = [];
      validateEmbeds();
      validateComponents();
    } else {
      applyImportedJson(snapshot, false);
    }

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

  $effect(() => {
    JSON.stringify({ content, embeds, linkButtons });

    if (!isOpen || restoringHistory) return;

    if (historyDebounce) clearTimeout(historyDebounce);
    historyDebounce = setTimeout(() => {
      const snapshot = serializeDraft();
      if (snapshot === editHistory[historyIndex]) return;

      const nextHistory = [...editHistory.slice(0, historyIndex + 1), snapshot].slice(-50);
      editHistory = nextHistory;
      historyIndex = nextHistory.length - 1;
    }, 350);
  });

  /**
   * Whether a cleaned embed shows anything. Discord rejects the whole message when one embed has only a color or
   * a link, so those are left out of the output.
   * @param cleaned An embed from cleanEmbed
   */
  function hasVisibleContent(cleaned: any): boolean {
    return !!(cleaned.title || cleaned.description || cleaned.fields?.length || cleaned.image || cleaned.thumbnail ||
      cleaned.author?.name || cleaned.footer?.text);
  }

  function cleanEmbed(embed: Embed) {
    const cleaned: any = {};

    if (embed.title?.trim()) cleaned.title = embed.title;
    if (embed.description?.trim()) cleaned.description = embed.description;
    if (embed.color) cleaned.color = embed.color;
    if (embed.url?.trim()) cleaned.url = embed.url;

    if (embed.author?.name?.trim() || embed.author?.url?.trim() || embed.author?.icon_url?.trim()) {
      cleaned.author = {};
      if (embed.author.name?.trim()) cleaned.author.name = embed.author.name;
      if (embed.author.url?.trim()) cleaned.author.url = embed.author.url;
      if (embed.author.icon_url?.trim()) cleaned.author.icon_url = embed.author.icon_url;
    }

    if (embed.footer?.text?.trim() || embed.footer?.icon_url?.trim()) {
      cleaned.footer = {};
      if (embed.footer.text?.trim()) cleaned.footer.text = embed.footer.text;
      if (embed.footer.icon_url?.trim()) cleaned.footer.icon_url = embed.footer.icon_url;
    }

    if (embed.thumbnail?.url?.trim()) {
      cleaned.thumbnail = { url: embed.thumbnail.url };
    }
    if (embed.image?.url?.trim()) {
      cleaned.image = { url: embed.image.url };
    }

    if (embed.fields?.length > 0) {
      cleaned.fields = embed.fields;
    }

    return cleaned;
  }

  // Refreshes the editable JSON textarea from the current builder state
  function refreshJsonPreview() {
    const data = cleanOutput();
    jsonText = typeof data === "string" ? "{}" : JSON.stringify(data, null, 2);
    jsonParseError = "";
  }

  // Parses embed JSON (either { content, embeds, components } or a bare embed) and loads it into
  // the builder. Respects the same restrictions manual editing is subject to: allowContent,
  // allowMultipleEmbeds/maxEmbeds, and allowComponents.
  function applyImportedJson(text: string, notify = true) {
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      jsonParseError = m.embedbuilder.fullscreenJsonParseError();
      if (notify) showNotificationMessage(m.embedbuilder.fullscreenNotifyJsonInvalid(), "error");
      return;
    }

    const isFullPayload = "content" in parsed || "embeds" in parsed || "components" in parsed;
    const parsedEmbeds = isFullPayload ? parsed.embeds : [parsed];

    content = allowContent && isFullPayload && parsed.content ? String(parsed.content) : "";

    if (Array.isArray(parsedEmbeds) && parsedEmbeds.length > 0) {
      const limit = allowMultipleEmbeds ? maxEmbeds : 1;
      embeds = parsedEmbeds.slice(0, limit).map((e: any) => ({
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
      embeds = [];
    }
    hasInitialized = true;

    const importedComponents = isFullPayload && Array.isArray(parsed.components) ? parsed.components : [];
    const importedButtons = allowComponents ? linkButtonsFromComponents(importedComponents) : [];
    linkButtons = importedButtons;
    const componentsSkipped = importedComponents.length > importedButtons.length;

    jsonParseError = "";
    validateEmbeds();
    validateComponents();
    if (notify) {
      showNotificationMessage(
        componentsSkipped ? m.embedbuilder.fullscreenNotifyJsonAppliedSkipped() : m.embedbuilder.fullscreenNotifyJsonApplied()
      );
      activeTab = "editor";
    }
  }

  function applyJsonText() {
    applyImportedJson(jsonText);
  }

  // Loads the personal and (if a guild is selected) guild-shared saved embed templates
  async function loadSavedEmbeds() {
    if (!user?.id) return;
    loadingSavedEmbeds = true;
    try {
      savedUserEmbeds = await embedsApi.getUserEmbeds(user.id);
      savedGuildEmbeds = guildIdBigInt ? await embedsApi.getGuildEmbeds(guildIdBigInt) : [];
    } catch (error) {
      logger.error("Failed to load saved embeds:", error);
      showNotificationMessage(m.embedbuilder.fullscreenNotifyLoadSavedFailed(), "error");
    } finally {
      loadingSavedEmbeds = false;
    }
  }

  // Saves the current builder state as a reusable embed template
  async function saveCurrentEmbed() {
    if (!user?.id) {
      showNotificationMessage(m.embedbuilder.fullscreenNotifyLoginRequired(), "error");
      return;
    }

    const name = saveEmbedName.trim();
    if (!name) {
      showNotificationMessage(m.embedbuilder.fullscreenNotifyNameRequired(), "error");
      return;
    }

    const exportData = cleanOutput();
    if (!exportData || (typeof exportData === "object" && Object.keys(exportData).length === 0)) {
      showNotificationMessage(m.embedbuilder.fullscreenNotifyNothingToSave(), "error");
      return;
    }

    if (saveAsGuildShared && !guildIdBigInt) {
      showNotificationMessage(m.embedbuilder.fullscreenNotifyServerRequired(), "error");
      return;
    }

    savingEmbed = true;
    try {
      await embedsApi.createEmbed({
        userId: user.id,
        guildId: saveAsGuildShared ? guildIdBigInt : undefined,
        embedName: name,
        jsonCode: JSON.stringify(exportData),
        isGuildShared: saveAsGuildShared
      });

      showNotificationMessage(m.embedbuilder.fullscreenNotifySavedNamed({ name }));
      saveEmbedName = "";
      await loadSavedEmbeds();
    } catch (error) {
      logger.error("Failed to save embed:", error);
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
    showDeleteSavedConfirm = true;
  }

  async function confirmDeleteSavedEmbed() {
    const saved = embedPendingDelete;
    embedPendingDelete = null;
    if (!saved || !user?.id) return;

    try {
      await embedsApi.deleteEmbed(saved.id, user.id);
      showNotificationMessage(m.embedbuilder.personaDeleted({ name: saved.embedName ?? m.embedbuilder.fullscreenSavedNameFallback() }));
      await loadSavedEmbeds();
    } catch (error) {
      logger.error("Failed to delete embed:", error);
      showNotificationMessage(m.embedbuilder.fullscreenNotifyDeleteFailed(), "error");
    }
  }

  // Embed management
  function addEmbed() {
    if (embeds.length >= maxEmbeds) return;

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
    if (embeds.length > 1 || !allowMultipleEmbeds) {
      embeds = embeds.filter((_, i) => i !== index);
      showNotificationMessage(m.embedbuilder.fullscreenNotifyEmbedRemoved());
    }
  }

  function clearAllEmbeds() {
    embeds = [];
    showNotificationMessage(m.embedbuilder.fullscreenNotifyEmbedsCleared());
  }

  function clearAll() {
    // Clear everything
    content = "";
    embeds = [];
    linkButtons = [];

    // Set the bound value to empty string
    value = "";
    onchange?.("");

    showNotificationMessage(m.embedbuilder.fullscreenNotifyEverythingCleared());
  }

  function duplicateEmbed(index: number) {
    if (embeds.length >= maxEmbeds) return;

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

  // Validation
  function validateEmbeds() {
    validationErrors = validationErrors.filter(err => err.id.startsWith("component-"));
    validationWarnings = [];

    embeds.forEach((embed, index) => {
      if (!embed.author?.name?.trim() && (embed.author?.url?.trim() || embed.author?.icon_url?.trim())) {
        validationErrors.push({
          id: `embed-${index}-author`,
          message: m.embedbuilder.fullscreenValidationAuthorNeedsName({ number: index + 1 }),
          field: `embeds[${index}].author.name`
        });
      }

      if (!embed.footer?.text?.trim() && embed.footer?.icon_url?.trim()) {
        validationErrors.push({
          id: `embed-${index}-footer`,
          message: m.embedbuilder.fullscreenValidationFooterNeedsText({ number: index + 1 }),
          field: `embeds[${index}].footer.text`
        });
      }

      embed.fields?.forEach((field, fieldIndex) => {
        if (!field.name?.trim() || !field.value?.trim()) {
          validationErrors.push({
            id: `embed-${index}-field-${fieldIndex}`,
            message: m.embedbuilder.fullscreenValidationFieldIncomplete({ embed: index + 1, field: fieldIndex + 1 }),
            field: `embeds[${index}].fields[${fieldIndex}]`
          });
        }
      });

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

      if (!hasVisibleContent(cleanEmbed(embed))) {
        validationWarnings.push({
          id: `embed-${index}-empty`,
          message: m.embedbuilder.fullscreenValidationEmbedEmpty({ number: index + 1 }),
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

  // Notification helper
  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  // Check if has content
  let hasContent = $derived(
    (allowContent && typeof content === "string" && content.trim()) ||
    embeds.some(e => e.title || e.description || e.fields?.length > 0) ||
    (allowComponents && linkButtons.length > 0)
  );

  // Mobile detection
  let isMobile = $derived.by(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  });
</script>

<!-- Preview (clickable) -->
<button
  {id}
  aria-labelledby={ariaLabelledby}
  class="w-full text-left rounded-xl border transition-all hover:shadow-lg hover:scale-[1.01] cursor-pointer p-4"
  onclick={open}
  style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
  type="button"
>
  <div class="flex items-start gap-4">
    <div class="flex-shrink-0 mt-1">
      <i class="fa-solid {icon}" style="color: {$colorStore.primary}; font-size: 24px;"></i>
    </div>

    <div class="flex-1 min-w-0">
      <h3 class="text-base font-semibold mb-1" style="color: {$colorStore.text};">
        {previewTitle}
      </h3>
      <p class="text-sm mb-3" style="color: {$colorStore.muted};">
        {previewDescription}
      </p>

      {#if hasContent}
        <!-- Mini preview using PreviewCard -->
        <div class="max-h-[200px] overflow-hidden rounded-lg border" style="border-color: {$colorStore.primary}20;">
          <div class="scale-75 origin-top-left" style="width: 133.33%;">
            <PreviewCard
              {content}
              {embeds}
              componentRows={linkButtonsToPreviewRows(linkButtons)}
              {user}
              {guildId}
              showEmpty={false}
            />
          </div>
        </div>
      {:else}
        <div class="text-center py-8 rounded-lg"
             style="background: {$colorStore.primary}03; border: 1px dashed {$colorStore.primary}20;">
          <p class="text-sm" style="color: {$colorStore.muted};">
            {placeholder}
          </p>
        </div>
      {/if}
    </div>

    <div class="flex-shrink-0">
      <i class="fa-solid fa-chevron-right" style="color: {$colorStore.muted}; font-size: 16px;"></i>
    </div>
  </div>
</button>

<!-- Fullscreen Editor Modal -->
{#if isOpen}
  <Portal>
    <div class="fixed inset-0 z-[9999] flex flex-col" transition:fade={{ duration: 200 }}>
      <!-- Backdrop -->
      <button
        type="button"
        class="absolute inset-0 bg-black/80 backdrop-blur-sm"
        aria-label={m.common.ariaCloseEditor()}
        onclick={cancel}
      ></button>

      <!-- Modal Content -->
      <div
        class="relative flex-1 flex flex-col m-0 md:m-4 rounded-none md:rounded-2xl overflow-hidden"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}98, {$colorStore.gradientMid}99);"
        transition:slide={{ duration: 300 }}
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-4 md:px-6 py-4 border-b"
          style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30;"
        >
          <div>
            <h2 class="text-lg md:text-xl font-bold" style="color: {$colorStore.text};">
              {previewTitle}
            </h2>
            <p class="text-xs md:text-sm" style="color: {$colorStore.muted};">
              {previewDescription}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button
              class="px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-sm transition-all hover:scale-[1.02] disabled:opacity-50"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              onclick={undo}
              disabled={historyIndex <= 0}
              type="button"
              title={m.common.undo()}
            >
              <i class="fa-solid fa-rotate-left"></i>
              <span class="hidden sm:inline ml-1">{m.common.undo()}</span>
            </button>
            <button
              class="px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-sm transition-all hover:scale-[1.02] disabled:opacity-50"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              onclick={redo}
              disabled={historyIndex >= editHistory.length - 1}
              type="button"
              title={m.common.redo()}
            >
              <i class="fa-solid fa-rotate-right"></i>
              <span class="hidden sm:inline ml-1">{m.common.redo()}</span>
            </button>
            <button
              class="px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-sm transition-all hover:scale-[1.02]"
              style="background: #ED424520; color: #ED4245; border: 1px solid #ED424530;"
              onclick={clearAll}
              type="button"
              title={m.embedbuilder.fullscreenClearEverything()}
            >
              <i class="fa-solid fa-eraser"></i>
              <span class="hidden sm:inline ml-1">{m.common.clearAll()}</span>
            </button>
            <button
              class="px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-sm transition-all hover:scale-[1.02]"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              onclick={cancel}
              type="button"
            >
              {m.common.cancel()}
            </button>
            <button
              class="px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-sm transition-all hover:scale-[1.02]"
              style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
              onclick={save}
              type="button"
            >
              {m.common.save()}
            </button>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 overflow-hidden flex flex-col lg:flex-row">
          <!-- Editor Side -->
          <div class="flex-1 overflow-y-auto p-4 md:p-6 lg:w-1/2">
            <!-- Tabs -->
            <div class="flex gap-2 mb-4 flex-wrap">
              {#if allowContent || embeds.length > 0}
                <button
                  class="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; {activeTab === 'editor' ? 'filter: brightness(0.9);' : ''}"
                  onclick={() => activeTab = 'editor'}
                  type="button"
                >
                  <i class="fa-solid fa-layer-group mr-2"></i>
                  {m.embedbuilder.fullscreenTabEmbed()}
                </button>
              {/if}

              {#if allowComponents}
                <button
                  class="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; {activeTab === 'components' ? 'filter: brightness(0.9);' : ''}"
                  onclick={() => activeTab = 'components'}
                  type="button"
                >
                  <i class="fa-solid fa-link mr-2"></i>
                  {m.embedbuilder.tabLinks()}
                </button>
              {/if}

              <button
                class="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; {activeTab === 'json' ? 'filter: brightness(0.9);' : ''}"
                onclick={() => { activeTab = 'json'; refreshJsonPreview(); }}
                type="button"
              >
                <i class="fa-solid fa-code mr-2"></i>
                {m.embedbuilder.tabJson()}
              </button>

              {#if user?.id}
                <button
                  class="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; {activeTab === 'saved' ? 'filter: brightness(0.9);' : ''}"
                  onclick={() => { activeTab = 'saved'; loadSavedEmbeds(); }}
                  type="button"
                >
                  <i class="fa-solid fa-floppy-disk mr-2"></i>
                  {m.common.saved()}
                </button>
              {/if}
            </div>

            <!-- Tab Content -->
            <div class="space-y-4">
              {#if activeTab === 'editor'}
                <!-- Message Content -->
                {#if allowContent}
                  <div>
                    <label for="message-content" class="block text-sm font-medium mb-2"
                           style="color: {$colorStore.text};">
                      {m.common.messageContent()} <span class="text-xs">{m.common.optionalSuffix()}</span>
                    </label>
                    <div class="relative">
                      <textarea
                        id="message-content"
                        rows="3"
                        class="w-full px-3 py-2 pr-10 rounded-lg border resize-y"
                        style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                        placeholder={m.embedbuilder.fullscreenContentPlaceholder()}
                        bind:value={content}
                        bind:this={contentTextarea}
                      ></textarea>
                      <button
                        class="absolute right-2 top-2 p-1 rounded-sm hover:bg-black/10"
                        style="color: {$colorStore.muted};"
                        onclick={() => { showContentPlaceholders = !showContentPlaceholders; contentPlaceholderSearch = ""; }}
                        title={m.embedbuilder.editorInsertPlaceholder()}
                        type="button"
                      >
                        %
                      </button>
                      <PlaceholderPicker
                        visible={showContentPlaceholders}
                        placeholders={allPlaceholders}
                        searchTerm={contentPlaceholderSearch}
                        inline={true}
                        inputElement={contentTextarea}
                        onselect={(detail) => insertContentPlaceholder(detail.placeholder)}
                        onclose={() => showContentPlaceholders = false}
                        onsearch={(detail) => contentPlaceholderSearch = detail.term}
                      />
                    </div>
                  </div>
                {/if}

                <!-- Embeds -->
                <div class="space-y-4">
                  <div class="flex justify-between items-center flex-wrap gap-2">
                    <h3 class="text-base md:text-lg font-semibold" style="color: {$colorStore.text};">
                      {m.embedbuilder.fullscreenEmbedsHeading({ count: embeds.length, max: maxEmbeds })}
                    </h3>
                    <div class="flex gap-2">
                      {#if embeds.length > 1}
                        <button
                          class="px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-sm transition-all hover:scale-[1.02] flex items-center gap-2"
                          style="background: #ED424520; color: #ED4245; border: 1px solid #ED424530;"
                          onclick={clearAllEmbeds}
                          type="button"
                        >
                          <i class="fa-solid fa-eraser"></i>
                          {m.embedbuilder.fullscreenClearAllEmbeds()}
                        </button>
                      {/if}
                      {#if allowMultipleEmbeds}
                        <button
                          class="px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-sm transition-all hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50"
                          style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                          disabled={embeds.length >= maxEmbeds}
                          onclick={addEmbed}
                          type="button"
                        >
                          <i class="fa-solid fa-plus"></i>
                          {m.embedbuilder.fullscreenAddEmbed()}
                        </button>
                      {/if}
                    </div>
                  </div>

                  {#if embeds.length === 0}
                    <div class="text-center py-12 rounded-lg"
                         style="background: {$colorStore.primary}05; border: 1px dashed {$colorStore.primary}20;">
                      <i class="fa-solid fa-layer-group"
                         style="font-size: 48px; opacity: 0.3; display: block; margin: 0 auto 16px; color: {$colorStore.muted};"></i>
                      <h4 class="text-lg font-semibold mb-2" style="color: {$colorStore.text};">{m.embedbuilder.fullscreenEmbedsEmptyTitle()}</h4>
                      <p class="text-sm mb-4" style="color: {$colorStore.muted};">
                        {m.embedbuilder.fullscreenEmbedsEmptyHint()}
                      </p>
                      <button
                        class="px-4 py-2 rounded-lg font-medium text-sm transition-all hover:scale-[1.02] flex items-center gap-2 mx-auto"
                        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                        onclick={addEmbed}
                        type="button"
                      >
                        <i class="fa-solid fa-plus"></i>
                        {m.embedbuilder.fullscreenAddEmbed()}
                      </button>
                    </div>
                  {:else}
                    {#each embeds as embed, index}
                      <EmbedEditor
                        {embed}
                        {index}
                        placeholders={allPlaceholders}
                        onupdate={handleEmbedUpdate}
                        onremove={(detail) => removeEmbed(detail.index)}
                        onduplicate={(detail) => duplicateEmbed(detail.index)}
                      />
                    {/each}
                  {/if}
                </div>

              {:else if activeTab === 'components'}
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <div>
                      <h3 class="text-base md:text-lg font-semibold" style="color: {$colorStore.text};">
                        {m.embedbuilder.tabLinks()} <span class="text-sm font-normal">({linkButtons.length}/{MAX_LINK_BUTTONS})</span>
                      </h3>
                      <p class="text-xs md:text-sm" style="color: {$colorStore.muted};">
                        {m.embedbuilder.linksHint()}
                      </p>
                    </div>

                    <button
                      class="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50"
                      style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                      disabled={linkButtons.length >= MAX_LINK_BUTTONS}
                      onclick={addLinkButton}
                      type="button"
                    >
                      <i class="fa-solid fa-plus"></i>
                      {m.common.addButton()}
                    </button>
                  </div>

                  {#if linkButtons.length === 0}
                    <div class="text-center py-12">
                      <i class="fa-solid fa-link text-4xl mb-4" style="color: {$colorStore.muted}; opacity: 0.5;"></i>
                      <h4 class="text-lg font-semibold mb-2" style="color: {$colorStore.text};">{m.embedbuilder.linksEmptyTitle()}</h4>
                      <p class="text-sm" style="color: {$colorStore.muted};">
                        {m.embedbuilder.linksEmptyHint()}
                      </p>
                    </div>
                  {:else}
                    <div class="space-y-3" role="list">
                      {#each linkButtons as button (button.key)}
                        <div
                          class="p-3 md:p-4 border rounded-lg"
                          style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;"
                          role="listitem"
                        >
                          <LinkButtonEditor
                            {button}
                            {user}
                            onupdate={handleLinkButtonUpdate}
                            onremove={handleLinkButtonRemove}
                            onduplicate={handleLinkButtonDuplicate}
                          />
                        </div>
                      {/each}
                    </div>
                  {/if}
                </div>

              {:else if activeTab === 'json'}
                <!-- JSON Tab -->
                <div class="space-y-4">
                  <div class="flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h3 class="text-base md:text-lg font-semibold" style="color: {$colorStore.text};">{m.embedbuilder.fullscreenJsonHeading()}</h3>
                      <p class="text-xs md:text-sm" style="color: {$colorStore.muted};">
                        {m.embedbuilder.fullscreenJsonHint()}
                      </p>
                    </div>
                    <div class="flex gap-2">
                      <button
                        class="px-3 py-1.5 md:py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
                        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                        onclick={refreshJsonPreview}
                        type="button"
                      >
                        <i class="fa-solid fa-rotate"></i>
                        {m.common.refresh()}
                      </button>
                      <button
                        class="px-3 py-1.5 md:py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
                        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                        onclick={applyJsonText}
                        type="button"
                      >
                        <i class="fa-solid fa-check"></i>
                        {m.common.apply()}
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows="16"
                    spellcheck="false"
                    class="w-full px-3 py-2 rounded-lg border font-mono text-xs resize-y"
                    style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    placeholder={m.embedbuilder.fullscreenJsonPlaceholder()}
                    bind:value={jsonText}
                  ></textarea>

                  {#if jsonParseError}
                    <p class="text-sm" style="color: #ED4245;">{jsonParseError}</p>
                  {/if}

                  {#if !allowComponents}
                    <p class="text-xs" style="color: {$colorStore.muted};">
                      {@html m.embedbuilder.fullscreenJsonComponentsIgnored()}
                    </p>
                  {/if}
                </div>

              {:else if activeTab === 'saved'}
                <!-- Saved Embeds Tab -->
                <div class="space-y-6">
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
                        class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
                        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                        disabled={savingEmbed || !saveEmbedName.trim()}
                        onclick={saveCurrentEmbed}
                        type="button"
                      >
                        <i class="fa-solid fa-floppy-disk"></i>
                        {savingEmbed ? m.common.saving() : m.common.save()}
                      </button>
                    </div>
                    {#if guildIdBigInt}
                      <label class="flex items-center gap-2 text-sm min-h-[44px]" style="color: {$colorStore.muted};">
                        <input type="checkbox" bind:checked={saveAsGuildShared} />
                        {m.embedbuilder.fullscreenSaveShare()}
                      </label>
                    {/if}
                  </div>

                  {#if guildIdBigInt}
                    <div class="space-y-2">
                      <h3 class="text-base font-semibold" style="color: {$colorStore.text};">
                        {m.embedbuilder.fullscreenSharedHeading({ count: savedGuildEmbeds.length })}
                      </h3>
                      {#if loadingSavedEmbeds}
                        <p class="text-sm" style="color: {$colorStore.muted};">{m.common.loading()}</p>
                      {:else if savedGuildEmbeds.length === 0}
                        <p class="text-sm" style="color: {$colorStore.muted};">{m.embedbuilder.fullscreenSharedEmpty()}</p>
                      {:else}
                        {#each savedGuildEmbeds as saved (saved.id)}
                          <div class="flex items-center justify-between gap-2 p-3 rounded-lg border"
                               style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                            <span class="text-sm font-medium truncate" style="color: {$colorStore.text};">
                              {saved.embedName}
                            </span>
                            <div class="flex gap-2 shrink-0">
                              <button
                                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] min-h-[44px]"
                                style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                                onclick={() => loadSavedEmbed(saved)}
                                type="button"
                              >
                                {m.common.load()}
                              </button>
                              <button
                                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] min-h-[44px]"
                                style="background: #ED424520; color: #ED4245; border: 1px solid #ED424530;"
                                onclick={() => requestDeleteSavedEmbed(saved)}
                                type="button"
                              >
                                {m.common.delete()}
                              </button>
                            </div>
                          </div>
                        {/each}
                      {/if}
                    </div>
                  {/if}

                  <div class="space-y-2">
                    <h3 class="text-base font-semibold" style="color: {$colorStore.text};">
                      {m.embedbuilder.fullscreenMineHeading({ count: savedUserEmbeds.length })}
                    </h3>
                    {#if loadingSavedEmbeds}
                      <p class="text-sm" style="color: {$colorStore.muted};">{m.common.loading()}</p>
                    {:else if savedUserEmbeds.length === 0}
                      <p class="text-sm" style="color: {$colorStore.muted};">{m.embedbuilder.fullscreenMineEmpty()}</p>
                    {:else}
                      {#each savedUserEmbeds as saved (saved.id)}
                        <div class="flex items-center justify-between gap-2 p-3 rounded-lg border"
                             style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                          <span class="text-sm font-medium truncate" style="color: {$colorStore.text};">
                            {saved.embedName}
                          </span>
                          <div class="flex gap-2 shrink-0">
                            <button
                              class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] min-h-[44px]"
                              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                              onclick={() => loadSavedEmbed(saved)}
                              type="button"
                            >
                              {m.common.load()}
                            </button>
                            <button
                              class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] min-h-[44px]"
                              style="background: #ED424520; color: #ED4245; border: 1px solid #ED424530;"
                              onclick={() => requestDeleteSavedEmbed(saved)}
                              type="button"
                            >
                              {m.common.delete()}
                            </button>
                          </div>
                        </div>
                      {/each}
                    {/if}
                  </div>
                </div>
              {/if}
            </div>
          </div>

          <!-- Preview Side (Desktop only) -->
          <div class="hidden lg:block lg:w-1/2 border-l overflow-y-auto"
               style="background: {$colorStore.primary}03; border-color: {$colorStore.primary}30;">
            <div class="sticky top-0 p-4 border-b"
                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30;">
              <h3 class="text-lg font-semibold" style="color: {$colorStore.text};">{m.embedbuilder.fullscreenLivePreview()}</h3>
            </div>

            <div class="p-4">
              <!-- Validation -->
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

              <!-- Preview -->
              <PreviewCard
                {content}
                {embeds}
                componentRows={linkButtonsToPreviewRows(linkButtons)}
                {user}
                {guildId}
                emptyMessage={m.embedbuilder.previewEmptyMessage()}
              />
            </div>
          </div>
        </div>

        <!-- Mobile Floating Preview Button -->
        {#if isMobile && !showMobilePreview}
          <button
            class="fixed bottom-4 right-4 z-[9999] px-4 py-3 rounded-full shadow-lg transition-all hover:scale-[1.05] flex items-center gap-2 backdrop-blur-md"
            style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; box-shadow: 0 4px 12px {$colorStore.secondary}40; border: 2px solid {$colorStore.secondary}30;"
            onclick={() => showMobilePreview = true}
            type="button"
          >
            <i class="fa-solid fa-eye"></i>
            <span class="font-medium">{m.common.preview()}</span>
          </button>
        {/if}
      </div>
    </div>

    <!-- Notification -->
    {#if showNotification}
      <div class="fixed top-4 right-4 z-[10000]" transition:fade>
        <Notification message={notificationMessage} type={notificationType} />
      </div>
    {/if}

    <!-- Mobile Preview Modal -->
    {#if showMobilePreview}
      <div class="fixed inset-0 z-[10001] flex items-center justify-center p-4" transition:fade={{ duration: 200 }}>
        <!-- Backdrop -->
        <button
          type="button"
          class="absolute inset-0 bg-black/80 backdrop-blur-sm"
          aria-label={m.embedbuilder.fullscreenClosePreview()}
          onclick={() => showMobilePreview = false}
        ></button>

        <!-- Preview Modal -->
        <div
          class="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl flex flex-col"
          style="background: linear-gradient(135deg, {$colorStore.gradientStart}98, {$colorStore.gradientMid}99);"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-4 py-3 border-b"
            style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30;"
          >
            <h3 class="text-lg font-semibold" style="color: {$colorStore.primary};">{m.common.preview()}</h3>
            <button
              class="p-2 rounded-lg transition-all hover:scale-[1.02]"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
              onclick={() => showMobilePreview = false}
              type="button"
              aria-label={m.embedbuilder.fullscreenClosePreview()}
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-4">
            <!-- Validation -->
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

            <!-- Preview -->
            <PreviewCard
              {content}
              {embeds}
              componentRows={linkButtonsToPreviewRows(linkButtons)}
              {user}
              {guildId}
              emptyMessage={m.embedbuilder.previewEmptyMessage()}
            />
          </div>

          <!-- Footer -->
          <div
            class="px-4 py-3 border-t"
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30;"
          >
            <button
              class="w-full px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              onclick={() => showMobilePreview = false}
              type="button"
            >
              <i class="fa-solid fa-arrow-left mr-2"></i>
              {m.embedbuilder.fullscreenBackToEditor()}
            </button>
          </div>
        </div>
      </div>
    {/if}
  </Portal>
{/if}

<!-- Delete Saved Embed Confirmation -->
<ConfirmationModal
  bind:isOpen={showDeleteSavedConfirm}
  title={m.embedbuilder.pageSavedDeleteAria()}
  message={m.embedbuilder.fullscreenDeleteMessage({ name: embedPendingDelete?.embedName ?? m.embedbuilder.fullscreenSavedNameFallbackThis() })}
  confirmText={m.common.delete()}
  variant="danger"
  oncancel={() => embedPendingDelete = null}
  onconfirm={confirmDeleteSavedEmbed}
/>
