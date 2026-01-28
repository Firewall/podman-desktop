<script lang="ts">
import { Spinner } from '@podman-desktop/ui-svelte';

import { getStatusStyles, mapConnectionStatus } from './status-styles';
import type { DisplayStatus } from './types';

interface Props {
  status: string;
  uptime?: string;
}

let { status, uptime }: Props = $props();

let displayStatus: DisplayStatus = $derived(mapConnectionStatus(status));
let styles = $derived(getStatusStyles(displayStatus));
</script>

<div
  class="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wide flex-shrink-0 {styles.badgeClass}"
  role="status"
  aria-label="Connection Status: {styles.label}">
  {#if displayStatus === 'starting' || displayStatus === 'stopping'}
    <Spinner size="12px" />
  {:else}
    <span class="w-1.5 h-1.5 rounded-full {styles.dotColor}"></span>
  {/if}
  <span>{styles.label}</span>
  {#if displayStatus === 'running' && uptime}
    <span class="normal-case font-normal opacity-80">· {uptime}</span>
  {/if}
</div>
