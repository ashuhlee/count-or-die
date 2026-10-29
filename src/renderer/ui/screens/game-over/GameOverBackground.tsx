import { memo } from "react";

import Balatro from "../../components/balatro/Balatro.tsx";

// Never re-renders: the game changes constantly, but this has no props to
// follow, and re-rendering Balatro would make it re-measure itself each time.
export default memo(function GameOverBackground() {
  return (
    <div className="go-background">
      <Balatro
        color1="#fd93e4"
        color2="#ff90e5"
        color3="#ffbaee"
        swirl={0.19}
        pixelSize={5.5}
        mouseInteraction
        lighting={0.2}
        rotationSpeed={-0.3}
        crt={0.3}
        mouseStrength={0.35}
        clickSwirl={false}
        intro={false}
      />
    </div>
  );
});
