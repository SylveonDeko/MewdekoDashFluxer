<!-- routes/dashboard/migrate/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { currentGuild } from "$lib/stores/currentGuild";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import MigrationFlow from "$lib/components/dashboard/migration/MigrationFlow.svelte";
</script>

<DashboardPageLayout
  guildName={$currentGuild?.name || m.common.dashboard()}
  icon="fa-arrow-right-arrow-left"
  subtitle={m.migration.pageSubtitle()}
  title={m.features.migrateName()}
>
  {#if $currentGuild?.id}
    {#key $currentGuild.id}
      <MigrationFlow guildId={$currentGuild.id} />
    {/key}
  {/if}
</DashboardPageLayout>
