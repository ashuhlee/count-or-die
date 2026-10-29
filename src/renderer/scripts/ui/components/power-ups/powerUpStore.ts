import { createStore } from "../../createStore.ts";

export type SpawnedPowerUp = {
  id: number;
  type: string;
  icon: string;
  side: "left" | "right";
  fall: "falling" | "falling-reverse";
  // 0-1, scaled to the spawn area's width once it is on screen
  xRand: number;
  // clicked: gets the icon's on-screen position for the smoke puff
  onCollect: (rect: DOMRect) => void;
  // fell off the bottom of the screen without being clicked
  onMiss: () => void;
};

export type NewPowerUp = Omit<SpawnedPowerUp, "id">;

const store = createStore<SpawnedPowerUp[]>([]);
let nextId = 0;

// For the components: the falling power-ups, and removing one once it is gone
export const powerUpStore = {
  subscribe: store.subscribe,
  getSnapshot: store.getSnapshot,
  remove(id: number) {
    store.set(store.getSnapshot().filter((item) => item.id !== id));
  },
};

// For the game code: spawn power-ups and clear them
export const powerUps = {
  spawn(powerUp: NewPowerUp): void {
    store.set([...store.getSnapshot(), { ...powerUp, id: nextId++ }]);
  },

  clear(): void {
    store.set([]);
  },
};
