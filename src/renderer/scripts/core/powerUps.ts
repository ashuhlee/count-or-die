
import { resetBar, currAnimDuration } from '../components/progressBarDisplay.js';
import { replenishHearts } from '../components/heartDisplay.js';
import { GameState } from './gameState.js';

/*
TO-DO
- [TASK] sound + visual sparkle effect when boost replenishes
- [TASK] power up use sound + visual effect
- [BUG] slow down timer does not function correctly
*/

interface PowerUp {
	type: string;
	icon: string;
	duration: number | null;
	weight: number;
}

type PowerUpSystem = {
	spawnCooldown: () => void,
	clearPowerUps: () => void
}

type PowerUpArgs = {
	state: GameState,
	bar: HTMLElement
}

export function setPowerUps({ state, bar }: PowerUpArgs): PowerUpSystem {

	const POWER_UPS: PowerUp[] = [{
		type: 'double_click',
		icon: '🧋',
		duration: 3000,
		weight: 40
	}, {
		type: 'four_click',
		icon: '🍡',
		duration: 2000,
		weight: 20
	}, {
		type: 'extra_boost',
		icon: '⭐',
		duration: null,
		weight: 15
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
	function addTimedEffect(apply: () => void, reverse: () => void, duration: number): void {
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
		return items[0]; // fallback: double_click
	}

	// applies selected power-up effect to GameState
	function applyPowerUp(powerUp: PowerUp): void {

		// instant effects
		if (powerUp.type === 'extra_boost') {
			state.boostsAvailable = Math.min(state.boostsAvailable + 1, 4);
			replenishHearts(state.boostsAvailable, 'extra_boost');
		}
		if (powerUp.type === 'replenish_boosts') {
			state.boostsAvailable = 4;
			replenishHearts(state.boostsAvailable, 'replenish_boosts');
		}

		// timed effects
		if (powerUp.type === 'double_click') {
			addTimedEffect(
				() => {
					state.countIncrement = 2;
					state.goalIncRandomizer = [15, 20, 25, 30];
				},
				() => {
					state.countIncrement = 1;
					state.goalIncRandomizer = [10, 15, 20, 25, 30];
				}, powerUp.duration!
    		);
		}
		else if (powerUp.type === 'four_click') {
			addTimedEffect(
				() => {
					state.countIncrement = 4;
					state.goalIncRandomizer = [20, 25, 30];
				},
				() => {
					state.countIncrement = 1;
					state.goalIncRandomizer = [10, 15, 20, 25, 30];
				}, powerUp.duration!
    		);
		}
		else if (powerUp.type === 'slow_timer') {

			addTimedEffect(
				() => resetBar(bar, currAnimDuration * 2),
				() => resetBar(bar, state.barSpeed()), powerUp.duration!
    		);
		}
	}

	// creates element in DOM and handles click event listener
	function spawnPowerUp(): void {

		const powerUp: PowerUp = choosePowerUp(POWER_UPS);

		const spawnArea: HTMLElement = document.createElement('div');
		spawnArea.className = 'spawn-area';

		const placeholder: HTMLElement = document.createElement('span'); // switch to images later
		placeholder.className = 'power-up-img';
		placeholder.textContent = powerUp.icon;

		const side = Math.random() < 0.5 ? 'left' : 'right';
		placeholder.classList.add(`spawn-area--${side}`);

		const mainDiv: HTMLElement | null = document.getElementById('main');
		mainDiv?.appendChild(spawnArea);
		spawnArea.appendChild(placeholder);

		const spawnAreaWidth: number = spawnArea.offsetWidth;

		const xPos = Math.floor(Math.random() * (Math.min(spawnAreaWidth / 3, 150) + 1))
		console.log([powerUp.type, xPos, spawnAreaWidth, spawnAreaWidth > 600].join('-')); // tests?

		if (spawnAreaWidth > 600) {
			placeholder.style[side] = `${xPos}px`
		}

		placeholder.addEventListener('click', () => {

			console.log(powerUp.icon, powerUp.type + `${powerUp.duration === null? '' : ': ' + powerUp.duration / 1000 + 's'}`);
			applyPowerUp(powerUp);
			spawnArea.remove();
			placeholder.remove();

			if (!state.isGameOver) spawnCooldown();
			// playAnimation(placeholder, 'disappear');
		})

		placeholder.addEventListener('animationend', () => {
			spawnArea.remove();
			placeholder.remove();

			if (!state.isGameOver) spawnCooldown();
		})
	}

	// applies cooldown timer after each power-up spawn
	function spawnCooldown(): void {

		const minInterval: number = 6000;
		const maxInterval: number = 10000;

		const randomInterval: number = Math.random() * (maxInterval - minInterval) + minInterval;

		setTimeout(() => {
			if (!state.isGameOver) {
				spawnPowerUp();
			}
		}, randomInterval);
	}

	function clearPowerUps(): void {
		document.querySelectorAll('.spawn-area').forEach(el => el.remove());
	}

	return { spawnCooldown, clearPowerUps };
}