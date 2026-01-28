<script lang="ts">
import type { Snippet } from 'svelte';

import type { ProviderInfo } from '/@api/provider-info';

interface Props {
  id: string;
  title: string;
  version?: string;
  icon?: ProviderInfo['images']['icon'];
  emptyMessage?: string;
  isEmpty?: boolean;
  children?: Snippet;
  actionButtons?: Snippet;
}

let { id, title, version, icon, emptyMessage, isEmpty = false, children, actionButtons }: Props = $props();
</script>

<section {id} class="mb-5 scroll-mt-8" aria-label={id}>
  <!-- Section Header -->
  <div class="flex items-center gap-3 mb-3">
    <!-- Provider Icon -->
    <div class="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 bg-[var(--pd-content-bg)]">
      {#if icon}
        {#if typeof icon === 'string'}
          <img src={icon} alt={title} class="max-w-[18px] max-h-[18px]" />
        {:else}
          <img src={icon.dark} alt={title} class="max-w-[18px] max-h-[18px]" />
        {/if}
      {/if}
    </div>
    <!-- Title and Version -->
    <div class="flex-1 min-w-0">
      <h2 class="text-sm font-semibold text-[var(--pd-invert-content-card-header-text)] flex items-center gap-2">
        {title}
        {#if version}
          <span class="text-xs font-normal text-[var(--pd-content-sub-header)]">v{version}</span>
        {/if}
      </h2>
    </div>
    <!-- Action Buttons -->
    {#if actionButtons}
      <div class="flex items-center gap-2 flex-shrink-0">
        {@render actionButtons()}
      </div>
    {/if}
  </div>

  <!-- Content -->
  {#if isEmpty && emptyMessage}
    <div
      class="flex items-center justify-center py-3 px-4 bg-[var(--pd-content-bg)]/30 rounded-md border border-dashed border-[var(--pd-content-divider)]">
      <p class="text-xs text-[var(--pd-content-sub-header)] text-center">{emptyMessage}</p>
    </div>
  {:else if children}
    <div class="flex flex-col gap-1.5">
      {@render children()}
    </div>
  {/if}
</section>
