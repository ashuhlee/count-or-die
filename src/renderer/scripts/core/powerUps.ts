
import { replenishHearts } from '../components/heartDisplay.js';
import { playAudio, audioConfig } from '../controls/audioHandler.js';
import { playAnimation, resetHeartEffect } from '../anim/animations.js';

import { GameState } from './gameState.js';
import { Counter } from '../components/counterDisplay.js';

import { candy, donut, badDonut, star, superstar } from '@assets/ui/power-ups';
import smokeGif from '@assets/ui/deco/smoke.gif';


type PowerUpType = 'double_click' | 'four_click' | 'minus_25' | 'extra_boost' | 'replenish_boosts';

type PowerUp = {
	type: PowerUpType;
	icon: string;
	duration: number | null;
	weight: number;
	sfx: HTMLAudioElement;
	desc: string,
	effect: 'good' | 'bad'
}

type PowerUpSystem = {
	spawnCooldown: () => void,
	clearPowerUps: () => void
}

type PowerUpArgs = {
	counter: Counter,
	state: GameState,
}

export function setPowerUps({ counter, state }: PowerUpArgs): PowerUpSystem {

	const POWER_UPS: PowerUp[] = [{
		type: 'double_click',
		icon: candy,
		duration: 3000,
		weight: 40,
		sfx: audioConfig.powerUp.audio,
		desc: '2x counter!',
		effect: 'good'
	}, {
		type: 'four_click',
		icon: donut,
		duration: 3000,
		weight: 20,
		sfx: audioConfig.powerUp.audio,
		desc: '4x counter!',
		effect: 'good'
	}, {
		type: 'minus_25',
		icon: badDonut,
		duration: null,
		weight: 20,
		sfx: audioConfig.penalty.audio,
		desc: '-25 penalty!',
		effect: 'bad'
	}, {
		type: 'extra_boost',
		icon: star,
		duration: null,
		weight: 10,
		sfx: audioConfig.boostPowerUp.audio,
		desc: 'extra boost!',
		effect: 'good'
	}, {
		type: 'replenish_boosts',
		icon: superstar,
		duration: null,
		weight: 8,
		sfx: audioConfig.boostPowerUp.audio,
		desc: 'superstar!',
		effect: 'good'
	}]

	let spawnTimeoutId: ReturnType<typeof setTimeout> | null = null;

	const resetCountIncrement = () => {
		state.countIncrement = 1;
		state.goalIncRandomizer = [10, 15, 20, 25, 30];
	}

	// applies and resets power-ups
	function addTimedEffect(apply: () => void, reverse: () => void, duration: number): void {
		apply();
		setTimeout(reverse, duration);
	}

	function choosePowerUp(items: PowerUp[]): PowerUp {

		const totalWeight = items.reduce((sum, item) => sum + item.weight, 0); // calculate total weight sum
		let pick = Math.random() * totalWeight; // chooses random number

		// iterate and find selected item
		for (const i of items) {
			pick -= i.weight;
			if (pick <= 0) return i;
		}
		return items[0]; // fallback: double_click
	}

	// applies selected power-up effect to GameState
	function applyPowerUp(powerUp: PowerUp): void {

		switch (powerUp.type) {
			// instant effects
			case 'extra_boost':
				state.boostsAvailable = Math.min(state.boostsAvailable + 1, 4);
				replenishHearts(state.boostsAvailable, 'extra_boost');
				resetHeartEffect();
				break;

			case 'replenish_boosts':
				state.boostsAvailable = 4;
				replenishHearts(state.boostsAvailable, 'replenish_boosts');
				resetHeartEffect();
				break;

			case 'minus_25':
				state.counter -= 25;
				counter.update(state.counter);
				break;

			// timed effects
			case 'double_click':
				addTimedEffect(
					() => {
						state.countIncrement = 2;
						state.goalIncRandomizer = [15, 20, 25, 30];
					}, resetCountIncrement, powerUp.duration!
				);
				break;

			case 'four_click':
				addTimedEffect(
					() => {
						state.countIncrement = 4;
						state.goalIncRandomizer = [20, 25, 30];
					}, resetCountIncrement, powerUp.duration!
				);
				break;
		}
	}

	// creates element in DOM and handles click event listener
	function spawnPowerUp(): void {

		const boostsFull: boolean = state.boostsAvailable >= 4;

		const boostTypes: Set<string> = new Set(['extra_boost', 'replenish_boosts']);
		const options: PowerUp[] = boostsFull ? POWER_UPS.filter(p => !boostTypes.has(p.type)) : POWER_UPS;

		const powerUp: PowerUp = choosePowerUp(options.length > 0 ? options : POWER_UPS);

		const flash: HTMLElement | null = document.getElementById('red-flash');
		const container: HTMLElement | null = document.getElementById('game-container');

		const spawnArea: HTMLElement = document.createElement('div');
		spawnArea.className = 'spawn-area';

		const icon: HTMLImageElement = document.createElement('img');
		icon.className = 'power-up-img';
		icon.src = powerUp.icon;
		icon.dataset.powerUpType = powerUp.type;

		icon.style.animation = Math.random() < 0.5 ?
			'falling 2.8s linear forwards' : 'falling-reverse 2.8s linear forwards';


		const side = Math.random() < 0.5 ? 'left' : 'right';
		icon.classList.add(`spawn-area--${side}`);

		const mainDiv: HTMLElement | null = document.getElementById('main');
		mainDiv?.appendChild(spawnArea);
		spawnArea.appendChild(icon);

		const spawnAreaWidth: number = spawnArea.offsetWidth;
		const xPos = Math.floor(Math.random() * (Math.min(spawnAreaWidth / 3, 150) + 1))

		if (spawnAreaWidth > 600) {
			icon.style[side] = `${xPos}px`
		}

		icon.addEventListener('click', () => {

			applyPowerUp(powerUp);
			playAudio(powerUp.sfx);

			addUseEffect(icon, smokeGif);
			icon.remove();
			spawnArea.remove();

			if (powerUp.effect === 'bad') {
				playAnimation(container, 'penalty-shake');
				counter.animate('pop-min');

				flash?.classList.add('flash-penalty');
				flash?.addEventListener('animationend', () => {
					flash.classList.remove('flash-penalty');
				}, {once: true});
			}
			else {
				counter.animate('pop');
			}

			if (!state.isGameOver) spawnCooldown();
		})

		icon.addEventListener('animationend', () => {
			spawnArea.remove();
			icon.remove();

			if (!state.isGameOver) spawnCooldown();
		})
	}

	// cancels the pending spawn timeout - prevents overlaps
	function clearSpawnTimer(): void {
		if (spawnTimeoutId != null) {
			clearTimeout(spawnTimeoutId);
			spawnTimeoutId = null;
		}
	}

	// applies cooldown timer after each power-up spawn
	function spawnCooldown(enabled: boolean = true): void {

		clearSpawnTimer();
		if (!enabled || state.isGameOver) return;

		const minInterval = 6000;
		const maxInterval = 12000;

		const randomInterval = Math.random() * (maxInterval - minInterval) + minInterval;

		spawnTimeoutId = setTimeout(() => {
			spawnTimeoutId = null;
			if (!state.isGameOver) {
				spawnPowerUp();
			}
		}, randomInterval)
	}

	// stops all power-up activity: cancels spawn timer + clears screen
	function clearPowerUps(): void {
		clearSpawnTimer();
		document.querySelectorAll('.spawn-area').forEach(el => el.remove());
	}

	function addUseEffect(icon: HTMLElement, imgType: string): void {

		const popupElement = document.getElementById('powerUpUsedElement') as HTMLImageElement;
		if (!popupElement) return;

		const rect: DOMRect = icon.getBoundingClientRect()!;

		const effectWidth = 70;
		const effectHeight = 70;

		const xPos: number = rect.left + 20;
		const yPos: number = rect.top + 30;

		popupElement.style.left = `${xPos}px`;
		popupElement.style.top = `${yPos}px`;

		popupElement.style.width = `${effectWidth}px`;
		popupElement.style.height = `${effectHeight}px`;

		// display smoke effect
		popupElement.src = '';
		popupElement.src = `${imgType}?t=${Date.now()}`;

		popupElement.style.display = 'block';
		popupElement.style.zIndex = `2`;

		setTimeout(() => {
			popupElement.style.display = 'none';
		}, 3000)
	}

	return { spawnCooldown, clearPowerUps };
}