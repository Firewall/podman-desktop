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

// Create writable stores for testing
const mockResourceCounts = writable({
  containers: { total: 5, running: 3, stopped: 2 },
  pods: { total: 2, running: 1, stopped: 1 },
  images: { total: 10, inUse: 6, unused: 4 },
  volumes: { total: 4, inUse: 2, unused: 2 },
  machines: { total: 1, running: 1, stopped: 0, starting: 0, error: 0 },
});

const mockIsEngineRunning = writable(true);
const mockProviderInfos = writable<ProviderInfo[]>([]);

// Mock the stores
vi.mock('/@/stores/dashboard/dashboard-resource-counts', () => ({
  resourceCounts: mockResourceCounts,
  isEngineRunning: mockIsEngineRunning,
}));

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

describe('ResourceOverviewCard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Mock configuration to return expanded = true by default
    vi.mocked(window.getConfigurationValue).mockResolvedValue(true);
    vi.mocked(window.updateConfigurationValue).mockResolvedValue(undefined);
    mockResourceCounts.set({
      containers: { total: 5, running: 3, stopped: 2 },
      pods: { total: 2, running: 1, stopped: 1 },
      images: { total: 10, inUse: 6, unused: 4 },
      volumes: { total: 4, inUse: 2, unused: 2 },
      machines: { total: 1, running: 1, stopped: 0, starting: 0, error: 0 },
    });
    mockIsEngineRunning.set(true);
    mockProviderInfos.set([]);
  });

  test('should render Resources title', async () => {
    const { default: ResourceOverviewCard } = await import('./ResourceOverviewCard.svelte');
    render(ResourceOverviewCard);

    const title = screen.getByText('Resources');
    expect(title).toBeInTheDocument();
  });

  test('should render Containers resource card', async () => {
    const { default: ResourceOverviewCard } = await import('./ResourceOverviewCard.svelte');
    render(ResourceOverviewCard);

    await waitFor(() => expect(window.getConfigurationValue).toBeCalled());

    const containersLabel = screen.getByText('Containers');
    expect(containersLabel).toBeInTheDocument();
  });

  test('should render Pods resource card', async () => {
    const { default: ResourceOverviewCard } = await import('./ResourceOverviewCard.svelte');
    render(ResourceOverviewCard);

    await waitFor(() => expect(window.getConfigurationValue).toBeCalled());

    const podsLabel = screen.getByText('Pods');
    expect(podsLabel).toBeInTheDocument();
  });

  test('should render Images resource card', async () => {
    const { default: ResourceOverviewCard } = await import('./ResourceOverviewCard.svelte');
    render(ResourceOverviewCard);

    await waitFor(() => expect(window.getConfigurationValue).toBeCalled());

    const imagesLabel = screen.getByText('Images');
    expect(imagesLabel).toBeInTheDocument();
  });

  test('should render Volumes resource card', async () => {
    const { default: ResourceOverviewCard } = await import('./ResourceOverviewCard.svelte');
    render(ResourceOverviewCard);

    await waitFor(() => expect(window.getConfigurationValue).toBeCalled());

    const volumesLabel = screen.getByText('Volumes');
    expect(volumesLabel).toBeInTheDocument();
  });

  test('should have correct navigation links', async () => {
    const { default: ResourceOverviewCard } = await import('./ResourceOverviewCard.svelte');
    render(ResourceOverviewCard);

    await waitFor(() => expect(window.getConfigurationValue).toBeCalled());

    const containersLink = screen.getByText('Containers').closest('a');
    expect(containersLink).toHaveAttribute('href', '/containers');

    const podsLink = screen.getByText('Pods').closest('a');
    expect(podsLink).toHaveAttribute('href', '/pods');

    const imagesLink = screen.getByText('Images').closest('a');
    expect(imagesLink).toHaveAttribute('href', '/images');

    const volumesLink = screen.getByText('Volumes').closest('a');
    expect(volumesLink).toHaveAttribute('href', '/volumes');
  });

  test('should display running indicator text when engine is running', async () => {
    const { default: ResourceOverviewCard } = await import('./ResourceOverviewCard.svelte');
    render(ResourceOverviewCard);

    await waitFor(() => expect(window.getConfigurationValue).toBeCalled());

    // Should show running counts
    const runningText = screen.getAllByText(/running/i);
    expect(runningText.length).toBeGreaterThan(0);
  });

  test('should show Start Podman button when engine not running', async () => {
    mockIsEngineRunning.set(false);
    mockProviderInfos.set([
      {
        internalId: 'podman',
        containerConnections: [{ name: 'machine', status: 'stopped' }],
      } as unknown as ProviderInfo,
    ]);

    const { default: ResourceOverviewCard } = await import('./ResourceOverviewCard.svelte');
    render(ResourceOverviewCard);

    await waitFor(() => expect(window.getConfigurationValue).toBeCalled());

    // Should show a start podman button or indicator
    const startButton = screen.queryByText(/Start Podman/i);
    expect(startButton).toBeInTheDocument();
  });

  test('should show unavailable state for engine-dependent resources when stopped', async () => {
    mockIsEngineRunning.set(false);

    const { default: ResourceOverviewCard } = await import('./ResourceOverviewCard.svelte');
    render(ResourceOverviewCard);

    await waitFor(() => expect(window.getConfigurationValue).toBeCalled());

    // Should show unavailable message for containers, pods, images
    const unavailableMessages = screen.getAllByText(/Start engine to view/i);
    expect(unavailableMessages.length).toBeGreaterThan(0);
  });
});
