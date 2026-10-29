import { useSyncExternalStore } from "react";

import heartPink from "@assets/ui/deco/px_heart_pink.png";
import heartPurple from "@assets/ui/deco/px_heart_purple.png";
import heartBlue from "@assets/ui/deco/px_heart_blue.png";
import heartWhite from "@assets/ui/deco/px_heart_white.png";

import Letters from "./Letters.tsx";
import { heartStore } from "./heartStore.ts";

const HEARTS = [
  { className: "heart-pink", src: heartPink },
  { className: "heart-purple", src: heartPurple },
  { className: "heart-blue", src: heartBlue },
  { className: "heart-white", src: heartWhite },
];

export default function Hearts() {
  const { slots, noBoosts } = useSyncExternalStore(
    heartStore.subscribe,
    heartStore.getSnapshot,
  );

  return (
    <>
      <h1
        className="no-boosts"
        id="no-boosts"
        style={{ display: noBoosts ? "grid" : "none" }}
      >
        <span className="no-boost-text">
          <Letters text="no boosts left!" step={0.2} />
        </span>
      </h1>
      <div className="hearts">
        {HEARTS.map(({ className, src }, index) => {
          const { used, restoring } = slots[index];
          const n = index + 1;

          return (
            <div
              key={n}
              id={`boost-${n}`}
              className={[
                className,
                used && "heart-use",
                restoring && "heart-restore",
              ]
                .filter(Boolean)
                .join(" ")}
              // beats the staggered delay the nth-child rules give each heart
              style={restoring ? { animationDelay: "0s" } : undefined}
              onAnimationEnd={(event) => {
                if (event.target === event.currentTarget) {
                  heartStore.endRestore(index);
                }
              }}
            >
              <img
                src={src}
                alt={`heart${n}`}
                className={`heart${n}`}
                id={`heart${n}`}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
