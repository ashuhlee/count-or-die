import type { CSSProperties } from "react";
import { rem } from "../../../../utils/app/scale.ts";

type LettersProps = {
  text: string;
  step: number;
  height?: number;
  duration?: number;
  offset?: number;
};

export default function Letters({
  text,
  step,
  height,
  duration,
  offset = 0,
}: LettersProps) {
  return (
    <>
      {text.split("").map((char, index) => (
        <span
          key={index}
          data-char={char === " " ? "\u00a0" : char}
          style={
            {
              "--delay": `${(index + offset) * step}s`,
              "--index": index + offset,
              "--count": text.length,
              ...(height !== undefined && { "--wave-height": rem(height) }),
              ...(duration !== undefined && {
                "--wave-duration": `${duration}s`,
              }),
            } as CSSProperties
          }
        >
          {char === " " ? "\u00a0" : char}
        </span>
      ))}
    </>
  );
}
