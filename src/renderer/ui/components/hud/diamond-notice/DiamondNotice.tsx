import type { CSSProperties, ReactNode } from "react";
import Letters from "../../text/letters/Letters.tsx";

const STEP = 0.014;
const TILT = 8;

const SHAPE_TURN = 15;
const MIN_CHANGE = 10;
let lastTurn = 0;

export function nextShapeTurn(): number {
  const turns: number[] = [];
  for (let turn = -SHAPE_TURN; turn <= SHAPE_TURN; turn++) {
    if (Math.abs(turn - lastTurn) >= MIN_CHANGE) turns.push(turn);
  }
  lastTurn = turns[Math.floor(Math.random() * turns.length)];
  return lastTurn;
}

type DiamondNoticeProps = {
  text: string;
  fill: string;
  place: "left" | "right";
  turn: number;
  sparkles?: boolean;
  id?: string;
};

export default function DiamondNotice({
  text,
  fill,
  place,
  turn,
  sparkles = false,
  id,
}: DiamondNoticeProps) {
  const style = {
    "--fill": fill,
    "--tilt": `${place === "left" ? -TILT : TILT}deg`,
  } as CSSProperties;
  const shapeStyle = { ...style, "--tilt": `${turn}deg` } as CSSProperties;

  const lines = text.split("\n");
  const letters = (
    <span className="diamond-notice-text">
      {lines.map((line, index) => (
        <span key={index} className="diamond-notice-line">
          <Letters
            text={line}
            step={STEP}
            offset={lines.slice(0, index).join("").length}
          />
        </span>
      ))}
    </span>
  );

  const layer = (name: string, children: ReactNode) => (
    <div
      className={`diamond-notice diamond-notice--${place} diamond-notice--${name}`}
      style={name === "shape" ? shapeStyle : style}
      aria-hidden={name === "shadow" || name === "sparkles" || undefined}
    >
      <div className="diamond-notice-body">{children}</div>
    </div>
  );

  return (
    <div id={id} className="diamond-notice-group">
      {layer(
        "shape",
        <svg
          className="diamond-notice-shape"
          viewBox="0 0 128 128"
          aria-hidden="true"
        >
          <rect width="128" height="128" fill="var(--fill)" />
        </svg>,
      )}
      {layer("shadow", letters)}
      {layer("text", letters)}
      {sparkles &&
        layer(
          "sparkles",
          <div className="diamond-notice-sparkles">
            <span className="diamond-notice-sparkle diamond-notice-sparkle--top" />
            <span className="diamond-notice-sparkle diamond-notice-sparkle--bottom" />
          </div>,
        )}
    </div>
  );
}
