export type ClockTimer = {
  id?: ReturnType<typeof setTimeout>;
  callback: () => void;
  endsAt: number;
  left: number;
};

export type GameClock = {
  after: (callback: () => void, ms: number) => ClockTimer;
  cancel: (timer: ClockTimer | undefined) => void;
  pause: () => void;
  resume: () => void;
  setRate: (rate: number) => void;
  clear: () => void;
};

export function createGameClock(): GameClock {
  const timers = new Set<ClockTimer>();
  let paused = false;
  let rate = 1;

  function start(timer: ClockTimer) {
    const wait = timer.left / rate;
    timer.endsAt = Date.now() + wait;
    timer.id = setTimeout(() => {
      timers.delete(timer);
      timer.callback();
    }, wait);
  }

  function stop(timer: ClockTimer) {
    clearTimeout(timer.id);
    timer.left = Math.max(0, timer.endsAt - Date.now()) * rate;
  }

  return {
    after(callback, ms) {
      const timer: ClockTimer = { callback, endsAt: 0, left: ms };
      timers.add(timer);
      if (!paused) start(timer);
      return timer;
    },

    cancel(timer) {
      if (!timer) return;
      clearTimeout(timer.id);
      timers.delete(timer);
    },

    pause() {
      if (paused) return;
      paused = true;
      timers.forEach(stop);
    },

    resume() {
      if (!paused) return;
      paused = false;
      timers.forEach(start);
    },

    setRate(next) {
      if (next === rate) return;
      if (!paused) timers.forEach(stop);
      rate = next;
      if (!paused) timers.forEach(start);
    },

    clear() {
      timers.forEach((timer) => clearTimeout(timer.id));
      timers.clear();
    },
  };
}
