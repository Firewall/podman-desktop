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

import { describe, expect, test } from 'vitest';

import { getStatusStyles, mapConnectionStatus } from './status-styles';

describe('mapConnectionStatus', () => {
  test('should map started to running', () => {
    expect(mapConnectionStatus('started')).toBe('running');
  });

  test('should map stopped to stopped', () => {
    expect(mapConnectionStatus('stopped')).toBe('stopped');
  });

  test('should map starting to starting', () => {
    expect(mapConnectionStatus('starting')).toBe('starting');
  });

  test('should map stopping to stopping', () => {
    expect(mapConnectionStatus('stopping')).toBe('stopping');
  });

  test('should map failed to error', () => {
    expect(mapConnectionStatus('failed')).toBe('error');
  });

  test('should map error to error', () => {
    expect(mapConnectionStatus('error')).toBe('error');
  });

  test('should map unknown status to unknown', () => {
    expect(mapConnectionStatus('anything')).toBe('unknown');
  });
});

describe('getStatusStyles', () => {
  test('should return running styles', () => {
    const styles = getStatusStyles('running');
    expect(styles.dimmed).toBe(false);
    expect(styles.label).toBe('RUNNING');
    expect(styles.dotColor).toContain('status-running');
  });

  test('should return stopped styles with dimmed true', () => {
    const styles = getStatusStyles('stopped');
    expect(styles.dimmed).toBe(true);
    expect(styles.label).toBe('OFF');
    expect(styles.border).toContain('status-stopped');
  });

  test('should return starting styles', () => {
    const styles = getStatusStyles('starting');
    expect(styles.dimmed).toBe(false);
    expect(styles.label).toBe('STARTING');
    expect(styles.border).toContain('status-starting');
  });

  test('should return stopping styles', () => {
    const styles = getStatusStyles('stopping');
    expect(styles.dimmed).toBe(false);
    expect(styles.label).toBe('STOPPING');
    expect(styles.border).toContain('status-terminated');
  });

  test('should return error styles', () => {
    const styles = getStatusStyles('error');
    expect(styles.dimmed).toBe(false);
    expect(styles.label).toBe('ERROR');
    expect(styles.border).toContain('status-terminated');
  });

  test('should return unknown styles for unknown status', () => {
    const styles = getStatusStyles('unknown');
    expect(styles.dimmed).toBe(false);
    expect(styles.label).toBe('UNKNOWN');
  });
});
