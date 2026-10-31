import { Fragment, useState } from "react";

import cloudTopLeft from "@assets/ui/deco/clouds/cloud_1.png";
import cloudBottomLeft from "@assets/ui/deco/clouds/cloud_2.png";
import cloudTopRight from "@assets/ui/deco/clouds/cloud_3.png";
import cloudBottomRight from "@assets/ui/deco/clouds/cloud_4.png";
import cloudMini from "@assets/ui/deco/clouds/cloud_5.png";

import { useKeyboardControls } from "../hooks/useKeyboardControls.ts";
import { useGameEvent } from "../provider/useGameEvent.ts";
import MeltInDebug, { isMeltDebug } from "./debug/MeltInDebug.tsx";
import CursorCounts from "./components/cursor-counts/CursorCounts.tsx";
import HighScore from "./components/high-score/HighScore.tsx";
import MenuBar from "./components/menu-bar/MenuBar.tsx";
import PowerUps from "./components/power-ups/PowerUps.tsx";
import SmokePopups from "./components/smoke/SmokePopups.tsx";
import CRTShader from "./shaders/crt-shader/CRTShader.tsx";
import LoadingScreen from "./overlays/loading/LoadingScreen.tsx";
import GameOver from "./screens/game-over/GameOver.tsx";
import RedFlash from "./screens/game-over/RedFlash.tsx";
import GameScreen from "./screens/game/GameScreen.tsx";

export default function Game() {
  useKeyboardControls();
  const [page, setPage] = useState(0);
  useGameEvent("pageReset", () => setPage((current) => current + 1));

  return (
    <>
      <CRTShader
        scanlineIntensity={0.03}
        scanlineCount={256}
        adaptiveIntensity={0.13}
        brightness={1}
        saturation={1}
        vignetteStrength={0.02}
        curvature={0.03}
        edgeBlur={6}
        bezel={0}
        flickerStrength={0}
        maxDevicePixelRatio={1}
      />

      <Fragment key={page}>
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
        <PowerUps />
      </Fragment>
      <LoadingScreen />
      {isMeltDebug() && <MeltInDebug />}
    </>
  );
}
