import { memo } from "react";

import PixelSwirl from "../../shaders/pixel-swirl/PixelSwirl.tsx";

export default memo(function GameBackground() {
  return (
    <div className="game-background">
      <PixelSwirl
        color1="#ff54d6"
        color2="#ffa0ea"
        color3="#ffa0ea"
        swirl={0.2}
        scale={1}
        contrast={5}
        pixelSize={4}
        detail={7}
        lighting={0}
        rotationSpeed={-0.1}
        crt={0.1}
        mouseInteraction={false}
        clickSwirl={false}
        intro={false}
      />
    </div>
  );
});
