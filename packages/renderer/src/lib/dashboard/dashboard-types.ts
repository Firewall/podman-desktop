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

import type { Component } from 'svelte';

// Machine/VM status types
export type MachineStatus = 'running' | 'stopped' | 'starting' | 'stopping' | 'error';

// Dashboard types - Critical Path Health
export interface CriticalPathItem {
  id: string;
  category: 'engine' | 'local-k8s' | 'connected-k8s';
  title: string;
  subtitle?: string;
  status: MachineStatus;
  action?: string;
  actionHref?: string;
  icon?: Component;
  requires?: string;
  stoppedHint?: string;
}

export interface ResourceCard {
  href: string;
  icon: Component;
  label: string;
  count?: number;
  running?: number;
  stopped?: number;
  size?: string;
  priority?: number;
  hasIssue?: boolean;
}

export interface GettingStartedItem {
  text: string;
  completed: boolean;
  href?: string;
}

export interface SystemStat {
  label: string;
  value: number;
  detail: string;
  status?: 'normal' | 'warning' | 'critical';
}

// Helper function to map provider status to MachineStatus
export function getDisplayStatus(providerStatus: string): MachineStatus {
  switch (providerStatus) {
    case 'ready':
    case 'started':
      return 'running';
    case 'starting':
      return 'starting';
    case 'stopping':
      return 'stopping';
    case 'stopped':
    case 'not-installed':
    case 'installed':
    case 'configured':
      return 'stopped';
    default:
      return 'error';
  }
}
