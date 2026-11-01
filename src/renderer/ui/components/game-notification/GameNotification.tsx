import PixelPanel from "../pixel-panel/PixelPanel.tsx";
import Letters from "../letters/Letters.tsx";

type GameNotificationProps = {
  icon: string;
  iconAlt: string;
  text: string;
  border: string;
  accent?: string;
  visible?: boolean;
  delay?: number;
  id?: string;
};

export default function GameNotification({
  icon,
  iconAlt,
  text,
  border,
  accent,
  visible = true,
  delay = 0,
  id,
}: GameNotificationProps) {
  return (
    <PixelPanel
      border={border}
      accent={accent}
      id={id}
      className={`game-notification${visible ? " bounce-in-left" : ""}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <img src={icon} alt={iconAlt} className="game-notification-icon" />
      <span className="game-notification-text">
        <Letters text={text} step={0.2} duration={3} />
      </span>
    </PixelPanel>
  );
}
