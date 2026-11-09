import Game from "./ui/Game.tsx";
import GameProvider from "./provider/GameProvider.tsx";
import { betaNoticeHidden } from "./utils/storage/betaNotice.ts";

export default function App() {
  return (
    <GameProvider startOnMenu betaNotice={!betaNoticeHidden()}>
      <Game />
    </GameProvider>
  );
}
