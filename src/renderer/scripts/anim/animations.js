
let i = 0;
const animClasses = ["pop", "pop-dec", "reset-shake", "new-goal"];

export const btnImages = {
	increase: {
		normal: "../assets/images/png/buttons/increase.png",
		pressed: "../assets/images/png/buttons/increase-press.png",
	},
	decrease: {
		normal: "../assets/images/png/buttons/decrease.png",
		pressed: "../assets/images/png/buttons/decrease-press.png",
	},
};


function updateColor() {
	const colors = ['#e68ad6', '#A193FF', '#94BEFF', '#BEB9DC', "#FFB7A4"];
	const color = colors[i];
	i = (i + 1) % colors.length;

	return color;
}

// match goal box colors with the letters
function applyColorTheme(color) {

	const goalBox = document.querySelector(".next-goal");
	goalBox.style.borderTop = `3px solid ${color}`;

	// goalBox.style.borderTop = `4px solid ${color}`;
	// goalBox.style.borderLeft = `4px solid ${color}`;
	// goalBox.style.boxShadow = `-4px 0 0 0 ${color}, 4px 0 0 0 ${color}, 0 -4px 0 0 ${color}`

	const chatDeco = document.querySelector(".chat-deco");
	chatDeco.style.fill = `${color}`;

	// const goalChatBox = document.querySelector(".goal-chatbox");
	// goalChatBox.style.filter = `drop-shadow(4px 4px 0px ${color})`;
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
export function animateBtn(btnType) {

    const img = document.getElementById(`${btnType}-img`);
    img.src = btnImages[btnType].pressed;

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

			} else {
				span.style.setProperty('--delay', `${index * 0.05}s`);
				span.style.setProperty("color", newColor);
			}

			element.appendChild(span);
		});
	});
}
