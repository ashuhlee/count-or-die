import type { ComponentPropsWithoutRef, CSSProperties } from "react";

type PixelButtonProps = {
  color: string;
  pixelSize?: number;
  paddingY?: number;
  shadeRows?: number;
  outline?: string;
  highlight?: string;
  shade?: string;
  textShadow?: string;
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
  className,
  style,
  children,
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
          ...(shadeRows !== undefined && { "--btn-shade-rows": shadeRows }),
          ...(outline !== undefined && { "--btn-outline": outline }),
          ...(highlight !== undefined && { "--btn-highlight": highlight }),
          ...(shade !== undefined && { "--btn-shade": shade }),
          ...(textShadow !== undefined && { "--btn-text-shadow": textShadow }),
          ...style,
        } as CSSProperties
      }
      {...rest}
    >
      <span className="pixel-btn-label">{children}</span>
    </button>
  );
}
