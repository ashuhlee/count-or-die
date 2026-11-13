import { Fragment, useLayoutEffect, useRef, type KeyboardEvent } from "react";

import { measured, rem } from "../../../utils/app/scale.ts";
import { playSound } from "../../../utils/app/sounds.ts";
import PixelPanel from "../../components/hud/pixel-panel/PixelPanel.tsx";
import Letters from "../../components/text/letters/Letters.tsx";

type GameNotificationProps = {
  icon?: string;
  iconAlt?: string;
  iconSize?: number;
  text: string;
  border: string;
  accent?: string;
  visible?: boolean;
  delay?: number;
  still?: boolean;
  leaving?: boolean;
  shine?: boolean;
  collapse?: boolean;
  // a longer max width, for long texts
  wide?: boolean;
  id?: string;
  // makes the whole notification a button
  onClick?: () => void;
  // the button hover sound, when the mouse enters
  hoverSound?: boolean;
};

export default function GameNotification({
  icon,
  iconAlt,
  iconSize,
  text,
  border,
  accent,
  visible = true,
  delay = 0,
  still = false,
  leaving = false,
  shine = false,
  collapse = false,
  wide = false,
  id,
  onClick,
  hoverSound = false,
}: GameNotificationProps) {
  const textRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const panel = element.closest(".game-notification");
    const parts = () =>
      element.querySelectorAll<HTMLElement>(".game-notification-word");
    const longestLine = () => {
      element.style.width = "";
      return Math.max(
        ...Array.from(parts(), (part) => part.offsetLeft + part.offsetWidth),
      );
    };

    const fit = () => {
      panel?.classList.remove("game-notification--long");
      longestLine();
      const lines =
        element.offsetHeight / parseFloat(getComputedStyle(element).lineHeight);
      panel?.classList.toggle("game-notification--long", lines > 1.5);

      const longest = longestLine();
      if (longest > 0) element.style.width = measured(Math.ceil(longest) + 1);
    };

    fit();
    void document.fonts?.ready.then(fit);
  }, [text, iconSize, visible, leaving, shine]);

  useLayoutEffect(() => {
    if (!leaving || !collapse) return;
    const panel = textRef.current?.closest<HTMLElement>(".game-notification");
    panel?.style.setProperty("--collapse-from", `${panel.offsetHeight}px`);
  }, [leaving, collapse]);

  return (
    <PixelPanel
      border={border}
      accent={accent}
      id={id}
      className={`game-notification${visible ? (leaving ? " slide-out-left" : " bounce-in-left") : ""}${shine ? " shine" : ""}${wide ? " game-notification--wide" : ""}${leaving && collapse ? " game-notification--collapse" : ""}`}
      style={{ animationDelay: `${leaving ? 0 : delay}s` }}
      {...(hoverSound && { onMouseEnter: () => playSound("buttonHover") })}
      {...(onClick && {
        role: "button",
        tabIndex: 0,
        onClick,
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          if (event.key === "Enter" || event.key === " ") onClick();
        },
      })}
    >
      {icon && (
        <img
          src={icon}
          alt={iconAlt}
          className="game-notification-icon"
          style={
            iconSize
              ? { width: rem(iconSize), height: rem(iconSize) }
              : undefined
          }
        />
      )}
      <span
        ref={textRef}
        className={`game-notification-text${still ? " game-notification-text--still" : ""}`}
      >
        {text.split(" ").map((word, index, words) => (
          <Fragment key={index}>
            {index > 0 && " "}
            <span className="game-notification-word">
              <Letters
                text={word}
                step={0.2}
                duration={3}
                offset={
                  words.slice(0, index).join(" ").length + (index ? 1 : 0)
                }
              />
            </span>
          </Fragment>
        ))}
      </span>
    </PixelPanel>
  );
}
