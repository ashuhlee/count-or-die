import type { CSSProperties } from "react";

import sparkleTopRight from "@assets/ui/deco/sparkle-2.svg";
import sparkleBottomLeft from "@assets/ui/deco/sparkle-3.svg";
import titleImage from "@assets/ui/deco/title-placeholder.png";

import { useGame } from "../../../provider/useGame.ts";
import MeltInShader from "../../shaders/melt-in-shader/MeltInShader.tsx";

// the title melts in over this long, when it does
const MELT_IN = 1.85;

export default function StartMenuTitle() {
  const { ready, cameFromGame } = useGame();

  // the sparkles come in once the title is there
  const sparkleDelay = cameFromGame ? MELT_IN : 0.4;
  const sparkling = ready ? " menu-sparkle--on" : "";

  return (
    <div
      className="menu-title-wrap"
      style={{ "--sparkle-delay": `${sparkleDelay}s` } as CSSProperties}
    >
      <MeltInShader
        src={titleImage}
        alt="Count or Die"
        className="menu-title"
        active={ready}
        instant={!cameFromGame}
        delay={250}
        duration={1600}
        shadow={true}
        pixelScale={1.5}
      />
      {/* top right and bottom left, which twinkle by turns */}
      <img
        src={sparkleTopRight}
        alt=""
        aria-hidden="true"
        className={`menu-sparkle menu-sparkle--top-right${sparkling}`}
      />
      <img
        src={sparkleBottomLeft}
        alt=""
        aria-hidden="true"
        className={`menu-sparkle menu-sparkle--bottom-left${sparkling}`}
      />
    </div>
  );
}
