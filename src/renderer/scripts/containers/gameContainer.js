
import chatTip from '@assets/ui/svg/chat-tip.svg';

import decreaseBtn from '@assets/ui/buttons/decrease.png';
import increaseBtn from '@assets/ui/buttons/increase.png';
import resetBtn from '@assets/ui/buttons/reset-btn.png';

import heartPink from '@assets/ui/deco/px_heart_pink.png';
import heartPurple from '@assets/ui/deco/px_heart_purple.png';
import heartBlue from '@assets/ui/deco/px_heart_blue.png';
import heartWhite from '@assets/ui/deco/px_heart_white.png';


export function renderGame() {

	const app = document.getElementById('app');

	app.innerHTML = `
		<div class="goal-chatbox" id="goal-chatbox">
			<div class="notifications">
				<span id="boost-notif-text" class="boost-notif-text">boost!</span>
				<span id="theme-switch-notif-text" class="theme-switch-notif-text">new rank!</span>
				<span id="score-notif-text" class="score-notif-text">new best!</span>
			</div>

			<div class="next-goal animate__animated animate__fast" id="next-goal">
				<span class="goal-text fade-up-text">next: 30</span>
			</div>
			<img src="${chatTip}" class="chat-tip" alt="chat tip"/>
		</div>
		
        <div class="progress"><div class="pg-lines"></div><div class="progress-bar" id="progress-bar"></div><div class="progress-bg"></div></div>
        <h1 class="title"><span class="game-name">count or die</span></h1>

        <div class="counter-container">
            <svg viewBox="0 0 300 140" class="counter-svg">
	  			<defs>
					<clipPath id="shine-effect">
					<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" id="counter-shine">00</text>
					</clipPath>
					<linearGradient id="gradient-counter" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" style="stop-color:#FFACAD" /> 
						<stop offset="14.28%" style="stop-color:#FFD5A5" />
						<stop offset="28.57%" style="stop-color:#FDFFB6" /> 
						<stop offset="42.85%" style="stop-color:#CBFFBF" />
						<stop offset="57.14%" style="stop-color:#9BF6FF" /> 
						<stop offset="85.71%" style="stop-color:#BDB2FF" /> 
						<stop offset="100%" style="stop-color:#ffb7fe" />
					</linearGradient>
					<linearGradient id="default-color" x1="0%" x2="0%" y1="0%" y2="100%">
						<stop offset="5%" stop-color="#ffe6f9" />
						<stop offset="30%" stop-color="#DF7FC7" />
						<stop offset="100%" stop-color="#cc5cb0" />
					</linearGradient>
		  		</defs>
				<!-- outer stroke -->
				<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"  stroke="#39232B" stroke-width="12" stroke-linejoin="round"
						stroke-linecap="round" fill="none" paint-order="stroke" id="counter-outer">00
				</text>
				<!-- inner stroke -->
				<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" stroke="#FFF4F7" stroke-width="8" stroke-linejoin="round"
					stroke-linecap="round" paint-order="stroke fill" id="counter">00
				</text>
  				<!-- shine effect -->
  				<rect x="0" y="0" width="100%" height="100%" clip-path="url(#shine-effect)" class="shine-rect"/>
            </svg>
        </div>
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
            <img src="${resetBtn}" id="reset-img" alt="increase-reg"/>
        </div>
    </div>
	`
}