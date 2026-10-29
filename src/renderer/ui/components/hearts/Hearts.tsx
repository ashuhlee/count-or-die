import heartPink from "@assets/ui/deco/px_heart_pink.png";
import heartPurple from "@assets/ui/deco/px_heart_purple.png";
import heartBlue from "@assets/ui/deco/px_heart_blue.png";
import heartWhite from "@assets/ui/deco/px_heart_white.png";

import { useReplayAnimation } from "../../../hooks/useReplayAnimation.ts";
import { useGame } from "../../../provider/useGame.ts";
import { useGameEvent } from "../../../provider/useGameEvent.ts";
import Letters from "../letters/Letters.tsx";
import Heart from "./Heart.tsx";
import { useHeartSlots } from "./useHeartSlots.ts";

const HEARTS = [
  { colorClass: "heart-pink", src: heartPink },
  { colorClass: "heart-purple", src: heartPurple },
  { colorClass: "heart-blue", src: heartBlue },
  { colorClass: "heart-white", src: heartWhite },
];

export default function Hearts() {
  const { state } = useGame();
  const { slots, slotRef, finishRestoring } = useHeartSlots();

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
        style={{ display: state.boostsAvailable === 0 ? "grid" : "none" }}
      >
        <span className="no-boost-text">
          <Letters text="no boosts left!" step={0.2} />
        </span>
      </h1>
      <div className="hearts">
        {HEARTS.map(({ colorClass, src }, index) => (
          <Heart
            key={index}
            number={index + 1}
            colorClass={colorClass}
            src={src}
            used={slots.used[index]}
            restoring={slots.restoring[index]}
            slotRef={slotRef(index)}
            onRestored={() => finishRestoring(index)}
          />
        ))}
      </div>
    </>
  );
}
