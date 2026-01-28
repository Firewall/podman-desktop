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

import { get } from 'svelte/store';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { ContainerInfo } from '/@api/container-info';
import type { ImageInfo } from '/@api/image-info';
import type { PodInfo } from '/@api/pod-info';
import type { ProviderInfo } from '/@api/provider-info';
import type { VolumeListInfo } from '/@api/volume-info';

import { containersInfos } from '../containers';
import { imagesInfos } from '../images';
import { podsInfos } from '../pods';
import { providerInfos } from '../providers';
import { volumeListInfos } from '../volumes';
import { isEngineRunning, resourceCounts } from './dashboard-resource-counts';

// Mock the stores
vi.mock('../containers', () => ({
  containersInfos: {
    subscribe: vi.fn(),
  },
}));

vi.mock('../pods', () => ({
  podsInfos: {
    subscribe: vi.fn(),
  },
}));

vi.mock('../images', () => ({
  imagesInfos: {
    subscribe: vi.fn(),
  },
}));

vi.mock('../volumes', () => ({
  volumeListInfos: {
    subscribe: vi.fn(),
  },
}));

vi.mock('../providers', () => ({
  providerInfos: {
    subscribe: vi.fn(),
  },
}));

describe('resourceCounts', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('should count running and stopped containers', () => {
    const containers: ContainerInfo[] = [
      { State: 'running' } as ContainerInfo,
      { State: 'running' } as ContainerInfo,
      { State: 'exited' } as ContainerInfo,
      { State: 'stopped' } as ContainerInfo,
    ];

    vi.mocked(containersInfos.subscribe).mockImplementation((cb: (value: ContainerInfo[]) => void) => {
      cb(containers);
      return (): void => {};
    });

    // Mock other stores with empty data
    vi.mocked(podsInfos.subscribe).mockImplementation((cb: (value: PodInfo[]) => void) => {
      cb([]);
      return (): void => {};
    });
    vi.mocked(imagesInfos.subscribe).mockImplementation((cb: (value: ImageInfo[]) => void) => {
      cb([]);
      return (): void => {};
    });
    vi.mocked(volumeListInfos.subscribe).mockImplementation((cb: (value: VolumeListInfo[]) => void) => {
      cb([]);
      return (): void => {};
    });
    vi.mocked(providerInfos.subscribe).mockImplementation((cb: (value: ProviderInfo[]) => void) => {
      cb([]);
      return (): void => {};
    });

    const counts = get(resourceCounts);

    expect(counts.containers.total).toBe(4);
    expect(counts.containers.running).toBe(2);
    expect(counts.containers.stopped).toBe(2);
  });

  test('should count running and stopped pods', () => {
    const pods: PodInfo[] = [
      { Status: 'Running' } as PodInfo,
      { Status: 'Running' } as PodInfo,
      { Status: 'Stopped' } as PodInfo,
    ];

    vi.mocked(containersInfos.subscribe).mockImplementation((cb: (value: ContainerInfo[]) => void) => {
      cb([]);
      return (): void => {};
    });
    vi.mocked(podsInfos.subscribe).mockImplementation((cb: (value: PodInfo[]) => void) => {
      cb(pods);
      return (): void => {};
    });
    vi.mocked(imagesInfos.subscribe).mockImplementation((cb: (value: ImageInfo[]) => void) => {
      cb([]);
      return (): void => {};
    });
    vi.mocked(volumeListInfos.subscribe).mockImplementation((cb: (value: VolumeListInfo[]) => void) => {
      cb([]);
      return (): void => {};
    });
    vi.mocked(providerInfos.subscribe).mockImplementation((cb: (value: ProviderInfo[]) => void) => {
      cb([]);
      return (): void => {};
    });

    const counts = get(resourceCounts);

    expect(counts.pods.total).toBe(3);
    expect(counts.pods.running).toBe(2);
    expect(counts.pods.stopped).toBe(1);
  });

  test('should count total images and in-use/unused', () => {
    const images: ImageInfo[] = [
      { Id: 'image1' } as ImageInfo,
      { Id: 'image2' } as ImageInfo,
      { Id: 'image3' } as ImageInfo,
    ];
    const containers: ContainerInfo[] = [
      { ImageID: 'image1' } as ContainerInfo,
      { ImageID: 'image1' } as ContainerInfo, // same image used by multiple containers
    ];

    vi.mocked(containersInfos.subscribe).mockImplementation((cb: (value: ContainerInfo[]) => void) => {
      cb(containers);
      return (): void => {};
    });
    vi.mocked(podsInfos.subscribe).mockImplementation((cb: (value: PodInfo[]) => void) => {
      cb([]);
      return (): void => {};
    });
    vi.mocked(imagesInfos.subscribe).mockImplementation((cb: (value: ImageInfo[]) => void) => {
      cb(images);
      return (): void => {};
    });
    vi.mocked(volumeListInfos.subscribe).mockImplementation((cb: (value: VolumeListInfo[]) => void) => {
      cb([]);
      return (): void => {};
    });
    vi.mocked(providerInfos.subscribe).mockImplementation((cb: (value: ProviderInfo[]) => void) => {
      cb([]);
      return (): void => {};
    });

    const counts = get(resourceCounts);

    expect(counts.images.total).toBe(3);
    expect(counts.images.inUse).toBe(1);
    expect(counts.images.unused).toBe(2);
  });

  test('should count total volumes and in-use/unused across volume lists', () => {
    const volumeLists: VolumeListInfo[] = [
      {
        Volumes: [
          { containersUsage: [{ id: 'c1', names: ['container1'] }] },
          { containersUsage: [] },
          { containersUsage: [{ id: 'c2', names: ['container2'] }] },
        ],
      } as VolumeListInfo,
      {
        Volumes: [{ containersUsage: [] }, { containersUsage: undefined }],
      } as unknown as VolumeListInfo,
    ];

    vi.mocked(containersInfos.subscribe).mockImplementation((cb: (value: ContainerInfo[]) => void) => {
      cb([]);
      return (): void => {};
    });
    vi.mocked(podsInfos.subscribe).mockImplementation((cb: (value: PodInfo[]) => void) => {
      cb([]);
      return (): void => {};
    });
    vi.mocked(imagesInfos.subscribe).mockImplementation((cb: (value: ImageInfo[]) => void) => {
      cb([]);
      return (): void => {};
    });
    vi.mocked(volumeListInfos.subscribe).mockImplementation((cb: (value: VolumeListInfo[]) => void) => {
      cb(volumeLists);
      return (): void => {};
    });
    vi.mocked(providerInfos.subscribe).mockImplementation((cb: (value: ProviderInfo[]) => void) => {
      cb([]);
      return (): void => {};
    });

    const counts = get(resourceCounts);

    expect(counts.volumes.total).toBe(5);
    expect(counts.volumes.inUse).toBe(2);
    expect(counts.volumes.unused).toBe(3);
  });

  test('should count machine statuses from provider connections', () => {
    const providers: ProviderInfo[] = [
      {
        internalId: 'provider1',
        containerConnections: [{ status: 'started' }, { status: 'stopped' }, { status: 'starting' }],
      } as unknown as ProviderInfo,
    ];

    vi.mocked(containersInfos.subscribe).mockImplementation((cb: (value: ContainerInfo[]) => void) => {
      cb([]);
      return (): void => {};
    });
    vi.mocked(podsInfos.subscribe).mockImplementation((cb: (value: PodInfo[]) => void) => {
      cb([]);
      return (): void => {};
    });
    vi.mocked(imagesInfos.subscribe).mockImplementation((cb: (value: ImageInfo[]) => void) => {
      cb([]);
      return (): void => {};
    });
    vi.mocked(volumeListInfos.subscribe).mockImplementation((cb: (value: VolumeListInfo[]) => void) => {
      cb([]);
      return (): void => {};
    });
    vi.mocked(providerInfos.subscribe).mockImplementation((cb: (value: ProviderInfo[]) => void) => {
      cb(providers);
      return (): void => {};
    });

    const counts = get(resourceCounts);

    expect(counts.machines.total).toBe(3);
    expect(counts.machines.running).toBe(1);
    expect(counts.machines.stopped).toBe(1);
    expect(counts.machines.starting).toBe(1);
  });
});

describe('isEngineRunning', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('should return true when provider status is ready', () => {
    const providers: ProviderInfo[] = [
      {
        status: 'ready',
        containerConnections: [],
      } as unknown as ProviderInfo,
    ];

    vi.mocked(providerInfos.subscribe).mockImplementation((cb: (value: ProviderInfo[]) => void) => {
      cb(providers);
      return (): void => {};
    });

    const running = get(isEngineRunning);
    expect(running).toBe(true);
  });

  test('should return true when container connection is started', () => {
    const providers: ProviderInfo[] = [
      {
        status: 'stopped',
        containerConnections: [{ status: 'started' }],
      } as unknown as ProviderInfo,
    ];

    vi.mocked(providerInfos.subscribe).mockImplementation((cb: (value: ProviderInfo[]) => void) => {
      cb(providers);
      return (): void => {};
    });

    const running = get(isEngineRunning);
    expect(running).toBe(true);
  });

  test('should return false when no providers are running', () => {
    const providers: ProviderInfo[] = [
      {
        status: 'stopped',
        containerConnections: [{ status: 'stopped' }],
      } as unknown as ProviderInfo,
    ];

    vi.mocked(providerInfos.subscribe).mockImplementation((cb: (value: ProviderInfo[]) => void) => {
      cb(providers);
      return (): void => {};
    });

    const running = get(isEngineRunning);
    expect(running).toBe(false);
  });

  test('should return false when no providers exist', () => {
    vi.mocked(providerInfos.subscribe).mockImplementation((cb: (value: ProviderInfo[]) => void) => {
      cb([]);
      return (): void => {};
    });

    const running = get(isEngineRunning);
    expect(running).toBe(false);
  });
});
