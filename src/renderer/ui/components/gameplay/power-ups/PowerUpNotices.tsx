import { useState } from "react";

import { getPowerUp, type PowerUpType } from "../../../../game/powerUps.ts";
import { useGameEvent } from "../../../../provider/useGameEvent.ts";
import DiamondNotice from "../../hud/diamond-notice/DiamondNotice.tsx";
import { useTimedNotification } from "../../../overlays/game-notification/useTimedNotification.ts";
import { POWER_UP_LABELS } from "./powerUpLabels.ts";

const SHOWN_FOR = 500;

const GOOD = "#98E5FF";
const BAD = "#ff68a0";
const BOOST = "#FC92E0";

export default function PowerUpNotices() {
  const powerUpNotice = useTimedNotification(SHOWN_FOR, 0);
  const boostNotice = useTimedNotification(SHOWN_FOR, 0);
  const [picked, setPicked] = useState<PowerUpType | null>(null);

  useGameEvent("powerUpPicked", (event) => {
    setPicked(event.powerUp);
    powerUpNotice.show();
  });
  useGameEvent("boostNotification", boostNotice.show);

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
        />
      )}
      {boostNotice.shown && (
        <DiamondNotice
          key={boostNotice.shown.id}
          id="boost-notice"
          text="Boost!"
          fill={BOOST}
          place="right"
        />
      )}
    </>
  );
}
