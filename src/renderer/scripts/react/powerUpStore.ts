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

const listeners = new Set<() => void>();
let items: SpawnedPowerUp[] = [];
let nextId = 0;

function setItems(next: SpawnedPowerUp[]): void {
  items = next;
  listeners.forEach((listener) => listener());
}

// React side: read the falling power-ups and remove them once they are gone
export const powerUpStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => items,
  remove(id: number) {
    setItems(items.filter((item) => item.id !== id));
  },
};

// vanilla side: the power-up system spawns and clears them
export const powerUps = {
  spawn(powerUp: NewPowerUp): void {
    setItems([...items, { ...powerUp, id: nextId++ }]);
  },

  clear(): void {
    setItems([]);
  },
};
