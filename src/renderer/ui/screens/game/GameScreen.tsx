import type { MouseEvent } from "react";

import decreaseBtn from "@assets/ui/buttons/decrease.png";
import decreaseBtnPress from "@assets/ui/buttons/decrease-press.png";
import increaseBtn from "@assets/ui/buttons/increase.png";
import increaseBtnPress from "@assets/ui/buttons/increase-press.png";

import Counter from "../../components/gameplay/counter/Counter.tsx";
import GoalBox from "../../components/gameplay/goal/GoalBox.tsx";
import Hearts from "../../components/gameplay/hearts/Hearts.tsx";
import Letters from "../../components/text/letters/Letters.tsx";
import PressButton from "../../components/buttons/press-button/PressButton.tsx";
import PixelButton from "../../components/buttons/pixel-button/PixelButton.tsx";
import {
  BUTTON_LOOK,
  RESTART_COLORS,
} from "../../components/buttons/pixel-button/buttonLooks.ts";
import ProgressBar from "../../components/gameplay/progress-bar/ProgressBar.tsx";
import { useGame } from "../../../provider/useGame.ts";
import { useGameEvent } from "../../../provider/useGameEvent.ts";
import { useReplayAnimation } from "../../../hooks/useReplayAnimation.ts";
import { useState } from "react";

const pointerOf = (event: MouseEvent) => ({
  x: event.clientX,
  y: event.clientY,
});

export default function GameScreen() {
  const { state, actions } = useGame();

  const [screenRef, shake] =
    useReplayAnimation<HTMLDivElement>("penalty-shake");
  useGameEvent("penalty", shake);

  const [titleRef, popTitle] =
    useReplayAnimation<HTMLSpanElement>("game-name-pop");
  useGameEvent("powerUpPicked", popTitle);

  const [run, setRun] = useState(0);
  useGameEvent("restarted", () => setRun((current) => current + 1));

  return (
    <div
      id="game-container"
      ref={screenRef}
      className={state.isGameOver ? "game-ended" : undefined}
    >
      <div className="goal-chatbox" id="goal-chatbox">
        <GoalBox />
      </div>

      <div className="progress">
        <ProgressBar />
      </div>
      <h1 className="title">
        <span className="game-name" ref={titleRef}>
          <Letters text="count or die" step={0.1} />
        </span>
      </h1>

      <div className="counter-container">
        <Counter />
      </div>
      <div className="boost-stuff">
        <Hearts key={run} />
      </div>

      <div className="buttons">
        <div id="decrease-button">
          <PressButton
            button="decrease"
            id="decrease-img"
            alt="boost-reg"
            normal={decreaseBtn}
            pressed={decreaseBtnPress}
            onClick={(event) => actions.boost(pointerOf(event))}
          />
        </div>
        <div id="increase-button">
          <PressButton
            button="increase"
            id="increase-img"
            alt="increase-reg"
            normal={increaseBtn}
            pressed={increaseBtnPress}
            onClick={(event) => actions.increase(pointerOf(event))}
          />
        </div>
      </div>

      <div className="reset" id="reset">
        <PixelButton
          {...BUTTON_LOOK}
          {...RESTART_COLORS}
          id="reset-img"
          className="wide-btn"
          aria-label="restart"
          onClick={actions.reset}
        >
          <Letters text="RESTART" step={0.1} height={0.7} duration={1} />
        </PixelButton>
      </div>
    </div>
  );
}
