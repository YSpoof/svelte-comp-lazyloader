import type { Component, ComponentProps, Snippet } from "svelte";

import Lazy from "./Lazy.svelte";

type Mod = { default: Component<any> };
type Reserved = "pending" | "failed" | "onerror";

type KnownKeys<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K];
};

/** `Record<string, never>` (a component with no props) keys as `string`, but carries no real index signature. */
type CatchAll<T extends Record<string, unknown>> = [T[string]] extends [never] ? object : T;

type WrappedProps<C extends Component<any>> = string extends keyof ComponentProps<C>
  ? CatchAll<ComponentProps<C>>
  : Omit<KnownKeys<ComponentProps<C>>, Reserved>;

export type LazyProps<M extends Mod> = {
  pending?: Snippet;
  failed?: Snippet<[unknown, () => void]>;
  onerror?: (error: unknown, reset: () => void) => void;
} & WrappedProps<M["default"]>;

export type LazyOptions = {
  /** On the server, render the full component instead of the pending snippet, CSR aways renders the pending snippet */
  ssr?: boolean;
};

export type LazyComponent<M extends Mod> = Component<LazyProps<M>> & {
  preload: () => Promise<void>;
};

export function lazy<M extends Mod>(
  loader: () => Promise<M>,
  { ssr = false }: LazyOptions = {},
): LazyComponent<M> {
  let pending: Promise<M> | undefined;
  let settled: M | undefined;

  const load = () => (pending ??= loader().then((mod) => (settled = mod)));

  const injected: Record<PropertyKey, unknown> = { l: load, ssr };

  const C = ((anchor: any, props: any) =>
    Lazy(
      anchor,
      new Proxy(props, {
        get: (target, key) =>
          key === "settled" ? settled : key in injected ? injected[key] : target[key],
        has: (target, key) => key === "settled" || key in injected || key in target,
        ownKeys: (target) => [...new Set([...Reflect.ownKeys(target), "l", "ssr", "settled"])],
        getOwnPropertyDescriptor: (target, key) =>
          key === "settled" || key in injected
            ? {
                enumerable: true,
                configurable: true,
                value: key === "settled" ? settled : injected[key],
              }
            : Reflect.getOwnPropertyDescriptor(target, key),
      }),
    )) as unknown as LazyComponent<M>;

  C.preload = async () => {
    await load();
  };

  return C;
}
