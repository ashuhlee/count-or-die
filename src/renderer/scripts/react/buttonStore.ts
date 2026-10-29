const PRESS_DURATION = 100;

export type ButtonType = "increase" | "decrease";

type ButtonState = {
  pressed: boolean;
  // bumped each time the button is pressed while disabled, so it remounts and
  // replays its shake; 0 means it never has
  shakeId: number;
};

type ButtonsState = Record<ButtonType, ButtonState>;

const listeners = new Set<() => void>();
const releaseTimers: Partial<
  Record<ButtonType, ReturnType<typeof setTimeout>>
> = {};
let state: ButtonsState = createInitialState();

function createInitialState(): ButtonsState {
  return {
    increase: { pressed: false, shakeId: 0 },
    decrease: { pressed: false, shakeId: 0 },
  };
}

function setButton(type: ButtonType, next: Partial<ButtonState>): void {
  state = { ...state, [type]: { ...state[type], ...next } };
  listeners.forEach((listener) => listener());
}

// React side: read the state
export const buttonStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => state,

  reset() {
    Object.values(releaseTimers).forEach(clearTimeout);
    state = createInitialState();
    listeners.forEach((listener) => listener());
  },
};

// vanilla side: same function the game code already calls. Shows the pressed
// image for a moment; a disabled press also shakes the button.
export function animateBtn(type: ButtonType, disabled = false): void {
  clearTimeout(releaseTimers[type]);

  setButton(type, {
    pressed: true,
    shakeId: disabled ? state[type].shakeId + 1 : state[type].shakeId,
  });

  releaseTimers[type] = setTimeout(
    () => setButton(type, { pressed: false }),
    PRESS_DURATION,
  );
}
