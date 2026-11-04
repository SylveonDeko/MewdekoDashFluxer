// SPDX-License-Identifier: AGPL-3.0-or-later. Portions adapted from Fluxer (https://github.com/fluxerapp/fluxer).

export type Inline =
  | { t: "text"; v: string }
  | { t: "strong" | "em" | "del" | "u"; c: Inline[] }
  | { t: "code"; v: string }
  | { t: "time"; v: string }
  | { t: "mention"; v: string }
  | { t: "channel"; v: string }
  | { t: "emoji"; v: string; src: string }
  | { t: "link"; c: Inline[] };

export type Block =
  | { t: "text"; c: Inline[] }
  | { t: "heading"; level: 1 | 2 | 3; c: Inline[] }
  | { t: "quote"; c: Inline[] }
  | { t: "subtext"; c: Inline[] }
  | { t: "list"; ordered: boolean; start: number; items: Inline[][] };

const emoji = String.raw`[0-9#*]️?⃣|\p{Regional_Indicator}{1,2}|\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}️?)*`;
const inlinePattern = new RegExp(
  String.raw`\x60\x60\x60([^\x60]+)\x60\x60\x60|(\x60\x60)|(\x60[^\x60]+\x60)|\*\*(.+?)\*\*|__(.+?)__|~~(.+?)~~|\*([^*\s][^*]*?)\*|<t:(-?\d+):R>|<@(\w+)>|<#([^>\s]+)>|(${emoji})|<a?:(\w+):(\d+)>|\[([^\]\n]+)\]\(<?https?:\/\/[^)\s>]+>?\)`,
  "u",
);

/** Twemoji, the emoji set Fluxer draws unicode emoji with. */
export function emojiUrl(value: string): string {
  const points = [...value].map((c) => c.codePointAt(0)!.toString(16));
  const kept = value.includes("‍") ? points : points.filter((p) => p !== "fe0f");
  return `https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/${kept.join("-")}.svg`;
}

function relative(seconds: number): string {
  if (seconds < 60) return seconds === 1 ? "1 second ago" : `${seconds} seconds ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
}

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let rest = text;
  while (rest.length) {
    const match = inlinePattern.exec(rest);
    if (!match) {
      out.push({ t: "text", v: rest });
      break;
    }
    if (match.index > 0) out.push({ t: "text", v: rest.slice(0, match.index) });
    const [whole, block, empty, code, strong, underline, del, em, time, mention, channel, glyph, customName, customId, linkText] =
      match;
    if (block) out.push({ t: "code", v: block });
    else if (empty) out.push({ t: "text", v: empty });
    else if (code) out.push({ t: "code", v: code.slice(1, -1) });
    else if (strong !== undefined) out.push({ t: "strong", c: parseInline(strong) });
    else if (underline !== undefined) out.push({ t: "u", c: parseInline(underline) });
    else if (del !== undefined) out.push({ t: "del", c: parseInline(del) });
    else if (em !== undefined) out.push({ t: "em", c: parseInline(em) });
    else if (time !== undefined)
      out.push({ t: "time", v: time.startsWith("-") ? relative(-Number(time)) : `in ${relative(Number(time)).replace(/ ago$/, "")}` });
    else if (mention !== undefined) out.push({ t: "mention", v: mention });
    else if (channel !== undefined) out.push({ t: "channel", v: channel });
    else if (glyph) out.push({ t: "emoji", v: glyph, src: emojiUrl(glyph) });
    else if (customId) out.push({ t: "emoji", v: `:${customName}:`, src: `https://fluxerusercontent.com/emojis/${customId}.webp` });
    else if (linkText !== undefined) out.push({ t: "link", c: parseInline(linkText) });
    rest = rest.slice(match.index + whole.length);
  }
  return out;
}

/** Parses the markdown subset bot replies use: headings, subtext, quotes, lists and inline styles. */
export function parseMarkup(text: string): Block[] {
  const blocks: Block[] = [];
  let lines: string[] = [];
  const flush = () => {
    if (lines.length) blocks.push({ t: "text", c: parseInline(lines.join("\n")) });
    lines = [];
  };
  for (const line of text.split("\n")) {
    const heading = /^(#{1,3}) (.*)$/.exec(line);
    const subtext = /^-# (.*)$/.exec(line);
    const quote = /^> (.*)$/.exec(line);
    const item = /^(?:[-*]|(\d+)\.) (.*)$/.exec(line);
    if (heading) {
      flush();
      blocks.push({ t: "heading", level: heading[1].length as 1 | 2 | 3, c: parseInline(heading[2]) });
    } else if (subtext) {
      flush();
      blocks.push({ t: "subtext", c: parseInline(subtext[1]) });
    } else if (quote) {
      flush();
      const last = blocks.at(-1);
      if (last?.t === "quote") last.c.push({ t: "text", v: "\n" }, ...parseInline(quote[1]));
      else blocks.push({ t: "quote", c: parseInline(quote[1]) });
    } else if (item) {
      flush();
      const ordered = item[1] !== undefined;
      const last = blocks.at(-1);
      if (last?.t === "list" && last.ordered === ordered) last.items.push(parseInline(item[2]));
      else blocks.push({ t: "list", ordered, start: ordered ? Number(item[1]) : 1, items: [parseInline(item[2])] });
    } else {
      lines.push(line);
    }
  }
  flush();
  return blocks;
}
