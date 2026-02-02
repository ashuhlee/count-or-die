
const animClasses = ["pop", "pop-dec", "reset-shake", "new-goal"];

// main animation function
export function playAnimation(element, className) {

	// reset animations
	element.style.animation = "none	";
	element.getBoundingClientRect();
	element.style.animation = "";

	// remove old anim classes -> add new anim
	element.classList.remove(...animClasses);
	element.classList.add(className);
}

// play animation on multiple elements at once
export function playAnimationMulti(elements, className) {
	elements.forEach(element => {
		playAnimation(element, className)
	});
}

// show text by letter
export function wrapLetters(className) {
	const elements = document.querySelectorAll(className);
	elements.forEach(element => {
		const text = element.textContent;
		element.textContent = "";

		text.split("").forEach((char, index) => {
			const span = document.createElement("span");
			span.textContent = char === " " ? "\u00A0" : char;
			span.style.setProperty('--delay', `${index * 0.05}s`);
			element.appendChild(span);
		});
	});
}

// trigger animation
export function playLetterAnim(element) {
	const spans = element.querySelectorAll('span');
	spans.forEach(span => {
		span.style.animation = 'none';
		span.offsetHeight;
		span.style.animation = '';
	});
}
