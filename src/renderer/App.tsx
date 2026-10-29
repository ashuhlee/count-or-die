import Game from "./ui/Game.tsx";
import GameProvider from "./ui/provider/GameProvider.tsx";

export default function App() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}
