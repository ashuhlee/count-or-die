import type { CSSProperties } from "react";

type LettersProps = {
  text: string;
  // seconds between each letter's animation start (read as --delay by the CSS)
  step: number;
  // how far a wavy letter rises, in pixels (read as --wave-height)
  height?: number;
  // seconds for a wavy or shaking letter to go through its motion once
  // (read as --wave-duration)
  duration?: number;
};

export default function Letters({
  text,
  step,
  height,
  duration,
}: LettersProps) {
  return (
    <>
      {text.split("").map((char, index) => (
        <span
          key={index}
          // lets the CSS draw a copy of the letter, for gradients and the like
          data-char={char === " " ? "\u00a0" : char}
          style={
            {
              "--delay": `${index * step}s`,
              "--index": index,
              "--count": text.length,
              ...(height !== undefined && { "--wave-height": `${height}px` }),
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
