import type { ButtonHTMLAttributes } from "react";

import button1 from "@assets/ui/buttons/button-1.png";
import button2 from "@assets/ui/buttons/button-2.png";
import button3 from "@assets/ui/buttons/button-3.png";
import button4 from "@assets/ui/buttons/button-4.png";
import button5 from "@assets/ui/buttons/button-5.png";

const FACES = { 1: button1, 2: button2, 3: button3, 4: button4, 5: button5 };

type RoundButtonProps = {
  variant: keyof typeof FACES;
  icon: string;
  iconAlt: string;
  iconId?: string;
  iconSize?: number;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function RoundButton({
  variant,
  icon,
  iconAlt,
  iconId,
  iconSize = 22,
  className,
  ...buttonProps
}: RoundButtonProps) {
  return (
    <button
      type="button"
      className={className ? `round-btn ${className}` : "round-btn"}
      {...buttonProps}
    >
      <img className="round-btn-face" alt="" src={FACES[variant]} />
      <img
        id={iconId}
        className="round-btn-icon"
        alt={iconAlt}
        src={icon}
        style={{ width: iconSize }}
      />
    </button>
  );
}
