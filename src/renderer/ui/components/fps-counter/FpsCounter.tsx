import { useFps } from "../../../hooks/useFps.ts";

export default function FpsCounter() {
  const fps = useFps();

  return (
    <p className="fps-counter" id="fps-counter">
      {fps === 0 ? "--" : fps} FPS
    </p>
  );
}
