<script lang="ts">
  import { m } from "$lib/i18n";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { Cfg, Change } from "./suggestionsModel";

  interface Props {
    cfg: Cfg;
    emojis: GuildEmojiInfo[];
    onchange: Change;
  }

  let { cfg, emojis, onchange }: Props = $props();
</script>

<PluginCard title={m.suggestions.votingTitle()} alwaysOpen>
  <SettingField label={m.suggestions.emoteCustomLabel()} id="suggest-emotes">
    <EmojiPicker
      id="suggest-emotes"
      guildEmojis={emojis}
      selected={cfg.suggestEmotes}
      multiple
      maxSelection={5}
      placeholder={m.suggestions.emoteCustomPlaceholder()}
      onchange={(detail) =>
        onchange("suggestEmotes", Array.isArray(detail.selected) ? detail.selected : detail.selected ? [detail.selected] : [])}
    />
  </SettingField>
</PluginCard>
