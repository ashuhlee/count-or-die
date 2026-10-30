import { memo } from "react";

import PixelSwirl from "../../shaders/pixel-swirl/PixelSwirl.tsx";

export default memo(function GameOverBackground() {
  return (
    <div className="go-background">
      <PixelSwirl
        color1="#ff8be3"
        color2="#ffc4f2"
        color3="#ffa0ea"
        swirl={0.2}
        scale={1}
        contrast={5}
        pixelSize={7}
        detail={7}
        lighting={0.2}
        rotationSpeed={-0.1}
        crt={0.2}
        mouseInteraction={false}
        clickSwirl={false}
        intro={false}
      />
    </div>
  );
});
