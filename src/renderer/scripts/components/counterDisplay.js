
import { playAnimation } from "../anim/animations.js";

export class Counter {

	constructor({ textElement, outerElement }) {
		this.textElement = textElement;
		this.outerElement = outerElement;
	}

	update(counter) {
		let displayValue = counter.toString().padStart(2, "0");

		this.textElement.textContent = displayValue;
		this.outerElement.textContent = displayValue;
	}

	animate(className) {
		playAnimation(this.textElement, className);
		playAnimation(this.outerElement, className);
	}

	addNewScoreEffect() {
		this.textElement.classList.add("new-score-counter");

		setTimeout(() => {
			this.textElement.classList.remove("new-score-counter");
		}, 200);
	}

	removeNewScoreEffect() {
		this.textElement.classList.remove("new-score-counter");
	}
}