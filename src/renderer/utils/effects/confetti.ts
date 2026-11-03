import confetti from "canvas-confetti";
import sparkleSvg from "@assets/ui/deco/sparkle.svg?raw";

const SPARKLE_SIZE = 16;
const SPARKLE_SCALE = SPARKLE_SIZE / 128;

let sparkle: confetti.Shape | undefined;
const getSparkle = () =>
  (sparkle ??= confetti.shapeFromPath({
    path: /\sd="([^"]+)"/.exec(sparkleSvg)![1],
    matrix: [
      SPARKLE_SCALE,
      0,
      0,
      SPARKLE_SCALE,
      -SPARKLE_SIZE / 2,
      -SPARKLE_SIZE / 2,
    ],
  }));

const look = () => ({
  scalar: 1.5,
  colors: ["#ffa1fd", "#af97ff", "#a8e6ff", "#ffc6ff", "#ff95ea", "#FFEEFC"],
  shapes: ["square", getSparkle()] as confetti.Shape[],
});

function burst(): void {
  confetti({
    ...look(),
    particleCount: 80,
    spread: 800,
    startVelocity: 30,
    ticks: 100,
    origin: { x: 0.5, y: 0.2 },
  });
}

export const FIREWORKS = { duration: 400, every: 300, count: 50 };

const between = (min: number, max: number) => min + Math.random() * (max - min);

function fireworks(): void {
  const end = Date.now() + FIREWORKS.duration;

  const round = (): boolean => {
    const left = end - Date.now();
    if (left <= 0) return false;

    const options = {
      ...look(),
      startVelocity: 30,
      spread: 400,
      ticks: 100,
      particleCount: FIREWORKS.count * (left / FIREWORKS.duration),
    };
    confetti({
      ...options,
      origin: { x: between(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...options,
      origin: { x: between(0.7, 0.9), y: Math.random() - 0.2 },
    });
    return true;
  };

  round();
  const timer = setInterval(() => {
    if (!round()) clearInterval(timer);
  }, FIREWORKS.every);
}

let fireworksNext = false;

export function playConfetti(): void {
  if (fireworksNext) fireworks();
  else burst();
  fireworksNext = !fireworksNext;
}
