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

import ResourceProviderSection from './ResourceProviderSection.svelte';

describe('ResourceProviderSection', () => {
  test('should display the title', () => {
    render(ResourceProviderSection, { id: 'test-provider', title: 'Test Provider' });
    expect(screen.getByRole('heading', { name: /Test Provider/i })).toBeInTheDocument();
  });

  test('should display the version when provided', () => {
    render(ResourceProviderSection, { id: 'test-provider', title: 'Test Provider', version: '1.0.0' });
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
  });

  test('should display the icon when provided as string', () => {
    render(ResourceProviderSection, {
      id: 'test-provider',
      title: 'Test Provider',
      icon: 'http://example.com/icon.png',
    });
    const img = screen.getByAltText('Test Provider');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'http://example.com/icon.png');
  });

  test('should display the icon when provided as object', () => {
    render(ResourceProviderSection, {
      id: 'test-provider',
      title: 'Test Provider',
      icon: { dark: 'http://example.com/dark.png', light: 'http://example.com/light.png' },
    });
    const img = screen.getByAltText('Test Provider');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'http://example.com/dark.png');
  });

  test('should display empty message when isEmpty is true', () => {
    render(ResourceProviderSection, {
      id: 'test-provider',
      title: 'Test Provider',
      isEmpty: true,
      emptyMessage: 'No connections available',
    });
    expect(screen.getByText('No connections available')).toBeInTheDocument();
  });

  test('should have correct aria-label', () => {
    render(ResourceProviderSection, { id: 'test-provider', title: 'Test Provider' });
    expect(screen.getByRole('region', { name: 'test-provider' })).toBeInTheDocument();
  });
});
