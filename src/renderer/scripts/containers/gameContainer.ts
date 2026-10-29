import chatTip from "@assets/ui/svg/chat-tip.svg";

import decreaseBtn from "@assets/ui/buttons/decrease.png";
import increaseBtn from "@assets/ui/buttons/increase.png";
import resetBtn from "@assets/ui/buttons/reset-btn.png";

export default function renderGame() {
  const app = document.getElementById("app") as HTMLDivElement;

  app.innerHTML = `
	<div id="game-container">
		<div class="goal-chatbox" id="goal-chatbox">
			<div class="notifications">
				<span id="boost-notif-text" class="boost-notif-text">boost!</span>
			</div>

			<div id="goal-root" style="display: contents"></div>
			<img src="${chatTip}" class="chat-tip" alt="chat tip"/>
		</div>
		
        <div class="progress" id="progress-root"></div>
        <h1 class="title"><span class="game-name">count or die</span></h1>

        <div class="counter-container" id="counter-root"></div>
		<div class="boost-stuff" id="boost-root"></div>

        <div class="buttons">
        	<!-- boost button -->
            <div id="decrease-button">
                <img src="${decreaseBtn}" id="decrease-img" alt="boost-reg"/>
            </div>
            <!-- increment button -->
            <div id="increase-button">
                <img src="${increaseBtn}" id="increase-img" alt="increase-reg"/>
            </div>
        </div>

        <div class="reset" id="reset">
            <img src="${resetBtn}" id="reset-img" class="btn-hover" alt="increase-reg"/>
        </div>
    </div>
    </div>
	`;
}
