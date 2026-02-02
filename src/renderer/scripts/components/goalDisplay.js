import { wrapLetters, playLetterAnim } from "../anim/animations.js";

export function setGoalDisplay(element) {

	return {
		update(goal, shouldAnimate = false) {
			const textSpan = element.querySelector('.goal-text');

			if (textSpan) {
				textSpan.textContent = `next: ${goal}`;

				if (shouldAnimate) {
					wrapLetters('.goal-text');
					playLetterAnim(textSpan);
				}
			} else {
				element.textContent = `next: ${goal}`;
			}
		},

		addNewGoalEffect() {
			element.classList.remove("new-goal");
			element.offsetHeight;
			element.classList.add("new-goal");
		},
		removeNewGoalEffect() {
			element.classList.remove("new-goal");
		}
	};
}

export function setGradientText(element) {

	return {
		addNewTextEffect() {
			element.classList.remove("new-goal-text");
			element.offsetHeight;
			element.classList.add("new-goal-text");
		},
		removeNewTextEffect() {
			element.classList.remove("new-goal-text");
		}
	};
}
