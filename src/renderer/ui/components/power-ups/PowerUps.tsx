import FallingPowerUp from "./FallingPowerUp.tsx";
import { usePowerUpSpawner } from "./usePowerUpSpawner.ts";

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
