import { useGame } from "../../../../provider/useGame.ts";
import FallingPowerUp from "./FallingPowerUp.tsx";
import { usePowerUpSpawner } from "./usePowerUpSpawner.ts";

export default function PowerUps() {
  const { falling, collect, miss } = usePowerUpSpawner();
  const { state } = useGame();

  return (
    <>
      {falling.map((item) => (
        <FallingPowerUp
          key={item.id}
          falling={item}
          gameOver={state.isGameOver}
          onCollect={collect}
          onMiss={miss}
        />
      ))}
    </>
  );
}
