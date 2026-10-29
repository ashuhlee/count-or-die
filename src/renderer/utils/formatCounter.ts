// the counter always shows at least two digits: 07, 30, -04
export function formatCounter(counter: number): string {
  const absValue = Math.abs(counter).toString().padStart(2, "0");
  return counter < 0 ? `-${absValue}` : absValue;
}
