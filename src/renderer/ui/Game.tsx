import { Fragment, useEffect, useState } from "react";

import cloudTopLeft from "@assets/ui/deco/clouds/cloud_1.png";
import cloudBottomLeft from "@assets/ui/deco/clouds/cloud_2.png";
import cloudTopRight from "@assets/ui/deco/clouds/cloud_3.png";
import cloudBottomRight from "@assets/ui/deco/clouds/cloud_4.png";
import cloudMini from "@assets/ui/deco/clouds/cloud_5.png";

import { useKeyboardControls } from "../hooks/useKeyboardControls.ts";
import { useGame } from "../provider/useGame.ts";
import { useGameEvent } from "../provider/useGameEvent.ts";
import AlertPopup from "./overlays/alert-popup/AlertPopup.tsx";
import { useFadeOut } from "./overlays/alert-popup/useFadeOut.ts";
import CursorCounts from "./components/effects/cursor-counts/CursorCounts.tsx";
import HighScore from "./components/gameplay/high-score/HighScore.tsx";
import FpsCounter from "./components/hud/fps-counter/FpsCounter.tsx";
import MenuBar from "./components/hud/menu-bar/MenuBar.tsx";
import PowerUps from "./components/gameplay/power-ups/PowerUps.tsx";
import PowerUpNotices from "./components/gameplay/power-ups/PowerUpNotices.tsx";
import SmokePopups from "./components/effects/smoke/SmokePopups.tsx";
import CRTShader from "./shaders/crt-shader/CRTShader.tsx";
import LoadingScreen from "./overlays/loading/LoadingScreen.tsx";
import GameOver from "./screens/game-over/GameOver.tsx";
import RedFlash from "./screens/game-over/RedFlash.tsx";
import GameScreen from "./screens/game/GameScreen.tsx";
import StartMenuScreen from "./screens/start-menu/StartMenuScreen.tsx";

const HOW_TO_PLAY = [
  "Reach the goal before the timer runs out.",
  "Click *+* or *D* arrow key to count. Boosts *(space)* jump straight to the goal.",
].join("\n");

export default function Game() {
  useKeyboardControls();
  const { state, screen, ready, actions, loading } = useGame();
  const [page, setPage] = useState(0);
  useGameEvent("pageReset", () => setPage((current) => current + 1));

  const [endingRun, setEndingRun] = useState(false);
  useGameEvent("gameOver", () => setEndingRun(false));
  useGameEvent("restarted", () => setEndingRun(false));
  const asking = endingRun && screen === "game";

  const [helpOpen, setHelpOpen] = useState(false);
  const helping = helpOpen && screen === "menu";

  const { pause, resume } = actions;
  useEffect(() => {
    if (!asking && !helping) return;
    pause();
    return resume;
  }, [asking, helping, pause, resume]);

  const popupShown = useFadeOut(asking, 300);
  const helpShown = useFadeOut(helping, 300);

  return (
    <>
      <CRTShader
        scanlineIntensity={0.03}
        scanlineCount={256}
        adaptiveIntensity={0.13}
        brightness={1.02}
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

        <MenuBar
          entrance={screen === "menu" ? (ready ? "play" : "wait") : undefined}
          inGame={screen === "game"}
          onHelp={() => setHelpOpen(true)}
          onHome={
            screen === "game"
              ? () => {
                  if (loading.mounted) return;
                  if (state.counter === 0) actions.backToMenu();
                  else setEndingRun(true);
                }
              : undefined
          }
        />

        {screen === "menu" ? (
          <StartMenuScreen />
        ) : (
          <>
            <SmokePopups />
            <RedFlash />
            <GameOver />

            <div className="app" id="app">
              <GameScreen />
            </div>
            {/*<HighScore />*/}

            <CursorCounts />
            <PowerUps />
            <PowerUpNotices />
          </>
        )}
        <p id="app-ver" className="app-ver">
          {__APP_VERSION__}
        </p>
      </Fragment>
      {popupShown && (
        <AlertPopup
          size="small"
          leaving={!asking}
          text={
            "Are you sure you want to end this run?\nYour score will be saved."
          }
          border="#bfb3ff"
          onYes={() => {
            setEndingRun(false);
            actions.backToMenu();
          }}
          onNo={() => setEndingRun(false)}
        />
      )}
      {helpShown && (
        <AlertPopup
          size="regular"
          leaving={!helping}
          title="How to play"
          text={HOW_TO_PLAY}
          border="#bfb3ff"
          onNo={() => setHelpOpen(false)}
        />
      )}
      {(screen === "menu" || !state.isGameOver) && <FpsCounter />}
      <LoadingScreen />
    </>
  );
}
