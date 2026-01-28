<script lang="ts">
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from '@podman-desktop/ui-svelte';
import { Buffer } from 'buffer';
import Fa from 'svelte-fa';
import { router } from 'tinro';

import type { ProviderConnectionInfo, ProviderInfo, ProviderKubernetesConnectionInfo } from '/@api/provider-info';

import type { IConnectionStatus } from '../Util';
import ResourceConnectionActions from './ResourceConnectionActions.svelte';
import ResourceStatusBadge from './ResourceStatusBadge.svelte';
import { getStatusStyles, mapConnectionStatus } from './status-styles';
import type { CardDetail } from './types';

interface Props {
  provider: ProviderInfo;
  connection: ProviderKubernetesConnectionInfo;
  connectionStatus: IConnectionStatus | undefined;
  details?: CardDetail[];
  updateConnectionStatus: (
    provider: ProviderInfo,
    providerConnectionInfo: ProviderConnectionInfo,
    action?: string,
    error?: string,
    inProgress?: boolean,
  ) => void;
  addConnectionToRestartingQueue: (connection: {
    provider: string;
    container: string;
    loggerHandlerKey: symbol;
  }) => void;
}

let {
  provider,
  connection,
  connectionStatus,
  details = [],
  updateConnectionStatus,
  addConnectionToRestartingQueue,
}: Props = $props();

// Local state for optimistic updates - immediately reflects pending action
let pendingAction: string | undefined = $state(undefined);

// Reset pending action when connection status changes (action completed)
$effect(() => {
  // When the actual connection status changes, clear pending action
  if (connection.status === 'started' || connection.status === 'stopped') {
    pendingAction = undefined;
  }
});

// Wrapper to update status with optimistic local state
function handleUpdateConnectionStatus(
  prov: ProviderInfo,
  connInfo: ProviderConnectionInfo,
  action?: string,
  error?: string,
  inProgress?: boolean,
): void {
  // Immediately set pending action for optimistic update
  if (action && !error) {
    pendingAction = action;
  }
  updateConnectionStatus(prov, connInfo, action, error, inProgress);
}

// Compute effective status considering pending action (optimistic) or in-progress actions
let effectiveStatus = $derived.by(() => {
  // Check local pending action first for immediate optimistic updates
  if (pendingAction) {
    if (pendingAction === 'stop') return 'stopping';
    if (pendingAction === 'start') return 'starting';
    if (pendingAction === 'restart') return 'starting';
  }
  // Fall back to connectionStatus from parent
  if (connectionStatus?.inProgress && connectionStatus?.action) {
    if (connectionStatus.action === 'stop') return 'stopping';
    if (connectionStatus.action === 'start') return 'starting';
    if (connectionStatus.action === 'restart') return 'starting';
  }
  return connection.status;
});

let displayStatus = $derived(mapConnectionStatus(effectiveStatus));
let styles = $derived(getStatusStyles(displayStatus));

function getDetailsPath(): string {
  return `/preferences/kubernetes-connection/${provider.internalId}/${Buffer.from(connection.endpoint.apiURL).toString('base64')}/summary`;
}

function handleCardClick(e: MouseEvent): void {
  // Don't navigate if clicking on buttons or interactive elements
  const target = e.target as HTMLElement;
  if (target.closest('button') || target.closest('[role="button"]') || target.closest('[role="group"]')) {
    return;
  }
  router.goto(getDetailsPath());
}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  class="bg-[var(--pd-invert-content-card-bg)] border rounded-md p-3 transition-all hover:border-[var(--pd-content-sub-header)] cursor-pointer {styles.border}"
  role="region"
  aria-label={connection.name}
  onclick={handleCardClick}>
  <!-- Responsive Layout: flex-based for all screen sizes -->
  <div class="flex flex-col gap-2">
    <!-- Main row: Icon + Name + Status + Actions -->
    <div class="flex items-center gap-3">
      <!-- Provider Icon -->
      <div
        class="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 {styles.iconBg || 'bg-[var(--pd-content-bg)]'}">
        {#if provider.images.icon}
          {#if typeof provider.images.icon === 'string'}
            <img src={provider.images.icon} alt={provider.name} class="max-w-[18px] max-h-[18px]" />
          {:else}
            <img src={provider.images.icon.dark} alt={provider.name} class="max-w-[18px] max-h-[18px]" />
          {/if}
        {/if}
      </div>

      <!-- Name and Subtitle -->
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2 flex-wrap">
          <span
            class="text-sm font-medium truncate {styles.dimmed ? 'text-[var(--pd-content-sub-header)]' : 'text-[var(--pd-invert-content-card-header-text)]'}">
            {connection.name}
          </span>
          <!-- Status Badge - inline on all screens -->
          <ResourceStatusBadge status={effectiveStatus} />
        </div>
        <div
          class="text-[11px] mt-0.5 flex items-center gap-1.5 {styles.dimmed ? 'text-[var(--pd-content-sub-header)]/60' : 'text-[var(--pd-content-sub-header)]'}">
          <span class="px-1.5 py-0.5 rounded text-[10px] bg-[var(--pd-content-bg)] text-[var(--pd-content-sub-header)]">
            Kubernetes
          </span>
          <span class="truncate hidden lg:inline">{connection.endpoint.apiURL}</span>
        </div>
      </div>

      <!-- Details - hidden on smaller screens, shown on lg+ -->
      <div class="hidden lg:flex gap-4 flex-shrink-0 {styles.dimmed && 'opacity-50'}">
        {#each details as detail (detail.label)}
          <div class="text-center min-w-[50px]">
            <div
              class="text-xs font-semibold {styles.dimmed ? 'text-[var(--pd-content-sub-header)]' : 'text-[var(--pd-invert-content-card-text)]'}">
              {detail.value}
            </div>
            <div class="text-[9px] text-[var(--pd-content-sub-header)] uppercase tracking-wide">{detail.label}</div>
          </div>
        {/each}
      </div>

      <!-- Details tooltip - visible only on smaller screens -->
      {#if details.length > 0}
        <div class="lg:hidden flex-shrink-0">
          <Tooltip bottom tip={details.map(d => `${d.label}: ${d.value}`).join(' · ')}>
            <button
              type="button"
              class="px-2 py-1 text-xs text-[var(--pd-content-sub-header)] hover:text-[var(--pd-content-text)] {styles.dimmed && 'opacity-50'}"
              aria-label="Details: {details.map(d => `${d.label}: ${d.value}`).join(', ')}">
              <Fa icon={faCircleInfo} class="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
      {/if}

      <!-- Actions -->
      <div class="flex items-center gap-0.5 flex-shrink-0">
        <ResourceConnectionActions
          {provider}
          {connection}
          {connectionStatus}
          updateConnectionStatus={handleUpdateConnectionStatus}
          {addConnectionToRestartingQueue} />

        <Tooltip bottom tip="{provider.name} details">
          <button
            aria-label="{provider.name} details"
            type="button"
            class="px-2 py-1 text-[var(--pd-action-button-text)] hover:text-[var(--pd-action-button-hover-text)]"
            onclick={(): void => router.goto(getDetailsPath())}>
            <Fa icon={faCircleInfo} />
          </button>
        </Tooltip>
      </div>
    </div>

  </div>
</div>
