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

import type { ProviderInfo, ProviderKubernetesConnectionInfo } from '/@api/provider-info';

import ResourceClusterCard from './ResourceClusterCard.svelte';

vi.mock('tinro', () => ({
  router: {
    goto: vi.fn(),
  },
}));

const mockProvider: ProviderInfo = {
  id: 'kubernetes',
  name: 'Kubernetes',
  extensionId: 'k8s.extension',
  images: {
    icon: 'http://example.com/k8s-icon.png',
  },
  status: 'started',
  warnings: [],
  containerProviderConnectionCreation: false,
  detectionChecks: [],
  containerConnections: [],
  installationSupport: false,
  internalId: '0',
  kubernetesConnections: [],
  kubernetesProviderConnectionCreation: true,
  vmConnections: [],
  vmProviderConnectionCreation: false,
  vmProviderConnectionInitialization: false,
  links: [],
  containerProviderConnectionInitialization: false,
  kubernetesProviderConnectionInitialization: false,
  cleanupSupport: false,
};

const mockKubeConnection: ProviderKubernetesConnectionInfo = {
  connectionType: 'kubernetes',
  name: 'minikube',
  status: 'started',
  endpoint: {
    apiURL: 'https://192.168.49.2:8443',
  },
  lifecycleMethods: ['start', 'stop', 'delete'],
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
});

describe('ResourceClusterCard', () => {
  test('should display connection name', () => {
    render(ResourceClusterCard, {
      provider: mockProvider,
      connection: mockKubeConnection,
      connectionStatus: mockConnectionStatus,
      updateConnectionStatus: vi.fn(),
      addConnectionToRestartingQueue: vi.fn(),
    });
    expect(screen.getByText('minikube')).toBeInTheDocument();
  });

  test('should display Kubernetes type label', () => {
    render(ResourceClusterCard, {
      provider: mockProvider,
      connection: mockKubeConnection,
      connectionStatus: mockConnectionStatus,
      updateConnectionStatus: vi.fn(),
      addConnectionToRestartingQueue: vi.fn(),
    });
    expect(screen.getByText('Kubernetes')).toBeInTheDocument();
  });

  test('should display API URL', () => {
    render(ResourceClusterCard, {
      provider: mockProvider,
      connection: mockKubeConnection,
      connectionStatus: mockConnectionStatus,
      updateConnectionStatus: vi.fn(),
      addConnectionToRestartingQueue: vi.fn(),
    });
    expect(screen.getByText('https://192.168.49.2:8443')).toBeInTheDocument();
  });

  test('should display custom details when provided', () => {
    render(ResourceClusterCard, {
      provider: mockProvider,
      connection: mockKubeConnection,
      connectionStatus: mockConnectionStatus,
      details: [
        { label: 'Nodes', value: '3' },
        { label: 'Version', value: '1.28' },
      ],
      updateConnectionStatus: vi.fn(),
      addConnectionToRestartingQueue: vi.fn(),
    });
    // Details appear twice in the DOM (responsive layout: one for lg+ screens, one for smaller screens)
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Nodes').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('1.28').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Version').length).toBeGreaterThanOrEqual(1);
  });

  test('should have aria-label with connection name', () => {
    render(ResourceClusterCard, {
      provider: mockProvider,
      connection: mockKubeConnection,
      connectionStatus: mockConnectionStatus,
      updateConnectionStatus: vi.fn(),
      addConnectionToRestartingQueue: vi.fn(),
    });
    expect(screen.getByRole('region', { name: 'minikube' })).toBeInTheDocument();
  });
});
