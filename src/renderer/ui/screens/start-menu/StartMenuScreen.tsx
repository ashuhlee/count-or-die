import { useEffect, useState, type CSSProperties } from "react";

import { pickMathFact, rememberMathFact } from "../../../game/mathFacts.ts";
import { useGame } from "../../../provider/useGame.ts";
import Letters from "../../components/text/letters/Letters.tsx";
import SkullFloor from "../../components/effects/skull-floor/SkullFloor.tsx";
import PixelButton from "../../components/buttons/pixel-button/PixelButton.tsx";
import GameOverBackground, {
  GAME_OVER_HUE,
} from "../game-over/GameOverBackground.tsx";
import FallingIcons from "./FallingIcons.tsx";
import StartMenuTitle from "./StartMenuTitle.tsx";

const BUTTONS_DELAY = 300;
const HUE_DURATION = 500;

const COLORS = {
  play: "#b0a1ff",
  report: "#FF85E3",
  quit: "#CDC8EA",
};

const FILL = "#ffffff";
const look = (color: string) => ({
  color: `color-mix(in srgb, ${color} 15%, ${FILL})`,
  outline: color,
  highlight: `color-mix(in srgb, ${color} 5%, ${FILL})`,
  shade: `color-mix(in srgb, ${color} 50%, ${FILL})`,
});

export default function StartMenuScreen() {
  const { actions, loading, ready } = useGame();

  // a new math fact for the skull to say, each time the menu is shown
  const [fact] = useState(() => pickMathFact());
  useEffect(() => rememberMathFact(fact), [fact]);

  const [buttonsIn, setButtonsIn] = useState(false);
  useEffect(() => {
    if (!ready) return;

    const timer = setTimeout(() => setButtonsIn(true), BUTTONS_DELAY);
    return () => clearTimeout(timer);
  }, [ready]);

  return (
    <div
      className={`menu-screen${ready ? " hue-in" : ""}${buttonsIn ? " buttons-in" : ""}`}
      id="menu-screen"
      style={
        {
          "--hue-start": `${GAME_OVER_HUE.start}deg`,
          "--hue-duration": `${HUE_DURATION}ms`,
        } as CSSProperties
      }
    >
      <GameOverBackground
        paused={false}
        visible={ready}
        hueDuration={HUE_DURATION}
      />
      <FallingIcons active={ready} />
      <SkullFloor entrance={ready ? "play" : "wait"} chat={fact} />
      <StartMenuTitle />
      <div className="menu-buttons">
        <PixelButton
          {...look(COLORS.play)}
          className="menu-btn"
          id="play-btn"
          shine
          shadeRows={2.5}
          onClick={loading.mounted ? undefined : actions.play}
        >
          <Letters text="Classic Mode" step={0.2} duration={3} />
        </PixelButton>
        <PixelButton
          {...look(COLORS.report)}
          className="menu-btn"
          id="report-bug-btn"
          shadeRows={2.5}
          onClick={actions.reportBug}
        >
          <Letters text="Report a bug" step={0.2} duration={3} />
        </PixelButton>
        <PixelButton
          {...look(COLORS.quit)}
          className="menu-btn"
          id="quit-game-btn"
          shadeRows={2.5}
          onClick={actions.quit}
        >
          <Letters text="Quit" step={0.2} duration={3} />
        </PixelButton>
      </div>
    </div>
  );
}
