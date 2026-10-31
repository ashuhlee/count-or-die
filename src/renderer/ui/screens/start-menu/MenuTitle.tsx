import titleImage from "@assets/ui/deco/title-placeholder.png";

import { useGame } from "../../../provider/useGame.ts";
import MeltInShader from "../../shaders/melt-in-shader/MeltInShader.tsx";

export default function MenuTitle() {
  const { ready } = useGame();

  return (
    <MeltInShader
      src={titleImage}
      alt="Count or Die"
      className="menu-title"
      active={ready}
      delay={100}
      duration={1700}
      shadow={true}
      pixelScale={2}
    />
  );
}
