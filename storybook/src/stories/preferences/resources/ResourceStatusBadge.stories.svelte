<script context="module" lang="ts">
import { defineMeta } from '@storybook/addon-svelte-csf';

import ResourceStatusBadge from '../../../../../packages/renderer/src/lib/preferences/resources/ResourceStatusBadge.svelte';

/**
 * These are the stories for the `ResourceStatusBadge` component.
 * It displays connection status with appropriate styling for different states.
 */
// biome-ignore lint/correctness/noUnusedVariables: Story is used in markup
const { Story } = defineMeta({
  component: ResourceStatusBadge,
  render: template,
  title: 'Preferences/Resources/ResourceStatusBadge',
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['started', 'stopped', 'starting', 'stopping', 'error', 'failed', 'unknown'],
    },
  },
});

type StatusVariant = {
  name: string;
  status: string;
  uptime?: string;
};

// biome-ignore lint/correctness/noUnusedVariables: used in markup
const statusVariants: StatusVariant[] = [
  { name: 'Running', status: 'started' },
  { name: 'Running with Uptime', status: 'started', uptime: '2h 15m' },
  { name: 'Stopped', status: 'stopped' },
  { name: 'Starting', status: 'starting' },
  { name: 'Stopping', status: 'stopping' },
  { name: 'Error', status: 'error' },
  { name: 'Failed', status: 'failed' },
  { name: 'Unknown', status: 'unknown' },
];
</script>

{#snippet template({ ...args })}
  {#if args.showAll}
    <div class="bg-[var(--pd-content-card-bg)] p-4">
      <div class="flex flex-col gap-4">
        <div class="text-sm font-semibold text-[var(--pd-content-header)]">All Status States</div>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {#each statusVariants as variant (variant.name)}
            <div class="flex flex-col gap-2">
              <div class="text-xs text-[var(--pd-content-text)]">{variant.name}</div>
              <ResourceStatusBadge status={variant.status} uptime={variant.uptime} />
            </div>
          {/each}
        </div>
      </div>
    </div>
  {:else}
    <div class="bg-[var(--pd-content-card-bg)] p-4">
      <ResourceStatusBadge status={args.status} uptime={args.uptime} />
    </div>
  {/if}
{/snippet}

<Story name="All States" args={{ showAll: true }} />

<Story name="Running" args={{ status: 'started' }} />

<Story name="Running with Uptime" args={{ status: 'started', uptime: '2h 15m' }} />

<Story name="Stopped" args={{ status: 'stopped' }} />

<Story name="Starting" args={{ status: 'starting' }} />

<Story name="Stopping" args={{ status: 'stopping' }} />

<Story name="Error" args={{ status: 'error' }} />

<Story name="Failed" args={{ status: 'failed' }} />

<Story name="Unknown" args={{ status: 'unknown' }} />
