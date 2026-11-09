export const MATH_FACTS = [
  "pi = 3.1415926!",
  "E = 2.7182818!",
  "The golden ratio is 1.6180339!",
  "pi never ends and never repeats!",
  "2 is the only even prime!",
  "Zero is an even number!",
  "0.999... is exactly 1!",
  "0! is 1!",
  "5! is 120!",
  "2^10 is 1024!",
  "A googol is 10^100!",
  "111 x 111 = 12321!",
  "Fibonacci: 1 1 2 3 5 8 13!",
  "A circle has 360 degrees!",
  "A cube has 12 edges!",
  "Every square is a rectangle!",
  "Pythagoras: a^2 + b^2 = c^2!",
  "Euler: e^(i x pi) + 1 = 0!",
];

let shown = -1;

export function pickMathFact(random = Math.random()): string {
  let index = Math.floor(random * (MATH_FACTS.length - 1));
  if (index >= shown) index++;
  return MATH_FACTS[index];
}

export function rememberMathFact(fact: string): void {
  shown = MATH_FACTS.indexOf(fact);
}
