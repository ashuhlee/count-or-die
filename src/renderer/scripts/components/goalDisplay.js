import { splitLetters } from '../anim/animations.js';

export function setGoalDisplay(element) {

	return {
		update(goal, animateByLetter = false, direction = 'forward') {
			const textSpan = element.querySelector('.goal-text');

			if (textSpan) {
				textSpan.textContent = `next: ${goal}`;

				if (animateByLetter) {
					splitLetters('.goal-text', 'fade', direction);
				}
			} else {
				element.textContent = `next: ${goal}`;
			}
		},

		addNewGoalEffect(direction = 'forward') {
			element.classList.remove('new-goal', 'new-goal-reverse');
			element.offsetHeight;
			element.classList.add(direction === 'forward' ? 'new-goal': 'new-goal-reverse');
		},
		removeNewGoalEffect() {
			element.classList.remove('new-goal', 'new-goal-reverse');
		}
	};
}

export function setGradientText(element) {

	return {
		addNewTextEffect() {
			element.classList.remove('new-goal-text');
			element.offsetHeight;
			element.classList.add('new-goal-text');
		},
		removeNewTextEffect() {
			element.classList.remove('new-goal-text');
		}
	};
}
