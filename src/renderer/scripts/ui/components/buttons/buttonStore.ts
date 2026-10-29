import { createStore } from "../../createStore.ts";

const PRESS_DURATION = 100;

export type ButtonType = "increase" | "decrease";

type ButtonState = {
  pressed: boolean;
  // bumped each time the button is pressed while disabled, so it remounts and
  // replays its shake; 0 means it never has
  shakeId: number;
};

type ButtonsState = Record<ButtonType, ButtonState>;

const releaseTimers: Partial<
  Record<ButtonType, ReturnType<typeof setTimeout>>
> = {};
const store = createStore(createInitialState());

function createInitialState(): ButtonsState {
  return {
    increase: { pressed: false, shakeId: 0 },
    decrease: { pressed: false, shakeId: 0 },
  };
}

function setButton(type: ButtonType, next: Partial<ButtonState>): void {
  const state = store.getSnapshot();
  store.set({ ...state, [type]: { ...state[type], ...next } });
}

// For the components: the state
export const buttonStore = {
  subscribe: store.subscribe,
  getSnapshot: store.getSnapshot,

  reset() {
    Object.values(releaseTimers).forEach(clearTimeout);
    store.set(createInitialState());
  },
};

// For the game code: show the pressed image for a moment; a disabled press
// also shakes the button.
export function animateBtn(type: ButtonType, disabled = false): void {
  clearTimeout(releaseTimers[type]);

  setButton(type, {
    pressed: true,
    shakeId: disabled
      ? store.getSnapshot()[type].shakeId + 1
      : store.getSnapshot()[type].shakeId,
  });

  releaseTimers[type] = setTimeout(
    () => setButton(type, { pressed: false }),
    PRESS_DURATION,
  );
}
