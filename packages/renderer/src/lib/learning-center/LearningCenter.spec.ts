/**********************************************************************
 * Copyright (C) 2024-2026 Red Hat, Inc.
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

import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { Guide } from '/@api/learning-center/guide';

import LearningCenter from './LearningCenter.svelte';

const guides: Guide[] = [
  {
    id: 'podman-desktop-learning-center-example',
    url: 'https://podman-desktop.io/learning-center/example',
    title: 'My Title',
    description: 'fake description',
    categories: ['Kubernetes'],
    icon: '',
  },
];

vi.mock('svelte/transition', () => ({
  slide: (): { delay: number; duration: number } => ({
    delay: 0,
    duration: 0,
  }),
  fade: (): { delay: number; duration: number } => ({
    delay: 0,
    duration: 0,
  }),
}));

beforeEach(() => {
  vi.mocked(window.listGuides).mockResolvedValue(guides);
});

afterEach(() => {
  vi.resetAllMocks();
});

test('LearningCenter component shows guides in Learn tab', async () => {
  render(LearningCenter);

  await vi.waitFor(() => {
    const firstCard = screen.getByText(guides[0].title);
    expect(firstCard).toBeVisible();
  });
});

test("LearningCenter shows tabs for Learn, Community, and What's New", async () => {
  render(LearningCenter);

  const learnTab = screen.getByRole('button', { name: 'Learn' });
  const communityTab = screen.getByRole('button', { name: 'Community' });
  const whatsNewTab = screen.getByRole('button', { name: /What's New/i });

  expect(learnTab).toBeInTheDocument();
  expect(communityTab).toBeInTheDocument();
  expect(whatsNewTab).toBeInTheDocument();
});

test('Clicking Community tab shows community items', async () => {
  render(LearningCenter);

  const communityTab = screen.getByRole('button', { name: 'Community' });
  await fireEvent.click(communityTab);

  await waitFor(() => {
    expect(screen.getByText('Discord Community')).toBeInTheDocument();
    expect(screen.getByText('GitHub Discussions')).toBeInTheDocument();
  });
});

test("Clicking What's New tab shows release announcements", async () => {
  render(LearningCenter);

  const whatsNewTab = screen.getByRole('button', { name: /What's New/i });
  await fireEvent.click(whatsNewTab);

  await waitFor(() => {
    expect(screen.getByText('Podman Desktop 1.26 Released')).toBeInTheDocument();
    expect(screen.getByText('New Dashboard Experience')).toBeInTheDocument();
  });
});

test('Clicking All button opens external documentation link', async () => {
  render(LearningCenter);

  const allButton = screen.getByRole('button', { name: /All/i });
  await fireEvent.click(allButton);

  expect(window.openExternal).toHaveBeenCalledWith('https://podman-desktop.io/docs');
});

test('Clicking a guide opens external link', async () => {
  render(LearningCenter);

  await waitFor(() => {
    expect(screen.getByText(guides[0].title)).toBeVisible();
  });

  const guideButton = screen.getByRole('button', { name: new RegExp(guides[0].title) });
  await fireEvent.click(guideButton);

  expect(window.openExternal).toHaveBeenCalledWith(guides[0].url);
});
