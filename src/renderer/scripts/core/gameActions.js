
import { playAudio } from "../controls/audioHandler.js";

import { resetBar } from "../components/progressBarDisplay.js";
import { removeHeart, resetHearts } from "../components/heartDisplay.js";
import { displayCursorCount } from "../components/cursorDisplay.js";

import { animateBtn, playAnimation, resetHeartEffect } from "../anim/animations.js";
import { toggleGameOver } from "./gameOver.js";
import { changeTheme, resetTheme } from "../controls/themeHandler.js";


export function setGameActions({ state, counter, highScore, goal, goalText, bar, sounds }) {

	function updateScoreAndGoal(animationType, boosted) {

		// handle high score
		if (state.updateHighScore()) {
			highScore.update(state.highScore);
			highScore.addNewScoreEffect();

			if (!state.highScoreFxPlayed) {
				playAudio(sounds.highScore);
				state.highScoreFxPlayed = true;
			}
		} else {
			counter.removeNewScoreEffect();
		}

		// handle goal reached
		if (state.isGoalReached()) {

			if (!boosted) {
				playAudio(sounds.goalReached);
			}
			goal.addNewGoalEffect();
			goalText.addNewTextEffect();

			state.incrementGoal(boosted);
			// console.log(`boosted: ${boosted}`); // tests

			goal.update(state.currentGoal, true);
			resetBar(bar, state.barSpeed());
		}

		counter.animate(animationType);
		counter.update(state.counter);
	}

	function increase() {

		if (window.electron) {
			window.electron.setDiscordStatus({ gameStatusRPC: "in-game" });
		}

		state.increment();
		animateBtn("increase");
		playAudio(sounds.buttonInc);

		if (state.counter === state.highScore + 1) {
			counter.addNewScoreEffect();
		}

		if (state.counter === 200) {
			changeTheme("theme200", bar);
		}
		if (state.counter === 300) {
			changeTheme("theme300", bar);
		}

		displayCursorCount(state.countIncrement, event, false);
		updateScoreAndGoal("pop", false);
	}

	function jumpToGoal() {

		const noBoostsText = document.getElementById("no-boosts");
		const boostNotif = document.getElementById("boost-notif-text");

		if (state.boostsAvailable <= 0) {
			animateBtn("decrease", true);
			playAnimation(noBoostsText, "no-boosts-flash");
			playAudio(sounds.noBoosts);
			return;
		}

		const pointsAdded = state.currentGoal - state.counter;

		state.boost();
		// console.log(`boosts left: ${state.boostsAvailable}`); // tests

		animateBtn("decrease", false);
		playAnimation(boostNotif, "boost-notification");
		playAudio(sounds.useBoost);

		removeHeart(state.boostsAvailable);

		displayCursorCount(pointsAdded, event, true);
		updateScoreAndGoal("pop-dec", true);
	}

	function restartGame() {

		if (window.electron) {
			window.electron.setDiscordStatus({ gameStatusRPC: "in-game" });
		}
		// reset ui
		state.reset();

		resetTheme();
		resetHearts();

		// remove vfx from last game
		counter.removeNewScoreEffect();
		highScore.removeNewScoreEffect();
		goal.removeNewGoalEffect();

		// remove game over div
		toggleGameOver(false);

		// reset values
		counter.update(state.counter);
		goal.update(state.currentGoal);
		resetBar(bar, 20);

		// play reset anim + audio
		playAudio(sounds.bgMusic);
		counter.animate("reset-shake");

		playAudio(sounds.reset);
		resetHeartEffect();

	}

	return { increase, jumpToGoal, restartGame };

}