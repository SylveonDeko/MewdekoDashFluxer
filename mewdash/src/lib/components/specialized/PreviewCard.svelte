<!-- PreviewCard.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { marked } from "marked";
  import DOMPurify from "dompurify";
  import { currentInstance } from "$lib/stores/instanceStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { get } from "svelte/store";
  import { safeUrl } from "$lib/utils/sanitize";

  // Props
    interface Props {
      content?: string;
      embeds?: any[];
      componentRows?: any[];
      showEmpty?: boolean;
      emptyMessage?: string;
      user?: any;
      guild?: any;
      guildId?: string | bigint | null;
    }

    let {
      content = "",
      embeds = [],
      componentRows = [],
      showEmpty = true,
      emptyMessage = m.embedbuilder.previewEmptyMessage(),
      user = null,
      guild = null,
      guildId = null
    }: Props = $props();

  // Get real data from stores
  const instance = get(currentInstance);
  const currentGuildData = get(currentGuild);
  let actualGuild = $derived(guild || currentGuildData);
  let actualGuildId = $derived(guildId || currentGuildData?.id);

  // Extract user data for use in all functions
  let userName = $derived(user?.username || user?.globalName || m.embedbuilder.previewSampleUser());
  let userId = $derived(user?.id || "123456789012345678");

  // Placeholder replacement function
  function replacePlaceholders(text: string): string {
    if (!text) return text;

    let replaced = text;

    // User placeholders

    // Construct avatar URL from hash
    const userAvatarHash = user?.avatar;
    const userAvatar = userAvatarHash
      ? `https://cdn.discordapp.com/avatars/${userId}/${userAvatarHash}.${userAvatarHash.startsWith("a_") ? "gif" : "png"}?size=256`
      : "https://cdn.discordapp.com/embed/avatars/0.png";

    // Construct banner URL from hash
    const userBannerHash = user?.banner;
    const userBanner = userBannerHash
      ? `https://cdn.discordapp.com/banners/${userId}/${userBannerHash}.${userBannerHash.startsWith("a_") ? "gif" : "png"}?size=512`
      : "";

    replaced = replaced.replace(/%user%/g, `<@${userId}>`);
    replaced = replaced.replace(/%user\.mention%/g, `<@${userId}>`);
    replaced = replaced.replace(/%user\.name%/g, userName);
    replaced = replaced.replace(/%user\.fullname%/g, userName);
    replaced = replaced.replace(/%user\.id%/g, userId);
    replaced = replaced.replace(/%user\.avatar%/g, userAvatar);
    replaced = replaced.replace(/%user\.banner%/g, userBanner);
    replaced = replaced.replace(/%user\.created_time%/g, "14:30");
    replaced = replaced.replace(/%user\.created_date%/g, "15.06.2020");
    replaced = replaced.replace(/%user\.joined_time%/g, "09:45");
    replaced = replaced.replace(/%user\.joined_date%/g, "22.03.2023");

    // Server/Guild placeholders - use real data if available
    const guildName = actualGuild?.name || m.embedbuilder.previewSampleServer();
    const guildIdStr = typeof actualGuildId === "bigint" ? actualGuildId.toString() : (actualGuildId?.toString() || "987654321098765432");
    replaced = replaced.replace(/%server%/g, guildName);
    replaced = replaced.replace(/%server\.name%/g, guildName);
    replaced = replaced.replace(/%server\.id%/g, guildIdStr);
    replaced = replaced.replace(/%server\.members%/g, actualGuild?.memberCount?.toString() || "1,234");
    replaced = replaced.replace(/%server\.members\.online%/g, "523");
    replaced = replaced.replace(/%server\.members\.offline%/g, "711");
    replaced = replaced.replace(/%server\.members\.dnd%/g, "45");
    replaced = replaced.replace(/%server\.members\.idle%/g, "89");
    replaced = replaced.replace(/%server\.icon%/g, actualGuild?.icon ? `https://cdn.discordapp.com/icons/${guildIdStr}/${actualGuild.icon}.${actualGuild.icon.startsWith("a_") ? "gif" : "png"}?size=256` : "");
    replaced = replaced.replace(/%server\.banner%/g, actualGuild?.banner ? `https://cdn.discordapp.com/banners/${guildIdStr}/${actualGuild.banner}.png?size=512` : "");

    const nowTimestamp = Math.floor(Date.now() / 1000);
    replaced = replaced.replace(/%server\.time%/g, new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short"
    }));
    replaced = replaced.replace(/%server\.timestamp\.longdatetime%/g, `<t:${nowTimestamp}:F>`);
    replaced = replaced.replace(/%server\.timestamp\.longtime%/g, `<t:${nowTimestamp}:T>`);
    replaced = replaced.replace(/%server\.timestamp\.longdate%/g, `<t:${nowTimestamp}:D>`);
    replaced = replaced.replace(/%server\.timestamp\.shortdatetime%/g, `<t:${nowTimestamp}>`);

    // Channel placeholders (use Discord mention format)
    replaced = replaced.replace(/%channel%/g, "<#123456789012345678>");
    replaced = replaced.replace(/%channel\.mention%/g, "<#123456789012345678>");
    replaced = replaced.replace(/%channel\.name%/g, m.embedbuilder.previewSampleChannelName());
    replaced = replaced.replace(/%channel\.id%/g, "123456789012345678");
    replaced = replaced.replace(/%channel\.created%/g, "14:30 15.06.2020");
    replaced = replaced.replace(/%channel\.nsfw%/g, m.embedbuilder.previewSampleFalse());
    replaced = replaced.replace(/%channel\.topic%/g, m.embedbuilder.previewSampleChannelTopic());

    // Bot placeholders - use real instance data if available
    const botName = instance?.botName || "Mewdeko";
    const botId = instance?.botId || "752236274261426994";
    const botAvatar = instance?.botAvatar || "https://cdn.discordapp.com/embed/avatars/0.png";
    replaced = replaced.replace(/%bot\.status%/g, m.common.online());
    replaced = replaced.replace(/%bot\.latency%/g, "45");
    replaced = replaced.replace(/%bot\.name%/g, botName);
    replaced = replaced.replace(/%bot\.fullname%/g, botName);
    replaced = replaced.replace(/%bot\.id%/g, botId.toString());
    replaced = replaced.replace(/%bot\.avatar%/g, botAvatar);
    replaced = replaced.replace(/%bot\.time%/g, new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short"
    }));

    // Stats placeholders
    replaced = replaced.replace(/%shard\.servercount%/g, "1,234");
    replaced = replaced.replace(/%shard\.usercount%/g, "456,789");

    // Time placeholders
    const now = new Date();
    replaced = replaced.replace(/%time\.month%/g, now.toLocaleString("en", { month: "long" }));
    replaced = replaced.replace(/%time\.day%/g, now.toLocaleString("en", { weekday: "long" }));
    replaced = replaced.replace(/%time\.year%/g, now.getFullYear().toString());

    // Random placeholders (use static examples for preview)
    replaced = replaced.replace(/%rng%/g, "7");
    replaced = replaced.replace(/%rng\((\d+),(\d+)\)%/g, "42");
    replaced = replaced.replace(/%choose\([^)]+\)%/g, "[random option]");
    replaced = replaced.replace(/%target%/g, "example text");
    replaced = replaced.replace(/%img:([^%]+)%/g, "https://i.imgur.com/example.png");

    // GIF placeholders (use placeholder URL)
    const gifPlaceholders = [
      "baka", "bite", "blush", "bored", "cry", "cuddle", "dance", "facepalm", "feed",
      "handhold", "happy", "highfive", "hug", "kick", "kiss", "laugh", "pat", "poke",
      "pout", "punch", "shoot", "shrug", "slap", "sleep", "smile", "smug", "stare",
      "think", "thumbsup", "tickle", "wave", "wink"
    ];
    gifPlaceholders.forEach(gif => {
      replaced = replaced.replace(new RegExp(`%${gif}gif%`, "g"), `https://nekos.best/api/v2/${gif}/001.gif`);
    });

    return replaced;
  }

  // Helper functions
  function parseMarkdown(text: string): string {
    // Step 1: Replace placeholders (%user% → <@id>)
    const withPlaceholders = replacePlaceholders(text);

    // Step 2: Parse markdown (this escapes HTML: <@id> → &lt;@id&gt;)
    // Use breaks: true to match Discord's newline behavior (single \n = <br>)
    const markdown = marked.parse(withPlaceholders, { breaks: true }) as string;

    // Step 3: Format Discord mentions AFTER markdown escaping
    const withMentions = formatDiscordMentions(markdown);

    // Step 4: Sanitize but preserve our mention spans
    const sanitized = DOMPurify.sanitize(withMentions, {
      ADD_TAGS: ["span"],
      ADD_ATTR: ["class"]
    });

    return sanitized;
  }

  // Apply placeholder replacement to simple text (non-markdown)
  function processText(text: string): string {
    const withPlaceholders = replacePlaceholders(text);
    // For simple text, return raw HTML with mentions
    return withPlaceholders;
  }

  // Helper to escape HTML
  function escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Process and format text with mentions (for {@html} rendering)
  function processTextWithMentions(text: string): string {
    if (!text) return "";

    // Step 1: Replace placeholders (these are safe, controlled by us)
    const withPlaceholders = replacePlaceholders(text);

    // Step 2: Escape all HTML to prevent injection
    const escaped = escapeHtml(withPlaceholders);

    // Step 3: Format Discord mentions (safe, we control the HTML)
    const withMentions = formatDiscordMentions(escaped);

    return withMentions;
  }

  // Format Discord mentions using discord.css classes
  // This function receives escaped HTML, so mentions are &lt;@id&gt;
  function formatDiscordMentions(text: string): string {
    if (!text) return text;

    let result = text;

    // User mentions: &lt;@userId&gt; or &lt;@!userId&gt;
    result = result.replace(/&lt;@!?(\d+)&gt;/g, (match, id) => {
      const displayName = id === userId ? escapeHtml(userName) : m.common.user();
      return `<span class="dc-mention">@${displayName}</span>`;
    });

    // Channel mentions: &lt;#channelId&gt;
    result = result.replace(/&lt;#(\d+)&gt;/g, (match, id) => {
      return `<span class="dc-mention">#${m.embedbuilder.previewSampleChannelName()}</span>`;
    });

    // Role mentions: &lt;@&amp;roleId&gt; or &lt;@&roleId&gt;
    result = result.replace(/&lt;@&amp;(\d+)&gt;/g, (match, id) => {
      return `<span class="dc-mention dc-mention-role" style="--dc-mention-color-rgb: 114 137 218">@${m.common.role()}</span>`;
    });
    result = result.replace(/&lt;@&(\d+)&gt;/g, (match, id) => {
      return `<span class="dc-mention dc-mention-role" style="--dc-mention-color-rgb: 114 137 218">@${m.common.role()}</span>`;
    });

    return result;
  }

    // Parse Discord emoji format for rendering
    function parseEmojiForDisplay(emojiString: string): { url: string; name: string } | null {
      if (!emojiString) return null;
      const match = emojiString.match(/<(a?):([^:]+):(\d+)>/);
      if (!match) return null;

      const [, animatedFlag, name, id] = match;
      const animated = animatedFlag === "a";
      const url = `https://cdn.discordapp.com/emojis/${id}.${animated ? "png" : "png"}?size=32&quality=lossless`;

      return { url, name };
  }

  let linkButtons = $derived(
    componentRows
      .flatMap(row => row.components ?? [])
      .filter(component => !component.isSelect && typeof component.url === "string" && component.url.trim() && component.displayName)
  );

  let hasContent = $derived(content.trim() ||
    embeds.some(e => e.title || e.description || e.fields?.length > 0) ||
    linkButtons.length > 0);
</script>

<div
  class="bg-[#36393f] rounded-lg p-4 space-y-4 text-white font-mono text-sm min-h-[200px] preview-content overflow-hidden">
  {#if hasContent}
    <!-- Message Content -->
    {#if content.trim()}
      <div class="text-gray-100 break-words">
        {@html parseMarkdown(content)}
      </div>
    {/if}

    <!-- Embeds Preview -->
    {#each embeds as embed, index}
      {#if embed.title || embed.description || embed.fields?.length > 0}
        <div class="dc-embed" style="--dc-embed-color: {embed.color || '#5865F2'};">
            <!-- Author -->
            {#if embed.author?.name}
              {@const processedAuthorUrl = processText(embed.author.url || "")}
              {@const processedAuthorName = processTextWithMentions(embed.author.name)}
              {@const processedAuthorIcon = processText(embed.author.icon_url || "")}
              <div class="dc-embed-author">
                {#if processedAuthorIcon && !processedAuthorIcon.includes('%')}
                  <img src={processedAuthorIcon} alt={m.common.authorIcon()}>
                {/if}
                {#if processedAuthorUrl && !processedAuthorUrl.includes('%')}
                  <a href={safeUrl(processedAuthorUrl)}>
                    {@html processedAuthorName}
                  </a>
                {:else}
                  <span>{@html processedAuthorName}</span>
                {/if}
              </div>
            {/if}

          <!-- Thumbnail (comes BEFORE title in discord.css) -->
          {#if embed.thumbnail?.url}
            {@const processedThumbnail = processText(embed.thumbnail.url)}
            {#if processedThumbnail && !processedThumbnail.includes('%')}
              <div class="dc-embed-thumbnail">
                <img src={processedThumbnail} alt={m.common.thumbnail()}>
              </div>
            {/if}
            {/if}

            <!-- Title -->
            {#if embed.title}
              {@const processedTitle = processTextWithMentions(embed.title)}
              {@const processedUrl = processText(embed.url || "")}
              <div class="dc-embed-title">
                {#if processedUrl && !processedUrl.includes('%')}
                  <a href={safeUrl(processedUrl)}>
                    {@html processedTitle}
                  </a>
                {:else}
                  {@html processedTitle}
                {/if}
              </div>
            {/if}

            <!-- Description -->
            {#if embed.description}
              <div class="dc-embed-description">
                {@html parseMarkdown(embed.description)}
              </div>
            {/if}

            <!-- Fields -->
            {#if embed.fields?.length > 0}
              <div class="dc-embed-fields">
                {#each embed.fields as field}
                  {#if field.name || field.value}
                    <div class="dc-embed-field{field.inline ? '-inline' : ''}">
                      {#if field.name}
                        <div class="dc-embed-field-name">{@html processTextWithMentions(field.name)}</div>
                      {/if}
                      {#if field.value}
                        <div class="dc-embed-field-value">
                          {@html parseMarkdown(field.value)}
                        </div>
                      {/if}
                    </div>
                  {/if}
                {/each}
              </div>
            {/if}

          <!-- Image -->
          {#if embed.image?.url}
            {@const processedImage = processText(embed.image.url)}
            {#if processedImage && !processedImage.includes('%')}
              <div class="dc-embed-image">
                <img src={processedImage} alt="">
              </div>
            {/if}
            {/if}

            <!-- Footer -->
            {#if embed.footer?.text || embed.footer?.icon_url}
              {@const processedFooterIcon = processText(embed.footer.icon_url || "")}
              {@const processedFooterText = processTextWithMentions(embed.footer.text || "")}
              <div class="dc-embed-footer">
                {#if processedFooterIcon && !processedFooterIcon.includes('%')}
                  <img src={processedFooterIcon} alt={m.embedbuilder.previewAltFooterIcon()}>
                {/if}
                <span>{@html processedFooterText}</span>
              </div>
            {/if}
        </div>
      {/if}
    {/each}

    {#if linkButtons.length > 0}
      <div class="flex flex-col gap-1">
        {#each linkButtons as link, linkIndex (linkIndex)}
          <div class="flex items-center gap-1">
            {#if link.emoji}
              {@const parsedEmoji = parseEmojiForDisplay(link.emoji)}
              {#if parsedEmoji}
                <img src={parsedEmoji.url} alt={parsedEmoji.name} style="width: 1.2em; height: 1.2em; display: inline;" />
              {:else}
                <span>{link.emoji}</span>
              {/if}
            {/if}
            <span class="text-[#00AFF4]">{@html processTextWithMentions(link.displayName)}</span>
          </div>
        {/each}
      </div>
    {/if}

  {:else if showEmpty}
    <!-- Empty State -->
    <div class="text-center py-12">
      <i class="fa-solid fa-eye" style="font-size: 48px; opacity: 0.3; display: block; margin: 0 auto 16px;"></i>
      <p class="text-gray-400">{emptyMessage}</p>
    </div>
  {/if}
</div>

<style>


  /* Style adjustments for embedded images */
  img {
    max-width: 100%;
    height: auto;
  }

  /* Link styling */
  a {
    color: #00AFF4;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  /* Discord-like markdown styles */
  :global(.preview-content) {
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
  }

  :global(.preview-content strong) {
    font-weight: 600;
  }

  :global(.preview-content em) {
    font-style: italic;
  }

  :global(.preview-content code) {
    background: #2f3136;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
      word-break: break-all;
  }

  :global(.preview-content pre) {
    background: #2f3136;
    padding: 8px;
    border-radius: 4px;
    overflow-x: auto;
      max-width: 100%;
  }

  :global(.preview-content pre code) {
      word-break: normal;
  }

  :global(.preview-content blockquote) {
    border-left: 4px solid #4f545c;
    padding-left: 8px;
    margin: 4px 0;
  }

  :global(.preview-content) p {
      word-wrap: break-word;
      overflow-wrap: break-word;
  }

</style>