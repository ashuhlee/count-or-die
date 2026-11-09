import titleImage from "@assets/ui/deco/title-placeholder.png";

import { useGame } from "../../../provider/useGame.ts";
import MeltInShader from "../../shaders/melt-in-shader/MeltInShader.tsx";

export default function StartMenuTitle() {
  const { ready, cameFromGame } = useGame();

  return (
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
  );
}
