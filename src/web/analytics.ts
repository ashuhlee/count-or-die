const ELSEWHERE = /(^|\.)itch\.(io|zone)$/;

export function shouldTrack(hostname: string): boolean {
  return !ELSEWHERE.test(hostname);
}
