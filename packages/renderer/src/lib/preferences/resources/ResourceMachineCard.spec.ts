/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import { beforeAll, describe, expect, test, vi } from 'vitest';

import type { ProviderContainerConnectionInfo, ProviderInfo } from '/@api/provider-info';

import ResourceMachineCard from './ResourceMachineCard.svelte';

vi.mock('tinro', () => ({
  router: {
    goto: vi.fn(),
  },
}));

const mockProvider: ProviderInfo = {
  id: 'podman',
  name: 'Podman',
  extensionId: 'podman.extension',
  images: {
    icon: 'http://example.com/icon.png',
  },
  status: 'started',
  warnings: [],
  containerProviderConnectionCreation: true,
  detectionChecks: [],
  containerConnections: [],
  installationSupport: false,
  internalId: '0',
  kubernetesConnections: [],
  kubernetesProviderConnectionCreation: false,
  vmConnections: [],
  vmProviderConnectionCreation: false,
  vmProviderConnectionInitialization: false,
  links: [],
  containerProviderConnectionInitialization: false,
  kubernetesProviderConnectionInitialization: false,
  cleanupSupport: false,
};

const mockContainerConnection: ProviderContainerConnectionInfo = {
  connectionType: 'container',
  name: 'podman-machine-default',
  displayName: 'Podman Machine Default',
  status: 'started',
  endpoint: {
    socketPath: '/var/run/podman.sock',
  },
  lifecycleMethods: ['start', 'stop', 'delete'],
  type: 'podman',
  vmType: {
    id: 'libkrun',
    name: 'libkrun',
  },
};

const mockConnectionStatus = {
  inProgress: false,
  action: undefined,
  status: 'started',
};

beforeAll(() => {
  (window.events as unknown) = {
    receive: vi.fn(),
  };
  Object.defineProperty(window, 'getOsPlatform', { value: vi.fn().mockResolvedValue('linux') });
});

describe('ResourceMachineCard', () => {
  test('should display connection name', () => {
    render(ResourceMachineCard, {
      provider: mockProvider,
      connection: mockContainerConnection,
      connectionStatus: mockConnectionStatus,
      updateConnectionStatus: vi.fn(),
      addConnectionToRestartingQueue: vi.fn(),
    });
    expect(screen.getByText('Podman Machine Default')).toBeInTheDocument();
  });

  test('should display connection type as Podman', () => {
    render(ResourceMachineCard, {
      provider: mockProvider,
      connection: mockContainerConnection,
      connectionStatus: mockConnectionStatus,
      updateConnectionStatus: vi.fn(),
      addConnectionToRestartingQueue: vi.fn(),
    });
    expect(screen.getByText('Podman')).toBeInTheDocument();
  });

  test('should display platform from vmType', () => {
    render(ResourceMachineCard, {
      provider: mockProvider,
      connection: mockContainerConnection,
      connectionStatus: mockConnectionStatus,
      updateConnectionStatus: vi.fn(),
      addConnectionToRestartingQueue: vi.fn(),
    });
    expect(screen.getByText('Libkrun')).toBeInTheDocument();
  });

  test('should display resource stats', () => {
    render(ResourceMachineCard, {
      provider: mockProvider,
      connection: mockContainerConnection,
      connectionStatus: mockConnectionStatus,
      stats: [
        { label: 'CPU(s)', value: 4 },
        { label: 'Memory', value: '8 GB' },
        { label: 'Disk', value: '100 GB' },
      ],
      updateConnectionStatus: vi.fn(),
      addConnectionToRestartingQueue: vi.fn(),
    });
    // Stats appear twice in the DOM (responsive layout: one for lg+ screens, one for smaller screens)
    expect(screen.getAllByText('4').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('8 GB').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('100 GB').length).toBeGreaterThanOrEqual(1);
  });

  test('should have aria-label with connection name', () => {
    render(ResourceMachineCard, {
      provider: mockProvider,
      connection: mockContainerConnection,
      connectionStatus: mockConnectionStatus,
      updateConnectionStatus: vi.fn(),
      addConnectionToRestartingQueue: vi.fn(),
    });
    expect(screen.getByRole('region', { name: 'podman-machine-default' })).toBeInTheDocument();
  });

  test('should display Docker type for docker connections', () => {
    const dockerConnection: ProviderContainerConnectionInfo = {
      ...mockContainerConnection,
      type: 'docker',
    };
    render(ResourceMachineCard, {
      provider: mockProvider,
      connection: dockerConnection,
      connectionStatus: mockConnectionStatus,
      updateConnectionStatus: vi.fn(),
      addConnectionToRestartingQueue: vi.fn(),
    });
    expect(screen.getByText('Docker')).toBeInTheDocument();
  });
});
