import type { ComponentPropsWithoutRef, CSSProperties } from "react";

import { playSound } from "../../../../utils/app/sounds.ts";

type PixelButtonProps = {
  color: string;
  pixelSize?: number;
  paddingY?: number;
  shadeRows?: number;
  outline?: string;
  highlight?: string;
  shade?: string;
  textShadow?: string;
  shine?: boolean;
} & ComponentPropsWithoutRef<"button">;

export default function PixelButton({
  color,
  pixelSize,
  paddingY,
  shadeRows,
  outline,
  highlight,
  shade,
  textShadow,
  shine,
  className,
  style,
  children,
  onMouseEnter,
  ...rest
}: PixelButtonProps) {
  return (
    <button
      type="button"
      className={className ? `pixel-btn ${className}` : "pixel-btn"}
      style={
        {
          "--btn-fill": color,
          ...(pixelSize !== undefined && { "--px": `${pixelSize}px` }),
          ...(paddingY !== undefined && { "--btn-pad-y": paddingY }),
          ...(shadeRows !== undefined && { "--btn-shade-base": shadeRows }),
          ...(outline !== undefined && { "--btn-outline": outline }),
          ...(highlight !== undefined && { "--btn-highlight": highlight }),
          ...(shade !== undefined && { "--btn-shade": shade }),
          ...(textShadow !== undefined && { "--btn-text-shadow": textShadow }),
          ...style,
        } as CSSProperties
      }
      onMouseEnter={(event) => {
        if (!rest.disabled) playSound("buttonHover");
        onMouseEnter?.(event);
      }}
      {...rest}
    >
      <span className="pixel-btn-label">{children}</span>
      {shine && <span className="pixel-btn-shine shine" aria-hidden="true" />}
    </button>
  );
}
