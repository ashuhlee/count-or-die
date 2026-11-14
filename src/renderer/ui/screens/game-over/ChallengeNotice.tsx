import { useEffect } from "react";

import checkIcon from "@assets/ui/deco/check_grey.svg";

import GameNotification from "../../overlays/game-notification/GameNotification.tsx";
import {
  COLLAPSE_EXIT,
  SHOWN_FOR,
  useTimedNotification,
} from "../../overlays/game-notification/useTimedNotification.ts";

type ChallengeNoticeProps = {
  text: string;
  border: string;
  visible: boolean;
  delay: number;
  id: string;
};

export default function ChallengeNotice({
  text,
  border,
  visible,
  delay,
  id,
}: ChallengeNoticeProps) {
  const { shown, show } = useTimedNotification(
    delay * 1000 + SHOWN_FOR,
    COLLAPSE_EXIT,
  );

  useEffect(() => {
    if (visible) show();
  }, [visible, show]);

  if (!shown) return null;

  return (
    <GameNotification
      icon={checkIcon}
      iconAlt="check"
      text={text}
      wide
      collapse
      border={border}
      leaving={shown.leaving}
      delay={delay}
      shine
      id={id}
    />
  );
}
