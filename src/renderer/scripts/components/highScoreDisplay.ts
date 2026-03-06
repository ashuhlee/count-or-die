
export function setHighScoreDisplay(element: HTMLElement) {
	return {
		update(score: number) {
			element.textContent = 'high score: ' + score;
		},
		addNewScoreEffect() {
			element.classList.add('new-score');
		},
		removeNewScoreEffect() {
			element.classList.remove('new-score');
		}
	};
}