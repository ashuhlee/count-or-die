const PHRASES_REGULAR = [
  "You died lolz",
  "Lol... loser",
  "Lol. Loser.",
  "Aw, you died.",
  "You died :(",
  "Better luck next life..",
  "Nice try!",
  "Let's aim a bit higher..",
  "Sooo close!",
  "You are dead.",
  "Another try maybe?",
  "Give it another go!",
  "What a flop!",
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
