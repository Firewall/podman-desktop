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

import { render, screen, waitFor } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { ProviderInfo } from '/@api/provider-info';

// Create writable store for testing
const mockProviderInfos = writable<ProviderInfo[]>([]);

// Mock providerInfos store
vi.mock('/@/stores/providers', () => ({
  providerInfos: mockProviderInfos,
}));

// Mock preferences-connection-rendering-task
vi.mock('/@/lib/preferences/preferences-connection-rendering-task', () => ({
  eventCollect: vi.fn(),
  registerConnectionCallback: vi.fn(() => Symbol('test-key')),
}));

// Mock configurationProperties
vi.mock('/@/stores/configurationProperties', () => ({
  onDidChangeConfiguration: {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
}));

describe('SystemOverviewCard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Mock configuration to return expanded = true by default
    vi.mocked(window.getConfigurationValue).mockResolvedValue(true);
    vi.mocked(window.updateConfigurationValue).mockResolvedValue(undefined);
    mockProviderInfos.set([]);
  });

  test('should render System Overview title', async () => {
    const { default: SystemOverviewCard } = await import('./SystemOverviewCard.svelte');
    render(SystemOverviewCard);

    const title = screen.getByText('System Overview');
    expect(title).toBeInTheDocument();
  });

  test('should render Manage Resources button', async () => {
    const { default: SystemOverviewCard } = await import('./SystemOverviewCard.svelte');
    render(SystemOverviewCard);

    const button = screen.getByText('Manage Resources');
    expect(button).toBeInTheDocument();
    expect(button.tagName.toLowerCase()).toBe('button');
  });

  test('should show no engines message when no providers configured', async () => {
    mockProviderInfos.set([]);

    const { default: SystemOverviewCard } = await import('./SystemOverviewCard.svelte');
    render(SystemOverviewCard);

    await waitFor(() => expect(window.getConfigurationValue).toBeCalled());

    const message = screen.getByText('No container engines configured');
    expect(message).toBeInTheDocument();
  });

  test('should show Configure link when no providers', async () => {
    mockProviderInfos.set([]);

    const { default: SystemOverviewCard } = await import('./SystemOverviewCard.svelte');
    render(SystemOverviewCard);

    await waitFor(() => expect(window.getConfigurationValue).toBeCalled());

    const configureLink = screen.getByText('Configure');
    expect(configureLink).toBeInTheDocument();
    expect(configureLink).toHaveAttribute('href', '/preferences/resources');
  });

  test('should show healthy state when engine is running', async () => {
    const runningProviders: ProviderInfo[] = [
      {
        internalId: 'podman',
        id: 'podman',
        name: 'Podman',
        status: 'ready',
        containerConnections: [
          {
            name: 'Podman Machine',
            status: 'started',
          },
        ],
        kubernetesConnections: [],
        vmConnections: [],
      } as unknown as ProviderInfo,
    ];

    mockProviderInfos.set(runningProviders);

    const { default: SystemOverviewCard } = await import('./SystemOverviewCard.svelte');
    render(SystemOverviewCard);

    await waitFor(() => expect(window.getConfigurationValue).toBeCalled());

    // Should show running state
    const runningIndicator = screen.queryByText(/Engine running|engines running/i);
    expect(runningIndicator).toBeInTheDocument();
  });

  test('should show stopped state when engine is stopped', async () => {
    const stoppedProviders: ProviderInfo[] = [
      {
        internalId: 'podman',
        id: 'podman',
        name: 'Podman',
        status: 'stopped',
        containerConnections: [
          {
            name: 'Podman Machine',
            status: 'stopped',
          },
        ],
        kubernetesConnections: [],
        vmConnections: [],
      } as unknown as ProviderInfo,
    ];

    mockProviderInfos.set(stoppedProviders);

    const { default: SystemOverviewCard } = await import('./SystemOverviewCard.svelte');
    render(SystemOverviewCard);

    await waitFor(() => expect(window.getConfigurationValue).toBeCalled());

    // Should show stopped state - check for the status message
    const stoppedIndicators = screen.getAllByText(/stopped/i);
    expect(stoppedIndicators.length).toBeGreaterThan(0);
  });

  test('should show Start button for stopped connection', async () => {
    const stoppedProviders: ProviderInfo[] = [
      {
        internalId: 'podman',
        id: 'podman',
        name: 'Podman',
        status: 'stopped',
        containerConnections: [
          {
            name: 'Podman Machine',
            status: 'stopped',
          },
        ],
        kubernetesConnections: [],
        vmConnections: [],
      } as unknown as ProviderInfo,
    ];

    mockProviderInfos.set(stoppedProviders);

    const { default: SystemOverviewCard } = await import('./SystemOverviewCard.svelte');
    render(SystemOverviewCard);

    await waitFor(() => expect(window.getConfigurationValue).toBeCalled());

    const startButton = screen.queryByRole('button', { name: /Start/i });
    expect(startButton).toBeInTheDocument();
  });
});
