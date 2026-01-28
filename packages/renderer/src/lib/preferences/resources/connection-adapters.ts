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

import { filesize } from 'filesize';

import type { IProviderConnectionConfigurationPropertyRecorded } from '../Util';
import type { CardDetail, ResourceStat } from './types';

/**
 * Extract resource stats (CPU, Memory, Disk) from container connection configuration
 */
export function extractResourceStats(
  configurations: IProviderConnectionConfigurationPropertyRecorded[],
  connectionName: string,
): ResourceStat[] {
  const stats: ResourceStat[] = [];
  const connectionConfigs = configurations.filter(conf => conf.connection === connectionName);

  for (const config of connectionConfigs) {
    if (config.format === 'cpu' || config.format === 'cpuUsage') {
      // Skip peer properties (usage values)
      if (!config.id?.includes('Usage')) {
        stats.push({
          label: 'CPU(s)',
          value: config.value,
        });
      }
    } else if (config.format === 'memory' || config.format === 'memoryUsage') {
      if (!config.id?.includes('Usage')) {
        stats.push({
          label: 'Memory',
          value: typeof config.value === 'number' ? filesize(config.value) : config.value,
        });
      }
    } else if (config.format === 'diskSize' || config.format === 'diskSizeUsage') {
      if (!config.id?.includes('Usage')) {
        stats.push({
          label: 'Disk',
          value: typeof config.value === 'number' ? filesize(config.value) : config.value,
        });
      }
    }
  }

  return stats;
}

/**
 * Create Kubernetes connection details from connection info
 */
export function extractKubernetesDetails(apiURL: string): CardDetail[] {
  return [
    {
      label: 'API URL',
      value: apiURL,
    },
  ];
}
