// what the game remembers between sessions

const HIGH_SCORE_KEY = "highScore";
const DEATH_COUNT_KEY = "deathCount";

function readNumber(key: string): number {
  return Number.parseInt(localStorage.getItem(key) ?? "", 10) || 0;
}

export function loadSavedGame(): { highScore: number; deathCount: number } {
  return {
    highScore: readNumber(HIGH_SCORE_KEY),
    deathCount: readNumber(DEATH_COUNT_KEY),
  };
}

export function saveHighScore(score: number): void {
  localStorage.setItem(HIGH_SCORE_KEY, String(score));
}

export function saveDeathCount(count: number): void {
  localStorage.setItem(DEATH_COUNT_KEY, String(count));
}
