
import { beforeEach, expect, describe, test } from 'vitest';

import { soundToggle } from '../src/renderer/scripts/components/menuBar.js';
import { GameState } from '../src/renderer/scripts/core/gameState.js';
import { setHighScoreDisplay } from '../src/renderer/scripts/components/highScoreDisplay.js';

window.HTMLMediaElement.prototype.play = () => {};

describe('GameState', () => {

	// clear local storage before every test
	beforeEach(() => {
		localStorage.clear();
	});

	const state = new GameState();
	const storage = localStorage;

	document.body.innerHTML = `<p id="high-score"></p>`;
	let highScoreText = document.getElementById('high-score');

	test('Counter increments properly', () => {
		state.increment();
		expect(state.counter).toBe(1);

		state.increment();
		expect(state.counter).toBe(2);
	})

	test('High score and counter updates', () => {
		state.counter = 100;
		state.increment();
		state.updateHighScore();

		expect(state.counter).toBe(101);
		expect(state.highScore).toBe(101);

		setHighScoreDisplay(highScoreText).update(state.highScore);
		expect(highScoreText.textContent).toBe(`high score: 101`);

	})

	// check game state local storage values
	describe('Local Storage', () => {

		test('Loads high score', () => {
			storage.setItem('high-score', '50');

			const state = new GameState();
			expect(state.highScore).toBe(50);
		})

		test('Loads sound settings', () => {
			storage.setItem('soundMuted', 'true');

			document.body.innerHTML = `<button id="soundBtn">Sound</button>`;
			const toggleButton = document.getElementById('soundBtn');
			soundToggle();

			toggleButton.click();
			expect(storage.getItem('soundMuted')).toBe('false');

			toggleButton.click(); // test a second click
			expect(storage.getItem('soundMuted')).toBe('true');

		})
	})

})
// TODO: simulate bar speed incremental changes