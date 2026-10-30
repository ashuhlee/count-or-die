import { memo } from "react";

import PixelSwirlShader from "../../shaders/pixel-swirl-shader/PixelSwirlShader.tsx";

export const GAME_OVER_HUE = { start: -50, duration: 1000 };

export default memo(function GameOverBackground({
  paused,
  visible,
}: {
  paused: boolean;
  visible: boolean;
}) {
  return (
    <div className="go-background">
      <PixelSwirlShader
        color1="#ff8cdb"
        color2="#ffc4ee"
        color3="#ffa1e6"
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
        paused={paused}
        hue={visible ? 0 : GAME_OVER_HUE.start}
        hueDuration={GAME_OVER_HUE.duration}
      />
    </div>
  );
});
