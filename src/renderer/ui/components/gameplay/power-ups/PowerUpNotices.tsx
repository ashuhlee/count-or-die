import { useState } from "react";

import { getPowerUp, type PowerUpType } from "../../../../game/powerUps.ts";
import { useGameEvent } from "../../../../provider/useGameEvent.ts";
import DiamondNotice, {
  nextShapeTurn,
} from "../../hud/diamond-notice/DiamondNotice.tsx";
import { useTimedNotification } from "../../../overlays/game-notification/useTimedNotification.ts";
import { POWER_UP_LABELS } from "./powerUpLabels.ts";

const SHOWN_FOR = 500;

const GOOD = "#93E5FF";
const BAD = "#ff618b";
const BOOST = "#FF93E1";

export default function PowerUpNotices() {
  const powerUpNotice = useTimedNotification(SHOWN_FOR, 0);
  const boostNotice = useTimedNotification(SHOWN_FOR, 0);
  const [picked, setPicked] = useState<PowerUpType | null>(null);
  const [powerUpTurn, setPowerUpTurn] = useState(0);
  const [boostTurn, setBoostTurn] = useState(0);

  useGameEvent("powerUpPicked", (event) => {
    setPicked(event.powerUp);
    setPowerUpTurn(nextShapeTurn());
    powerUpNotice.show();
  });
  useGameEvent("boostNotification", () => {
    setBoostTurn(nextShapeTurn());
    boostNotice.show();
  });

  const bad = picked !== null && getPowerUp(picked).effect === "bad";

  return (
    <>
      {powerUpNotice.shown && picked && (
        <DiamondNotice
          key={powerUpNotice.shown.id}
          id="power-up-notice"
          text={POWER_UP_LABELS[picked]}
          fill={bad ? BAD : GOOD}
          place="left"
          turn={powerUpTurn}
        />
      )}
      {boostNotice.shown && (
        <DiamondNotice
          key={boostNotice.shown.id}
          id="boost-notice"
          text="Boost!"
          fill={BOOST}
          place="right"
          turn={boostTurn}
        />
      )}
    </>
  );
}
