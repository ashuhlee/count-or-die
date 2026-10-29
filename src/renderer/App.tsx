import Game from "./ui/Game.tsx";
import GameProvider from "./ui/provider/GameProvider.tsx";

// the game, and the page that shows it
export default function App() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}
