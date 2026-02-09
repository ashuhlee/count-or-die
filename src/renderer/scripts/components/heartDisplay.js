
import { splitLetters } from "../anim/animations";
import smokeGif from "../../assets/ui/deco/smoke.gif?t=0";

export function removeHeart(boostsLeft) {

	let i = boostsLeft + 1;

	const heart = document.getElementById(`boost-${i}`);
	const noBoostsText = document.getElementById('no-boosts');

	if (heart) {
		heart.classList.add("heart-use");
		addUseEffect(boostsLeft);
	}

	if (boostsLeft === 0) {
		noBoostsText.style.display = "grid";
		splitLetters(".no-boost-text", "shake");
	}
}

function addUseEffect(boostsLeft) {
	let i = boostsLeft + 1;

	const target = document.getElementById(`boost-${i}`);
	const popupElement = document.getElementById('popupElement');

	const rect = target.getBoundingClientRect();

	const smokeWidth = 65;
	const smokeHeight = 65;

	const xPos = rect.left; // x position of element
	const yPos = rect.top;  // y position of element

	// console.log("X:", xPos, "Y:", yPos); // tests

	popupElement.style.left = `${xPos}px`;
	popupElement.style.top = `${(yPos) - 20}px`;

	popupElement.style.width = `${smokeWidth}px`;
	popupElement.style.height = `${smokeHeight}px`;

	// display smoke effect
	popupElement.src = `${smokeGif}`;
	popupElement.style.display = 'block';
	popupElement.style.zIndex = `2`;
}

export function resetHearts() {

	for (let i = 1; i <= 4; i++) {
		const heart = document.getElementById(`boost-${i}`);

		if (heart) {
			heart.classList.remove("heart-use");
		}
	}
	const noBoostsText = document.getElementById('no-boosts');
	noBoostsText.style.display = "none";
}