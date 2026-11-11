import { useState } from "react";

import Game from "./ui/Game.tsx";
import GameProvider from "./provider/GameProvider.tsx";
import { betaNoticeSeen } from "./utils/storage/betaNotice.ts";

export default function App() {
  // the beta notice is for the first time the game is opened only
  const [showNotice] = useState(() => !betaNoticeSeen());

  return (
    <GameProvider startOnMenu betaNotice={showNotice}>
      <Game />
    </GameProvider>
  );
}
