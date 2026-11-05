export type ChallengeId =
  | "score-300"
  | "power-ups-5"
  | "power-ups-10"
  | "runs-10"
  | "runs-15";

export type RunStats = { peakScore: number; powerUps: number };

export type DayTotals = {
  bestScore: number;
  bestPowerUps: number;
  runs: number;
};

type Challenge = {
  id: ChallengeId;
  label: string;
  target: number;
  progress: (totals: DayTotals) => number;
};

export const CHALLENGES: readonly Challenge[] = [
  {
    id: "score-300",
    label: "Reach a score of 300",
    target: 300,
    progress: (totals) => totals.bestScore,
  },
  {
    id: "power-ups-5",
    label: "Collect 5 powerups in one run",
    target: 5,
    progress: (totals) => totals.bestPowerUps,
  },
  {
    id: "power-ups-10",
    label: "Collect 10 powerups in one run",
    target: 10,
    progress: (totals) => totals.bestPowerUps,
  },
  {
    id: "runs-10",
    label: "Complete 10 runs",
    target: 10,
    progress: (totals) => totals.runs,
  },
  {
    id: "runs-15",
    label: "Complete 15 runs",
    target: 15,
    progress: (totals) => totals.runs,
  },
];

export const DAILY_COUNT = 3;

export type DailyState = {
  date: string;
  ids: ChallengeId[];
  totals: DayTotals;
  done: ChallengeId[];
};

export const isChallengeId = (value: unknown): value is ChallengeId =>
  CHALLENGES.some((challenge) => challenge.id === value);

export function dateKey(now: Date): string {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function seedFrom(text: string): number {
  let hash = 2166136261;
  for (const char of text) {
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickDaily(date: string): ChallengeId[] {
  const random = seededRandom(seedFrom(date));
  const pool = CHALLENGES.map((challenge) => challenge.id);

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, DAILY_COUNT);
}

export function newDay(date: string): DailyState {
  return {
    date,
    ids: pickDaily(date),
    totals: { bestScore: 0, bestPowerUps: 0, runs: 0 },
    done: [],
  };
}

const byId = (id: ChallengeId) =>
  CHALLENGES.find((challenge) => challenge.id === id);

export function recordRun(
  state: DailyState,
  run: RunStats,
): { state: DailyState; completed: string[] } {
  const totals: DayTotals = {
    bestScore: Math.max(state.totals.bestScore, run.peakScore),
    bestPowerUps: Math.max(state.totals.bestPowerUps, run.powerUps),
    runs: state.totals.runs + 1,
  };

  const completed = state.ids
    .filter((id) => !state.done.includes(id))
    .map(byId)
    .filter(
      (challenge) =>
        challenge && challenge.progress(totals) >= challenge.target,
    );

  return {
    state: {
      ...state,
      totals,
      done: [...state.done, ...completed.map((challenge) => challenge.id)],
    },
    completed: completed.map((challenge) => challenge.label),
  };
}

export function describeDaily(state: DailyState) {
  return state.ids.map((id) => {
    const challenge = byId(id);
    const done = state.done.includes(id);
    const progress = Math.min(
      challenge.progress(state.totals),
      challenge.target,
    );
    return { label: challenge.label, progress, target: challenge.target, done };
  });
}
