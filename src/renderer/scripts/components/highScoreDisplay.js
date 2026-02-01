export function setHighScoreDisplay(element) {
	return {
		update(score) {
			element.textContent = "high score: " + score;
		},
		addNewScoreEffect() {
			element.classList.add("new-score");
		},
		removeNewScoreEffect() {
			element.classList.remove("new-score");
		}
	};
}