import skullImg from "@assets/ui/deco/skull_gradient.png";

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
          <img src={skullImg} className="loading-skull" alt="skull" />
        </div>
      </div>
    </div>
  );
}
