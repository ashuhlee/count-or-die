import PixelPanel from "../pixel-panel/PixelPanel.tsx";
import Letters from "../letters/Letters.tsx";

type GameNotificationProps = {
  icon: string;
  iconAlt: string;
  text: string;
  // after the text, a little smaller, like the s of seconds
  unit?: string;
  border: string;
  accent?: string;
  visible?: boolean;
  delay?: number;
  // keeps the letters from moving
  still?: boolean;
  // slides away to the left, where it came from
  leaving?: boolean;
  shine?: boolean;
  id?: string;
};

export default function GameNotification({
  icon,
  iconAlt,
  text,
  unit,
  border,
  accent,
  visible = true,
  delay = 0,
  still = false,
  leaving = false,
  shine = false,
  id,
}: GameNotificationProps) {
  return (
    <PixelPanel
      border={border}
      accent={accent}
      id={id}
      className={`game-notification${visible ? (leaving ? " slide-out-left" : " bounce-in-left") : ""}${shine ? " shine" : ""}`}
      style={{ animationDelay: `${leaving ? 0 : delay}s` }}
    >
      <img src={icon} alt={iconAlt} className="game-notification-icon" />
      <span
        className={`game-notification-text${still ? " game-notification-text--still" : ""}`}
      >
        <Letters text={text} step={0.2} duration={3} />
        {unit && <span className="game-notification-unit">{unit}</span>}
      </span>
    </PixelPanel>
  );
}
