<script lang="ts">
import { faFileText } from '@fortawesome/free-solid-svg-icons';
import { EmptyScreen } from '@podman-desktop/ui-svelte';

import Markdown from '../markdown/Markdown.svelte';

interface Props {
  readme: { content?: string; uri?: string };
}

const { readme }: Props = $props();

const readmePromise = $derived.by(async () => {
  if (readme.uri) {
    // fetch the readme file content
    const response = await fetch(readme.uri);
    if (response.ok) {
      const text = await response.text();
      return text;
    }
  }

  if (readme.content) {
    // try with extension readme
    return readme.content;
  }

  return '';
});
</script>

{#await readmePromise then readmeContent}
  {#if readmeContent}
    <div class="w-full min-h-full overflow-y-visible leading-6 text-[var(--pd-details-body-text)]">
      <Markdown markdown={readmeContent} />
    </div>
  {:else}
    <EmptyScreen
      class="w-full h-full"
      icon={faFileText}
      title="No Readme"
      message="No readme file is available for this extension" />
  {/if}
{/await}
