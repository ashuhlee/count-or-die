import { useEffect, useState } from "react";

import { useGame } from "../../../provider/useGame.ts";
import PixelButton from "../../components/pixel-button/PixelButton.tsx";
import MenuBackground from "./MenuBackground.tsx";
import MenuTitle from "./MenuTitle.tsx";

export const BUTTONS_DELAY = 400;

const COLORS = { play: "#b0a1ff", report: "#FF85E3", quit: "#CDC8EA" };

const FILL = "#ffffff";
const look = (color: string) => ({
  color: `color-mix(in srgb, ${color} 17%, ${FILL})`,
  outline: color,
  highlight: `color-mix(in srgb, ${color} 5%, ${FILL})`,
  shade: `color-mix(in srgb, ${color} 45%, ${FILL})`,
});

export default function MenuScreen() {
  const { actions, loading, ready } = useGame();

  const [buttonsIn, setButtonsIn] = useState(false);
  useEffect(() => {
    if (!ready) return;

    const timer = setTimeout(() => setButtonsIn(true), BUTTONS_DELAY);
    return () => clearTimeout(timer);
  }, [ready]);

  return (
    <div
      className={`menu-screen${buttonsIn ? " buttons-in" : ""}`}
      id="menu-screen"
    >
      <MenuBackground />
      <MenuTitle />
      <div className="menu-buttons">
        <PixelButton
          {...look(COLORS.play)}
          className="menu-btn"
          id="play-btn"
          shadeRows={2.5}
          onClick={loading.mounted ? undefined : actions.play}
        >
          Play game
        </PixelButton>
        <PixelButton
          {...look(COLORS.report)}
          className="menu-btn"
          id="report-bug-btn"
          shadeRows={2.5}
          onClick={actions.reportBug}
        >
          Report a bug
        </PixelButton>
        <PixelButton
          {...look(COLORS.quit)}
          className="menu-btn"
          id="quit-game-btn"
          shadeRows={2.5}
          onClick={actions.quit}
        >
          Quit
        </PixelButton>
      </div>
    </div>
  );
}
