<!-- routes/staff/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";

  let mounted = $state(false);

  onMount(() => {
    mounted = true;
  });

  function handleEasterEggClick(event: MouseEvent, member: any) {
    const element = event.currentTarget as HTMLElement;
    if (element && element.textContent === member.description) {
      element.textContent = member.eggy;
    } else if (element) {
      element.textContent = member.description;
    }
  }

  // Staff data
  const staffMembers = $derived([
    {
      alt: m.public.staffRoleOwnerDeveloper(),
      image: "https://cdn.mewdeko.tech/sylveon.gif",
      name: "SylveonDeko",
      description: m.public.staffRoleOwnerDeveloper(),
      eggy: m.public.staffEggSylveon()
    },
    {
      alt: m.public.staffRoleOwnerDeveloper(),
      image: "https://cdn.mewdeko.tech/Cottage.png",
      name: "GraveyardDwellingCat",
      description: m.public.staffRoleOwnerDeveloper(),
      eggy: m.public.staffEggCottage()
    },
    {
      alt: m.public.staffRoleOwnerSupporter(),
      image: "https://cdn.mewdeko.tech/Paw.gif",
      name: "Paw",
      description: m.public.staffRoleOwnerSupporter(),
      eggy: m.common.placeholder()
    }
  ]);
</script>

<svelte:head>
  <title>{m.public.staffTitle()}</title>
  <meta content={m.public.staffOgTitle()} property="og:title" />
  <meta content={m.public.staffDescription()} name="description" />
  <meta content={m.public.staffDescription()} property="og:description" />
  <meta content={m.public.staffDescription()} name="twitter:description" />
</svelte:head>

{#if mounted}
  <main
    class="min-h-screen"
    style="--color-primary: {$colorStore.primary};
           --color-secondary: {$colorStore.secondary};
           --color-accent: {$colorStore.accent};
           --color-text: {$colorStore.text};
           --color-muted: {$colorStore.muted};
           background: linear-gradient(135deg, {$colorStore.primary}10 0%, {$colorStore.secondary}05 100%);"
    title={m.public.staffMewdekoStaffMembers()}
    in:fade
  >
    <!-- Header Section -->
    <div class="sticky top-0 backdrop-blur-lg border-b shadow-lg"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}15 0%, {$colorStore.gradientEnd}10 100%); border-color: {$colorStore.primary}30;">
      <div class="container mx-auto px-4 py-6">
        <div class="text-center">
          <h1 class="text-3xl lg:text-4xl font-bold mb-2" style="color: {$colorStore.text};">
            {m.public.staffMeetOurTeam()}
          </h1>
          <p class="text-lg" style="color: {$colorStore.muted};">
            {m.public.staffThePassionatePeopleBehindMewdeko()}
          </p>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-16 max-w-7xl">
      <!-- Introduction -->
      <div class="text-center mb-16 max-w-4xl mx-auto" in:fade={{ duration: 300, delay: 100 }}>
        <div class="mb-8">
          <span class="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4"
                style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
            {m.public.staffOurStaff()}
          </span>
        </div>
        <h2 class="text-4xl lg:text-5xl font-black mb-6" style="color: {$colorStore.text};">
          {m.public.staffMajorPeople()}
        </h2>
        <p class="text-xl leading-relaxed" style="color: {$colorStore.muted};">
          {m.public.staffMeetTheDedicatedTeamThat()}
        </p>
      </div>

      <!-- Team Grid -->
      <div class="grid lg:grid-cols-3 gap-8 mb-16">
        {#each staffMembers as member, index}
          <div class="group" in:fly={{ y: 40, duration: 400, delay: 200 + (index * 100) }}>
            <div
              class="rounded-2xl p-8  border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
              style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}20;">

              <!-- Profile Image -->
              <div class="text-center mb-6">
                <div class="relative inline-block">
                  <img
                    alt={member.alt}
                    class="w-32 h-32 rounded-full mx-auto transition-transform duration-300 group-hover:scale-[1.02] shadow-lg"
                    style="border: 3px solid {$colorStore.primary};"
                    src={member.image}
                    loading="lazy"
                  >
                  <!-- Status indicator -->
                  <div
                    class="absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center"
                    style="background: {$colorStore.primary};">
                    <div class="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                  </div>
                </div>
              </div>

              <!-- Profile Info -->
              <div class="text-center">
                <h3 class="text-2xl font-bold mb-4" style="color: {$colorStore.text};">
                  {member.name}
                </h3>
                <div class="easter-egg-container">
                  <button
                    class="description text-base cursor-pointer transition-all duration-200 hover:opacity-70 text-left w-full bg-transparent border-none p-0 font-inherit"
                     style="color: {$colorStore.muted};"
                    data-hint={m.public.staffClickMe()}
                    onclick={(event) => handleEasterEggClick(event, member)}
                     aria-label={m.public.staffClickToRevealEasterEgg()}>
                    {member.description}
                  </button>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- Thank You Section -->
      <div class="text-center rounded-2xl p-12  border"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}08, {$colorStore.gradientMid}12); border-color: {$colorStore.primary}20;"
           in:fly={{ y: 40, duration: 400, delay: 600 }}>
        <div class="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}30, {$colorStore.gradientMid}40);">
          <span class="text-3xl">💖</span>
        </div>
        <h3 class="text-3xl font-bold mb-4" style="color: {$colorStore.text};">
          {m.public.staffThankYouForYourSupport()}
        </h3>
        <p class="text-lg max-w-2xl mx-auto leading-relaxed" style="color: {$colorStore.muted};">
          {m.public.staffOurTeamIsDrivenBy()}
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-4">
          <a href="https://github.com/SylveonDeko/Mewdeko"
             class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02]"
             style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
             target="_blank"
             rel="noopener noreferrer">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            {m.public.staffContributeOnGithub()}
          </a>
          <a href="https://fluxer.gg/GQuFOiBV"
             class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02]"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}80, {$colorStore.gradientMid}90); color: white; border: 1px solid {$colorStore.primary}50;"
             target="_blank"
             rel="noopener noreferrer">
            <i class="fa-solid fa-comments" aria-hidden="true"></i>
            {m.public.contactsJoinOurFluxer()}
          </a>
        </div>
      </div>
    </div>
  </main>
{/if}

<style>
    /* Enhanced profile card effects */
    .group:hover .w-32 {
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    /* Easter egg interaction styling */
    .easter-egg-container .description {
        user-select: none;
        position: relative;
    }

    .easter-egg-container .description:hover::after {
        content: attr(data-hint);
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--color-primary);
        color: white;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 12px;
        white-space: nowrap;
        opacity: 0.9;
        pointer-events: none;
    }

    /* Accessibility improvements */
    @media (prefers-reduced-motion: reduce) {
        * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }

    /* High contrast mode */
    @media (prefers-contrast: more) {
        .rounded-2xl {
            border-width: 2px;
        }
    }

    /* Focus states for accessibility */
    .description:focus {
        outline: 2px solid var(--color-accent);
        outline-offset: 2px;
        border-radius: 4px;
    }
</style>
