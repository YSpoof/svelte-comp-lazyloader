# svelte-comp-lazyloader

Lazy-load Svelte 5 components. Factory returns a concrete component type, so wrapped props autocomplete.

Requires Svelte 5.36+ with `compilerOptions.experimental.async`.

## Features

- Typed props from the wrapped component
- Optional `pending` / `failed` / `onerror` via `<svelte:boundary>` (no `pending` → renders nothing, like Solid's `lazy`)
- `preload()` to start the import early (hover, intent)
- `ssr` to render the full component on the server instead of the pending snippet, doesn't affect CSR

## Installation

```bash
pnpm add svelte-comp-lazyloader
```

## Usage

Call `lazy()` at module scope so identity stays stable across hydration.

```svelte
<script lang="ts">
  import { lazy } from "svelte-comp-lazyloader";

  const Hello = lazy(() => import("./Hello.svelte"));
</script>

<Hello name="world" />
```

With no `pending` snippet, the component renders nothing until the import resolves.

Pass `pending` (and optional `failed` / `onerror`) for loading UI:

```svelte
<script lang="ts">
  import { lazy } from "svelte-comp-lazyloader";

  const Hello = lazy(() => import("./Hello.svelte"), { ssr: true });
</script>

<Hello name="world">
  {#snippet pending()}
    <p>Loading...</p>
  {/snippet}
</Hello>
```

### Preload on hover

```svelte
<script lang="ts">
  import { lazy } from "svelte-comp-lazyloader";

  const LazyTest = lazy(() => import("./Test.svelte"));

  let show = $state(false);
</script>

<button
  onpointerenter={() => LazyTest.preload()}
  onclick={() => (show = !show)}>{show ? "Hide" : "Show"}
</button>

{#if show}
  <LazyTest name="Bah"/>
{/if}
```

Once `preload()` settles, the first mount skips the pending snippet.

## Options

```ts
lazy(loader, { ssr?: boolean });
```

| option | default | meaning                                                                 |
| ------ | ------- | ----------------------------------------------------------------------- |
| `ssr`  | `false` | On the server, render the full component instead of the pending snippet |

### `preload()`

```ts
LazyTest.preload(): Promise<void>
```

Starts the same import the component uses. Fire-and-forget on hover, or `await` it.

## Source Code

Since this lib is MIT licensed, you can also contribute to it at it's repo on [GitHub](https://github.com/yspoof/svelte-comp-lazyloader)
