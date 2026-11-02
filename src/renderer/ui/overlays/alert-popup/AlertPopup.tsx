import { Fragment, useEffect, useLayoutEffect, useRef } from "react";

import PixelPanel from "../../components/hud/pixel-panel/PixelPanel.tsx";
import Letters from "../../components/text/letters/Letters.tsx";

type AlertPopupProps = {
  text: string;
  border: string;
  leaving?: boolean;
  onYes: () => void;
  onNo: () => void;
};

type AlertButtonProps = {
  id: string;
  tone: "yes" | "no";
  label: string;
  onClick: () => void;
};

function AlertButton({ id, tone, label, onClick }: AlertButtonProps) {
  return (
    <button
      type="button"
      id={id}
      className={`alert-popup-button alert-popup-button--${tone}`}
      onClick={onClick}
    >
      <Letters text={label} step={0.1} height={0.7} duration={1} />
    </button>
  );
}

export default function AlertPopup({
  text,
  border,
  leaving = false,
  onYes,
  onNo,
}: AlertPopupProps) {
  const textRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const fit = () => {
      element.style.width = "";
      const longest = Math.max(
        ...Array.from(
          element.querySelectorAll<HTMLElement>(".alert-popup-word"),
          (word) => word.offsetLeft + word.offsetWidth,
        ),
      );
      if (longest > 0) element.style.width = `${Math.ceil(longest) + 1}px`;
    };

    fit();
    void document.fonts?.ready.then(fit);
  }, [text]);

  // Escape says no
  useEffect(() => {
    if (leaving) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onNo();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [leaving, onNo]);

  // a new line starts after each \n
  const lines = text.split("\n");

  return (
    <div
      className={`alert-popup${leaving ? " alert-popup--leaving" : ""}`}
      role="alertdialog"
      aria-modal="true"
      aria-label={text}
      onClick={(event) => {
        if (event.target === event.currentTarget) onNo();
      }}
    >
      <PixelPanel
        id="alert-popup"
        border={border}
        className="alert-popup-panel"
      >
        <span ref={textRef} className="alert-popup-text">
          {lines.map((line, lineIndex) => (
            <span key={lineIndex} className="alert-popup-line">
              {line.split(" ").map((word, index, words) => (
                <Fragment key={index}>
                  {index > 0 && " "}
                  <span className="alert-popup-word">
                    <Letters
                      text={word}
                      step={0.2}
                      duration={3}
                      offset={
                        lines.slice(0, lineIndex).join(" ").length +
                        (lineIndex ? 1 : 0) +
                        words.slice(0, index).join(" ").length +
                        (index ? 1 : 0)
                      }
                    />
                  </span>
                </Fragment>
              ))}
            </span>
          ))}
        </span>
        <div className="alert-popup-actions">
          <AlertButton id="alert-yes" tone="yes" label="Yes" onClick={onYes} />
          <AlertButton id="alert-no" tone="no" label="No" onClick={onNo} />
        </div>
      </PixelPanel>
    </div>
  );
}
