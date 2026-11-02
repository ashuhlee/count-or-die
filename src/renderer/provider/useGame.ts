import { createContext, useContext } from "react";

import type { GameClock } from "../game/gameClock.ts";
import type { GameState } from "../game/gameLogic.ts";
import type { PowerUpType } from "../game/powerUps.ts";
import type { AppEvent } from "./eventBus.ts";

// where the player clicked, on screen
export type Pointer = { x: number; y: number };

export type Screen = "menu" | "game";
export type BarStage = 0 | 1 | 2 | 3;

export type LoadingScreenState = {
  mounted: boolean;
  visible: boolean;
  hiding: boolean;
};

export type GameActions = {
  increase: (pointer?: Pointer) => void;
  boost: (pointer?: Pointer) => void;
  reset: () => void;
  restartFromGameOver: () => void;
  play: () => void;
  backToMenu: () => void;
  quit: () => void;
  reportBug: () => void;
  collectPowerUp: (type: PowerUpType) => void;
  pause: () => void;
  resume: () => void;

  emit: (event: AppEvent) => void;
};

export type GameContextValue = {
  state: GameState;
  barStage: BarStage;
  loading: LoadingScreenState;
  actions: GameActions;
  ready: boolean;
  paused: boolean;
  // the timers of the game, which stop while it is paused
  clock: GameClock;
  screen: Screen;
  cameFromGame: boolean;
};

export const GameContext = createContext<GameContextValue | null>(null);

export function useGame(): GameContextValue {
  const game = useContext(GameContext);
  if (!game) throw new Error("useGame needs a <GameProvider> above it");
  return game;
}
