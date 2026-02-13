
let boostIndex = 0;

function cycleColor(type) {
	let color;

	const colors = [
		'#E8E3F8',
		'#83d0ff',
		'#ae9eff',
		'#FF98E1',
	];

	if (type === 'boost') {
		color = colors[boostIndex];
		boostIndex = (boostIndex + 1) % colors.length;
	}
	else {
		color = '#FFFFFF';
	}
	return color;
}

export function displayCursorCount(value, event, isBoosted = false) {

	let textColor = cycleColor(isBoosted ? 'boost' : 'reg');

	// pointer position
	const cursorX = event.clientX;
	const cursorY = event.clientY;

	const cursorText = document.createElement('span');
	cursorText.className = 'count-cursor';
	cursorText.textContent = `+${value}`;

	cursorText.style.left = `${cursorX}px`;
	cursorText.style.top = `${cursorY}px`;

	cursorText.style.color = textColor;

	cursorText.style.textShadow = '0 2px 0 var(--shadow-pink-020)';

	document.body.appendChild(cursorText);

	const xPos = (Math.random() - 0.5) * 70;
	const rotateDeg = (Math.random() - 0.5) * 50;

	const animation = cursorText.animate([
		{
			opacity: isBoosted ? 1 : 0.7,
			transform: `translateY(-20px) translateX(0) rotate(0) scale(1)`,
		},
		{
			opacity: 0,
			transform: `translateY(-80px)
						translateX(${xPos}px)
						rotate(${isBoosted ? rotateDeg : xPos}deg)
						scale(${isBoosted ? 1.4 : 1.2})`,
			color: textColor
		}
	], {
		duration: 700,
		easing: 'ease-out'
	})

	animation.addEventListener('finish', () => {
		if (cursorText.parentNode) {
			cursorText.parentNode.removeChild(cursorText);
		}
	})

}