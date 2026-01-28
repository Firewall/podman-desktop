<script lang="ts">
import type { ContainerProviderConnection } from '@podman-desktop/api';
import { EmptyScreen } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import type { Unsubscriber } from 'svelte/store';
import { router } from 'tinro';

import type { ContextUI } from '/@/lib/context/context';
import { ContextKeyExpr } from '/@/lib/context/contextKey';
import { normalizeOnboardingWhenClause } from '/@/lib/onboarding/onboarding-utils';
import EngineIcon from '/@/lib/ui/EngineIcon.svelte';
import { configurationProperties } from '/@/stores/configurationProperties';
import { context } from '/@/stores/context';
import { onboardingList } from '/@/stores/onboarding';
import { providerInfos } from '/@/stores/providers';
import type { IConfigurationPropertyRecordedSchema } from '/@api/configuration/models.js';
import type { Menu } from '/@api/menu.js';
import { MenuContext } from '/@api/menu-context.js';
import type { CheckStatus, ProviderConnectionInfo, ProviderInfo } from '/@api/provider-info';

import { eventCollect } from './preferences-connection-rendering-task';
import PreferencesConnectionsEmptyRendering from './PreferencesConnectionsEmptyRendering.svelte';
import PreferencesProviderInstallationModal from './PreferencesProviderInstallationModal.svelte';
import ProviderActionButtons from './ProviderActionButtons.svelte';
import {
  extractResourceStats,
  ResourceClusterCard,
  ResourceMachineCard,
  ResourceProviderSection,
  type ResourceStat,
} from './resources';
import SettingsPage from './SettingsPage.svelte';
import {
  getProviderConnectionName,
  type IConnectionRestart,
  type IConnectionStatus,
  type IProviderConnectionConfigurationPropertyRecorded,
  isDefaultScope,
  isPropertyValidInContext,
} from './Util';

let providers = $state<ProviderInfo[]>([]);
let containerConnectionStatus = new SvelteMap<string, IConnectionStatus>();
let providerInstallationInProgress = new SvelteMap<string, boolean>();
let extensionOnboardingEnablement = new SvelteMap<string, string>();
let displayInstallModal = $state(false);
let providerToBeInstalled = $state<{ provider: ProviderInfo; displayName: string }>();
let doExecuteAfterInstallation: () => void;
let preflightChecks = $state<CheckStatus[]>([]);

let restartingQueue: IConnectionRestart[] = [];
let globalContext = $state<ContextUI>();

let providersUnsubscribe: Unsubscriber;
let configurationPropertiesUnsubscribe: Unsubscriber;
let onboardingsUnsubscribe: Unsubscriber;
let contextsUnsubscribe: Unsubscriber;

let contributionsContainerConnection = $state<Menu[]>([]);

onMount(async () => {
  configurationPropertiesUnsubscribe = configurationProperties.subscribe(value => {
    properties = value;
  });

  providersUnsubscribe = providerInfos.subscribe(providerInfosValue => {
    // Sort providers: those with connections first, then those without
    providers = [...providerInfosValue].sort((a, b) => {
      const aHasConnections =
        a.containerConnections.length > 0 || a.kubernetesConnections.length > 0 || a.vmConnections.length > 0;
      const bHasConnections =
        b.containerConnections.length > 0 || b.kubernetesConnections.length > 0 || b.vmConnections.length > 0;
      if (aHasConnections && !bHasConnections) return -1;
      if (!aHasConnections && bHasConnections) return 1;
      return 0;
    });
    const connectionNames: string[] = [];
    providers.forEach(provider => {
      if (
        providerToBeInstalled &&
        doExecuteAfterInstallation &&
        provider.name === providerToBeInstalled.provider.name &&
        (provider.status === 'ready' || provider.status === 'installed')
      ) {
        providerToBeInstalled = undefined;
        doExecuteAfterInstallation();
      }

      provider.containerConnections.forEach(container => {
        const containerConnectionName = getProviderConnectionName(provider, container);
        connectionNames.push(containerConnectionName);
        // update the map only if the container state is different from last time
        if (
          !containerConnectionStatus.has(containerConnectionName) ||
          containerConnectionStatus.get(containerConnectionName)?.status !== container.status
        ) {
          const containerToRestart = getContainerRestarting(provider.internalId, container.name);
          if (containerToRestart) {
            containerConnectionStatus.set(containerConnectionName, {
              inProgress: true,
              action: 'restart',
              status: container.status,
            });
            startConnectionProvider(provider, container, containerToRestart.loggerHandlerKey).catch((err: unknown) =>
              console.error(`Error starting connection provider ${container.name}`, err),
            );
          } else {
            containerConnectionStatus.set(containerConnectionName, {
              inProgress: false,
              action: undefined,
              status: container.status,
            });
          }
        }
      });
      provider.kubernetesConnections.forEach(connection => {
        const containerConnectionName = getProviderConnectionName(provider, connection);
        connectionNames.push(containerConnectionName);
        // update the map only if the container state is different from last time
        if (
          !containerConnectionStatus.has(containerConnectionName) ||
          containerConnectionStatus.get(containerConnectionName)?.status !== connection.status
        ) {
          const containerToRestart = getContainerRestarting(provider.internalId, connection.name);
          if (containerToRestart) {
            containerConnectionStatus.set(containerConnectionName, {
              inProgress: true,
              action: 'restart',
              status: connection.status,
            });
            startConnectionProvider(provider, connection, containerToRestart.loggerHandlerKey).catch((err: unknown) =>
              console.error(`Error starting connection provider ${connection.name}`, err),
            );
          } else {
            containerConnectionStatus.set(containerConnectionName, {
              inProgress: false,
              action: undefined,
              status: connection.status,
            });
          }
        }
      });
      provider.vmConnections.forEach(connection => {
        const vmConnectionName = getProviderConnectionName(provider, connection);
        connectionNames.push(vmConnectionName);
        // update the map only if the container state is different from last time
        if (
          !containerConnectionStatus.has(vmConnectionName) ||
          containerConnectionStatus.get(vmConnectionName)?.status !== connection.status
        ) {
          const containerToRestart = getContainerRestarting(provider.internalId, connection.name);
          if (containerToRestart) {
            containerConnectionStatus.set(vmConnectionName, {
              inProgress: true,
              action: 'restart',
              status: connection.status,
            });
            startConnectionProvider(provider, connection, containerToRestart.loggerHandlerKey).catch((err: unknown) =>
              console.error(`Error starting connection provider ${connection.name}`, err),
            );
          } else {
            containerConnectionStatus.set(vmConnectionName, {
              inProgress: false,
              action: undefined,
              status: connection.status,
            });
          }
        }
      });
    });
    // if a machine has been deleted we need to clean its old stored status
    containerConnectionStatus.forEach((v, k) => {
      if (!connectionNames.find(name => name === k)) {
        containerConnectionStatus.delete(k);
      }
    });
  });

  onboardingsUnsubscribe = onboardingList.subscribe(onboardingItems => {
    extensionOnboardingEnablement = new SvelteMap<string, string>();
    onboardingItems.forEach(o => {
      // maybe the boolean value should represent if the onboarding has been completed, to show the setup button or not
      // now true by default
      extensionOnboardingEnablement.set(o.extension, o.enablement);
    });
    extensionOnboardingEnablement = extensionOnboardingEnablement;
  });

  contextsUnsubscribe = context.subscribe(value => {
    globalContext = value;
  });

  contributionsContainerConnection = await window.getContributedMenus(MenuContext.DASHBOARD_CONTAINER_CONNECTION);
});

function getContainerRestarting(provider: string, container: string): IConnectionRestart {
  const containerToRestart = restartingQueue.filter(c => c.provider === provider && c.container === container)[0];
  if (containerToRestart) {
    restartingQueue = restartingQueue.filter(c => c.provider !== provider && c.container !== container);
  }
  return containerToRestart;
}

onDestroy(() => {
  if (providersUnsubscribe) {
    providersUnsubscribe();
  }
  if (configurationPropertiesUnsubscribe) {
    configurationPropertiesUnsubscribe();
  }
  if (onboardingsUnsubscribe) {
    onboardingsUnsubscribe();
  }
  if (contextsUnsubscribe) {
    contextsUnsubscribe();
  }
});

function updateContainerStatus(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderConnectionInfo,
  action?: string,
  error?: string,
  inProgress?: boolean,
): void {
  const containerConnectionName = getProviderConnectionName(provider, containerConnectionInfo);
  if (error) {
    const currentStatus = containerConnectionStatus.get(containerConnectionName);
    if (currentStatus) {
      containerConnectionStatus.set(containerConnectionName, {
        ...currentStatus,
        inProgress: false,
        error,
      });
    }
  } else if (action) {
    containerConnectionStatus.set(containerConnectionName, {
      inProgress: inProgress ?? true,
      action: action,
      status: containerConnectionInfo.status,
    });
  }
}

function addConnectionToRestartingQueue(connection: IConnectionRestart): void {
  restartingQueue.push(connection);
}

async function startConnectionProvider(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderConnectionInfo,
  loggerHandlerKey: symbol,
): Promise<void> {
  await window.startProviderConnectionLifecycle(
    provider.internalId,
    $state.snapshot(containerConnectionInfo),
    loggerHandlerKey,
    eventCollect,
  );
}

async function doCreateNew(provider: ProviderInfo, displayName: string): Promise<void> {
  displayInstallModal = false;
  if (provider.status === 'not-installed') {
    providerInstallationInProgress.set(provider.name, true);
    providerToBeInstalled = { provider, displayName };
    doExecuteAfterInstallation = (): void => router.goto(`/preferences/provider/${provider.internalId}`);
    await performInstallation(provider);
  } else {
    await window.telemetryTrack('createNewProviderConnectionPageRequested', {
      providerId: provider.id,
      name: provider.name,
    });
    router.goto(`/preferences/provider/${provider.internalId}`);
  }
}

async function performInstallation(provider: ProviderInfo): Promise<void> {
  const checksStatus: CheckStatus[] = [];
  let checkSuccess = false;
  let currentCheck: CheckStatus;
  try {
    checkSuccess = await window.runInstallPreflightChecks(provider.internalId, {
      endCheck: status => {
        if (currentCheck) {
          currentCheck = status;
        } else {
          return;
        }
        if (currentCheck.successful === false) {
          checksStatus.push(currentCheck);
          preflightChecks = checksStatus;
        }
      },
      startCheck: status => {
        currentCheck = status;
        if (currentCheck.successful === false) {
          preflightChecks = [...checksStatus, currentCheck];
        }
      },
    });
  } catch (err) {
    console.error(err);
  }
  if (checkSuccess) {
    await window.installProvider(provider.internalId);
    // reset checks
    preflightChecks = [];
  } else {
    displayInstallModal = true;
  }
  providerInstallationInProgress.set(provider.name, false);
}

function hideInstallModal(): void {
  displayInstallModal = false;
}

function isOnboardingEnabled(provider: ProviderInfo, globalContext: ContextUI): boolean {
  let whenEnablement = extensionOnboardingEnablement.get(provider.extensionId);
  if (!whenEnablement) {
    return false;
  }
  whenEnablement = normalizeOnboardingWhenClause(whenEnablement, provider.extensionId);
  const whenDeserialized = ContextKeyExpr.deserialize(whenEnablement);
  const isEnabled = whenDeserialized?.evaluate(globalContext);
  return !!isEnabled;
}

function hasAnyConfiguration(provider: ProviderInfo): boolean {
  return (
    properties
      .filter(
        property =>
          property.parentId.startsWith(`preferences.${provider.extensionId}`) &&
          isDefaultScope(property.scope) &&
          !property.hidden,
      )
      .filter(property => globalContext && isPropertyValidInContext(property.when, globalContext)).length > 0
  );
}

function handleUpdatePreflightChecks(checks: CheckStatus[]): CheckStatus[] {
  preflightChecks = checks;
  return checks;
}

interface Props {
  properties?: IConfigurationPropertyRecordedSchema[];
  focus: string | undefined;
}

function getRootfulDisplayInfo(
  provider: ProviderInfo,
  container: ProviderConnectionInfo,
): IProviderConnectionConfigurationPropertyRecorded | undefined {
  if (!providerContainerConfiguration.has(provider.internalId)) {
    return undefined;
  }

  const providerConfiguration = providerContainerConfiguration.get(provider.internalId) ?? [];
  const rootfulSetting = providerConfiguration.find(
    conf => conf.connection === container.name && conf.id === 'podman.machine.rootful',
  );

  return rootfulSetting;
}

let { properties = [], focus }: Props = $props();
let providerElementMap = $state<Record<string, HTMLElement>>({});

function handleError(errorMessage: string): void {
  console.error(errorMessage);
}

let configurationKeys: IConfigurationPropertyRecordedSchema[] = $derived(
  properties
    .filter(property => property.scope === 'ContainerConnection')
    .sort((a, b) => (a?.id ?? '').localeCompare(b?.id ?? '')),
);

let tmpProviderContainerConfiguration = $state<IProviderConnectionConfigurationPropertyRecorded[]>([]);
function updateTmpProviderContainerConfiguration(value: IProviderConnectionConfigurationPropertyRecorded[]): void {
  tmpProviderContainerConfiguration = value;
}

$effect(() => {
  Promise.all(
    providers.map(async provider => {
      const providerContainer = await Promise.all(
        provider.containerConnections.map(async container => {
          return await Promise.all(
            configurationKeys.map(async configurationKey => {
              return {
                ...configurationKey,
                value: configurationKey.id
                  ? await window.getConfigurationValue(
                      configurationKey.id,
                      $state.snapshot(container) as unknown as ContainerProviderConnection,
                    )
                  : undefined,
                connection: container.name,
                providerId: provider.internalId,
              };
            }),
          );
        }),
      );
      return providerContainer.flat();
    }),
  )
    .then(value => updateTmpProviderContainerConfiguration(value.flat()))
    .catch((err: unknown) => console.error('Error collecting providers', err));
});
let providerContainerConfiguration = $derived(
  tmpProviderContainerConfiguration
    .filter(configurationKey => configurationKey.value !== undefined)
    .reduce((map, value) => {
      const innerProviderContainerConfigurations = map.get(value.providerId) ?? [];
      innerProviderContainerConfigurations.push(value);
      map.set(value.providerId, innerProviderContainerConfigurations);
      return map;
    }, new Map<string, IProviderConnectionConfigurationPropertyRecorded[]>()),
);
$effect(() => {
  if (focus && providerElementMap[focus]) {
    providerElementMap[focus].scrollIntoView({ behavior: 'auto', block: 'start' });
  }
});

function getResourceStats(provider: ProviderInfo, connectionName: string): ResourceStat[] {
  const configs = providerContainerConfiguration.get(provider.internalId) ?? [];
  return extractResourceStats(configs, connectionName);
}
</script>

<SettingsPage title="Resources">
  {#snippet subtitle()}
    <span class:hidden={providers.length === 0}>
      Additional provider information is available under <a
        href="/extensions"
        class="text-[var(--pd-content-text)] underline underline-offset-2">Extensions</a>
    </span>
  {/snippet}
  <div class="h-full" role="region" aria-label="Featured Provider Resources">
    <EmptyScreen
      aria-label="no-resource-panel"
      icon={EngineIcon}
      title="No resources found"
      message="Start an extension that manages containers or Kubernetes engines"
      hidden={providers.length > 0} />

    {#each providers as provider, index (provider.id)}
      {@const hasConnections =
        provider.containerConnections.length > 0 ||
        provider.kubernetesConnections.length > 0 ||
        provider.vmConnections.length > 0}
      {@const isLast = index === providers.length - 1}
      <div bind:this={providerElementMap[provider.id]} class:pb-6={isLast}>
        <ResourceProviderSection
          id={provider.id}
          title={provider.name}
          version={provider.version}
          icon={provider.images.icon}
          isEmpty={!hasConnections}
          emptyMessage={provider.emptyConnectionMarkdownDescription}>
          {#snippet actionButtons()}
            <ProviderActionButtons
              {provider}
              {globalContext}
              providerInstallationInProgress={providerInstallationInProgress.get(provider.name) ?? false}
              onCreateNew={doCreateNew}
              onUpdatePreflightChecks={handleUpdatePreflightChecks}
              {isOnboardingEnabled}
              {hasAnyConfiguration} />
          {/snippet}

          {#if !hasConnections}
            <PreferencesConnectionsEmptyRendering message={provider.emptyConnectionMarkdownDescription} hidden={false} />
          {:else}
            {#each provider.containerConnections as container (container.name)}
              <ResourceMachineCard
                {provider}
                connection={container}
                connectionStatus={containerConnectionStatus.get(getProviderConnectionName(provider, container))}
                stats={getResourceStats(provider, container.name)}
                rootfulInfo={getRootfulDisplayInfo(provider, container)}
                {globalContext}
                {contributionsContainerConnection}
                updateConnectionStatus={updateContainerStatus}
                {addConnectionToRestartingQueue}
                onError={handleError} />
            {/each}
            {#each provider.kubernetesConnections as kubeConnection (kubeConnection.name)}
              <ResourceClusterCard
                {provider}
                connection={kubeConnection}
                connectionStatus={containerConnectionStatus.get(getProviderConnectionName(provider, kubeConnection))}
                updateConnectionStatus={updateContainerStatus}
                {addConnectionToRestartingQueue} />
            {/each}
            {#each provider.vmConnections as vmConnection (vmConnection.name)}
              <ResourceMachineCard
                {provider}
                connection={vmConnection}
                connectionStatus={containerConnectionStatus.get(getProviderConnectionName(provider, vmConnection))}
                {globalContext}
                updateConnectionStatus={updateContainerStatus}
                {addConnectionToRestartingQueue}
                onError={handleError} />
            {/each}
          {/if}
        </ResourceProviderSection>
      </div>
    {/each}
  </div>
  {#if displayInstallModal && providerToBeInstalled}
    <PreferencesProviderInstallationModal
      {providerToBeInstalled}
      {preflightChecks}
      closeCallback={hideInstallModal}
      {doCreateNew} />
  {/if}
</SettingsPage>
