import { memo } from "react";

import PixelSwirlShader from "../../shaders/pixel-swirl-shader/PixelSwirlShader.tsx";

export default memo(function GameOverBackground() {
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
      />
    </div>
  );
});
