import heartPink from "@assets/ui/deco/px_heart_pink.png";
import heartPurple from "@assets/ui/deco/px_heart_purple.png";
import heartBlue from "@assets/ui/deco/px_heart_blue.png";
import heartWhite from "@assets/ui/deco/px_heart_white.png";

import { useReplayAnimation } from "../../../../hooks/useReplayAnimation.ts";
import { useGame } from "../../../../provider/useGame.ts";
import { useGameEvent } from "../../../../provider/useGameEvent.ts";
import Letters from "../../text/letters/Letters.tsx";
import Heart, { type HeartMelt } from "./Heart.tsx";
import { useHeartSlots } from "./useHeartSlots.ts";

const HEARTS: {
  colorClass: string;
  src: string;
  shine: string; // the color of the shine that sweeps over it
  melt?: HeartMelt;
}[] = [
  { colorClass: "heart-pink", src: heartPink, shine: "#ffa6d7", melt: {} },
  { colorClass: "heart-purple", src: heartPurple, shine: "#bda9ff", melt: {} },
  { colorClass: "heart-blue", src: heartBlue, shine: "#a4d0ff", melt: {} },
  { colorClass: "heart-white", src: heartWhite, shine: "#d4dbff", melt: {} },
];

export default function Hearts() {
  const { state } = useGame();
  const { slots, slotRef, finishRestoring } = useHeartSlots();

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
        {HEARTS.map(({ colorClass, src, shine, melt }, index) => (
          <Heart
            key={index}
            number={index + 1}
            colorClass={colorClass}
            src={src}
            shine={shine}
            used={slots.used[index]}
            restoring={slots.restoring[index]}
            melt={melt}
            slotRef={slotRef(index)}
            onRestored={() => finishRestoring(index)}
          />
        ))}
      </div>
    </>
  );
}
