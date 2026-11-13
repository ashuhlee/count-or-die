const BASE_FONT_SIZE = 16;

export const rem = (px: number) => `${px / BASE_FONT_SIZE}rem`;

export const unit = () =>
  parseFloat(getComputedStyle(document.documentElement).fontSize) /
    BASE_FONT_SIZE || 1;

export const measured = (px: number) => `${px / (unit() * BASE_FONT_SIZE)}rem`;
