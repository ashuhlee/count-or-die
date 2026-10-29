import Game from "./ui/Game.tsx";
import GameProvider from "./provider/GameProvider.tsx";

export default function App() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}
