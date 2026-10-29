import { useRef, useState } from "react";

import gameOverGif from "@assets/ui/deco/game_over.gif";

import questionPng from "@assets/ui/deco/question.png";
import exclamationPng from "@assets/ui/deco/exclamation.png";

import ghostPng from "@assets/ui/deco/ghost.gif";
import skullFloor from "@assets/ui/deco/skull_floor.png";
import skullTracker from "@assets/ui/deco/skull_grey.png";
import tombstonePng from "@assets/ui/deco/tombstone.png";

import resetBtnPng from "@assets/ui/buttons/reset-btn.png";
import quitBtnPng from "@assets/ui/buttons/quit-btn.png";

import { playSound } from "../../../controls/audioHandler.ts";
import { pickGameOverPhrase } from "../../../game/phrases.ts";
import { formatCounter } from "../../formatCounter.ts";
import { useGame } from "../../GameProvider.tsx";
import { useGameEvent } from "../../gameEvents.ts";

const MENU_DELAY = 500;
const QUIT_DELAY = 400;

// "back to menu" tilts the opposite way each time it is hovered
function BackToMenu() {
  const [tilt, setTilt] = useState<"left" | "right" | null>(null);
  const nextTilt = useRef<"left" | "right">("left");

  function onClick() {
    playSound("buttonClick");
    setTimeout(
      () => alert("Oops! The menu is not available in the beta."),
      MENU_DELAY,
    );
  }

  return (
    <h2
      className="back-to-menu underline left"
      id="menu-btn"
      onClick={onClick}
      onMouseEnter={() => setTilt(nextTilt.current)}
      onMouseLeave={() => {
        nextTilt.current = nextTilt.current === "left" ? "right" : "left";
        setTilt(null);
      }}
      style={
        tilt
          ? ({
              transform: `scale(1.15) rotate(${tilt === "left" ? "-4deg" : "4deg"})`,
              "--arr-color": tilt === "left" ? "#FBB6FF" : "#FFDEB6",
            } as React.CSSProperties)
          : undefined
      }
    >
      back to menu
    </h2>
  );
}

function onQuit() {
  playSound("buttonClick");

  if (window.electron) {
    setTimeout(window.electron.quitApp, QUIT_DELAY);
  } else {
    alert("Thank you for playing!");
  }
}

export default function GameOver() {
  const { state, actions } = useGame();

  const [view, setView] = useState({
    visible: false,
    phrase: "you died lolz",
    rainbow: false,
    scoreText: "score: 0",
  });
  // game over appears once the red flash has played, unless the game was
  // restarted in the meantime
  const waitingForFlash = useRef(false);

  useGameEvent("gameOver", ({ isHighScore, score }) => {
    waitingForFlash.current = true;
    setView((current) => ({
      ...current,
      phrase: pickGameOverPhrase(isHighScore, Math.random()),
      rainbow: current.rainbow || isHighScore,
      scoreText: `Score: ${formatCounter(score)}`,
    }));
  });

  useGameEvent("flashEnded", () => {
    if (!waitingForFlash.current) return;

    waitingForFlash.current = false;
    setView((current) => ({ ...current, visible: true }));
  });

  useGameEvent("restarted", () => {
    waitingForFlash.current = false;
    setView((current) => ({
      ...current,
      visible: false,
      rainbow: false,
      phrase: pickGameOverPhrase(false, Math.random()),
    }));
  });

  const rainbowClass = view.rainbow ? " rainbow-txt" : "";

  return (
    <div id="game-over" className={view.visible ? "visible" : undefined}>
      <div className="go-content">
        <div id="red-overlay"></div>
        <h2 className="you-died" id="dead-text">
          <span className={`go-text-random${rainbowClass}`}>{view.phrase}</span>
        </h2>
        <div className="top-right-info">
          <div className="tracker-container">
            <img src={skullTracker} alt="skull" className="skull-tracker" />
            <h2 className="death-tracker" id="death-tracker">
              {state.deathCount}
            </h2>
          </div>
        </div>
        <div className="deco-icons">
          <img src={questionPng} alt="question mark" className="question" />
          <img src={exclamationPng} alt="exclamation mark" className="excl" />
        </div>

        <img src={gameOverGif} alt="game over text" className="go-title" />

        <h2 className="final-score" id="final-score">
          <span className={`score-text${rainbowClass}`}>{view.scoreText}</span>
        </h2>

        <h2 className="play-again">
          <span className="try-again">try again ?</span>
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
              onClick={onQuit}
            />
          </div>
          <div className="menu-anim">
            <BackToMenu />
          </div>
        </div>

        <div className="bg"></div>
      </div>
      <div className="skull-area">
        <img src={skullFloor} alt="skull" className="skull-floor" />
      </div>
      <div className="tombstone-area">
        <img src={ghostPng} alt="ghost" className="ghost" />
        <img src={tombstonePng} alt="tombstone" className="tombstone" />
      </div>
    </div>
  );
}
