import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
} from "react";
import { rem } from "../../../../utils/app/scale.ts";

type PixelPanelProps<T extends ElementType> = {
  as?: T;
  border: string;
  // the color of the two corner dots and the inner shadow, the border's own
  // when left out
  accent?: string;
  dotOpacity?: number;
  shadowOpacity?: number;
  // 0 to 1, how tall the shadow along the bottom is, as a share of the
  // panel's height
  shadowHeight?: number;
  // how thick the border is in CSS pixels, the size of a pixel of the panel when
  // left out
  borderSize?: number;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "border">;

export default function PixelPanel<T extends ElementType = "div">({
  as,
  border,
  accent,
  dotOpacity,
  shadowOpacity,
  shadowHeight,
  borderSize,
  className,
  style,
  ...rest
}: PixelPanelProps<T>) {
  const Tag: ElementType = as ?? "div";

  return (
    <Tag
      className={className ? `pixel-panel ${className}` : "pixel-panel"}
      style={
        {
          "--panel-border": border,
          ...(accent !== undefined && { "--panel-accent": accent }),
          ...(dotOpacity !== undefined && {
            "--panel-dot-opacity": `${dotOpacity * 100}%`,
          }),
          ...(shadowOpacity !== undefined && {
            "--panel-shade": `${shadowOpacity * 100}%`,
          }),
          ...(shadowHeight !== undefined && {
            "--panel-shadow-height": `${shadowHeight * 100}%`,
          }),
          ...(borderSize !== undefined && {
            "--panel-border-size": rem(borderSize),
          }),
          ...style,
        } as CSSProperties
      }
      {...rest}
    />
  );
}
