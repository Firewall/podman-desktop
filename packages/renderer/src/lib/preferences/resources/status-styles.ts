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

import type { DisplayStatus, StatusStyles } from './types';

/**
 * Map connection status from provider to display status
 */
export function mapConnectionStatus(status: string): DisplayStatus {
  switch (status) {
    case 'started':
      return 'running';
    case 'stopped':
      return 'stopped';
    case 'starting':
      return 'starting';
    case 'stopping':
      return 'stopping';
    case 'failed':
    case 'error':
      return 'error';
    default:
      return 'unknown';
  }
}

/**
 * Get status-based styling using --pd-* CSS variables
 */
export function getStatusStyles(status: DisplayStatus): StatusStyles {
  switch (status) {
    case 'running':
      return {
        border: 'border-[var(--pd-content-divider)]',
        iconBg: '',
        iconColor: '',
        badgeClass: 'bg-[var(--pd-status-running)]/15 text-[var(--pd-status-running)]',
        dotColor: 'bg-[var(--pd-status-running)]',
        dimmed: false,
        label: 'RUNNING',
      };
    case 'starting':
      return {
        border: 'border-l-[3px] border-l-[var(--pd-status-starting)] border-[var(--pd-content-divider)]',
        iconBg: 'bg-[var(--pd-status-starting)]/15',
        iconColor: 'text-[var(--pd-status-starting)]',
        badgeClass: 'bg-[var(--pd-status-starting)]/15 text-[var(--pd-status-starting)]',
        dotColor: 'bg-[var(--pd-status-starting)]',
        dimmed: false,
        label: 'STARTING',
      };
    case 'stopping':
      return {
        border: 'border-l-[3px] border-l-[var(--pd-status-terminated)] border-[var(--pd-content-divider)]',
        iconBg: 'bg-[var(--pd-status-terminated)]/15',
        iconColor: 'text-[var(--pd-status-terminated)]',
        badgeClass: 'bg-[var(--pd-status-terminated)]/15 text-[var(--pd-status-terminated)]',
        dotColor: 'bg-[var(--pd-status-terminated)]',
        dimmed: false,
        label: 'STOPPING',
      };
    case 'stopped':
      return {
        border: 'border-l-[3px] border-l-[var(--pd-status-stopped)] border-[var(--pd-content-divider)]',
        iconBg: 'bg-[var(--pd-content-bg)]/50',
        iconColor: 'text-[var(--pd-content-sub-header)]',
        badgeClass: 'bg-[var(--pd-content-bg)] text-[var(--pd-content-sub-header)]',
        dotColor: 'bg-[var(--pd-status-stopped)]',
        dimmed: true,
        label: 'OFF',
      };
    case 'error':
      return {
        border: 'border-l-[3px] border-l-[var(--pd-status-terminated)] border-[var(--pd-content-divider)]',
        iconBg: 'bg-[var(--pd-status-terminated)]/15',
        iconColor: 'text-[var(--pd-status-terminated)]',
        badgeClass: 'bg-[var(--pd-status-terminated)]/15 text-[var(--pd-status-terminated)]',
        dotColor: 'bg-[var(--pd-status-terminated)]',
        dimmed: false,
        label: 'ERROR',
      };
    default:
      return {
        border: 'border-[var(--pd-content-divider)]',
        iconBg: '',
        iconColor: '',
        badgeClass: 'bg-[var(--pd-content-bg)] text-[var(--pd-content-sub-header)]',
        dotColor: 'bg-[var(--pd-status-unknown)]',
        dimmed: false,
        label: status.toUpperCase(),
      };
  }
}
