import { expect, describe, test, vi } from "vite-plus/test";

import { createStore } from "../../src/renderer/scripts/ui/createStore.ts";

describe("createStore", () => {
  test("starts with the initial state", () => {
    expect(createStore(5).getSnapshot()).toBe(5);
    expect(createStore({ a: 1 }).getSnapshot()).toEqual({ a: 1 });
  });

  test("set() replaces the state and tells subscribers", () => {
    const store = createStore(1);
    const listener = vi.fn();
    store.subscribe(listener);

    store.set(2);
    expect(store.getSnapshot()).toBe(2);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("patch() merges into an object state without touching other keys", () => {
    const store = createStore({ a: 1, b: 2 });
    store.patch({ b: 3 });

    expect(store.getSnapshot()).toEqual({ a: 1, b: 3 });
  });

  test("every change gives a new snapshot object, so React sees it", () => {
    const store = createStore({ a: 1 });
    const before = store.getSnapshot();

    store.patch({ a: 1 });
    expect(store.getSnapshot()).not.toBe(before);
  });

  test("the snapshot stays the same object between changes", () => {
    const store = createStore({ a: 1 });
    expect(store.getSnapshot()).toBe(store.getSnapshot());
  });

  test("unsubscribing stops notifications", () => {
    const store = createStore(0);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.set(1);
    unsubscribe();
    store.set(2);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("works for lists", () => {
    const store = createStore<number[]>([]);
    store.set([...store.getSnapshot(), 1]);

    expect(store.getSnapshot()).toEqual([1]);
  });

  test("each store has its own state and subscribers", () => {
    const one = createStore(0);
    const two = createStore(0);
    const listener = vi.fn();
    two.subscribe(listener);

    one.set(1);
    expect(two.getSnapshot()).toBe(0);
    expect(listener).not.toHaveBeenCalled();
  });
});
