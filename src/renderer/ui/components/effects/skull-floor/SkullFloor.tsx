import type { CSSProperties } from "react";

import skullFloor from "@assets/ui/deco/skull_floor.png";

type SkullFloorProps = {
  entrance?: "wait" | "play";
};

export default function SkullFloor({ entrance }: SkullFloorProps) {
  return (
    <img
      src={skullFloor}
      alt="skull"
      className={`skull-floor${entrance ? " bounce-in-down-rotated" : ""}`}
      style={
        entrance
          ? ({
              animationPlayState: entrance === "play" ? "running" : "paused",
            } as CSSProperties)
          : undefined
      }
    />
  );
}
