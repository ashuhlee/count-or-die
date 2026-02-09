
import { setGameActions } from "./core/gameActions.js";
import { toggleGameOver, youDiedConsole } from "./core/gameOver.js";

import { keyboardControls } from "./controls/keyHandler.js";
import { playAudio, pauseAudio, sounds } from "./controls/audioHandler.js";

import { resetHeartEffect, splitLetters} from "./anim/animations.js";
import { heartGlitch } from "./anim/glitchEffect.js";

import { setGoalDisplay, setGradientText } from "./components/goalDisplay.js";
import { setHighScoreDisplay } from "./components/highScoreDisplay.js";
import { initProgressBar, updateBarColor } from "./components/progressBarDisplay.js";
import { soundToggle } from "./components/menuBar.js";

import { GameState } from "./core/gameState.js";
import { Counter } from "./components/counterDisplay.js";

// localStorage.setItem("high-score", 36); // TESTS: manually reset high score

document.addEventListener("DOMContentLoaded", () => {

	// initialize game (start audio and progress bar)
	playAudio(sounds.bgMusic);
	const progressBar = initProgressBar();

	// animations
	splitLetters(".game-name", "wavy");

	setInterval(heartGlitch, 6000);
	heartGlitch();

	// track progress bar
	function animate() {
		updateBarColor(progressBar);
		requestAnimationFrame(animate);
	}

	animate();

	let countText = document.getElementById("counter");
	let countOuter = document.getElementById("counter-outer");
	let countShine = document.getElementById("counter-shine");

	let highScoreText = document.getElementById("high-score");
	let finalScore = document.getElementById("final-score");
	let goalBox = document.getElementById("next-goal");
	let goalText = document.querySelector(".goal-text");

	// create class instances
	const gameState = new GameState();

	const counterDisplay = new Counter({
		textElement: countText,
		outerElement: countOuter,
		textShine: countShine
	});

	const highScoreDisplay = setHighScoreDisplay(highScoreText);
	const goalDisplay = setGoalDisplay(goalBox);
	const goalTextDisplay = setGradientText(goalText);

	// set initial displays
	highScoreDisplay.update(gameState.highScore);
	counterDisplay.update(gameState.counter);
	goalDisplay.update(gameState.currentGoal, false);

	// create game actions
	const actions = setGameActions({
		state: gameState,
		counter: counterDisplay,
		highScore: highScoreDisplay,
		goal: goalDisplay,
		goalText: goalTextDisplay,
		bar: progressBar,
		sounds: sounds,
	});

	const handleRestart = () => {
		actions.restartGame();
		playAudio(sounds.reset);
		resetHeartEffect();
	}

	// button clicks
	document.getElementById("increase-img").addEventListener("click", actions.increase);
	document.getElementById("decrease-img").addEventListener("click", actions.jumpToGoal);
	document.getElementById("reset-img").addEventListener("click", handleRestart);
	document.getElementById("game-over-btn").addEventListener("click", handleRestart);

	// keyb controls
	keyboardControls({
		onIncrease: actions.increase,
		onBoost: actions.jumpToGoal,
		onRestart: handleRestart,
		disabled: () => gameState.isGameOver
	});
	soundToggle();

	// game over
	document.addEventListener("progressBarExp", () => {
		if (!gameState.isGoalReached() && !gameState.isGameOver) {

			gameState.setGameOver(true);
			toggleGameOver(true);

			youDiedConsole(countText.textContent);
			finalScore.textContent = `Score: ${countText.textContent}`;

			playAudio(sounds.gameOver);
			pauseAudio(sounds.bgMusic);

		}
	});

});
