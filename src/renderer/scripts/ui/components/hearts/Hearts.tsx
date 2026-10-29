import { useEffect, useRef, useState } from "react";

import heartPink from "@assets/ui/deco/px_heart_pink.png";
import heartPurple from "@assets/ui/deco/px_heart_purple.png";
import heartBlue from "@assets/ui/deco/px_heart_blue.png";
import heartWhite from "@assets/ui/deco/px_heart_white.png";

import { MAX_BOOSTS } from "../../../game/gameReducer.ts";
import { useGame } from "../../GameProvider.tsx";
import { useGameEvent } from "../../gameEvents.ts";
import { useReplayAnimation, useTimeouts } from "../../hooks.ts";
import Letters from "../letters/Letters.tsx";
import { useHeartGlitch } from "./useHeartGlitch.ts";

const RESTORE_STAGGER = 150;

// where the smoke puff goes relative to a heart that just came back
const RESTORE_SMOKE_OFFSET = { x: -30, y: -36 };

const HEARTS = [
  { className: "heart-pink", src: heartPink },
  { className: "heart-purple", src: heartPurple },
  { className: "heart-blue", src: heartBlue },
  { className: "heart-white", src: heartWhite },
];

type Slots = { used: boolean[]; restoring: boolean[] };

// the hearts on the right are the first to go
function slotsFor(boostsAvailable: number): Slots {
  return {
    used: HEARTS.map((_, index) => index >= boostsAvailable),
    restoring: HEARTS.map(() => false),
  };
}

function Heart({
  number,
  src,
  heartRef,
}: {
  number: number;
  src: string;
  heartRef: React.RefObject<HTMLImageElement | null>;
}) {
  useHeartGlitch(heartRef, number);

  return (
    <img
      ref={heartRef}
      src={src}
      alt={`heart${number}`}
      className={`heart${number}`}
      id={`heart${number}`}
    />
  );
}

export default function Hearts() {
  const { state, actions } = useGame();
  const boosts = state.boostsAvailable;

  const [slots, setSlots] = useState(() => slotsFor(boosts));

  const later = useTimeouts();
  const slotElements = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef(HEARTS.map(() => ({ current: null })));
  const restoreTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const previous = useRef(boosts);

  const smokeAt = (index: number, offset = { x: 0, y: 0 }) => {
    const rect = slotElements.current[index]?.getBoundingClientRect();
    if (!rect) return;

    actions.emit({
      type: "smoke",
      kind: "heart",
      x: rect.left + offset.x,
      y: rect.top + offset.y,
    });
  };

  // a new game: every heart is back at once
  useGameEvent("restarted", () => {
    restoreTimers.current.forEach(clearTimeout);
    restoreTimers.current = [];
    previous.current = MAX_BOOSTS;
    setSlots(slotsFor(MAX_BOOSTS));
  });

  // hearts follow the number of boosts left
  useEffect(() => {
    const before = previous.current;
    previous.current = boosts;

    // a boost was used: its heart goes, with a puff of smoke
    if (boosts < before) {
      setSlots((current) => ({ ...current, used: slotsFor(boosts).used }));
      smokeAt(boosts);
      return;
    }

    // power-up: the missing hearts come back one after the other
    for (let index = before; index < boosts; index++) {
      const delay = (index - before) * RESTORE_STAGGER;

      restoreTimers.current.push(
        later(() => {
          setSlots((current) => ({
            used: current.used.map((used, i) => (i === index ? false : used)),
            restoring: current.restoring.map((r, i) =>
              i === index ? true : r,
            ),
          }));
          smokeAt(index, RESTORE_SMOKE_OFFSET);
        }, delay),
      );
    }
    // smokeAt only reads refs and emits events
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [boosts]);

  // the "no boosts left!" text flashes when a boost is tried with none left
  const [noBoostsRef, flashNoBoosts] =
    useReplayAnimation<HTMLHeadingElement>("no-boosts-flash");
  useGameEvent("noBoostsFlash", flashNoBoosts);

  return (
    <>
      <h1
        ref={noBoostsRef}
        className="no-boosts"
        id="no-boosts"
        style={{ display: boosts === 0 ? "grid" : "none" }}
      >
        <span className="no-boost-text">
          <Letters text="no boosts left!" step={0.2} />
        </span>
      </h1>
      <div className="hearts">
        {HEARTS.map(({ className, src }, index) => {
          const number = index + 1;
          const used = slots.used[index];
          const restoring = slots.restoring[index];

          return (
            <div
              key={number}
              ref={(element) => {
                slotElements.current[index] = element;
              }}
              id={`boost-${number}`}
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
                if (event.target !== event.currentTarget) return;

                setSlots((current) => ({
                  ...current,
                  restoring: current.restoring.map((r, i) =>
                    i === index ? false : r,
                  ),
                }));
              }}
            >
              <Heart
                number={number}
                src={src}
                heartRef={imageRefs.current[index]}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
