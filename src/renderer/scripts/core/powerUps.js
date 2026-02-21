
export function setPowerUps({ state, bar}) {

	const POWERUPS = [
	{
		type: 'double_click',
		icon: '🧋',
		duration: 10000,
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
		duration: 8000,
		weight: 15
	},
	{
		type: 'slow_timer',
		icon: '⏱️',
		duration: 10000,
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
				() => state.countIncrement = 2,
				() => state.countIncrement = 1, powerUp.duration
    		);
		}
		if (powerUp.type === 'four_click') {
			addTimedEffect(
				() => state.countIncrement = 4,
				() => state.countIncrement = 1, powerUp.duration
    		);
		}
		if (powerUp.type === 'slow_timer') {
			console.log('idk bruh')
		}
	}

	// generates element in DOM and handles click event listener
	function spawnPowerUp() {
	}

	// applies cooldown timer after each power-up spawn
	function scheduleNextSpawn() {
	}

	const powerUpPick = choosePowerUp(POWERUPS);
	console.log(powerUpPick.type, powerUpPick.icon);
}

setPowerUps('');