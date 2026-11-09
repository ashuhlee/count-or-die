export const DESIGN = { width: 1440, height: 825 };

const PHONE_WIDTH = 700;
const SMALLEST = 0.5;

export function viewportScale(width: number, height: number): number {
  if (width < PHONE_WIDTH) return 1;

  const fit = Math.min(width / DESIGN.width, height / DESIGN.height);
  return Math.max(SMALLEST, Math.min(1, fit));
}
