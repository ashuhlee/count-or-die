
const animClasses = ["pop", "pop-dec", "reset-shake"];

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
