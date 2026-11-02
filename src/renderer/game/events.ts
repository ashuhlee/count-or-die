export type SoundName =
  | "bgMusic"
  | "menuMusic"
  | "buttonInc"
  | "useBoost"
  | "noBoosts"
  | "highScore"
  | "goalReached"
  | "gameOver"
  | "gameOverMusic"
  | "buttonClick"
  | "mouseClick"
  | "powerUp"
  | "boostPowerUp"
  | "penalty";

export type CounterAnimation =
  | "pop"
  | "pop-dec"
  | "pop-min"
  | "pop-right"
  | "reset-shake";

export type GameEvent =
  | { type: "sound"; name: SoundName }
  | { type: "stopSound"; name: SoundName }
  | { type: "pressed"; button: "increase" | "decrease"; disabled: boolean }
  | { type: "counterAnimation"; name: CounterAnimation }
  | { type: "cursorCount"; value: number; boosted: boolean }
  | { type: "goalChanged"; direction: "forward" | "reverse" }
  | { type: "highScore"; score: number }
  | { type: "confetti" }
  | { type: "boostNotification"; points: number }
  | { type: "noBoostsFlash" }
  | { type: "noBoostsLeft" }
  | {
      type: "gameOver";
      isHighScore: boolean;
      score: number;
      newRank?: string;
    }
  | { type: "restarted" }
  | { type: "penalty" };
