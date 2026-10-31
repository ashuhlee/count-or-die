import { createContext, useContext } from "react";

import type { GameState } from "../game/gameReducer.ts";
import type { PowerUpType } from "../game/powerUps.ts";
import type { AppEvent } from "./eventBus.ts";

// where the player clicked, on screen
export type Pointer = { x: number; y: number };

// the countdown bar's color: 0 healthy, 1 warning, 2 critical, 3 critical fast
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
  collectPowerUp: (type: PowerUpType) => void;
  // lets components tell each other things
  emit: (event: AppEvent) => void;
};

export type GameContextValue = {
  state: GameState;
  barStage: BarStage;
  loading: LoadingScreenState;
  actions: GameActions;
  ready: boolean;
};

export const GameContext = createContext<GameContextValue | null>(null);

export function useGame(): GameContextValue {
  const game = useContext(GameContext);
  if (!game) throw new Error("useGame needs a <GameProvider> above it");
  return game;
}
