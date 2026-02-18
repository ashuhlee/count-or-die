
import confetti from 'canvas-confetti';

export function playConfetti() {
	confetti({
		particleCount: 100,
		spread: 400,
		startVelocity: 30,
		scalar: 1.4,
		ticks: 100,
		origin: { x: 0.5, y: 0.2 },
		colors: [
			'#ffacad',
			'#ffd5a5',
			'#fdffb6',
			'#cbffbf',
			'#9bf6ff',
			'#a0c4ff',
			'#bdb2ff',
			'#ffc6ff',
			'#ff95ea',
		]
	});
}