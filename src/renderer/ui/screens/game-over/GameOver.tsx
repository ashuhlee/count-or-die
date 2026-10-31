import type { CSSProperties } from "react";

import gameOverGif from "@assets/ui/deco/game_over.gif";

import questionPng from "@assets/ui/deco/question.png";
import exclamationPng from "@assets/ui/deco/exclamation.png";

import homeBtnSvg from "@assets/ui/svg/home-button.svg";
import ghostPng from "@assets/ui/deco/ghost.gif";
import skullTracker from "@assets/ui/deco/skull_grey.svg";
import starTracker from "@assets/ui/deco/star_grey.svg";
import trophyTracker from "@assets/ui/deco/trophy_grey.svg";
import tombstonePng from "@assets/ui/deco/tombstone.png";

import resetBtnPng from "@assets/ui/buttons/reset-btn.png";
import quitBtnPng from "@assets/ui/buttons/quit-btn.png";

import { useGame } from "../../../provider/useGame.ts";
import { formatCounter } from "../../../utils/formatCounter.ts";
import RoundButton from "../../components/round-button/RoundButton.tsx";
import SkullFloor from "../../components/skull-floor/SkullFloor.tsx";
import BulgeFilter from "../../components/bulge/BulgeFilter.tsx";
import Letters from "../../components/letters/Letters.tsx";
import PixelPanel from "../../components/pixel-panel/PixelPanel.tsx";
import BackToMenu from "./BackToMenu.tsx";
import MeltInShader, {
  type MeltColors,
} from "../../shaders/melt-in-shader/MeltInShader.tsx";
import GameOverBackground, { GAME_OVER_HUE } from "./GameOverBackground.tsx";
import { useGameOverView } from "./useGameOverView.ts";

const TRACKER_BULGE = { id: "tracker-bulge", strength: 25, area: 6 };

const TRACKER_BORDERS = {
  score: "#bfb3ff",
  highScore: "#FFB9F0",
  deaths: "#E3E0EF",
};

const TRACKER_ENTRANCE = { delay: 0.3, step: 0.16 };

const trackerStyle = (index: number): CSSProperties => ({
  animationDelay: `${TRACKER_ENTRANCE.delay + index * TRACKER_ENTRANCE.step}s`,
});

const GHOST_COLORS: MeltColors = {
  edge: "#605B84",
  flash: "#ffffff",
  ember: "#9875ff",
  cinder: "#ff8ae0",
  sparkA: "#ff8ae0",
  sparkB: "#605B84",
  shadow: "#ce2a85",
};

export default function GameOver() {
  const { state, actions, loading } = useGame();

  const view = useGameOverView();

  const rainbowClass = view.rainbow ? " rainbow-txt" : "";
  const trackerClass = `tracker-container${view.visible ? " bounce-in-right" : ""}`;

  return (
    <div
      id="game-over"
      className={view.visible ? "visible" : undefined}
      style={
        {
          "--hue-start": `${GAME_OVER_HUE.start}deg`,
          "--hue-duration": `${GAME_OVER_HUE.duration}ms`,
        } as CSSProperties
      }
    >
      <GameOverBackground paused={!view.background} visible={view.visible} />
      <div className="controls left">
        <RoundButton
          variant={5}
          icon={homeBtnSvg}
          iconAlt="home icon"
          id="game-over-home-btn"
          onClick={() => loading.mounted || actions.backToMenu()}
        />
      </div>
      <div className="go-content">
        <div id="red-overlay"></div>
        <h2 className="you-died">
          <span className={`go-text-random${rainbowClass}`}>{view.phrase}</span>
        </h2>
        <BulgeFilter {...TRACKER_BULGE} />
        <div className="top-right-info">
          <PixelPanel
            border={TRACKER_BORDERS.score}
            className={trackerClass}
            style={trackerStyle(0)}
          >
            <img src={starTracker} alt="score" className="tracker-icon" />
            <h2 className="tracker-value" id="score-tracker">
              <Letters text={view.score} step={0.2} duration={20} />
            </h2>
          </PixelPanel>
          <PixelPanel
            border={TRACKER_BORDERS.highScore}
            className={trackerClass}
            style={trackerStyle(1)}
          >
            <img
              src={trophyTracker}
              alt="high score"
              className="tracker-icon"
            />
            <h2 className="tracker-value" id="high-score-tracker">
              <Letters
                text={formatCounter(state.highScore)}
                step={0.3}
                duration={3}
              />
            </h2>
          </PixelPanel>
          <PixelPanel
            border={TRACKER_BORDERS.deaths}
            className={trackerClass}
            style={trackerStyle(2)}
          >
            <img src={skullTracker} alt="skull" className="tracker-icon" />
            <h2 className="tracker-value" id="death-tracker">
              <Letters
                text={String(state.deathCount)}
                step={0.3}
                duration={3}
              />
            </h2>
          </PixelPanel>
        </div>
        <div className="deco-icons">
          <img src={questionPng} alt="question mark" className="question" />
          <img src={exclamationPng} alt="exclamation mark" className="excl" />
        </div>

        <MeltInShader
          src={gameOverGif}
          alt="game over text"
          className="go-title"
          active={view.visible}
          delay={300}
          duration={1850}
        />

        <h2 className="play-again">
          <span className="try-again">
            <Letters text="try again?" step={0.3} duration={3} />
          </span>
        </h2>
        <div className="bottom-section">
          <div className="game-over-btns">
            <img
              src={resetBtnPng}
              id="game-over-btn"
              className="play-again-btn btn-hover"
              alt="game over reset button"
              onClick={actions.restartFromGameOver}
            />
            <img
              src={quitBtnPng}
              id="quit-btn"
              className="play-again-btn-2 btn-hover"
              alt="rage quit button"
              onClick={actions.quit}
            />
          </div>
          <div className="menu-anim">
            <BackToMenu />
          </div>
        </div>

        <div className="bg"></div>
      </div>
      <div className="skull-area">
        <SkullFloor />
      </div>
      <div className="tombstone-area">
        <div className="ghost">
          <MeltInShader
            src={ghostPng}
            alt="ghost"
            active={view.visible}
            delay={500}
            duration={1800}
            pixelScale={2.5}
            shadow={false}
            settledBrightness={1}
            colors={GHOST_COLORS}
          />
        </div>
        <img src={tombstonePng} alt="tombstone" className="tombstone" />
      </div>
    </div>
  );
}
