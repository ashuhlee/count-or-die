export function formatCounter(counter: number): string {
  const absValue = Math.abs(counter).toString().padStart(2, "0");
  return counter < 0 ? `-${absValue}` : absValue;
}
