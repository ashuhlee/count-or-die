import { createContext } from "react";
import type { GameEvent } from "../game/events.ts";
import type { PowerUpType } from "../game/powerUps.ts";

export type AppEvent =
  | Exclude<GameEvent, { type: "cursorCount" }>
  | {
      type: "cursorCount";
      value: number;
      x: number;
      y: number;
    }
  | { type: "smoke"; x: number; y: number }
  | { type: "powerUpPicked"; powerUp: PowerUpType }
  | { type: "flashEnded" } // the red flash finished playing
  | { type: "pageReset" }; // the whole page starts over, behind the loading screen

type Listener = (event: AppEvent) => void;

export type EventBus = {
  emit: Listener;
  subscribe: (listener: Listener) => () => void;
};

export function createEventBus(): EventBus {
  const listeners = new Set<Listener>();

  return {
    emit(event) {
      listeners.forEach((listener) => listener(event));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export const EventBusContext = createContext<EventBus | null>(null);
