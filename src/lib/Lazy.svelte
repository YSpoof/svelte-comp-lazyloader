<script lang="ts">
  import { BROWSER } from "esm-env";
  import type { Component, Snippet } from "svelte";

  type Props = {
    comp: () => Promise<{ default: Component<any> }>;
    ssr?: boolean;
    settled?: { default: Component<any> };
    pending?: Snippet;
    failed?: Snippet<[unknown, () => void]>;
    onerror?: (error: unknown, reset: () => void) => void;
  };

  const server = !BROWSER;

  let { comp, ssr = false, settled, pending, failed, onerror, ...rest }: Props = $props();

  const pendingSnippet = $derived.by(() => {
    if (settled || (ssr && server)) return null;
    return pending ?? empty;
  });
</script>

{#snippet empty()}{/snippet}

<svelte:boundary
  pending={pendingSnippet}
  {failed}
  {onerror}>
  {const C = $derived((await comp()).default)}
  <C {...rest} />
</svelte:boundary>
