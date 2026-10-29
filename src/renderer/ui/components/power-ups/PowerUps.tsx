import FallingPowerUp from "./FallingPowerUp.tsx";
import { usePowerUpSpawner } from "./usePowerUpSpawner.ts";

// Power-ups that fall down the screen. Clicking one collects it; letting it
// fall off the bottom just starts the wait for the next.
export default function PowerUps() {
  const { falling, collect, miss } = usePowerUpSpawner();

  return (
    <>
      {falling.map((item) => (
        <FallingPowerUp
          key={item.id}
          falling={item}
          onCollect={collect}
          onMiss={miss}
        />
      ))}
    </>
  );
}
