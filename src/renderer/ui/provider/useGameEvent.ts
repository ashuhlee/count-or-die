import { useContext, useEffect, useRef } from "react";

import { EventBusContext, type AppEvent, type EventBus } from "./eventBus.ts";

function useEventBus(): EventBus {
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
