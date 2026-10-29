import { gameOverScreen } from "../react/gameOverStore.ts";

const phrasesRegular = [
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

const phrasesNewScore = [
  "new high score!",
  "you beat your best score!",
  "you're getting better!",
  "oooh, a new record!",
];

function setRandomText(arr: string[]): string {
  const i = Math.floor(Math.random() * arr.length);
  return arr[i];
}

export function toggleGameOver(
  isGameOver = false,
  highScoreReached = false,
): void {
  const phrase = setRandomText(
    highScoreReached ? phrasesNewScore : phrasesRegular,
  );

  if (isGameOver) {
    gameOverScreen.show(phrase, highScoreReached);
  } else {
    gameOverScreen.hide(phrase);
  }
}

export function youDiedConsole(finalScore: string | number) {
  console.log(
    "%c▓██   ██▓ ▒█████   █    ██    ▓█████▄  ██▓▓█████ ▓█████▄ \n" +
      " ▒██  ██▒▒██▒  ██▒ ██  ▓██▒   ▒██▀ ██▌▓██▒▓█   ▀ ▒██▀ ██▌\n" +
      "  ▒██ ██░▒██░  ██▒▓██  ▒██░   ░██   █▌▒██▒▒███   ░██   █▌\n" +
      "  ░ ▐██▓░▒██   ██░▓▓█  ░██░   ░▓█▄   ▌░██░▒▓█  ▄ ░▓█▄   ▌\n" +
      "  ░ ██▒▓░░ ████▓▒░▒▒█████▓    ░▒████▓ ░██░░▒████▒░▒████▓ \n" +
      "   ██▒▒▒ ░ ▒░▒░▒░ ░▒▓▒ ▒ ▒     ▒▒▓  ▒ ░▓  ░░ ▒░ ░ ▒▒▓  ▒ \n" +
      " ▓██ ░▒░   ░ ▒ ▒░ ░░▒░ ░ ░     ░ ▒  ▒  ▒ ░ ░ ░  ░ ░ ▒  ▒ \n" +
      " ▒ ▒ ░░  ░ ░ ░ ▒   ░░░ ░ ░     ░ ░  ░  ▒ ░   ░    ░ ░  ░ \n" +
      " ░ ░         ░ ░     ░           ░     ░     ░  ░   ░    \n" +
      " ░ ░                           ░                  ░      \n\n" +
      `Final score: ${finalScore}`,
    "color: #FF2659",
  );
}
