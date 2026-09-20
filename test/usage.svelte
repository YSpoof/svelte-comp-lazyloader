<script lang="ts">
  import { lazy } from "../src/lib/index.js";

  const NoProps = lazy(() => import("./fixtures/NoProps.svelte"));
  const WithProps = lazy(() => import("./fixtures/WithProps.svelte"));
  const CatchAll = lazy(() => import("./fixtures/CatchAll.svelte"));
</script>

<NoProps>
  {#snippet pending()}
    <span>loading</span>
  {/snippet}
</NoProps>

<WithProps onBack={() => {}}>
  {#snippet pending()}
    <span>loading</span>
  {/snippet}
</WithProps>

<CatchAll>
  {#snippet pending()}
    <span>loading</span>
  {/snippet}
</CatchAll>
