import { useGame } from "../../../provider/useGame.ts";
import FallingPowerUp from "./FallingPowerUp.tsx";
import { usePowerUpSpawner } from "./usePowerUpSpawner.ts";

export default function PowerUps() {
  const { falling, collect, miss } = usePowerUpSpawner();
  const { state, paused } = useGame();

  return (
    <>
      {falling.map((item) => (
        <FallingPowerUp
          key={item.id}
          falling={item}
          gameOver={state.isGameOver}
          paused={paused}
          onCollect={collect}
          onMiss={miss}
        />
      ))}
    </>
  );
}
