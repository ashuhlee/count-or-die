import { playSound } from "../../../../utils/app/sounds.ts";
import Letters from "../../text/letters/Letters.tsx";

type AlertButtonProps = {
  id: string;
  tone: "yes" | "no";
  label: string;
  onClick: () => void;
  click?: boolean;
  autoFocus?: boolean;
};

export default function AlertButton({
  id,
  tone,
  label,
  onClick,
  click = false,
  autoFocus,
}: AlertButtonProps) {
  return (
    <button
      type="button"
      id={id}
      className={`alert-popup-button alert-popup-button--${tone}`}
      onClick={() => {
        if (click) playSound("buttonClick");
        onClick();
      }}
      onMouseEnter={() => playSound("buttonHover")}
      autoFocus={autoFocus}
    >
      <span className="alert-popup-button-label">
        <Letters text={label} step={0.1} height={0.4} duration={1} />
      </span>
    </button>
  );
}
