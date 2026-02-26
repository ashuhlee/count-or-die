
import smokeGif from '@assets/ui/deco/smoke.gif';
import gameOverGif from '@assets/ui/deco/game_over.gif';

import soundBtnSvg from '@assets/ui/svg/sound-button-reg.svg';
import optionsBtnSvg from '@assets/ui/svg/options-button.svg';
import leftDecoPng from '@assets/ui/deco/lines.png';

import questionPng from '@assets/ui/deco/question.png';
import exclamationPng from '@assets/ui/deco/exclamation.png';

import ghostPng from '@assets/ui/deco/ghost.gif';
import skullFloor from '@assets/ui/deco/skull_floor.png';
import tombstonePng from '@assets/ui/deco/tombstone.png';

import resetBtnPng from '@assets/ui/buttons/reset-btn.png';
import quitBtnPng from '@assets/ui/buttons/quit-btn.png';

export function renderMain() {

	const main = document.getElementById('main');
	
	main.innerHTML = `
		<!-- vfx -->
		<div class="scanlines"></div>
		<div class="scanlines-bg"></div>
		<div class="top-gradient"></div>
		
		<img class="left-deco" alt="left deco" src="${leftDecoPng}"/>
		
		<img id="popupElement" src="${smokeGif}" alt="smoke" style="filter: brightness(1.03) saturate(110%)">
		
		<!-- menu bar -->
		<div class="controls">
			<img id="soundBtn" alt="sound icon" src="${soundBtnSvg}"/>
			<img id="optionsBtn" alt="options icon" src="${optionsBtnSvg}"/>
		</div>
		
		<div id="red-flash"></div>
		
    	<!-- game over div -->
    	<div id="game-over">
			<div class="go-content">
				<div id="red-overlay"></div>
				<h2 class="you-died" id="dead-text"><span class="go-text-random">you died lolz</span></h2>
				<h2 class="death-tracker" id="death-tracker">deaths: 0</h2>
				
				<div class="deco-icons">
					<img src="${questionPng}" alt="question mark" class="question"/>
					<img src="${exclamationPng}" alt="exclamation mark" class="excl"/>
				</div>
				
				<img src="${gameOverGif}" alt="game over text" class="go-title"/>
				
				<h2 class="final-score" id="final-score"><span class="score-text">score: 0</span></h2>
				
				<h2 class="play-again"><span class="try-again">try again ?</span></h2>
				<div class="bottom-section">
					<div class="game-over-btns">
						<img src="${resetBtnPng}" id="game-over-btn" class="play-again-btn" alt="game over reset button"/>
						<img src="${quitBtnPng}" id="quit-btn" class="play-again-btn-2" alt="rage quit button"/>
					</div>
					<div class="menu-anim">
						<h2 class="back-to-menu underline left" id="menu-btn">back to menu</h2>		
					</div>	
				</div>

				<div class="bg"></div>
			</div>
			<div class="skull-area">
				<img src="${skullFloor}" alt="skull" class="skull-floor"/>	
			</div>	
			<div class="tombstone-area">
				<img src="${ghostPng}" alt="ghost" class="ghost"/>
				<img src="${tombstonePng}" alt="tombstone" class="tombstone"/>
			</div>
    	</div>
    	
    	<!-- render main app -->
    	<div class="app" id="app"></div>
    	<!-- high score text -->
    	<h1 id="high-score" class="animate__animated">high score: 0</h1>
    	<!-- app version -->
    	<p id="app-ver" class="app-ver">${__APP_VERSION__}</p>
	`
}