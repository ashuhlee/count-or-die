import { createContext } from "react";
import type { GameEvent } from "../game/events.ts";

export type AppEvent =
  | Exclude<GameEvent, { type: "cursorCount" }>
  | {
      type: "cursorCount";
      value: number;
      boosted: boolean;
      x: number;
      y: number;
    }
  | { type: "smoke"; kind: "heart" | "powerUp"; x: number; y: number }
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
