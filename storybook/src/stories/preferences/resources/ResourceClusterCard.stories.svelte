<script context="module" lang="ts">
import { defineMeta } from '@storybook/addon-svelte-csf';
import { fn } from 'storybook/test';

import type { ProviderInfo, ProviderKubernetesConnectionInfo } from '../../../../../../packages/api/src/provider-info';
import ResourceClusterCard from '../../../../../packages/renderer/src/lib/preferences/resources/ResourceClusterCard.svelte';

// Mock functions
const updateConnectionStatusFn = fn().mockName('updateConnectionStatus');
const addConnectionToRestartingQueueFn = fn().mockName('addConnectionToRestartingQueue');

// Base provider mock for Kind
const mockKindProvider: ProviderInfo = {
  internalId: 'kind',
  id: 'kind',
  extensionId: 'podman-desktop.kind',
  name: 'Kind',
  containerConnections: [],
  kubernetesConnections: [],
  vmConnections: [],
  status: 'ready',
  containerProviderConnectionCreation: false,
  containerProviderConnectionInitialization: false,
  kubernetesProviderConnectionCreation: true,
  kubernetesProviderConnectionInitialization: false,
  vmProviderConnectionCreation: false,
  vmProviderConnectionInitialization: false,
  links: [],
  detectionChecks: [],
  warnings: [],
  images: {
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iIzMyNkNFNSIvPjwvc3ZnPg==',
  },
  installationSupport: false,
  cleanupSupport: false,
  version: '0.20.0',
};

// Base provider mock for Minikube
const mockMinikubeProvider: ProviderInfo = {
  ...mockKindProvider,
  internalId: 'minikube',
  id: 'minikube',
  extensionId: 'podman-desktop.minikube',
  name: 'Minikube',
  version: '1.32.0',
};

// Connection mock factory
function createKubeConnection(
  status: 'started' | 'stopped' | 'starting' | 'stopping' | 'error',
  options: Partial<ProviderKubernetesConnectionInfo> = {},
): ProviderKubernetesConnectionInfo {
  return {
    connectionType: 'kubernetes',
    name: options.name ?? 'kind-cluster',
    status: status,
    endpoint: {
      apiURL: options.endpoint?.apiURL ?? 'https://127.0.0.1:6443',
    },
    lifecycleMethods: options.lifecycleMethods ?? ['start', 'stop', 'delete'],
    ...options,
  };
}

// Details mock
const mockDetails = [
  { label: 'Nodes', value: '1' },
  { label: 'Version', value: 'v1.29.0' },
];

/**
 * These are the stories for the `ResourceClusterCard` component.
 * It displays a Kubernetes cluster connection with status and actions.
 */
// biome-ignore lint/correctness/noUnusedVariables: Story is used in markup
const { Story } = defineMeta({
  component: ResourceClusterCard,
  render: template,
  title: 'Preferences/Resources/ResourceClusterCard',
  tags: ['autodocs'],
  args: {
    provider: mockKindProvider,
    updateConnectionStatus: updateConnectionStatusFn,
    addConnectionToRestartingQueue: addConnectionToRestartingQueueFn,
  },
});

// IConnectionStatus type
interface MockConnectionStatus {
  status: string;
  action?: string;
  inProgress: boolean;
  error?: string;
}

type ClusterVariant = {
  name: string;
  provider: ProviderInfo;
  connection: ProviderKubernetesConnectionInfo;
  connectionStatus?: MockConnectionStatus;
  details?: typeof mockDetails;
};

// biome-ignore lint/correctness/noUnusedVariables: used in markup
const clusterVariants: ClusterVariant[] = [
  {
    name: 'Kind - Running',
    provider: mockKindProvider,
    connection: createKubeConnection('started', { name: 'kind-cluster' }),
    details: mockDetails,
  },
  {
    name: 'Kind - Stopped',
    provider: mockKindProvider,
    connection: createKubeConnection('stopped', { name: 'kind-cluster' }),
    details: mockDetails,
  },
  {
    name: 'Kind - Starting',
    provider: mockKindProvider,
    connection: createKubeConnection('starting', { name: 'kind-cluster' }),
    details: mockDetails,
  },
  {
    name: 'Kind - Stopping',
    provider: mockKindProvider,
    connection: createKubeConnection('stopping', { name: 'kind-cluster' }),
    details: mockDetails,
  },
  {
    name: 'Kind - Error',
    provider: mockKindProvider,
    connection: createKubeConnection('error', { name: 'kind-cluster' }),
    details: mockDetails,
    connectionStatus: {
      status: 'error',
      action: 'start',
      inProgress: false,
      error: 'Failed to connect to cluster: connection refused',
    },
  },
  {
    name: 'Kind - Starting (In Progress)',
    provider: mockKindProvider,
    connection: createKubeConnection('stopped', { name: 'kind-cluster' }),
    details: mockDetails,
    connectionStatus: {
      status: 'stopped',
      action: 'start',
      inProgress: true,
    },
  },
  {
    name: 'Minikube - Running',
    provider: mockMinikubeProvider,
    connection: createKubeConnection('started', { name: 'minikube' }),
    details: [
      { label: 'Nodes', value: '1' },
      { label: 'Driver', value: 'docker' },
    ],
  },
  {
    name: 'Minikube - Stopped',
    provider: mockMinikubeProvider,
    connection: createKubeConnection('stopped', { name: 'minikube' }),
    details: [
      { label: 'Nodes', value: '1' },
      { label: 'Driver', value: 'docker' },
    ],
  },
  {
    name: 'Minikube - Error',
    provider: mockMinikubeProvider,
    connection: createKubeConnection('error', { name: 'minikube' }),
    connectionStatus: {
      status: 'error',
      action: 'start',
      inProgress: false,
      error: 'Cluster health check failed: API server not responding',
    },
  },
  {
    name: 'No Lifecycle Methods',
    provider: mockKindProvider,
    connection: createKubeConnection('started', {
      name: 'external-cluster',
      lifecycleMethods: [],
      endpoint: { apiURL: 'https://my-cluster.example.com:6443' },
    }),
  },
  {
    name: 'Long Error Message',
    provider: mockKindProvider,
    connection: createKubeConnection('error', { name: 'kind-broken' }),
    connectionStatus: {
      status: 'error',
      action: 'start',
      inProgress: false,
      error:
        'Failed to start Kind cluster: Docker daemon is not running. Please ensure Docker is installed and running, then try again. You can check Docker status with "docker info" command.',
    },
  },
];
</script>

{#snippet template({ ...args })}
  {#if args.showAll}
    <div class="bg-[var(--pd-content-bg)] p-4">
      <div class="flex flex-col gap-6">
        <div class="text-sm font-semibold text-[var(--pd-content-header)]">All Cluster Card States</div>
        <div class="flex flex-col gap-4 max-w-3xl">
          {#each clusterVariants as variant (variant.name)}
            <div class="flex flex-col gap-2">
              <div class="text-xs text-[var(--pd-content-text)] font-medium">{variant.name}</div>
              <ResourceClusterCard
                provider={variant.provider}
                connection={variant.connection}
                connectionStatus={variant.connectionStatus}
                details={variant.details}
                updateConnectionStatus={args.updateConnectionStatus}
                addConnectionToRestartingQueue={args.addConnectionToRestartingQueue} />
            </div>
          {/each}
        </div>
      </div>
    </div>
  {:else}
    <div class="bg-[var(--pd-content-bg)] p-4">
      <div class="max-w-3xl">
        <ResourceClusterCard
          provider={args.provider}
          connection={args.connection}
          connectionStatus={args.connectionStatus}
          details={args.details}
          updateConnectionStatus={args.updateConnectionStatus}
          addConnectionToRestartingQueue={args.addConnectionToRestartingQueue} />
      </div>
    </div>
  {/if}
{/snippet}

<Story name="All States" args={{ showAll: true }} />

<Story
  name="Running"
  args={{
    connection: createKubeConnection('started'),
    details: mockDetails,
  }} />

<Story
  name="Stopped"
  args={{
    connection: createKubeConnection('stopped'),
    details: mockDetails,
  }} />

<Story
  name="Starting"
  args={{
    connection: createKubeConnection('starting'),
    details: mockDetails,
  }} />

<Story
  name="Stopping"
  args={{
    connection: createKubeConnection('stopping'),
    details: mockDetails,
  }} />

<Story
  name="Error"
  args={{
    connection: createKubeConnection('error'),
    details: mockDetails,
    connectionStatus: {
      status: 'error',
      action: 'start',
      inProgress: false,
      error: 'Failed to connect to cluster: connection refused',
    },
  }} />

<Story
  name="Error with Long Message"
  args={{
    connection: createKubeConnection('error'),
    connectionStatus: {
      status: 'error',
      action: 'start',
      inProgress: false,
      error:
        'Failed to start Kind cluster: Docker daemon is not running. Please ensure Docker is installed and running, then try again. You can check Docker status with "docker info" command. Additional context: The Kind CLI requires a working container runtime.',
    },
  }} />
