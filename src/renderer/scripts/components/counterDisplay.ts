
import { playAnimation } from '../anim/animations.ts';

export default class Counter {

	textElement: HTMLElement;
	outerElement: HTMLElement;
	textShine: HTMLElement;

	constructor({ textElement, outerElement, textShine }) {
		this.textElement = textElement;
		this.outerElement = outerElement;
		this.textShine = textShine;
	}

	update(counter: number): void {
		const isNegative = counter < 0;
		const absValue = Math.abs(counter).toString().padStart(2, '0');
		const displayValue = isNegative ? `-${absValue}` : absValue;

		this.textElement.textContent = displayValue;
		this.outerElement.textContent = displayValue;
		this.textShine.textContent = displayValue;
	}

	animate(className: string): void {
		playAnimation(this.textElement, className);
		playAnimation(this.outerElement, className);
		playAnimation(this.textShine, className);
	}

	addNewScoreEffect(): void {
		this.textElement.classList.add('new-score-counter');

		setTimeout(() => {
			this.textElement.classList.remove('new-score-counter');
		}, 200);
	}

	removeNewScoreEffect(): void {
		this.textElement.classList.remove('new-score-counter');
	}
}
