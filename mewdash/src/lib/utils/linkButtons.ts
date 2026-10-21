export interface LinkButton {
  key: string;
  displayName: string;
  url: string;
  emoji: string;
}

export const MAX_LINK_BUTTONS = 25;
export const MAX_LINK_LABEL_LENGTH = 80;

export function newLinkButton(): LinkButton {
  return {
    key: `link-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    displayName: "",
    url: "",
    emoji: ""
  };
}

/**
 * Whether a link button URL is usable. Placeholders such as %server.name% are allowed anywhere in the URL.
 */
export function isValidLinkUrl(url: string): boolean {
  if (!url) return true;
  if (url.includes("%")) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Reads the link buttons out of a stored components array. The bot only keeps entries that have a link, so
 * buttons without a URL and select menus are dropped.
 */
export function linkButtonsFromComponents(components: unknown): LinkButton[] {
  if (!Array.isArray(components)) return [];
  return components
    .filter((c: any) => c && !c.isSelect && typeof c.url === "string" && c.url.trim())
    .map((c: any, index: number) => ({ c, index }))
    .sort((a, b) => (a.c.row ?? 0) - (b.c.row ?? 0) || a.index - b.index)
    .slice(0, MAX_LINK_BUTTONS)
    .map(({ c }) => ({
      ...newLinkButton(),
      displayName: c.displayName ?? "",
      url: c.url,
      emoji: c.emoji ?? ""
    }));
}

/**
 * Builds the components array the bot reads, one entry per link button in the order they are listed.
 */
export function linkButtonsToComponents(buttons: LinkButton[]): Record<string, unknown>[] {
  return buttons
    .filter(button => button.displayName.trim() && button.url.trim())
    .map((button, index) => {
      const component: Record<string, unknown> = {
        row: index,
        displayName: button.displayName,
        style: 5,
        isSelect: false,
        url: button.url
      };
      if (button.emoji.trim()) component.emoji = button.emoji;
      return component;
    });
}

/**
 * Wraps link buttons in the single row shape PreviewCard reads.
 */
export function linkButtonsToPreviewRows(buttons: LinkButton[]): { rowKey: string; components: LinkButton[] }[] {
  return buttons.length ? [{ rowKey: "links", components: buttons }] : [];
}
