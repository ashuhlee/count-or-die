
import { resetBar, currAnimDuration } from '../components/progressBarDisplay.js';
import { replenishHearts } from '../components/heartDisplay.js';
import { playAudio, audioConfig } from '../controls/audioHandler.js';
import { GameState } from './gameState.js';

// @ts-ignore
import candy from '@assets/ui/power-ups/candy.png';
// @ts-ignore
import donut from '@assets/ui/power-ups/donut.png';
// @ts-ignore
import star from '@assets/ui/power-ups/star.png';
// @ts-ignore
import superstar from '@assets/ui/power-ups/superstar.png';
// @ts-ignore
import smokeGif from '@assets/ui/deco/smoke.gif';

/*
TO-DO
- [TASK] sound + visual sparkle effect when boost replenishes
- [BUG] slow down timer does not function correctly
*/

interface PowerUp {
	type: string;
	icon: string;
	duration: number | null;
	weight: number;
	sfx: HTMLAudioElement
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
		icon: candy,
		duration: 3000,
		weight: 40,
		sfx: audioConfig.powerUp.audio
	}, {
		type: 'four_click',
		icon: donut,
		duration: 3000,
		weight: 20,
		sfx: audioConfig.powerUp.audio
	}, {
		type: 'extra_boost',
		icon: star,
		duration: null,
		weight: 10,
		sfx: audioConfig.boostPowerUp.audio
	},
	// {
	// 	type: 'slow_timer',
	// 	icon: '⏱️',
	// 	duration: 5000,
	// 	weight: 10,
	// 	sfx: audioConfig.powerUp.audio
	// },
		{
		type: 'replenish_boosts',
		icon: superstar,
		duration: null,
		weight: 8,
		sfx: audioConfig.boostPowerUp.audio
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
		// not fully functional
		else if (powerUp.type === 'slow_timer') {

			addTimedEffect(
				() => resetBar(bar, currAnimDuration * 2),
				() => resetBar(bar, state.barSpeed()), powerUp.duration!
    		);
		}
	}

	// creates element in DOM and handles click event listener
	function spawnPowerUp(): void {

		const spawnFiltered = POWER_UPS.filter(p => {

			if (state.boostsAvailable >= 4 && (p.type === 'extra_boost' || p.type === 'replenish_boosts')) {
				return false;
			}
			return true;
		})

		const powerUp: PowerUp = choosePowerUp(spawnFiltered.length > 0 ? spawnFiltered : POWER_UPS);

		const spawnArea: HTMLElement = document.createElement('div');
		spawnArea.className = 'spawn-area';

		const icon: HTMLImageElement = document.createElement('img'); // switch to images later
		icon.className = 'power-up-img';
		icon.id = 'power-up-img';
		icon.src = powerUp.icon;

		icon.style.animation = Math.random() < 0.5 ?
			'falling 3.2s linear forwards' : 'falling-reverse 3.2s linear forwards';


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

			if (!state.isGameOver) spawnCooldown();
		})

		icon.addEventListener('animationend', () => {
			spawnArea.remove();
			icon.remove();

			if (!state.isGameOver) spawnCooldown();
		})
	}

	// applies cooldown timer after each power-up spawn
	function spawnCooldown(enabled: boolean = true): void {

		const minInterval: number = 6000;
		const maxInterval: number = 12000;

		const randomInterval: number = Math.random() * (maxInterval - minInterval) + minInterval;

		setTimeout(() => {
			if (!state.isGameOver && enabled) {
				spawnPowerUp();
			}
		}, randomInterval);
	}

	function clearPowerUps(): void {
		document.querySelectorAll('.spawn-area').forEach(el => el.remove());
	}

	function addUseEffect(icon: HTMLElement, imgType: string): void {

		const popupElement = document.getElementById('powerUpUsedElement') as HTMLImageElement;
		if (!popupElement) return;

		const rect: DOMRect = icon.getBoundingClientRect()!;

		const effectWidth: number = 70;
		const effectHeight: number = 70;

		const xPos: number = rect.left + 20; // x position of element
		const yPos: number = rect.top + 30;  // y position of element

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