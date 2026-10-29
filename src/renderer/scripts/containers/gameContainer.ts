import chatTip from "@assets/ui/svg/chat-tip.svg";

import decreaseBtn from "@assets/ui/buttons/decrease.png";
import increaseBtn from "@assets/ui/buttons/increase.png";
import resetBtn from "@assets/ui/buttons/reset-btn.png";

import heartPink from "@assets/ui/deco/px_heart_pink.png";
import heartPurple from "@assets/ui/deco/px_heart_purple.png";
import heartBlue from "@assets/ui/deco/px_heart_blue.png";
import heartWhite from "@assets/ui/deco/px_heart_white.png";

export default function renderGame() {
  const app = document.getElementById("app") as HTMLDivElement;

  app.innerHTML = `
	<div id="game-container">
		<div class="goal-chatbox" id="goal-chatbox">
			<div class="notifications">
				<span id="boost-notif-text" class="boost-notif-text">boost!</span>
			</div>

			<div class="next-goal animate__animated animate__fast" id="next-goal">
				<span class="goal-text fade-up-text">next: 30</span>
			</div>
			<img src="${chatTip}" class="chat-tip" alt="chat tip"/>
		</div>
		
        <div class="progress"><div class="pg-lines"></div><div class="progress-bar" id="progress-bar"></div><div class="progress-bg"></div></div>
        <h1 class="title"><span class="game-name">count or die</span></h1>

        <div class="counter-container" id="counter-root"></div>
		<div class="boost-stuff">
			<h1 class="no-boosts" id="no-boosts"><span class="no-boost-text">no boosts left!</span></h1>
			<div class="hearts">
				<!-- pink heart	-->
				<div class="heart-pink" id="boost-1">
					<img src="${heartPink}" alt="heart1" class="heart1" id="heart1"/>
				</div>
				<!-- purple heart	-->
				<div class="heart-purple" id="boost-2">
					<img src="${heartPurple}" alt="heart2" class="heart2" id="heart2"/>
				</div>
				<!-- blue heart	-->
				<div class="heart-blue" id="boost-3">
					<img src="${heartBlue}" alt="heart3" class="heart3" id="heart3"/>
				</div>
				<!-- white heart -->
				<div class="heart-white" id="boost-4">
					<img src="${heartWhite}" alt="heart4" class="heart4" id="heart4"/>
				</div>
			</div>
		</div>

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
