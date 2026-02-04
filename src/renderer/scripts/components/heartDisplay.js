
export function removeHeart(boostsLeft) {

	let i = boostsLeft + 1;

	const heart = document.getElementById(`boost-${i}`);
	const noBoostsText = document.getElementById('no-boosts');

	if (heart) {
		heart.classList.add("heart-use");
	}

	if (boostsLeft === 0) {
		noBoostsText.style.display = "grid";
	}
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