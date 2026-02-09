
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
	}
}

function addUseEffect(boostsLeft) {
	let i = boostsLeft + 1;

	const target = document.getElementById(`boost-${i}`);
	const popupElement = document.getElementById('popupElement');

	const rect = target.getBoundingClientRect();

	const smokeWidth = 65;
	const smokeHeight = 65;

	const xPosition = rect.left; // x position of element
	const yPosition = rect.top;  // y position of element

	console.log("X:", xPosition, "Y:", yPosition);

	popupElement.style.left = `${xPosition}px`;
	popupElement.style.top = `${(yPosition) - 18}px`;

	// display smoke effect
	popupElement.src = 'assets/ui/deco/smoke.gif?t=0';
	popupElement.style.display = 'block';
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