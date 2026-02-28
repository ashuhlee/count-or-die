
import { splitLetters } from '../anim/animations';
import smokeGif from '@assets/ui/deco/smoke.gif';

export function removeHeart(boostsLeft) {

	let i = boostsLeft + 1;

	const heart = document.getElementById(`boost-${i}`);
	const noBoostsText = document.getElementById('no-boosts');

	if (heart) {
		heart.classList.add('heart-use');
		addUseEffect(boostsLeft, smokeGif);
	}

	if (boostsLeft === 0) {
		noBoostsText.style.display = 'grid';
		splitLetters('.no-boost-text', 'shake');
	}
}

function addUseEffect(boostsLeft, imgType, powerUp = false) {

	let i = boostsLeft + 1;

	const target = document.getElementById(`boost-${i}`);
	const popupElement = document.getElementById('popupElement');

	const rect = target.getBoundingClientRect();

	const smokeWidth = 70;
	const smokeHeight = 70;

	const xPos = rect.left; // x position of element
	const yPos = rect.top;  // y position of element

	const xOffset = -30;
	const yOffset = -36;

	popupElement.style.left = powerUp ? `${xPos + xOffset}px` : `${xPos}px`;
	popupElement.style.top = powerUp ? `${yPos + yOffset}px` : `${yPos}px`;

	popupElement.style.width = `${smokeWidth}px`;
	popupElement.style.height = `${smokeHeight}px`;

	// display smoke effect
	popupElement.src = '';
	popupElement.src = `${imgType}?t=${Date.now()}`;

	popupElement.style.display = 'block';
	popupElement.style.zIndex = `2`;

	setTimeout(() => {
		popupElement.style.display = 'none';
	}, 3000)
}

export function replenishHearts(boostsLeft, powerUpType) {

	let firstRestored = false;
	let restoreCount = 0;

	for (let i = 1; i <= boostsLeft; i++) {
		const heart = document.getElementById(`boost-${i}`);

		if (heart && heart.classList.contains('heart-use')) {
			let delay = 0;

			if (powerUpType === 'replenish_boosts' && firstRestored) {
				delay = restoreCount * 150;
			}

			firstRestored = true;
			restoreCount++;

			setTimeout(() => {

				heart.style.animationDelay = '0s';
				heart.classList.remove('heart-use');
				heart.classList.add('heart-restore');

				heart.addEventListener('animationend', () => {
					heart.classList.remove('heart-restore');
					heart.style.animationDelay = '';

				}, {once: true})

				addUseEffect(i - 1, smokeGif, true);
			}, delay)
		}
	}
	if (boostsLeft > 0) {
		const noBoostsText = document.getElementById('no-boosts');
		noBoostsText.style.display = 'none';
	}
}

export function resetHearts() {

	for (let i = 1; i <= 4; i++) {
		const heart = document.getElementById(`boost-${i}`);

		if (heart) {
			heart.classList.remove('heart-use');
		}
	}
	const noBoostsText = document.getElementById('no-boosts');
	noBoostsText.style.display = 'none';
}