// What the game rules report back after each action. The rules themselves
// never touch sound, the screen or storage; GameProvider and the components
// react to these.

export type SoundName =
  | "bgMusic"
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
  // a floating "+N" at the pointer (only shown when there was a pointer)
  | { type: "cursorCount"; value: number; boosted: boolean }
  | { type: "goalChanged"; direction: "forward" | "reverse" }
  | { type: "highScore"; score: number }
  | { type: "confetti" }
  | { type: "boostNotification" }
  | { type: "noBoostsFlash" }
  // the last boost was just used
  | { type: "noBoostsLeft" }
  | { type: "gameOver"; isHighScore: boolean; score: number }
  | { type: "restarted" }
  // a bad power-up was collected: shake the screen and flash it red
  | { type: "penalty" };
