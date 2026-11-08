import { Fragment, useEffect, useLayoutEffect, useRef } from "react";

import tabPurple from "@assets/ui/tabs/tab.svg";
import tabBlue from "@assets/ui/tabs/tab-blue.svg";
import closePng from "@assets/ui/tabs/close.png";
import closeHoverPng from "@assets/ui/tabs/close-hover.png";

import { useParallax } from "../../../hooks/useParallax.ts";
import { playSound } from "../../../utils/app/sounds.ts";
import Letters from "../../components/text/letters/Letters.tsx";

const TABS = { purple: tabPurple, blue: tabBlue };

const WINDOW_MARGIN = 32;
const MIN_FIT = 0.3;

export type AlertRow = { label: string; value: string; done?: boolean };

type AlertPopupProps = {
  // *words* between asterisks are highlighted
  text?: string;
  rows?: AlertRow[];
  title: string;
  tab?: keyof typeof TABS;
  leaving?: boolean;
  onYes?: () => void;
  onNo: () => void;
  okLabel?: string;
  onOk?: () => void;
  // the main button clicks, unless it starts the loading screen
  clickOk?: boolean;
};

type AlertButtonProps = {
  id: string;
  tone: "yes" | "no";
  label: string;
  onClick: () => void;
  click?: boolean;
  autoFocus?: boolean;
};

function AlertButton({
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

// the seconds between the letters of the title zooming in
const TYPING_STEP = 0.02;

type Word = { word: string; highlight: boolean };

function parseLine(line: string): Word[] {
  return line.split(/(\*[^*]+\*)/).flatMap((part) => {
    const highlight = part.length > 1 && part.startsWith("*");
    const plain = highlight ? part.slice(1, -1) : part;
    return plain
      .split(" ")
      .filter(Boolean)
      .map((word) => ({ word, highlight }));
  });
}

export default function AlertPopup({
  text = "",
  rows,
  title,
  tab = "purple",
  leaving = false,
  onYes,
  onNo,
  okLabel = "Got it",
  onOk,
  clickOk = true,
}: AlertPopupProps) {
  useParallax(true, "modal-parallax");

  const textRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const fit = () => {
      const scale = Math.min(
        1,
        (window.innerWidth - WINDOW_MARGIN) / panel.offsetWidth,
        (window.innerHeight - WINDOW_MARGIN) / panel.offsetHeight,
      );
      panel.style.setProperty("--fit", String(Math.max(scale, MIN_FIT)));
    };

    fit();
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(fit);
    observer?.observe(panel);
    window.addEventListener("resize", fit);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  useEffect(() => {
    if (leaving) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onNo();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [leaving, onNo]);

  const lines = text.split("\n").map(parseLine);
  const plainLines = lines.map((words) => words.map(({ word }) => word));
  const label = rows
    ? rows.map((row) => `${row.label} ${row.value}`).join(" ")
    : plainLines.map((words) => words.join(" ")).join(" ");

  return (
    <div
      className={`alert-popup${leaving ? " alert-popup--leaving" : ""}`}
      role="alertdialog"
      aria-modal="true"
      aria-label={label}
      onClick={(event) => {
        if (event.target === event.currentTarget) onNo();
      }}
    >
      <div id="alert-popup" ref={panelRef} className="alert-popup-panel">
        <div className={`alert-popup-tab alert-popup-tab--${tab}`}>
          <img src={TABS[tab]} alt="" className="alert-popup-header" />
          <span className="alert-popup-title" aria-label={title}>
            <Letters text={title} step={TYPING_STEP} />
          </span>
          <button
            type="button"
            id="alert-close"
            className="alert-popup-close"
            aria-label="Close"
            onClick={() => {
              onNo();
            }}
          >
            <img src={closePng} alt="" />
            <img
              src={closeHoverPng}
              alt=""
              className="alert-popup-close-hover"
            />
          </button>
        </div>
        <div
          className={`alert-popup-body${rows ? " alert-popup-body--rows" : ""}`}
        >
          {rows ? (
            <ul className="alert-popup-rows">
              {rows.map((row) => (
                <li
                  key={row.label}
                  className={`alert-popup-row${row.done ? " alert-popup-row--done" : ""}`}
                >
                  <span className="alert-popup-row-label">
                    <span className="alert-popup-row-text">{row.label}</span>
                  </span>
                  <span className="alert-popup-row-value">{row.value}</span>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <span ref={textRef} className="alert-popup-text">
                {lines.map((words, lineIndex) => (
                  <span key={lineIndex} className="alert-popup-line">
                    {words.map(({ word, highlight }, index) => (
                      <Fragment key={index}>
                        {index > 0 && " "}
                        <span
                          className={`alert-popup-word${highlight ? " alert-popup-word--highlight" : ""}`}
                        >
                          <Letters
                            text={word}
                            step={0.2}
                            duration={3}
                            offset={
                              plainLines.slice(0, lineIndex).join(" ").length +
                              (lineIndex ? 1 : 0) +
                              plainLines[lineIndex].slice(0, index).join(" ")
                                .length +
                              (index ? 1 : 0)
                            }
                          />
                        </span>
                      </Fragment>
                    ))}
                  </span>
                ))}
              </span>
            </>
          )}
          <div className="alert-popup-actions">
            {onYes ? (
              <>
                <AlertButton
                  id="alert-yes"
                  tone="yes"
                  label="Yes"
                  onClick={onYes}
                />
                <AlertButton
                  id="alert-no"
                  tone="no"
                  label="No"
                  onClick={onNo}
                />
              </>
            ) : (
              <AlertButton
                id="alert-ok"
                tone="yes"
                label={okLabel}
                onClick={onOk ?? onNo}
                click={clickOk}
                autoFocus
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
