import type { MouseEvent } from "react";

import chatTip from "@assets/ui/svg/chat-tip.svg";

import decreaseBtn from "@assets/ui/buttons/decrease.png";
import decreaseBtnPress from "@assets/ui/buttons/decrease-press.png";
import increaseBtn from "@assets/ui/buttons/increase.png";
import increaseBtnPress from "@assets/ui/buttons/increase-press.png";
import resetBtn from "@assets/ui/buttons/reset-btn.png";

import Counter from "../../components/counter/Counter.tsx";
import GoalBox from "../../components/goal/GoalBox.tsx";
import Hearts from "../../components/hearts/Hearts.tsx";
import Letters from "../../components/letters/Letters.tsx";
import PressButton from "../../components/buttons/PressButton.tsx";
import ProgressBar from "../../components/progress-bar/ProgressBar.tsx";
import { useGame } from "../../../provider/useGame.ts";
import { useGameEvent } from "../../../provider/useGameEvent.ts";
import { useReplayAnimation } from "../../../hooks/useReplayAnimation.ts";
import { useState } from "react";

const pointerOf = (event: MouseEvent) => ({
  x: event.clientX,
  y: event.clientY,
});

export default function GameScreen() {
  const { actions } = useGame();

  // the whole screen shakes when a bad power-up is collected
  const [screenRef, shake] =
    useReplayAnimation<HTMLDivElement>("penalty-shake");
  useGameEvent("penalty", shake);

  // a new game starts the hearts from scratch
  const [run, setRun] = useState(0);
  useGameEvent("restarted", () => setRun((current) => current + 1));

  // the "boost!" text floats up; a new key remounts it to replay that
  const [boostNotification, setBoostNotification] = useState(0);
  useGameEvent("boostNotification", () =>
    setBoostNotification((current) => current + 1),
  );

  return (
    <div id="game-container" ref={screenRef}>
      <div className="goal-chatbox" id="goal-chatbox">
        <div className="notifications">
          <span
            id="boost-notif-text"
            className={`boost-notif-text${boostNotification > 0 ? " boost-notification" : ""}`}
            key={boostNotification}
          >
            boost!
          </span>
        </div>

        <GoalBox />
        <img src={chatTip} className="chat-tip" alt="chat tip" />
      </div>

      <div className="progress">
        <ProgressBar />
      </div>
      <h1 className="title">
        <span className="game-name">
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
        {/* boost button */}
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
        {/* increment button */}
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
        <img
          src={resetBtn}
          id="reset-img"
          className="btn-hover"
          alt="increase-reg"
          onClick={actions.reset}
        />
      </div>
    </div>
  );
}
