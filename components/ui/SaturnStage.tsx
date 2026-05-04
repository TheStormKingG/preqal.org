import React from 'react';

type SaturnSize = 'sm' | 'md';

interface SaturnStageProps {
  imageSrc: string;
  imageAlt: string;
  size?: SaturnSize;
}

const ringStyle = (
  w: number,
  h: number,
  border: string,
  shadow: string | undefined,
  duration: string
): React.CSSProperties => ({
  width: `${w}px`,
  height: `${h}px`,
  border,
  boxShadow: shadow,
  marginLeft: `${-w / 2}px`,
  marginTop: `${-h / 2}px`,
  animation: `orbit ${duration} linear infinite`,
});

// sm: 96px container, 52px building, 2 rings
const SM_CONTAINER = 96;
const SM_BUILDING = 52;
const SM_RINGS = [
  { w: 72,  h: 18, border: '1.5px solid rgba(245,158,11,0.6)', shadow: undefined,                              dur: '8s'  },
  { w: 98,  h: 25, border: '1px solid rgba(245,158,11,0.35)',  shadow: undefined,                              dur: '14s' },
] as const;

// md: 480px container, 400px building, 3 rings that orbit dramatically beyond container (clipped by hero overflow-hidden)
const MD_CONTAINER = 480;
const MD_BUILDING = 400;
const MD_RINGS = [
  { w: 488, h: 123, border: '3.5px solid rgba(245,158,11,0.7)', shadow: '0 0 18px rgba(245,158,11,0.38)', dur: '8s'  },
  { w: 677, h: 171, border: '2px solid rgba(245,158,11,0.4)',   shadow: '0 0 10px rgba(245,158,11,0.14)', dur: '14s' },
  { w: 852, h: 216, border: '1.5px solid rgba(245,158,11,0.2)', shadow: undefined,                        dur: '22s' },
] as const;

const SaturnStage: React.FC<SaturnStageProps> = ({
  imageSrc,
  imageAlt,
  size = 'md',
}) => {
  const containerSize = size === 'sm' ? SM_CONTAINER : MD_CONTAINER;
  const buildingSize  = size === 'sm' ? SM_BUILDING  : MD_BUILDING;
  const rings         = size === 'sm' ? SM_RINGS      : MD_RINGS;

  return (
    <div
      className="saturn-stage-float"
      style={{
        position: 'relative',
        width: `${containerSize}px`,
        height: `${containerSize}px`,
        animation: 'saturn-float 6s ease-in-out infinite',
      }}
    >
      {/* Back halves — z-index 1, behind image */}
      {rings.map((r, i) => (
        <div
          key={`back-${i}`}
          className="orbit-ring ring-back"
          style={ringStyle(r.w, r.h, r.border, r.shadow, r.dur)}
        />
      ))}

      {/* Building image — z-index 2 */}
      <img
        src={imageSrc}
        alt={imageAlt}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: `${buildingSize}px`,
          height: `${buildingSize}px`,
          transform: 'translate(-50%, -50%)',
          objectFit: 'contain',
          zIndex: 2,
        }}
        loading="eager"
      />

      {/* Front halves — z-index 3, in front of image */}
      {rings.map((r, i) => (
        <div
          key={`front-${i}`}
          className="orbit-ring ring-front"
          style={ringStyle(r.w, r.h, r.border, r.shadow, r.dur)}
        />
      ))}
    </div>
  );
};

export default SaturnStage;
