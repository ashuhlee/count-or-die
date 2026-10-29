import chatTip from "@assets/ui/svg/chat-tip.svg";

import decreaseBtn from "@assets/ui/buttons/decrease.png";
import increaseBtn from "@assets/ui/buttons/increase.png";
import resetBtn from "@assets/ui/buttons/reset-btn.png";

import Counter from "./Counter.tsx";
import GoalBox from "./GoalBox.tsx";
import Hearts from "./Hearts.tsx";
import Letters from "./Letters.tsx";
import ProgressBar from "./ProgressBar.tsx";

// The click handlers for the buttons are still attached by app.ts (by id).
// Playing animations on #game-container and #boost-notif-text is also still
// done by hand, so neither gets a className prop.
export default function GameScreen() {
  return (
    <div id="game-container">
      <div className="goal-chatbox" id="goal-chatbox">
        <div className="notifications">
          <span id="boost-notif-text" className="boost-notif-text">
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
        <Hearts />
      </div>

      <div className="buttons">
        {/* boost button */}
        <div id="decrease-button">
          <img src={decreaseBtn} id="decrease-img" alt="boost-reg" />
        </div>
        {/* increment button */}
        <div id="increase-button">
          <img src={increaseBtn} id="increase-img" alt="increase-reg" />
        </div>
      </div>

      <div className="reset" id="reset">
        <img
          src={resetBtn}
          id="reset-img"
          className="btn-hover"
          alt="increase-reg"
        />
      </div>
    </div>
  );
}
