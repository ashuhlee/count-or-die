import { useGame } from "../../provider/useGame.ts";

export default function HighScore() {
  const { state } = useGame();

  return (
    <h1
      id="high-score"
      className={`animate__animated${state.isHighScore ? " new-score" : ""}`}
    >
      {`high score: ${state.highScore}`}
    </h1>
  );
}
