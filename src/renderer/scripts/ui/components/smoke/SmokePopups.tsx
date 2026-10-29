import { useSyncExternalStore } from "react";

import { smokeStore, type SmokeKind } from "./smokeStore.ts";

const KINDS: SmokeKind[] = ["popupElement", "powerUpUsedElement"];

export default function SmokePopups() {
  const state = useSyncExternalStore(
    smokeStore.subscribe,
    smokeStore.getSnapshot,
  );

  return (
    <>
      {KINDS.map((kind) => {
        const { src, left, top, visible } = state[kind];

        return (
          <img
            key={kind}
            id={kind}
            alt="smoke"
            src={src ?? undefined}
            style={{
              filter: "brightness(1.03) saturate(110%)",
              left: `${left}px`,
              top: `${top}px`,
              width: `${smokeStore.size}px`,
              height: `${smokeStore.size}px`,
              display: visible ? "block" : undefined,
              zIndex: 2,
            }}
          />
        );
      })}
    </>
  );
}
