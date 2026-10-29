import smokeGif from "@assets/ui/deco/smoke.gif";

import { createStore } from "../../createStore.ts";

const SMOKE_SIZE = 70;
const SMOKE_DURATION = 3000;

// two popups share the same gif: one for hearts, one for collected power-ups
export type SmokeKind = "popupElement" | "powerUpUsedElement";

type Popup = {
  src: string | null;
  left: number;
  top: number;
  visible: boolean;
};
type SmokeState = Record<SmokeKind, Popup>;

const hideTimers: Partial<Record<SmokeKind, ReturnType<typeof setTimeout>>> =
  {};
const store = createStore(createInitialState());

function createInitialState(): SmokeState {
  const popup = { src: null, left: 0, top: 0, visible: false };
  return { popupElement: { ...popup }, powerUpUsedElement: { ...popup } };
}

function setPopup(kind: SmokeKind, next: Partial<Popup>): void {
  const state = store.getSnapshot();
  store.set({ ...state, [kind]: { ...state[kind], ...next } });
}

// For the components: the state
export const smokeStore = {
  subscribe: store.subscribe,
  getSnapshot: store.getSnapshot,
  size: SMOKE_SIZE,

  reset() {
    Object.values(hideTimers).forEach(clearTimeout);
    store.set(createInitialState());
  },
};

// For the game code: a puff of smoke at a screen position
export function showSmoke(kind: SmokeKind, left: number, top: number): void {
  clearTimeout(hideTimers[kind]);

  setPopup(kind, {
    // a new query string restarts the gif from its first frame
    src: `${smokeGif}?t=${Date.now()}`,
    left,
    top,
    visible: true,
  });

  hideTimers[kind] = setTimeout(
    () => setPopup(kind, { visible: false }),
    SMOKE_DURATION,
  );
}
