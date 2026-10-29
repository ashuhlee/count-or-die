import { createContext, useContext, useEffect, useRef } from "react";
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
  | { type: "flashEnded" }; // the red flash finished playing

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

export function useEventBus(): EventBus {
  const bus = useContext(EventBusContext);
  if (!bus) throw new Error("useEventBus needs a <GameProvider> above it");
  return bus;
}

// runs `handler` for every event of one type while the component is mounted
export function useGameEvent<Type extends AppEvent["type"]>(
  type: Type,
  handler: (event: Extract<AppEvent, { type: Type }>) => void,
): void {
  const bus = useEventBus();

  // always call the latest handler without resubscribing on every render
  const latest = useRef(handler);
  useEffect(() => {
    latest.current = handler;
  });

  useEffect(
    () =>
      bus.subscribe((event) => {
        if (event.type === type) {
          latest.current(event as Extract<AppEvent, { type: Type }>);
        }
      }),
    [bus, type],
  );
}
