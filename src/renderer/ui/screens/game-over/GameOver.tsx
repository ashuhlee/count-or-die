import type { CSSProperties } from "react";

import gameOverGif from "@assets/ui/deco/game_over.gif";

import questionPng from "@assets/ui/deco/question.png";
import exclamationPng from "@assets/ui/deco/exclamation.png";

import githubBtnSvg from "@assets/ui/svg/github-button.svg";
import ghostPng from "@assets/ui/deco/ghost.gif";
import skullTracker from "@assets/ui/deco/skull_grey.svg";
import starTracker from "@assets/ui/deco/star_grey.svg";
import redoTracker from "@assets/ui/deco/redo_grey.svg";
import trophyTracker from "@assets/ui/deco/trophy_grey.svg";
import tombstonePng from "@assets/ui/deco/tombstone.png";

import { useGame } from "../../../provider/useGame.ts";
import { formatCounter } from "../../../utils/text/formatCounter.ts";
import { openGithub } from "../../../utils/app/openGithub.ts";
import RoundButton from "../../components/buttons/round-button/RoundButton.tsx";
import PixelButton from "../../components/buttons/pixel-button/PixelButton.tsx";
import {
  BUTTON_LOOK,
  QUIT_COLORS,
  RESTART_COLORS,
} from "../../components/buttons/pixel-button/buttonLooks.ts";
import Tooltip from "../../overlays/tooltip/Tooltip.tsx";
import ChallengeNotice from "./ChallengeNotice.tsx";
import SkullFloor from "../../components/effects/skull-floor/SkullFloor.tsx";
import BulgeFilter from "../../components/effects/bulge/BulgeFilter.tsx";
import Letters from "../../components/text/letters/Letters.tsx";
import GameNotification from "../../overlays/game-notification/GameNotification.tsx";
import PixelPanel from "../../components/hud/pixel-panel/PixelPanel.tsx";
import BackToMenu from "./BackToMenu.tsx";
import MeltInShader, {
  type MeltColors,
} from "../../shaders/melt-in-shader/MeltInShader.tsx";
import GameOverBackground, { GAME_OVER_HUE } from "./GameOverBackground.tsx";
import { useGameOverView } from "./useGameOverView.ts";
import { useSpaceToRestart } from "./useSpaceToRestart.ts";

const TRACKER_BULGE = { id: "tracker-bulge", strength: 25, area: 6 };

const TRACKER_BORDERS = {
  score: "#bfb3ff",
  highScore: "#FFB9F0",
  deaths: "#E3E0EF",
};

const NOTIFICATION_COLORS = {
  blue: "#a6d7ff",
  purple: "#d0a4ff",
  pink: "#ffb9f0",
  grey: "#E3E0EF",
};

const NOTIFICATION_ENTRANCE = { step: 0.2 };
const TRACKER_ENTRANCE = {
  delay: 0.2,
  delayWithNotifications: 0.5,
  step: 0.16,
};

const trackerStyle = (index: number, delay: number): CSSProperties => ({
  animationDelay: `${delay + index * TRACKER_ENTRANCE.step}s`,
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
  const { state, actions } = useGame();

  const view = useGameOverView();
  useSpaceToRestart(view.visible);

  const rainbowClass = view.rainbow ? " rainbow-txt" : "";
  const trackerClass = `tracker-container${view.visible ? " bounce-in-right" : ""}`;
  const notifications =
    [view.newBest, view.newRank].filter(Boolean).length +
    view.challenges.length;
  const challengesFrom = [view.newBest, view.newRank].filter(Boolean).length;

  const trackerDelay = notifications
    ? TRACKER_ENTRANCE.delayWithNotifications
    : TRACKER_ENTRANCE.delay;

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
      <div className="controls bottom">
        <Tooltip text="Contribute" placement="cursor-left">
          <RoundButton
            variant={5}
            icon={githubBtnSvg}
            iconAlt="github icon"
            iconSize={30}
            id="game-over-github-btn"
            onClick={openGithub}
          />
        </Tooltip>
      </div>
      <div className="go-content">
        <div id="red-overlay"></div>
        <h2 className="you-died">
          <span className={`go-text-random${rainbowClass}`}>{view.phrase}</span>
        </h2>
        <BulgeFilter {...TRACKER_BULGE} />
        {notifications > 0 && (
          <div className="notices">
            {view.newBest && (
              <GameNotification
                icon={starTracker}
                iconAlt="star"
                text="new best score!"
                border={NOTIFICATION_COLORS.blue}
                visible={view.visible}
                id="new-best"
              />
            )}
            {view.newRank && (
              <GameNotification
                icon={trophyTracker}
                iconAlt="trophy"
                text={`new rank: ${view.newRank}`}
                border={NOTIFICATION_COLORS.purple}
                visible={view.visible}
                delay={NOTIFICATION_ENTRANCE.step}
                shine
                id="new-rank"
              />
            )}
            {view.challenges.map((label, index) => (
              <ChallengeNotice
                key={label}
                text={label}
                border={NOTIFICATION_COLORS.grey}
                visible={view.visible}
                delay={NOTIFICATION_ENTRANCE.step * (challengesFrom + index)}
                id={`challenge-${index}`}
              />
            ))}
          </div>
        )}
        <div className="top-right-info">
          <PixelPanel
            border={TRACKER_BORDERS.score}
            className={trackerClass}
            style={trackerStyle(0, trackerDelay)}
          >
            <img src={redoTracker} alt="score" className="tracker-icon" />
            <h2 className="tracker-value" id="score-tracker">
              <Letters text={view.score} step={0.4} duration={3} />
            </h2>
          </PixelPanel>
          <PixelPanel
            border={TRACKER_BORDERS.highScore}
            className={trackerClass}
            style={trackerStyle(1, trackerDelay)}
          >
            <img src={starTracker} alt="high score" className="tracker-icon" />
            <h2 className="tracker-value" id="high-score-tracker">
              <Letters
                text={formatCounter(state.highScore)}
                step={0.4}
                duration={3}
              />
            </h2>
          </PixelPanel>
          <PixelPanel
            border={TRACKER_BORDERS.deaths}
            className={trackerClass}
            style={trackerStyle(2, trackerDelay)}
          >
            <img src={skullTracker} alt="skull" className="tracker-icon" />
            <h2 className="tracker-value" id="death-tracker">
              <Letters
                text={String(state.deathCount)}
                step={0.4}
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
            <Letters text="play again?" step={0.3} duration={3} />
          </span>
        </h2>
        <div className="bottom-section">
          <div className="game-over-btns">
            <PixelButton
              {...BUTTON_LOOK}
              {...RESTART_COLORS}
              id="game-over-btn"
              className="wide-btn play-again-btn"
              aria-label="retry"
              onClick={actions.restartFromGameOver}
            >
              <Letters text="NEW RUN" step={0.1} height={1.5} duration={1} />
            </PixelButton>
            <PixelButton
              {...BUTTON_LOOK}
              {...QUIT_COLORS}
              id="quit-btn"
              className="wide-btn play-again-btn-2"
              aria-label="rage quit"
              onClick={actions.quit}
            >
              <Letters text="RAGE QUIT" step={0.1} height={1.5} duration={1} />
            </PixelButton>
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
