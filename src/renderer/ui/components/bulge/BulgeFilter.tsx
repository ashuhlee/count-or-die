import bulgeMap from "@assets/ui/effects/bulge-map.png?inline";

type BulgeFilterProps = {
  id: string;
  strength: number;
  area: number;
};

export default function BulgeFilter({ id, strength, area }: BulgeFilterProps) {
  const margin = ((area - 1) / 2) * 100;

  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      style={{ position: "absolute" }}
    >
      <filter
        id={id}
        x={`${-margin}%`}
        y={`${-margin}%`}
        width={`${area * 100}%`}
        height={`${area * 100}%`}
        colorInterpolationFilters="sRGB"
      >
        <feImage href={bulgeMap} preserveAspectRatio="none" result="map" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="map"
          scale={strength * 4}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}
