
import { resetBar, currAnimDuration } from '../components/progressBarDisplay.js';
import { GameState } from './gameState.js';

/*
Known Bugs
- slow down timer does not function correctly
- when a boost is replenished, it doesn't reappear on screen -> refactor heartDisplay.js
*/

interface PowerUp {
	type: string;
	icon: string;
	duration: number | null;
	weight: number;
}

export function setPowerUps({ state, bar }: { state: GameState, bar: HTMLElement }) {

	const POWER_UPS: PowerUp[] = [{
		type: 'double_click',
		icon: '🧋',
		duration: 5000,
		weight: 40
	}, {
		type: 'extra_boost',
		icon: '⭐',
		duration: null,
		weight: 25
	}, {
		type: 'four_click',
		icon: '🍡',
		duration: 4000,
		weight: 20
	}, {
		type: 'slow_timer',
		icon: '⏱️',
		duration: 5000,
		weight: 10
	}, {
		type: 'replenish_boosts',
		icon: '🌟',
		duration: null,
		weight: 5
	}]

	// applies and resets power-ups
	function addTimedEffect(apply: () => void, reverse: () => void, duration: number) {
		apply();
		setTimeout(reverse, duration);
	}

	function choosePowerUp(items: PowerUp[]): PowerUp {

		const totalWeight = items.reduce((sum, item) => sum + item.weight, 0); // calculate total weight sum
		let pick = Math.random() * totalWeight; // chooses random number

		// iterate and find selected item
		for (let i = 0; i < items.length; i++) {

			pick = pick - items[i].weight;
			if (pick <= 0) {
				return items[i];
			}
		}
		return items[1]; // fallback: extra boost
	}

	// applies selected power-up effect to GameState
	function applyPowerUp(powerUp: PowerUp) {

		// instant effects
		if (powerUp.type === 'extra_boost') {
			state.boostsAvailable = Math.min(state.boostsAvailable + 1, 4);
		}
		if (powerUp.type === 'replenish_boosts') {
			state.boostsAvailable = 4;
		}

		// timed effects
		if (powerUp.type === 'double_click') {
			addTimedEffect(
				() => {
					state.countIncrement = 2;
					state.goalIncRandomizer = [30, 30];
				},
				() => {
					state.countIncrement = 1;
					state.goalIncRandomizer = [10, 15, 20, 25, 30];
				}, powerUp.duration!
    		);
		}
		else if (powerUp.type === 'four_click') {
			addTimedEffect(
				() => state.countIncrement = 4,
				() => state.countIncrement = 1, powerUp.duration!
    		);
		}
		else if (powerUp.type === 'slow_timer') {
			const prevSpeed = currAnimDuration; // save last bar speed

			addTimedEffect(
				() => resetBar(bar, currAnimDuration * 2),
				() => resetBar(bar, prevSpeed), powerUp.duration!
    		);
		}
	}

	// creates element in DOM and handles click event listener
	function spawnPowerUp() {

		const powerUp: PowerUp = choosePowerUp(POWER_UPS);

		const spawnArea: HTMLElement = document.createElement('div');
		spawnArea.id = 'spawn-area';
		spawnArea.className = 'spawn-area';

		const placeholder: HTMLElement = document.createElement('span'); // switch to images later
		placeholder.id = 'power-up-img';
		placeholder.className = 'power-up-img';

		placeholder.textContent = powerUp.icon;

		const mainDiv: HTMLElement | null = document.getElementById('main');

		mainDiv?.appendChild(spawnArea);
		spawnArea.appendChild(placeholder);

		placeholder.addEventListener('click', () => {

			console.log(powerUp.type, powerUp.icon);
			applyPowerUp(powerUp);
			placeholder.remove();
			// playAnimation(placeholder, 'disappear');
		})

		placeholder.addEventListener('animationend', () => {
			spawnArea.remove();
			placeholder.remove();
		})
	}

	// applies cooldown timer after each power-up spawn
	function spawnCooldown(): void {

		const minInterval: number = 6000;
		const maxInterval: number = 12000;

		const randomInterval: number = Math.random() * (maxInterval - minInterval) + minInterval;

		setTimeout(() => {
			if (!state.isGameOver) {
				spawnPowerUp();
				spawnCooldown();
			}
		}, randomInterval);
	}

	function clearPowerUps() {
		document.querySelectorAll('.power-up-img').forEach(el => el.remove());
	}

	return { spawnCooldown, clearPowerUps };
}