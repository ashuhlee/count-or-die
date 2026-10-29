import cloudTopLeft from "@assets/ui/deco/clouds/cloud_1.png";
import cloudBottomLeft from "@assets/ui/deco/clouds/cloud_2.png";
import cloudTopRight from "@assets/ui/deco/clouds/cloud_3.png";
import cloudBottomRight from "@assets/ui/deco/clouds/cloud_4.png";
import cloudMini from "@assets/ui/deco/clouds/cloud_5.png";

import Controls from "./Controls.tsx";
import CursorCounts from "./CursorCounts.tsx";
import GameOver from "./GameOver.tsx";
import GameScreen from "./GameScreen.tsx";
import HighScore from "./HighScore.tsx";
import LoadingScreen from "./LoadingScreen.tsx";
import PowerUps from "./PowerUps.tsx";
import RedFlash from "./RedFlash.tsx";
import SmokePopups from "./SmokePopups.tsx";
import useKeyboardControls from "./useKeyboardControls.ts";

// The whole page. A few animations are still replayed by hand on elements
// found by id (see playAnimation), so those ids stay put.
export default function App() {
  useKeyboardControls();

  return (
    <>
      {/* vfx */}
      <div className="scanlines"></div>
      <div className="scanlines-bg"></div>
      <div className="top-gradient"></div>

      {/* clouds */}
      <div className="clouds">
        <img className="cloud-t-left" alt="cloud" src={cloudTopLeft} />
        <img className="cloud-b-left" alt="cloud" src={cloudBottomLeft} />
        <img className="cloud-mini" alt="cloud" src={cloudMini} />
        <img className="cloud-t-right" alt="cloud" src={cloudTopRight} />
        <img className="cloud-b-right" alt="cloud" src={cloudBottomRight} />
      </div>

      <SmokePopups />

      <Controls />

      <RedFlash />
      <GameOver />

      <div className="app" id="app">
        <GameScreen />
      </div>
      <HighScore />
      <p id="app-ver" className="app-ver">
        {__APP_VERSION__}
      </p>

      {/* these position themselves with fixed positioning */}
      <CursorCounts />
      <LoadingScreen />
      <PowerUps />
    </>
  );
}
