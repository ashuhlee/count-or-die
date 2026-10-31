import { memo } from "react";

import PixelSwirlShader from "../../shaders/pixel-swirl-shader/PixelSwirlShader.tsx";

export default memo(function MenuBackground() {
  return (
    <div className="menu-bg">
      <PixelSwirlShader
        color1="#ff8fdb"
        color2="#ffc4ee"
        color3="#ffa1e6"
        swirl={0.2}
        scale={0.7}
        contrast={5}
        pixelSize={5}
        detail={7}
        lighting={0.2}
        rotationSpeed={-0.1}
        crt={0}
        mouseInteraction={false}
        clickSwirl={false}
        intro={false}
      />
    </div>
  );
});
