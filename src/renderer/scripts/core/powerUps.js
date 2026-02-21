
import { resetBar, currAnimDuration } from '../components/progressBarDisplay.js';
import { playAnimation } from '../anim/animations.js';

export function setPowerUps({ state, bar}) {

	const POWER_UPS = [
	{
		type: 'double_click',
		icon: '🧋',
		duration: 5000,
		weight: 30
	},
	{
		type: 'extra_boost',
		icon: '⭐',
		duration: null,
		weight: 20
	},
	{
		type: 'four_click',
		icon: '🍡',
		duration: 4000,
		weight: 15
	},
	{
		type: 'slow_timer',
		icon: '⏱️',
		duration: 5000,
		weight: 10
	},
	{
		type: 'replenish_boosts',
		icon: '🌟',
		duration: null,
		weight: 8
	}]

	// applies and resets power-ups
	function addTimedEffect(apply, reverse, duration) {
		apply();
		setTimeout(reverse, duration);
	}

	function choosePowerUp(items) {

		const totalWeight = items.reduce((sum, item) => sum + item.weight, 0); // calculate total weight sum
		let pick = Math.random() * totalWeight; // choose random number

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
	function applyPowerUp(powerUp) {

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
				}, powerUp.duration
    		);
		}
		if (powerUp.type === 'four_click') {
			addTimedEffect(
				() => state.countIncrement = 4,
				() => state.countIncrement = 1, powerUp.duration
    		);
		}
		if (powerUp.type === 'slow_timer') {
			const prevSpeed = currAnimDuration; // save last bar speed

			addTimedEffect(
				() => resetBar(bar, currAnimDuration * 2),
				() => resetBar(bar, prevSpeed), powerUp.duration
    		);
		}
	}

	// creates element in DOM and handles click event listener
	function spawnPowerUp() {

		const powerUp = choosePowerUp(POWER_UPS);

		const spawnArea = document.createElement('div');
		spawnArea.id = 'spawn-area';
		spawnArea.className = 'spawn-area';

		const placeholder = document.createElement('span'); // switch to images later
		placeholder.id = 'power-up-img';
		placeholder.className = 'power-up-img';

		placeholder.textContent = powerUp.icon;

		document.getElementById('main').appendChild(spawnArea);
		spawnArea.appendChild(placeholder);

		placeholder.addEventListener('click', () => {
			console.log(powerUp.type, powerUp.icon);
			applyPowerUp(powerUp);
			playAnimation(placeholder, 'disappear');
			console.log(document.contains(placeholder));
		})

		placeholder.addEventListener('animationend', () => {
			spawnArea.remove();
			placeholder.remove();
		})

	}

	// applies cooldown timer after each power-up spawn
	function spawnCooldown() {

		const minInterval = 6000;
		const maxInterval = 12000;

		const setInterval = Math.random() * (maxInterval - minInterval) + minInterval;

		setTimeout(() => {
			if (!state.isGameOver) {
				spawnPowerUp();
				spawnCooldown();
			}
		}, setInterval);
	}

	function clearPowerUps() {
		document.querySelectorAll('.power-up-img').forEach(el => el.remove());
	}

	return { spawnCooldown, clearPowerUps };
}