<script lang="ts">
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import {
  faCalendarAlt,
  faChevronRight,
  faComments,
  faExternalLinkAlt,
  faFileAlt,
  faGraduationCap,
  faPlay,
  faStar,
} from '@fortawesome/free-solid-svg-icons';
import { onMount } from 'svelte';
import Fa from 'svelte-fa';

import type { Guide } from '/@api/learning-center/guide';

// Tab definitions
const TABS = ['Learn', 'Community', "What's New"] as const;

let guides: Guide[] = $state([]);
let activeTab: number = $state(0);

// Community items - static content
const communityItems = [
  {
    title: 'Join Community Call',
    type: 'Event',
    meta: 'Monthly',
    url: 'https://podman-desktop.io/community',
    icon: faCalendarAlt,
  },
  {
    title: 'Discord Community',
    type: 'Chat',
    meta: '2.5k members',
    url: 'https://discord.com/invite/x5GzFF6QH4',
    icon: faComments,
  },
  {
    title: 'GitHub Discussions',
    type: 'Forum',
    meta: 'Active',
    url: 'https://github.com/containers/podman-desktop/discussions',
    icon: faGithub,
  },
];

// What's new items - static content for release announcements
const whatsNewItems = [
  {
    title: 'Podman Desktop 1.26 Released',
    type: 'Release',
    meta: 'Jan 2025',
    url: 'https://podman-desktop.io/blog',
    icon: faStar,
  },
  {
    title: 'New Dashboard Experience',
    type: 'Feature',
    meta: 'Jan 2025',
    url: 'https://podman-desktop.io/blog',
    icon: faStar,
  },
];

onMount(async () => {
  guides = await window.listGuides();
});

async function openExternal(url: string): Promise<void> {
  await window.openExternal(url);
}

async function openGuide(guide: Guide): Promise<void> {
  await window.telemetryTrack('openLearningCenterGuide', {
    guideId: guide.id,
  });
  await window.openExternal(guide.url);
}

function getGuideIcon(_guide: Guide): typeof faPlay | typeof faFileAlt {
  // Determine icon based on guide type or metadata
  if (_guide.id?.toLowerCase().includes('video')) {
    return faPlay;
  }
  return faFileAlt;
}
</script>

<div class="flex flex-col bg-[var(--pd-content-card-bg)] rounded-lg overflow-hidden">
  <!-- Header with tabs -->
  <div
    class="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-[var(--pd-content-divider)]">
    <Fa icon={faGraduationCap} class="w-4 h-4 text-[var(--pd-content-card-light-title)]" />
    <div class="flex gap-1 overflow-x-auto flex-1">
      {#each TABS as tab, i (tab)}
        <button
          onclick={(): void => { activeTab = i; }}
          class="px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap
            {activeTab === i
            ? 'text-[var(--pd-content-text)] bg-[var(--pd-content-bg)]'
            : 'text-[var(--pd-content-card-light-title)] hover:text-[var(--pd-content-text)] hover:bg-[var(--pd-content-bg)]/50'}">
          {tab}
          {#if i === 2 && whatsNewItems.length > 0}
            <span class="ml-1 w-1.5 h-1.5 bg-purple-500 rounded-full inline-block"></span>
          {/if}
        </button>
      {/each}
    </div>
    <button
      onclick={(): Promise<void> => openExternal('https://podman-desktop.io/docs')}
      class="text-xs text-[var(--pd-link)] hover:underline flex items-center gap-0.5 flex-shrink-0">
      All
      <Fa icon={faChevronRight} class="w-2.5 h-2.5" />
    </button>
  </div>

  <!-- Content -->
  <div class="p-2">
    {#if activeTab === 0}
      <!-- Learn tab - Guide items -->
      {#each guides.slice(0, 3) as guide (guide.id)}
        <button
          onclick={(): Promise<void> => openGuide(guide)}
          class="flex gap-3 p-2 w-full rounded-lg cursor-pointer transition-all hover:bg-[var(--pd-content-bg)] group text-left">
          <div
            class="w-10 h-10 rounded-lg bg-[var(--pd-content-bg)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--pd-content-card-bg)] transition-colors overflow-hidden">
            {#if guide.icon}
              <img
                src={`data:image/png;base64,${guide.icon}`}
                class="w-6 h-6 object-contain"
                alt={guide.title} />
            {:else}
              <Fa icon={getGuideIcon(guide)} class="w-4 h-4 text-[var(--pd-content-card-light-title)]" />
            {/if}
          </div>
          <div class="flex-1 min-w-0 py-0.5">
            <div
              class="text-sm font-medium text-[var(--pd-content-text)] mb-0.5 line-clamp-1 group-hover:text-[var(--pd-link)] transition-colors">
              {guide.title}
            </div>
            <div class="text-xs text-[var(--pd-content-card-light-title)] flex items-center gap-1.5">
              <span>Guide</span>
            </div>
          </div>
          <Fa
            icon={faExternalLinkAlt}
            class="w-3.5 h-3.5 text-[var(--pd-content-card-light-title)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
        </button>
      {/each}
      {#if guides.length === 0}
        <div class="text-sm text-[var(--pd-content-card-light-title)] p-4 text-center">
          No guides available
        </div>
      {/if}
    {:else if activeTab === 1}
      <!-- Community tab -->
      {#each communityItems as item (item.title)}
        <button
          onclick={(): Promise<void> => openExternal(item.url)}
          class="flex gap-3 p-2 w-full rounded-lg cursor-pointer transition-all hover:bg-[var(--pd-content-bg)] group text-left">
          <div
            class="w-10 h-10 rounded-lg bg-[var(--pd-content-bg)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--pd-content-card-bg)] transition-colors">
            <Fa icon={item.icon} class="w-4 h-4 text-[var(--pd-content-card-light-title)]" />
          </div>
          <div class="flex-1 min-w-0 py-0.5">
            <div
              class="text-sm font-medium text-[var(--pd-content-text)] mb-0.5 line-clamp-1 group-hover:text-[var(--pd-link)] transition-colors">
              {item.title}
            </div>
            <div class="text-xs text-[var(--pd-content-card-light-title)] flex items-center gap-1.5">
              <span>{item.type}</span>
              <span>·</span>
              <span>{item.meta}</span>
            </div>
          </div>
          <Fa
            icon={faExternalLinkAlt}
            class="w-3.5 h-3.5 text-[var(--pd-content-card-light-title)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
        </button>
      {/each}
    {:else if activeTab === 2}
      <!-- What's New tab -->
      {#each whatsNewItems as item (item.title)}
        <button
          onclick={(): Promise<void> => openExternal(item.url)}
          class="flex gap-3 p-2 w-full rounded-lg cursor-pointer transition-all hover:bg-[var(--pd-content-bg)] group text-left">
          <div
            class="w-10 h-10 rounded-lg bg-[var(--pd-content-bg)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--pd-content-card-bg)] transition-colors">
            <Fa icon={item.icon} class="w-4 h-4 text-[var(--pd-content-card-light-title)]" />
          </div>
          <div class="flex-1 min-w-0 py-0.5">
            <div
              class="text-sm font-medium text-[var(--pd-content-text)] mb-0.5 line-clamp-1 group-hover:text-[var(--pd-link)] transition-colors">
              {item.title}
            </div>
            <div class="text-xs text-[var(--pd-content-card-light-title)] flex items-center gap-1.5">
              <span
                class="text-[10px] px-1.5 py-0.5 bg-[var(--pd-content-bg)] text-[var(--pd-content-card-light-title)] rounded">
                {item.type}
              </span>
              <span>{item.meta}</span>
            </div>
          </div>
          <Fa
            icon={faExternalLinkAlt}
            class="w-3.5 h-3.5 text-[var(--pd-content-card-light-title)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
        </button>
      {/each}
    {/if}
  </div>
</div>
