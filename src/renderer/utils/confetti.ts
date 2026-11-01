import confetti from "canvas-confetti";

export function playConfetti(): void {
  confetti({
    particleCount: 80,
    spread: 800,
    startVelocity: 30,
    scalar: 1.4,
    ticks: 100,
    origin: { x: 0.5, y: 0.2 },
    colors: ["#ffa1fd", "#af97ff", "#a8e6ff", "#ffc6ff", "#ff95ea", "#FFEEFC"],
  });
}
