import type { CSSProperties } from "react";

type LettersProps = {
  text: string;
  // seconds between each letter's animation start (read as --delay by the CSS)
  step: number;
};

export default function Letters({ text, step }: LettersProps) {
  return (
    <>
      {text.split("").map((char, index) => (
        <span
          key={index}
          style={{ "--delay": `${index * step}s` } as CSSProperties}
        >
          {char === " " ? " " : char}
        </span>
      ))}
    </>
  );
}
