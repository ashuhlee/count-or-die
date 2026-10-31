import { useGame } from "../../../provider/useGame.ts";
import PixelButton from "../../components/pixel-button/PixelButton.tsx";
import MenuBackground from "./MenuBackground.tsx";

const COLORS = { play: "#b0a1ff", report: "#FF85E3", quit: "#CDC8EA" };

const FILL = "#FCEEFB";
const look = (color: string) => ({
  color: FILL,
  outline: color,
  highlight: `color-mix(in srgb, ${color} 10%, ${FILL})`,
  shade: `color-mix(in srgb, ${color} 30%, ${FILL})`,
});

export default function MenuScreen() {
  const { actions, loading, ready } = useGame();

  return (
    <div className={`menu-screen${ready ? " ready" : ""}`} id="menu-screen">
      <MenuBackground />
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
