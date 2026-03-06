
import { playAudio } from '../controls/audioHandler.ts';

import { resetBar } from '../components/progressBarDisplay.ts';
import { removeHeart, resetHearts } from '../components/heartDisplay.ts';
import { displayCursorCount } from '../components/cursorDisplay.ts';

import { animateBtn, playAnimation, resetHeartEffect } from '../anim/animations.ts';
import { playConfetti } from '../anim/confetti.ts';

import { toggleGameOver } from './gameOver.ts';
import { GameState } from './gameState.ts';


type Sounds = typeof import('../controls/audioHandler.ts').audioConfig;

interface CounterUI {
	update: (value: number) => void;
	animate: (type: string) => void;
}

interface HighScoreUI {
  update: (score: number) => void;
  addNewScoreEffect: () => void;
  removeNewScoreEffect: () => void;
}

interface GoalUI {
  update: (goal: number, animateByLetter?: boolean, direction?: string) => void;
  addNewGoalEffect: (direction?: string) => void;
  removeNewGoalEffect: () => void;
}

interface GoalTextUI {
  addNewTextEffect: () => void;
  removeNewTextEffect: () => void;
}

interface GameActions {
	state: GameState;
	counter: CounterUI;
	highScore: HighScoreUI;
	goal: GoalUI;
	goalText: GoalTextUI;
	bar: HTMLElement;
	sounds: Sounds;
}

export default function setGameActions({ state, counter, highScore, goal, goalText, bar, sounds }: GameActions) {

	function updateScoreAndGoal(animationType: string, boosted: boolean): void {

		let counterAnimation = animationType;

		// handle high score
		if (state.updateHighScore()) {
			highScore.update(state.highScore);
			highScore.addNewScoreEffect();

			counterAnimation = boosted ? animationType : 'pop-right';

			if (!state.highScoreFxPlayed) {
				playAudio(sounds.highScore.audio);
				state.highScoreFxPlayed = true;
			}
			if (!state.confettiPlayed) {
				playConfetti();
				state.confettiPlayed = true;
			}
			if (!state.gradientFxPlayed) {
				state.gradientFxPlayed = true;
			}
		}

		// handle goal reached
		if (state.isGoalReached()) {

			if (!boosted) {
				playAudio(sounds.goalReached.audio);
			}
			goal.addNewGoalEffect('forward');
			goalText.addNewTextEffect();

			state.incrementGoal(boosted);

			goal.update(state.currentGoal, true);
			resetBar(bar, state.barSpeed());
		}

		counter.animate(counterAnimation);
		counter.update(state.counter);
	}

	function increase(event?: MouseEvent): void {

		if (window.electron) {
			window.electron.setDiscordStatus({ gameStatusRPC: 'in-game' });
		}

		state.increment();
		animateBtn('increase');
		playAudio(sounds.buttonInc.audio);

		if (state.counter === state.highScore + 1 && !state.gradientFxPlayed) {
			state.gradientFxPlayed = true;
		}

		if (event) {
			displayCursorCount(state.countIncrement, event, false);
		}
		updateScoreAndGoal('pop', false);
	}

	function jumpToGoal(event?: MouseEvent): void {

		const noBoostsText = document.getElementById('no-boosts');
		const boostNotif = document.getElementById('boost-notif-text');

		if (state.boostsAvailable <= 0) {
			animateBtn('decrease', true);
			playAnimation(noBoostsText, 'no-boosts-flash');
			playAudio(sounds.noBoosts.audio);
			return;
		}

		const pointsAdded = state.currentGoal - state.counter;

		state.boost();

		animateBtn('decrease', false);
		playAnimation(boostNotif, 'boost-notification');
		playAudio(sounds.useBoost.audio);

		removeHeart(state.boostsAvailable);

		if (event) {
			displayCursorCount(pointsAdded, event, true);
		}
		updateScoreAndGoal('pop-dec', true);
	}

	function restartGame(): void {

		if (window.electron) {
			window.electron.setDiscordStatus({ gameStatusRPC: 'in-game' });
		}
		// reset ui
		state.reset();

		// remove vfx from last game
		highScore.removeNewScoreEffect();
		goal.removeNewGoalEffect();
		goalText.removeNewTextEffect();

		// remove game over div
		toggleGameOver(false);

		// reset values
		counter.update(state.counter);
		goal.update(state.currentGoal);
		resetBar(bar, 20);

		resetHearts();
		resetHeartEffect();

		// play reset anim + audio
		playAudio(sounds.bgMusic.audio);
		counter.animate('reset-shake');

		goal.addNewGoalEffect('reverse');
		goalText.addNewTextEffect();
		goal.update(state.currentGoal, true, 'reverse');

	}

	return { increase, jumpToGoal, restartGame };

}
