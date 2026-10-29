import cloudTopLeft from "@assets/ui/deco/clouds/cloud_1.png";
import cloudBottomLeft from "@assets/ui/deco/clouds/cloud_2.png";
import cloudTopRight from "@assets/ui/deco/clouds/cloud_3.png";
import cloudBottomRight from "@assets/ui/deco/clouds/cloud_4.png";
import cloudMini from "@assets/ui/deco/clouds/cloud_5.png";

import { useKeyboardControls } from "./hooks/useKeyboardControls.ts";
import CursorCounts from "./components/cursor-counts/CursorCounts.tsx";
import HighScore from "./components/high-score/HighScore.tsx";
import MenuBar from "./components/menu-bar/MenuBar.tsx";
import PowerUps from "./components/power-ups/PowerUps.tsx";
import SmokePopups from "./components/smoke/SmokePopups.tsx";
import LoadingScreen from "./overlays/loading/LoadingScreen.tsx";
import GameOver from "./screens/game-over/GameOver.tsx";
import RedFlash from "./screens/game-over/RedFlash.tsx";
import GameScreen from "./screens/game/GameScreen.tsx";

export default function Game() {
  useKeyboardControls();

  return (
    <>
      <div className="scanlines"></div>
      <div className="scanlines-bg"></div>
      <div className="top-gradient"></div>

      <div className="clouds">
        <img className="cloud-t-left" alt="cloud" src={cloudTopLeft} />
        <img className="cloud-b-left" alt="cloud" src={cloudBottomLeft} />
        <img className="cloud-mini" alt="cloud" src={cloudMini} />
        <img className="cloud-t-right" alt="cloud" src={cloudTopRight} />
        <img className="cloud-b-right" alt="cloud" src={cloudBottomRight} />
      </div>

      <SmokePopups />

      <MenuBar />

      <RedFlash />
      <GameOver />

      <div className="app" id="app">
        <GameScreen />
      </div>
      <HighScore />
      <p id="app-ver" className="app-ver">
        {__APP_VERSION__}-beta
      </p>

      <CursorCounts />
      <LoadingScreen />
      <PowerUps />
    </>
  );
}
