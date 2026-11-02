import skullImg from "@assets/ui/deco/skull_grey.svg";

import type { CSSProperties } from "react";

import { useGame } from "../../../provider/useGame.ts";

export default function LoadingScreen() {
  const { loading } = useGame();
  const { mounted, visible, hiding } = loading;

  if (!mounted) return null;

  return (
    <div
      id="loading-screen"
      className={`loading-screen${visible ? " visible" : ""}${hiding ? " hiding" : ""}`}
    >
      <div className="loading-content">
        <div className="diamond-outline" id="diamond-outline"></div>
        <div className="diamond-wrapper" id="diamond-wrapper">
          <div className="diamond" id="diamond"></div>
          {/* only the shape of the skull is used, its color is in the style sheet */}
          <span
            className="loading-skull"
            role="img"
            aria-label="skull"
            style={{ "--skull": `url("${skullImg}")` } as CSSProperties}
          />
        </div>
      </div>
    </div>
  );
}
