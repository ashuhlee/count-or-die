
import increaseBtn from "../../assets/ui/buttons/increase.png";
import increaseBtnPress from "../../assets/ui/buttons/increase-press.png";

import powerBtn from "../../assets/ui/buttons/decrease.png";
import powerBtnPress from "../../assets/ui/buttons/decrease-press.png";

let i = 0;

const animClasses = [
	"pop",
	"pop-dec",
	"reset-shake",
	"no-boosts-shake",
	"no-boosts-flash",
	"new-goal",
	"boost-notification"
];

export const btnImages = {
	increase: {
		normal: increaseBtn,
		pressed: increaseBtnPress,
	},
	decrease: {
		normal: powerBtn,
		pressed: powerBtnPress,
	},
};


function updateColor() {
	const colors = ['#e673d2', '#A193FF', '#94BEFF', '#BEB9DC'];
	const color = colors[i];
	i = (i + 1) % colors.length;

	return color;
}

// match goal box colors with the letters
function applyColorTheme(color) {

	const goalBox = document.querySelector(".next-goal");
	goalBox.style.borderTop = `3px solid ${color}`;
}

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

// clicking animation
export function animateBtn(btnType, disabled = false) {

    const img = document.getElementById(`${btnType}-img`);
    img.src = btnImages[btnType].pressed;

	if (disabled) {
		playAnimation(img, "no-boosts-shake");
		img.animate([
			{ filter: 'opacity(0.4) drop-shadow(0 0 0 red) drop-shadow(0 0 0 red) brightness(0.8) saturate(120%)' },
			{ filter: 'none' }
		], {
			duration: 800,
			easing: 'ease',
			fill: 'forwards'
		});
	}
	setTimeout(() => {
		img.src = btnImages[btnType].normal;
	}, 100);
}

// show text by letter
export function splitLetters(className, animationType = "fade") {

	let newColor = updateColor();
	applyColorTheme(newColor);

	const elements = document.querySelectorAll(className);
	elements.forEach(element => {
		const text = element.textContent;
		element.textContent = "";

		text.split("").forEach((char, index) => {
			const span = document.createElement("span");
			span.textContent = char === " " ? "\u00A0" : char;

			if (animationType === "wavy") {
				span.style.setProperty('--delay', `${index * 0.1}s`);

			} else if (animationType === "shake") {
				span.style.setProperty('--delay', `${index * 0.2}s`);
			} else {
				span.style.setProperty('--delay', `${index * 0.05}s`);
				span.style.setProperty("color", newColor);
			}

			element.appendChild(span);
		});
	});
}

export function resetHeartEffect() {

    const heartIds = ['heart1', 'heart2', 'heart3', 'heart4'];

    heartIds.forEach(id => {
        const heart = document.getElementById(id);
        if (heart) {
            heart.style.visibility = "hidden";
			heart.getBoundingClientRect();
			heart.style.visibility = "visible";
        }
    });
}
