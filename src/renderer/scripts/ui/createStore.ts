// The game's rules and timers are plain TypeScript (core/, app.ts), so they
// can't call into React components. A store sits between them: the game code
// changes it, and components subscribe to it with useSyncExternalStore.
export type Store<T> = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
  // replace the whole state
  set: (next: T) => void;
  // merge into an object state
  patch: (next: T extends object ? Partial<T> : never) => void;
};

export function createStore<T>(initial: T): Store<T> {
  const listeners = new Set<() => void>();
  let state = initial;

  function set(next: T): void {
    state = next;
    listeners.forEach((listener) => listener());
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => state,
    set,
    patch(next) {
      set({ ...state, ...next });
    },
  };
}
