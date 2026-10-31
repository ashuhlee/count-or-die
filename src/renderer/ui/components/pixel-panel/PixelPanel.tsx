import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
} from "react";

type PixelPanelProps<T extends ElementType> = {
  as?: T;
  border: string;
  // the color of the two corner dots and the inner shadow, the border's own
  // when left out
  accent?: string;
  dotOpacity?: number;
  shadowOpacity?: number;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "border">;

export default function PixelPanel<T extends ElementType = "div">({
  as,
  border,
  accent,
  dotOpacity,
  shadowOpacity,
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
          ...style,
        } as CSSProperties
      }
      {...rest}
    />
  );
}
