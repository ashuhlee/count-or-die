import type { CSSProperties, ReactNode } from "react";
import Letters from "../letters/Letters.tsx";

const STEP = 0.014;
const TILT = 8;

type DiamondNoticeProps = {
  text: string;
  fill: string;
  place: "left" | "right";
  id?: string;
};

export default function DiamondNotice({
  text,
  fill,
  place,
  id,
}: DiamondNoticeProps) {
  const style = {
    "--fill": fill,
    "--tilt": `${place === "left" ? -TILT : TILT}deg`,
  } as CSSProperties;

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
      style={style}
      aria-hidden={name === "shadow" || undefined}
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
          <polygon points="64,0 128,64 64,128 0,64" fill="var(--fill)" />
        </svg>,
      )}
      {layer("shadow", letters)}
      {layer("text", letters)}
    </div>
  );
}
