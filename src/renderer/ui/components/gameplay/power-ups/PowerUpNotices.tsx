import { useState } from "react";

import { getPowerUp, type PowerUpType } from "../../../../game/powerUps.ts";
import { useGameEvent } from "../../../../provider/useGameEvent.ts";
import DiamondNotice, {
  nextShapeTurn,
} from "../../hud/diamond-notice/DiamondNotice.tsx";
import { useTimedNotification } from "../../../overlays/game-notification/useTimedNotification.ts";
import { POWER_UP_LABELS } from "./powerUpLabels.ts";

const SHOWN_FOR = 600;
const NEW_BEST_SHOWN_FOR = 700;

export const NOTICE_COLORS = {
  good: "#a6e4f7",
  bad: "#ff618b",
  boost: "#FF91E0",
  newBest: "#B1AEFF",
};

export default function PowerUpNotices() {
  const powerUpNotice = useTimedNotification(SHOWN_FOR, 0);
  const boostNotice = useTimedNotification(SHOWN_FOR, 0);
  const [picked, setPicked] = useState<PowerUpType | null>(null);
  const [powerUpTurn, setPowerUpTurn] = useState(0);
  const [boostTurn, setBoostTurn] = useState(0);
  const [boostPoints, setBoostPoints] = useState(0);

  const newBestNotice = useTimedNotification(NEW_BEST_SHOWN_FOR, 0);
  const [newBestTurn, setNewBestTurn] = useState(0);
  const [newBestSide, setNewBestSide] = useState<"left" | "right">("left");

  useGameEvent("powerUpPicked", (event) => {
    setPicked(event.powerUp);
    setPowerUpTurn(nextShapeTurn());
    powerUpNotice.show();
  });
  useGameEvent("boostNotification", (event) => {
    setBoostPoints(event.points);
    setBoostTurn(nextShapeTurn());
    boostNotice.show();
  });
  useGameEvent("newBest", (event) => {
    setNewBestTurn(nextShapeTurn());
    setNewBestSide(event.boosted || Math.random() < 0.5 ? "left" : "right");
    newBestNotice.show();
  });

  const bad = picked !== null && getPowerUp(picked).effect === "bad";

  return (
    <>
      {powerUpNotice.shown && picked && (
        <DiamondNotice
          key={powerUpNotice.shown.id}
          id="power-up-notice"
          text={POWER_UP_LABELS[picked]}
          fill={bad ? NOTICE_COLORS.bad : NOTICE_COLORS.good}
          place="left"
          turn={powerUpTurn}
        />
      )}
      {boostNotice.shown && (
        <DiamondNotice
          key={boostNotice.shown.id}
          id="boost-notice"
          text={`+${boostPoints}\nCount!`}
          fill={NOTICE_COLORS.boost}
          place="right"
          turn={boostTurn}
        />
      )}
      {newBestNotice.shown && (
        <DiamondNotice
          key={newBestNotice.shown.id}
          id="new-best-notice"
          text={"New\nBest!"}
          fill={NOTICE_COLORS.newBest}
          place={newBestSide}
          turn={newBestTurn}
          shownFor={NEW_BEST_SHOWN_FOR}
          sparkles
        />
      )}
    </>
  );
}
