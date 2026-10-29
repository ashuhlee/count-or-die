// What the buttons and keys do. app.ts owns the game state, so it registers
// the real handlers once the game is created; until then clicks do nothing.
export type GameHandlers = {
  increase: (event?: MouseEvent) => void;
  boost: (event?: MouseEvent) => void;
  reset: () => void;
  restart: () => void;
  menu: () => void;
  quit: () => void;
};

let handlers: GameHandlers | null = null;

export const gameControls = {
  register(next: GameHandlers): void {
    handlers = next;
  },

  increase: (event?: MouseEvent) => handlers?.increase(event),
  boost: (event?: MouseEvent) => handlers?.boost(event),
  reset: () => handlers?.reset(),
  restart: () => handlers?.restart(),
  menu: () => handlers?.menu(),
  quit: () => handlers?.quit(),
};
