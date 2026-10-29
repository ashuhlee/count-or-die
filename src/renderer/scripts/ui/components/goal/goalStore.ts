import { createStore } from "../../createStore.ts";

// splitLetters() colors, in the order they cycle through
const THEME_COLORS = ["#ff80ea", "#A193FF", "#9ad9ff", "#BEB9DC"];

type Letter = { char: string; delay: string };

type GoalState = {
  text: string;
  // set when the goal should animate in letter by letter, otherwise plain text
  letters: Letter[] | null;
  letterColor: string | null;
  // bumped per update so the letters remount and replay their animation
  updateId: number;
  // the goal box's top border matches the latest letter color
  borderColor: string | null;
  effect: "new-goal" | "new-goal-reverse" | null;
  // bumped per new-goal effect so the box remounts and replays the swing
  effectId: number;
  textEffect: boolean;
};

let colorIndex = 0;
const store = createStore<GoalState>({
  text: "next: 30",
  letters: null,
  letterColor: null,
  updateId: 0,
  borderColor: null,
  effect: null,
  effectId: 0,
  textEffect: false,
});

// Every letter animation (title, no-boosts text, goal) advances the same color
// cycle, and the goal box's border follows whichever color was picked last.
export function cycleThemeColor(): string {
  const color = THEME_COLORS[colorIndex];
  colorIndex = (colorIndex + 1) % THEME_COLORS.length;

  store.patch({ borderColor: color });
  return color;
}

// For the components: the state
export const goalStore = {
  subscribe: store.subscribe,
  getSnapshot: store.getSnapshot,
};

// For the game code: update the score and its highlight
export const goal = {
  update(value: number, animateByLetter = false, direction = "forward"): void {
    const text = `next: ${value}`;

    if (!animateByLetter) {
      store.patch({ text, letters: null });
      return;
    }

    const letterColor = cycleThemeColor();
    const isReverse = direction === "reverse";

    store.patch({
      text,
      letterColor,
      updateId: store.getSnapshot().updateId + 1,
      letters: text.split("").map((char, index) => {
        const delayIndex = isReverse ? text.length - 1 - index : index;
        return {
          char: char === " " ? " " : char,
          delay: `${delayIndex * 0.05}s`,
        };
      }),
    });
  },

  addNewGoalEffect(direction = "forward"): void {
    store.patch({
      effect: direction === "forward" ? "new-goal" : "new-goal-reverse",
      effectId: store.getSnapshot().effectId + 1,
    });
  },

  removeNewGoalEffect(): void {
    store.patch({ effect: null });
  },
};

export const goalText = {
  addNewTextEffect(): void {
    store.patch({ textEffect: true });
  },

  removeNewTextEffect(): void {
    store.patch({ textEffect: false });
  },
};
