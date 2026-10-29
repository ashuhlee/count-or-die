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

const listeners = new Set<() => void>();
let colorIndex = 0;
let state: GoalState = {
  text: "next: 30",
  letters: null,
  letterColor: null,
  updateId: 0,
  borderColor: null,
  effect: null,
  effectId: 0,
  textEffect: false,
};

function setState(next: Partial<GoalState>): void {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

// Every letter animation (title, no-boosts text, goal) advances the same color
// cycle, and the goal box's border follows whichever color was picked last.
export function cycleThemeColor(): string {
  const color = THEME_COLORS[colorIndex];
  colorIndex = (colorIndex + 1) % THEME_COLORS.length;

  setState({ borderColor: color });
  return color;
}

// React side: read the state
export const goalStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => state,
};

// vanilla side: same API the game code already calls
export const goal = {
  update(value: number, animateByLetter = false, direction = "forward"): void {
    const text = `next: ${value}`;

    if (!animateByLetter) {
      setState({ text, letters: null });
      return;
    }

    const letterColor = cycleThemeColor();
    const isReverse = direction === "reverse";

    setState({
      text,
      letterColor,
      updateId: state.updateId + 1,
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
    setState({
      effect: direction === "forward" ? "new-goal" : "new-goal-reverse",
      effectId: state.effectId + 1,
    });
  },

  removeNewGoalEffect(): void {
    setState({ effect: null });
  },
};

export const goalText = {
  addNewTextEffect(): void {
    setState({ textEffect: true });
  },

  removeNewTextEffect(): void {
    setState({ textEffect: false });
  },
};
