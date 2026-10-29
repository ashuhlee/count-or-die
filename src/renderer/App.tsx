import cloudTopLeft from "@assets/ui/deco/clouds/cloud_1.png";
import cloudBottomLeft from "@assets/ui/deco/clouds/cloud_2.png";
import cloudTopRight from "@assets/ui/deco/clouds/cloud_3.png";
import cloudBottomRight from "@assets/ui/deco/clouds/cloud_4.png";
import cloudMini from "@assets/ui/deco/clouds/cloud_5.png";

import { useKeyboardControls } from "./ui/hooks/useKeyboardControls.ts";
import CursorCounts from "./ui/components/cursor-counts/CursorCounts.tsx";
import HighScore from "./ui/components/high-score/HighScore.tsx";
import MenuBar from "./ui/components/menu-bar/MenuBar.tsx";
import PowerUps from "./ui/components/power-ups/PowerUps.tsx";
import SmokePopups from "./ui/components/smoke/SmokePopups.tsx";
import { GameProvider } from "./ui/provider/GameProvider.tsx";
import LoadingScreen from "./ui/overlays/loading/LoadingScreen.tsx";
import GameOver from "./ui/screens/game-over/GameOver.tsx";
import RedFlash from "./ui/screens/game-over/RedFlash.tsx";
import GameScreen from "./ui/screens/game/GameScreen.tsx";

export function Game() {
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
        {__APP_VERSION__}
      </p>

      <CursorCounts />
      <LoadingScreen />
      <PowerUps />
    </>
  );
}

export default function App() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}
