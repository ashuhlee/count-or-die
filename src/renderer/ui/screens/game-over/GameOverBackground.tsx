import { memo } from "react";

import PixelSwirlShader from "../../shaders/pixel-swirl-shader/PixelSwirlShader.tsx";

export const GAME_OVER_HUE = { start: -30, duration: 900 };

export default memo(function GameOverBackground({
  paused,
  visible,
  hueDuration = GAME_OVER_HUE.duration,
}: {
  paused: boolean;
  visible: boolean;
  hueDuration?: number;
}) {
  return (
    <div className="go-background">
      <PixelSwirlShader
        color1="#f65fba"
        color2="#ffc4ee"
        color3="#ff8ed7"
        swirl={0.2}
        scale={0.9}
        contrast={5}
        pixelSize={5}
        detail={4}
        lighting={0.2}
        rotationSpeed={-0.1}
        crt={0}
        mouseInteraction={false}
        clickSwirl={false}
        intro={false}
        paused={paused}
        hue={visible ? 0 : GAME_OVER_HUE.start}
        hueDuration={hueDuration}
      />
    </div>
  );
});
