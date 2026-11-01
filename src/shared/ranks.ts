export type Rank = {
  min: number;
  name: string;
  badge?: string;
};

export const RANKS: readonly Rank[] = [
  { min: 0, name: "Rookie" },
  { min: 100, name: "Slow Fingers", badge: "tier_one" },
  { min: 200, name: "Finger Breaker", badge: "tier_two" },
  { min: 300, name: "Speed Demon", badge: "tier_three" },
  { min: 400, name: "Legend", badge: "tier_four" },
];

export function getRank(bestScore: number): Rank {
  return RANKS.reduce(
    (best, rank) => (bestScore >= rank.min ? rank : best),
    RANKS[0],
  );
}
