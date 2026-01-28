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
import { describe, expect, test } from 'vitest';

import ResourceStatusBadge from './ResourceStatusBadge.svelte';

describe('ResourceStatusBadge', () => {
  test('should display RUNNING for started status', () => {
    render(ResourceStatusBadge, { status: 'started' });
    expect(screen.getByRole('status')).toHaveTextContent('RUNNING');
  });

  test('should display OFF for stopped status', () => {
    render(ResourceStatusBadge, { status: 'stopped' });
    expect(screen.getByRole('status')).toHaveTextContent('OFF');
  });

  test('should display STARTING for starting status', () => {
    render(ResourceStatusBadge, { status: 'starting' });
    expect(screen.getByLabelText('Connection Status: STARTING')).toBeInTheDocument();
  });

  test('should display uptime when provided and status is running', () => {
    render(ResourceStatusBadge, { status: 'started', uptime: '2h 30m' });
    expect(screen.getByRole('status')).toHaveTextContent('RUNNING');
    expect(screen.getByRole('status')).toHaveTextContent('2h 30m');
  });

  test('should have correct aria-label', () => {
    render(ResourceStatusBadge, { status: 'started' });
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Connection Status: RUNNING');
  });
});
