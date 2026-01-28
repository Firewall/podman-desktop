<script lang="ts">
import { faCubes, faPlay } from '@fortawesome/free-solid-svg-icons';
import { Button, Expandable } from '@podman-desktop/ui-svelte';
import { ContainerIcon } from '@podman-desktop/ui-svelte/icons';
import type { Component } from 'svelte';
import { onDestroy, onMount } from 'svelte';
import Fa from 'svelte-fa';

import ImageIcon from '/@/lib/images/ImageIcon.svelte';
import PodIcon from '/@/lib/images/PodIcon.svelte';
import ResourcesIcon from '/@/lib/images/ResourcesIcon.svelte';
import VolumeIcon from '/@/lib/images/VolumeIcon.svelte';
import { eventCollect, registerConnectionCallback } from '/@/lib/preferences/preferences-connection-rendering-task';
import { onDidChangeConfiguration } from '/@/stores/configurationProperties';
import { isEngineRunning, resourceCounts } from '/@/stores/dashboard/dashboard-resource-counts';
import { providerInfos } from '/@/stores/providers';

interface ResourceCardData {
  href: string;
  icon: Component;
  label: string;
  count?: number;
  running?: number;
  stopped?: number;
  inUse?: number;
  unused?: number;
  priority: number;
}

let expanded: boolean = $state(true);
let initialized: boolean = $state(false);

const CONFIGURATION_KEY = 'resourceOverview.expanded';

const listener: EventListener = (obj: object) => {
  if ('detail' in obj) {
    const detail = obj.detail as { key: string; value: boolean };
    if (CONFIGURATION_KEY === detail?.key) {
      expanded = detail.value;
    }
  }
};

onMount(async () => {
  onDidChangeConfiguration.addEventListener(CONFIGURATION_KEY, listener);
  expanded = (await window.getConfigurationValue<boolean>(CONFIGURATION_KEY)) ?? true;
  initialized = true;
});

onDestroy(() => {
  onDidChangeConfiguration.removeEventListener(CONFIGURATION_KEY, listener);
});

async function toggle(expandedState: boolean): Promise<void> {
  await window.updateConfigurationValue(CONFIGURATION_KEY, expandedState);
}

// Resources that require Podman to be running
const podmanDependentResources = ['Containers', 'Pods', 'Images'];

// Build resource cards from store data
let resources: ResourceCardData[] = $derived([
  {
    href: '/containers',
    icon: ContainerIcon,
    label: 'Containers',
    running: $resourceCounts.containers.running,
    stopped: $resourceCounts.containers.stopped,
    priority: 1,
  },
  {
    href: '/pods',
    icon: PodIcon,
    label: 'Pods',
    running: $resourceCounts.pods.running,
    stopped: $resourceCounts.pods.stopped,
    priority: 2,
  },
  {
    href: '/images',
    icon: ImageIcon,
    label: 'Images',
    count: $resourceCounts.images.total,
    inUse: $resourceCounts.images.inUse,
    unused: $resourceCounts.images.unused,
    priority: 3,
  },
  {
    href: '/volumes',
    icon: VolumeIcon,
    label: 'Volumes',
    count: $resourceCounts.volumes.total,
    inUse: $resourceCounts.volumes.inUse,
    unused: $resourceCounts.volumes.unused,
    priority: 4,
  },
]);

function isUnavailable(label: string): boolean {
  return !$isEngineRunning && podmanDependentResources.includes(label);
}

// Create a simple logger for dashboard start operations
function createDashboardLogger(): { log: () => void; warn: () => void; error: () => void; onEnd: () => void } {
  return {
    log: (): void => {},
    warn: (): void => {},
    error: (): void => {},
    onEnd: (): void => {},
  };
}

async function handleStartPodman(): Promise<void> {
  // Find a stopped container connection and start it
  for (const provider of $providerInfos) {
    for (const connection of provider.containerConnections) {
      if (connection.status === 'stopped') {
        try {
          const loggerHandlerKey = registerConnectionCallback(createDashboardLogger());
          await window.startProviderConnectionLifecycle(
            provider.internalId,
            connection,
            loggerHandlerKey,
            eventCollect,
          );
          return;
        } catch (error) {
          console.error('Failed to start provider connection', error);
        }
      }
    }
  }
}
</script>

<div class="flex flex-1 flex-col bg-[var(--pd-content-card-bg)] p-5 rounded-md">
  <Expandable bind:initialized bind:expanded onclick={toggle}>
    {#snippet title()}
      <div class="flex items-center gap-2">
        <Fa icon={faCubes} class="w-4 h-4 text-[var(--pd-content-card-light-title)]" />
        <span class="text-lg font-semibold text-[var(--pd-content-card-header-text)]">Resources</span>
      </div>
    {/snippet}

    <div class="pt-3">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        {#each resources as resource (resource.label)}
          {@const ResourceIcon = resource.icon}
          {@const unavailable = isUnavailable(resource.label)}
          <a
            href={resource.href}
            class="block bg-[var(--pd-content-bg)] border border-[var(--pd-content-card-border)] rounded-md p-4 cursor-pointer transition-all hover:border-[var(--pd-content-card-hover-border)] no-underline group">
            <div class="flex items-center gap-3 mb-2">
              <div
                class="w-8 h-8 rounded-md flex items-center justify-center
                  {unavailable
                  ? 'bg-[var(--pd-content-card-bg)] text-[var(--pd-content-card-light-title)]/50'
                  : 'bg-[var(--pd-content-card-bg)] text-[var(--pd-content-card-light-title)]'}">
                <ResourceIcon class="w-4 h-4" />
              </div>
              <div class="flex-1">
                {#if unavailable}
                  <div class="text-xl font-bold text-[var(--pd-content-card-light-title)]/50 leading-none">-</div>
                {:else if resource.count !== undefined}
                  <div class="text-xl font-bold text-[var(--pd-content-text)] leading-none">{resource.count}</div>
                {:else if resource.running !== undefined || resource.stopped !== undefined}
                  <div class="text-xl font-bold text-[var(--pd-content-text)] leading-none">
                    {resource.running ?? 0}
                  </div>
                {/if}
              </div>
            </div>
            <div class="text-sm {unavailable ? 'text-[var(--pd-content-card-light-title)]/50' : 'text-[var(--pd-content-card-light-title)]'}">
              {resource.label}
            </div>
            <div class="text-xs text-[var(--pd-content-card-light-title)] flex items-center gap-2 flex-wrap mt-1">
              {#if unavailable}
                <span class="text-[var(--pd-content-card-light-title)]/50">Start engine to view</span>
              {:else}
                {#if resource.running !== undefined}
                  <span class="flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    {resource.running} running
                  </span>
                {/if}
                {#if resource.stopped !== undefined && resource.stopped > 0}
                  <span class="flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-[var(--pd-content-card-light-title)]/50"></span>
                    {resource.stopped} stopped
                  </span>
                {/if}
                {#if resource.inUse !== undefined}
                  <span class="flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    {resource.inUse} in use
                  </span>
                {/if}
                {#if resource.unused !== undefined && resource.unused > 0}
                  <span class="flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-[var(--pd-content-card-light-title)]/50"></span>
                    {resource.unused} unused
                  </span>
                {/if}
              {/if}
            </div>
          </a>
        {/each}
      </div>

      <!-- Show Start Podman action when engine is not running -->
      {#if !$isEngineRunning}
        <div class="mt-4 pt-4 border-t border-[var(--pd-content-card-border)]">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <ResourcesIcon class="w-4 h-4 text-[var(--pd-content-card-light-title)]" />
              <span class="text-sm text-[var(--pd-content-card-light-title)]">Container engine is not running</span>
            </div>
            <Button type="primary" icon={faPlay} onclick={handleStartPodman}>
              Start Podman
            </Button>
          </div>
        </div>
      {/if}
    </div>
  </Expandable>
</div>
