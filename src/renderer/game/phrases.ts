const PHRASES_REGULAR = [
  "you died lolz",
  "lol loser",
  "aw, you died",
  "you died :(",
  "better luck next life..",
  "nice try!",
  "let's aim a bit higher..",
  "sooo close!",
  "you are dead",
  "another try maybe?",
  "give it another go!",
];

const PHRASES_NEW_SCORE = [
  "new high score!",
  "you beat your best score!",
  "you're getting better!",
  "oooh, a new record!",
];

export function pickGameOverPhrase(
  isHighScore: boolean,
  random: number,
): string {
  const phrases = isHighScore ? PHRASES_NEW_SCORE : PHRASES_REGULAR;
  return phrases[Math.floor(random * phrases.length)];
}
