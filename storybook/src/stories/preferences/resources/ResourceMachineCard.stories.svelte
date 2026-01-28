<script context="module" lang="ts">
import { defineMeta } from '@storybook/addon-svelte-csf';
import { fn } from 'storybook/test';

import type { ProviderContainerConnectionInfo, ProviderInfo } from '../../../../../../packages/api/src/provider-info';
import ResourceMachineCard from '../../../../../packages/renderer/src/lib/preferences/resources/ResourceMachineCard.svelte';

// Mock functions
const updateConnectionStatusFn = fn().mockName('updateConnectionStatus');
const addConnectionToRestartingQueueFn = fn().mockName('addConnectionToRestartingQueue');
const onErrorFn = fn().mockName('onError');

// Base provider mock
const mockProvider: ProviderInfo = {
  internalId: 'podman',
  id: 'podman',
  extensionId: 'podman.podman',
  name: 'Podman',
  containerConnections: [],
  kubernetesConnections: [],
  vmConnections: [],
  status: 'ready',
  containerProviderConnectionCreation: true,
  containerProviderConnectionInitialization: false,
  kubernetesProviderConnectionCreation: false,
  kubernetesProviderConnectionInitialization: false,
  vmProviderConnectionCreation: false,
  vmProviderConnectionInitialization: false,
  links: [],
  detectionChecks: [],
  warnings: [],
  images: {
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iIzg5MkNBMCIvPjwvc3ZnPg==',
  },
  installationSupport: false,
  cleanupSupport: false,
  version: '5.0.0',
};

// Connection mock factory
function createConnection(
  status: 'started' | 'stopped' | 'starting' | 'stopping' | 'error',
  options: Partial<ProviderContainerConnectionInfo> = {},
): ProviderContainerConnectionInfo {
  return {
    connectionType: 'container',
    name: options.name ?? 'podman-machine-default',
    displayName: options.displayName ?? 'Podman Machine',
    status: status,
    type: 'podman',
    endpoint: {
      socketPath: '/var/run/podman/podman.sock',
    },
    lifecycleMethods: ['start', 'stop', 'delete', 'edit'],
    shellAccess: true,
    vmType: { id: 'applehv', name: 'AppleHV' },
    isDefault: options.isDefault ?? true,
    ...options,
  };
}

// Stats mock
const mockStats = [
  { label: 'CPUs', value: '4' },
  { label: 'Memory', value: '8 GB' },
  { label: 'Disk', value: '100 GB' },
];

// Rootful info mock
const mockRootfulInfo = {
  id: 'podman.machine.rootful',
  title: 'Rootful',
  description: 'Machine is running in rootful mode',
  type: 'boolean' as const,
  parentId: 'podman',
  scope: 'ContainerConnection' as const,
  value: true,
  enum: [true, false],
  connection: 'podman-machine-default',
  providerId: 'podman',
};

const mockRootlessInfo = {
  ...mockRootfulInfo,
  value: false,
};

/**
 * These are the stories for the `ResourceMachineCard` component.
 * It displays a container/VM connection with status, actions, and stats.
 */
// biome-ignore lint/correctness/noUnusedVariables: Story is used in markup
const { Story } = defineMeta({
  component: ResourceMachineCard,
  render: template,
  title: 'Preferences/Resources/ResourceMachineCard',
  tags: ['autodocs'],
  args: {
    provider: mockProvider,
    updateConnectionStatus: updateConnectionStatusFn,
    addConnectionToRestartingQueue: addConnectionToRestartingQueueFn,
    onError: onErrorFn,
  },
});

// IConnectionStatus type
interface MockConnectionStatus {
  status: string;
  action?: string;
  inProgress: boolean;
  error?: string;
}

type CardVariant = {
  name: string;
  connection: ProviderContainerConnectionInfo;
  connectionStatus?: MockConnectionStatus;
  stats?: typeof mockStats;
  rootfulInfo?: typeof mockRootfulInfo;
};

// biome-ignore lint/correctness/noUnusedVariables: used in markup
const cardVariants: CardVariant[] = [
  {
    name: 'Running (Default, Rootful)',
    connection: createConnection('started'),
    stats: mockStats,
    rootfulInfo: mockRootfulInfo,
  },
  {
    name: 'Running (Rootless)',
    connection: createConnection('started'),
    stats: mockStats,
    rootfulInfo: mockRootlessInfo,
  },
  {
    name: 'Running (Not Default)',
    connection: createConnection('started', { isDefault: false }),
    stats: mockStats,
    rootfulInfo: mockRootfulInfo,
  },
  {
    name: 'Stopped',
    connection: createConnection('stopped'),
    stats: mockStats,
    rootfulInfo: mockRootfulInfo,
  },
  {
    name: 'Starting',
    connection: createConnection('starting'),
    stats: mockStats,
    rootfulInfo: mockRootfulInfo,
  },
  {
    name: 'Stopping',
    connection: createConnection('stopping'),
    stats: mockStats,
    rootfulInfo: mockRootfulInfo,
  },
  {
    name: 'Error',
    connection: createConnection('error'),
    stats: mockStats,
    rootfulInfo: mockRootfulInfo,
    connectionStatus: {
      status: 'error',
      action: 'start',
      inProgress: false,
      error: 'Failed to start machine: QEMU exited with error code 1',
    },
  },
  {
    name: 'Starting (In Progress)',
    connection: createConnection('stopped'),
    stats: mockStats,
    rootfulInfo: mockRootfulInfo,
    connectionStatus: {
      status: 'stopped',
      action: 'start',
      inProgress: true,
    },
  },
  {
    name: 'Stopping (In Progress)',
    connection: createConnection('started'),
    stats: mockStats,
    rootfulInfo: mockRootfulInfo,
    connectionStatus: {
      status: 'started',
      action: 'stop',
      inProgress: true,
    },
  },
  {
    name: 'With Error Message',
    connection: createConnection('error'),
    stats: mockStats,
    rootfulInfo: mockRootfulInfo,
    connectionStatus: {
      status: 'error',
      action: 'start',
      inProgress: false,
      error: 'Connection timeout: Unable to reach the container runtime. Please check if the daemon is running.',
    },
  },
  {
    name: 'Without Stats',
    connection: createConnection('started'),
    rootfulInfo: mockRootfulInfo,
  },
  {
    name: 'Docker Engine',
    connection: {
      ...createConnection('started'),
      type: 'docker',
      name: 'docker-desktop',
      displayName: 'Docker Desktop',
    },
    stats: [
      { label: 'CPUs', value: '2' },
      { label: 'Memory', value: '4 GB' },
    ],
  },
];
</script>

{#snippet template({ ...args })}
  {#if args.showAll}
    <div class="bg-[var(--pd-content-bg)] p-4">
      <div class="flex flex-col gap-6">
        <div class="text-sm font-semibold text-[var(--pd-content-header)]">All Machine Card States</div>
        <div class="flex flex-col gap-4 max-w-3xl">
          {#each cardVariants as variant (variant.name)}
            <div class="flex flex-col gap-2">
              <div class="text-xs text-[var(--pd-content-text)] font-medium">{variant.name}</div>
              <ResourceMachineCard
                provider={args.provider}
                connection={variant.connection}
                connectionStatus={variant.connectionStatus}
                stats={variant.stats}
                rootfulInfo={variant.rootfulInfo}
                updateConnectionStatus={args.updateConnectionStatus}
                addConnectionToRestartingQueue={args.addConnectionToRestartingQueue}
                onError={args.onError} />
            </div>
          {/each}
        </div>
      </div>
    </div>
  {:else}
    <div class="bg-[var(--pd-content-bg)] p-4">
      <div class="max-w-3xl">
        <ResourceMachineCard
          provider={args.provider}
          connection={args.connection}
          connectionStatus={args.connectionStatus}
          stats={args.stats}
          rootfulInfo={args.rootfulInfo}
          updateConnectionStatus={args.updateConnectionStatus}
          addConnectionToRestartingQueue={args.addConnectionToRestartingQueue}
          onError={args.onError} />
      </div>
    </div>
  {/if}
{/snippet}

<Story name="All States" args={{ showAll: true }} />

<Story
  name="Running"
  args={{
    connection: createConnection('started'),
    stats: mockStats,
    rootfulInfo: mockRootfulInfo,
  }} />

<Story
  name="Stopped"
  args={{
    connection: createConnection('stopped'),
    stats: mockStats,
    rootfulInfo: mockRootfulInfo,
  }} />

<Story
  name="Starting"
  args={{
    connection: createConnection('starting'),
    stats: mockStats,
    rootfulInfo: mockRootfulInfo,
  }} />

<Story
  name="Stopping"
  args={{
    connection: createConnection('stopping'),
    stats: mockStats,
    rootfulInfo: mockRootfulInfo,
  }} />

<Story
  name="Error"
  args={{
    connection: createConnection('error'),
    stats: mockStats,
    rootfulInfo: mockRootfulInfo,
    connectionStatus: {
      status: 'error',
      action: 'start',
      inProgress: false,
      error: 'Failed to start machine: QEMU exited with error code 1',
    },
  }} />

<Story
  name="Error with Long Message"
  args={{
    connection: createConnection('error'),
    stats: mockStats,
    rootfulInfo: mockRootfulInfo,
    connectionStatus: {
      status: 'error',
      action: 'start',
      inProgress: false,
      error:
        'Connection timeout: Unable to reach the container runtime. Please check if the daemon is running and that the socket path is correct. You may need to restart the service or check system logs for more details.',
    },
  }} />
