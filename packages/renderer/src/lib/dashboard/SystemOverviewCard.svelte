<script lang="ts">
import {
  faCheckCircle,
  faExclamationCircle,
  faPlay,
  faRedo,
  faServer,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { Button, Expandable, Spinner } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import Fa from 'svelte-fa';
import { router } from 'tinro';

import type { MachineStatus } from '/@/lib/dashboard/dashboard-types';
import KubernetesIcon from '/@/lib/images/KubernetesIcon.svelte';
import ResourcesIcon from '/@/lib/images/ResourcesIcon.svelte';
import { eventCollect, registerConnectionCallback } from '/@/lib/preferences/preferences-connection-rendering-task';
import { onDidChangeConfiguration } from '/@/stores/configurationProperties';
import { providerInfos } from '/@/stores/providers';

interface DisplayItem {
  id: string;
  title: string;
  subtitle?: string;
  status: MachineStatus;
  action?: string;
  providerInternalId?: string;
  connectionName?: string;
  type: 'container' | 'kubernetes';
  apiURL?: string;
  lifecycleMethods?: string[];
}

let expanded: boolean = $state(true);
let initialized: boolean = $state(false);

const CONFIGURATION_KEY = 'systemOverview.expanded';

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

// Map provider connection status to display status
function mapConnectionStatus(status: string): MachineStatus {
  switch (status) {
    case 'started':
      return 'running';
    case 'starting':
      return 'starting';
    case 'stopping':
      return 'stopping';
    case 'stopped':
      return 'stopped';
    default:
      return 'error';
  }
}

// Build display items from provider infos - include both container and kubernetes connections
let containerItems: DisplayItem[] = $derived(
  $providerInfos.flatMap(provider =>
    provider.containerConnections.map(connection => ({
      id: `${provider.internalId}-container-${connection.name}`,
      title: connection.displayName || connection.name,
      subtitle: provider.name,
      status: mapConnectionStatus(connection.status),
      action:
        connection.status === 'stopped'
          ? 'Start'
          : connection.status === 'started'
            ? undefined
            : connection.status === 'starting'
              ? undefined
              : 'Retry',
      providerInternalId: provider.internalId,
      connectionName: connection.name,
      type: 'container' as const,
    })),
  ),
);

let kubernetesItems: DisplayItem[] = $derived(
  $providerInfos.flatMap(provider =>
    provider.kubernetesConnections.map(connection => {
      const hasStart = connection.lifecycleMethods?.includes('start') ?? false;
      const status = mapConnectionStatus(connection.status);
      return {
        id: `${provider.internalId}-kubernetes-${connection.name}`,
        title: connection.name,
        subtitle: provider.name,
        status,
        action: hasStart && status === 'stopped' ? 'Start' : hasStart && status === 'error' ? 'Retry' : undefined,
        providerInternalId: provider.internalId,
        connectionName: connection.name,
        type: 'kubernetes' as const,
        apiURL: connection.endpoint.apiURL,
        lifecycleMethods: connection.lifecycleMethods,
      };
    }),
  ),
);

// Check if any container engine is running
let hasRunningContainerEngine = $derived(containerItems.some(i => i.status === 'running'));

// If a container engine is running, don't show actions for stopped items (no need to prompt starting others)
let displayItems: DisplayItem[] = $derived(
  [...containerItems, ...kubernetesItems].map(item => ({
    ...item,
    // Hide action for stopped items when there's already a running container engine
    action: hasRunningContainerEngine && item.status === 'stopped' ? undefined : item.action,
  })),
);

// Overall system status
// Consider healthy if all items are running, OR if there's a running container engine and no errors/starting/stopping
let allHealthy = $derived.by(() => {
  if (displayItems.length === 0) return false;
  // If all items are running, it's healthy
  if (displayItems.every(i => i.status === 'running')) return true;
  // If a container engine is running and remaining items are just stopped (not error/starting/stopping), consider it healthy
  if (hasRunningContainerEngine) {
    const nonRunningItems = displayItems.filter(i => i.status !== 'running');
    return nonRunningItems.every(i => i.status === 'stopped');
  }
  return false;
});
let hasError = $derived(displayItems.some(i => i.status === 'error'));
let hasStarting = $derived(displayItems.some(i => i.status === 'starting'));
let hasStopping = $derived(displayItems.some(i => i.status === 'stopping'));
let hasStopped = $derived(displayItems.some(i => i.status === 'stopped'));

// Items that need attention (not running)
// If a container engine is running, don't show stopped items as problems (no need to prompt starting others)
let problemItems = $derived(
  displayItems.filter(i => {
    if (i.status === 'running') return false;
    // Hide stopped items when there's already a running container engine
    if (hasRunningContainerEngine && i.status === 'stopped') return false;
    return true;
  }),
);
let healthyItems = $derived(displayItems.filter(i => i.status === 'running'));

// Machine counts
let stoppedCount = $derived(displayItems.filter(i => i.status === 'stopped').length);
let totalCount = $derived(displayItems.length);

function getStatusIcon(status: MachineStatus): typeof faCheckCircle {
  switch (status) {
    case 'running':
      return faCheckCircle;
    case 'error':
      return faTimesCircle;
    case 'starting':
    case 'stopping':
      return faExclamationCircle;
    default:
      return faExclamationCircle;
  }
}

function getStatusColor(status: MachineStatus): string {
  switch (status) {
    case 'running':
      return 'text-green-500';
    case 'error':
      return 'text-red-500';
    case 'starting':
      return 'text-violet-500';
    case 'stopping':
      return 'text-amber-500';
    default:
      return 'text-[var(--pd-content-card-light-title)]';
  }
}

function getStatusBgColor(status: MachineStatus): string {
  switch (status) {
    case 'running':
      return 'bg-green-500/10';
    case 'error':
      return 'bg-red-500/10';
    case 'starting':
      return 'bg-violet-500/10';
    case 'stopping':
      return 'bg-amber-500/10';
    default:
      return 'bg-[var(--pd-content-card-bg)]';
  }
}

function getStatusLabel(status: MachineStatus): string {
  switch (status) {
    case 'running':
      return 'Running';
    case 'error':
      return 'Error';
    case 'starting':
      return 'Starting...';
    case 'stopping':
      return 'Stopping...';
    default:
      return 'Stopped';
  }
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

async function handleAction(item: DisplayItem): Promise<void> {
  if (!item.providerInternalId) return;

  const provider = $providerInfos.find(p => p.internalId === item.providerInternalId);
  if (!provider) return;

  // Find the connection based on type
  const connection =
    item.type === 'kubernetes'
      ? provider.kubernetesConnections.find(c => c.name === item.connectionName)
      : provider.containerConnections.find(c => c.name === item.connectionName);
  if (!connection) return;

  try {
    if (item.action === 'Start' || item.action === 'Retry') {
      const loggerHandlerKey = registerConnectionCallback(createDashboardLogger());
      await window.startProviderConnectionLifecycle(provider.internalId, connection, loggerHandlerKey, eventCollect);
    }
  } catch (error) {
    console.error('Failed to perform action on provider connection', error);
  }
}
</script>

<div class="flex flex-1 flex-col bg-[var(--pd-content-card-bg)] p-5 rounded-md">
  <Expandable bind:initialized bind:expanded onclick={toggle}>
    {#snippet title()}
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-2">
          <Fa icon={faServer} class="w-4 h-4 text-[var(--pd-content-card-light-title)]" />
          <span class="text-lg font-semibold text-[var(--pd-content-card-header-text)]">System Overview</span>
        </div>
        <button
          type="button"
          onclick={(e: MouseEvent): void => {
            e.stopPropagation();
            e.preventDefault();
            router.goto('/preferences/resources');
          }}
          class="text-xs text-[var(--pd-link)] hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer">
          Manage Resources
        </button>
      </div>
    {/snippet}

    <div class="pt-3 space-y-3">
      {#if displayItems.length === 0}
        <!-- No providers configured -->
        <div
          class="flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-[var(--pd-content-bg)] border border-[var(--pd-content-card-border)]">
          <Fa icon={faExclamationCircle} class="w-4 h-4 text-[var(--pd-content-card-light-title)]" />
          <span class="text-[var(--pd-content-card-light-title)]">No container engines configured</span>
          <a href="/preferences/resources" class="text-[var(--pd-link)] hover:underline ml-auto">Configure</a>
        </div>
      {:else if allHealthy}
        <!-- Minimal healthy state - just a status line -->
        <a
          href="/preferences/resources"
          class="flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-green-500/10 hover:bg-green-500/15 transition-colors no-underline w-fit">
          <Fa icon={faCheckCircle} class="w-4 h-4 text-green-500" />
          <span class="text-green-500 font-medium">
            {#if stoppedCount === 0}
              {#if totalCount === 1}
                Engine running
              {:else}
                All {totalCount} engines running
              {/if}
            {:else}
              {healthyItems.length} of {totalCount} engines running
            {/if}
          </span>
        </a>
      {:else}
        <!-- Status Indicator for non-healthy states -->
        <div class="flex items-center gap-2 text-sm">
          {#if hasError}
            <Fa icon={faTimesCircle} class="w-4 h-4 text-red-500" />
            <span class="text-red-500 font-medium">System error detected</span>
          {:else if hasStarting}
            <Spinner size="1em" />
            <span class="text-violet-500 font-medium">Starting up...</span>
          {:else if hasStopping}
            <Spinner size="1em" />
            <span class="text-amber-500 font-medium">Stopping...</span>
          {:else if hasStopped}
            <Fa icon={faExclamationCircle} class="w-4 h-4 text-[var(--pd-content-card-light-title)]" />
            <span class="text-[var(--pd-content-card-light-title)] font-medium">
              {stoppedCount === totalCount ? 'Engine stopped' : 'Some engines are stopped'}
            </span>
          {/if}
        </div>

        <!-- Expanded cards for items needing attention -->
        <div class="grid gap-2">
          {#each problemItems as item (item.id)}
            <a
              href="/preferences/resources"
              class="flex items-center gap-3 p-3 rounded-md border transition-all no-underline group
                {item.status === 'error'
                ? 'bg-red-500/5 border-red-500/30 hover:border-red-500/50'
                : item.status === 'starting'
                  ? 'bg-violet-500/5 border-violet-500/30 hover:border-violet-500/50'
                  : item.status === 'stopping'
                    ? 'bg-amber-500/5 border-amber-500/30 hover:border-amber-500/50'
                    : 'bg-[var(--pd-content-bg)] border-[var(--pd-content-card-border)] hover:border-[var(--pd-content-card-hover-border)]'}">
              <!-- Icon -->
              <div class="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 {getStatusBgColor(item.status)}">
                {#if item.type === 'kubernetes'}
                  <KubernetesIcon class="w-5 h-5 {getStatusColor(item.status)}" />
                {:else}
                  <ResourcesIcon class="w-5 h-5 {getStatusColor(item.status)}" />
                {/if}
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-sm font-medium text-[var(--pd-content-text)]">{item.title}</span>
                  <span class="text-[10px] px-1.5 py-0.5 rounded bg-[var(--pd-content-bg)] text-[var(--pd-content-card-light-title)]">
                    {item.type === 'kubernetes' ? 'Kubernetes' : 'Engine'}
                  </span>
                </div>
                {#if item.subtitle}
                  <div class="text-xs text-[var(--pd-content-card-light-title)]">{item.subtitle}</div>
                {/if}
                <div class="text-xs flex items-center gap-1 mt-0.5 {getStatusColor(item.status)}">
                  {#if item.status === 'starting' || item.status === 'stopping'}
                    <Spinner size="0.75em" />
                  {:else}
                    <Fa icon={getStatusIcon(item.status)} class="w-3 h-3" />
                  {/if}
                  {getStatusLabel(item.status)}
                </div>
              </div>

              <!-- Action -->
              {#if item.status === 'starting' || item.status === 'stopping'}
                <Spinner size="1.25em" />
              {:else if item.action}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                  onclick={(e: MouseEvent): void => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}>
                  <Button
                    type={item.status === 'error' ? 'danger' : 'primary'}
                    icon={item.status === 'error' ? faRedo : faPlay}
                    onclick={(): void => {
                      handleAction(item).catch((err: unknown) => console.error('Action failed:', err));
                    }}>
                    {item.action}
                  </Button>
                </div>
              {/if}
            </a>
          {/each}
        </div>

        <!-- Compact row for healthy items when some items have issues -->
        {#if healthyItems.length > 0}
          <div class="flex items-center gap-2 flex-wrap">
            {#each healthyItems as item (item.id)}
              <a
                href="/preferences/resources"
                class="flex items-center gap-2 px-3 py-2 rounded-md bg-[var(--pd-content-bg)] border border-[var(--pd-content-card-border)] hover:border-[var(--pd-content-card-hover-border)] transition-colors no-underline">
                <div class="w-5 h-5 rounded-md bg-green-500/10 flex items-center justify-center">
                  {#if item.type === 'kubernetes'}
                    <KubernetesIcon class="w-3 h-3 text-green-500" />
                  {:else}
                    <ResourcesIcon class="w-3 h-3 text-green-500" />
                  {/if}
                </div>
                <span class="text-xs font-medium text-[var(--pd-content-text)]">{item.title}</span>
                <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              </a>
            {/each}
          </div>
        {/if}
      {/if}
    </div>
  </Expandable>
</div>
