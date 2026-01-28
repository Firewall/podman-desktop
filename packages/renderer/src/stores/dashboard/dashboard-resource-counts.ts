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

import { derived } from 'svelte/store';

import { containersInfos } from '/@/stores/containers';
import { imagesInfos } from '/@/stores/images';
import { podsInfos } from '/@/stores/pods';
import { providerInfos } from '/@/stores/providers';
import { volumeListInfos } from '/@/stores/volumes';

export interface ResourceCounts {
  containers: {
    total: number;
    running: number;
    stopped: number;
  };
  pods: {
    total: number;
    running: number;
    stopped: number;
  };
  images: {
    total: number;
    inUse: number;
    unused: number;
  };
  volumes: {
    total: number;
    inUse: number;
    unused: number;
  };
  machines: {
    total: number;
    running: number;
    stopped: number;
    starting: number;
    error: number;
  };
}

export const resourceCounts = derived(
  [containersInfos, podsInfos, imagesInfos, volumeListInfos, providerInfos],
  ([$containersInfos, $podsInfos, $imagesInfos, $volumeListInfos, $providerInfos]) => {
    // Container counts
    const runningContainers = $containersInfos.filter(c => c.State === 'running').length;
    const stoppedContainers = $containersInfos.filter(c => c.State !== 'running').length;

    // Pod counts
    const runningPods = $podsInfos.filter(p => p.Status === 'Running').length;
    const stoppedPods = $podsInfos.filter(p => p.Status !== 'Running').length;

    // Image counts - check which images are used by containers
    const usedImageIds = new Set($containersInfos.map(c => c.ImageID));
    const totalImages = $imagesInfos.length;
    const inUseImages = $imagesInfos.filter(img => usedImageIds.has(img.Id)).length;
    const unusedImages = totalImages - inUseImages;

    // Volume counts - check containersUsage array
    const allVolumes = $volumeListInfos.flatMap(volumeInfo => volumeInfo.Volumes);
    const totalVolumes = allVolumes.length;
    const inUseVolumes = allVolumes.filter(v => v.containersUsage && v.containersUsage.length > 0).length;
    const unusedVolumes = totalVolumes - inUseVolumes;

    // Machine counts from provider container connections
    let totalMachines = 0;
    let runningMachines = 0;
    let stoppedMachines = 0;
    let startingMachines = 0;
    let errorMachines = 0;

    for (const provider of $providerInfos) {
      for (const connection of provider.containerConnections) {
        totalMachines++;
        switch (connection.status) {
          case 'started':
            runningMachines++;
            break;
          case 'starting':
            startingMachines++;
            break;
          case 'stopped':
            stoppedMachines++;
            break;
          default:
            // Handle error, stopping, or unknown states
            errorMachines++;
        }
      }
    }

    return {
      containers: {
        total: $containersInfos.length,
        running: runningContainers,
        stopped: stoppedContainers,
      },
      pods: {
        total: $podsInfos.length,
        running: runningPods,
        stopped: stoppedPods,
      },
      images: {
        total: totalImages,
        inUse: inUseImages,
        unused: unusedImages,
      },
      volumes: {
        total: totalVolumes,
        inUse: inUseVolumes,
        unused: unusedVolumes,
      },
      machines: {
        total: totalMachines,
        running: runningMachines,
        stopped: stoppedMachines,
        starting: startingMachines,
        error: errorMachines,
      },
    } as ResourceCounts;
  },
);

// Derived store to check if any engine is running
export const isEngineRunning = derived([providerInfos], ([$providerInfos]) => {
  return $providerInfos.some(
    provider =>
      provider.status === 'ready' ||
      provider.status === 'started' ||
      provider.containerConnections.some(conn => conn.status === 'started'),
  );
});
