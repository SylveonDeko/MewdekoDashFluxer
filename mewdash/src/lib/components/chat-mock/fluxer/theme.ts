// SPDX-License-Identifier: AGPL-3.0-or-later. Portions adapted from Fluxer (https://github.com/fluxerapp/fluxer).

const neutral = (lightness: string) => `hsl(258, 10%, ${lightness})`;
const accent = "hsla(258, 13%, 80%, 0.15)";
const hover = "hsla(258, 10%, 100%, 0.05)";
const selected = "hsla(258, 10%, 100%, 0.1)";
const codeText = `color-mix(in srgb, ${neutral("90.36%")} 82%, hsl(340, 50%, 90%) 18%)`;

const fallbackSans =
  "'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', 'Fluxer Fallback', 'Fluxer Symbols', 'Fluxer Math', 'Noto Sans', 'Nirmala UI', 'Noto Sans Bengali', 'Noto Sans Tamil', 'Noto Sans Telugu', 'Noto Sans Kannada', 'Noto Sans Malayalam', 'Noto Sans Gujarati', 'Noto Sans Gurmukhi', 'Noto Sans Oriya', 'Noto Sans Sinhala', 'Noto Sans Khmer', 'Noto Sans Lao', 'Noto Sans Myanmar', 'Noto Sans Tibetan', 'Noto Sans Armenian', 'Noto Sans Georgian', 'Noto Sans Ethiopic', 'Noto Sans Cherokee', 'Noto Sans Canadian Aboriginal', 'Noto Sans Mongolian', 'Noto Sans Vai', 'Noto Sans NKo', 'Noto Sans Adlam', 'Noto Sans Yi', 'Noto Sans Osage', 'Noto Sans Thaana', 'Noto Sans CJK SC', 'Noto Sans CJK TC', 'Noto Sans CJK JP', 'Noto Sans CJK KR', 'Segoe UI Symbol', 'Segoe UI Historic', 'Apple Symbols', 'Noto Sans Symbols', 'Noto Sans Symbols 2', 'Noto Sans Math', 'Cambria Math'";
const cjk = "'Fluxer Sans SC', 'Fluxer Sans TC', 'Fluxer Sans JP', 'Fluxer Sans KR'";

const vars: Record<string, string> = {
  "--saturation-factor": "1",
  "--background-primary": neutral("5%"),
  "--background-secondary": neutral("10.59%"),
  "--background-secondary-lighter": neutral("12.44%"),
  "--background-secondary-alt": neutral("14.15%"),
  "--background-tertiary": neutral("17.16%"),
  "--background-textarea": neutral("14.69%"),
  "--background-modifier-accent": accent,
  "--background-modifier-accent-focus": "hsla(258, 13%, 80%, 0.22)",
  "--background-modifier-hover": hover,
  "--background-modifier-selected": selected,
  "--guild-list-foreground": neutral("16.7%"),
  "--guilds-layout-item-bg": neutral("16.7%"),
  "--interactive-muted": "color-mix(in oklab, hsl(228, 10%, 35%) 100%, hsl(245, 100%, 80%) 40%)",
  "--brand-primary": "hsl(242, 70%, 55%)",
  "--brand-primary-fill": "hsl(0, 0%, 100%)",
  "--text-primary": neutral("96%"),
  "--text-secondary": neutral("90.36%"),
  "--text-chat": neutral("93.67%"),
  "--text-chat-muted": neutral("81.42%"),
  "--text-primary-muted": neutral("81.42%"),
  "--text-tertiary": neutral("70.4%"),
  "--text-tertiary-muted": neutral("62.88%"),
  "--text-tertiary-secondary": neutral("60%"),
  "--text-code": codeText,
  "--bg-code": `color-mix(in srgb, ${neutral("14.15%")} 88%, ${neutral("17.16%")} 12%)`,
  "--code-block-border": `color-mix(in srgb, hsla(258, 10%, 50%, 0.2) 90%, ${codeText} 10%)`,
  "--status-online": "hsl(152, 72%, 40%)",
  "--text-link": "hsl(198, 92%, 70%)",
  "--markup-mention-fill": "color-mix(in srgb, hsl(198, 92%, 70%) 20%, transparent)",
  "--brand-tint": `color-mix(in srgb, hsl(242, 70%, 55%) 36%, ${neutral("10.59%")})`,
  "--brand-tint-border": "hsl(242, 70%, 72%)",
  "--text-on-brand-tint": neutral("98%"),
  "--panel-control-bg": `color-mix(in srgb, ${neutral("14.15%")} 90%, ${neutral("2%")} 10%)`,
  "--floating-surface-ring-color": `color-mix(in srgb, ${accent} 20%, transparent)`,
  "--user-area-divider-color": `color-mix(in srgb, ${hover} 70%, transparent)`,
  "--surface-interactive-hover-bg": hover,
  "--surface-interactive-selected-bg": selected,
  "--surface-interactive-selected-color": neutral("96%"),
  "--control-button-normal-text": neutral("81.42%"),
  "--message-timestamp-color": neutral("81.42%"),
  "--composer-surface-color": neutral("12.44%"),
  "--font-sans": `'Fluxer Sans', 'Fluxer Sans Arabic', 'Fluxer Sans Hebrew', 'Fluxer Sans Devanagari', 'Fluxer Sans Thai Looped', ${cjk}, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', ${fallbackSans}, sans-serif`,
  "--font-mono": `'Fluxer Mono', 'Menlo', 'Monaco', 'Courier New', 'Noto Sans Mono', ${cjk}, ${fallbackSans}, monospace`,
};

export const fluxerTheme = Object.entries(vars)
  .map(([name, value]) => `${name}: ${value}`)
  .join("; ");
