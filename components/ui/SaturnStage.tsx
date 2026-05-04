import React from 'react';

interface SaturnStageProps {
  imageSrc: string;
  imageAlt: string;
  size?: number;
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

const SaturnStage: React.FC<SaturnStageProps> = ({
  imageSrc,
  imageAlt,
  size = 340,
}) => (
  <div
    className="saturn-stage-float"
    style={{
      position: 'relative',
      width: `${size}px`,
      height: `${size}px`,
      animation: 'saturn-float 6s ease-in-out infinite',
    }}
  >
    {/* Back halves — z-index 1, behind image */}
    <div
      className="orbit-ring ring-back"
      style={ringStyle(310, 78, '3.5px solid rgba(245,158,11,0.7)', '0 0 12px rgba(245,158,11,0.3)', '8s')}
    />
    <div
      className="orbit-ring ring-back"
      style={ringStyle(430, 108, '2px solid rgba(245,158,11,0.4)', '0 0 8px rgba(245,158,11,0.12)', '14s')}
    />
    <div
      className="orbit-ring ring-back"
      style={ringStyle(540, 136, '1.5px solid rgba(245,158,11,0.2)', undefined, '22s')}
    />

    {/* Building image — z-index 2 */}
    <img
      src={imageSrc}
      alt={imageAlt}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        zIndex: 2,
      }}
      loading="eager"
    />

    {/* Front halves — z-index 3, in front of image */}
    <div
      className="orbit-ring ring-front"
      style={ringStyle(310, 78, '3.5px solid rgba(245,158,11,0.7)', '0 0 12px rgba(245,158,11,0.3)', '8s')}
    />
    <div
      className="orbit-ring ring-front"
      style={ringStyle(430, 108, '2px solid rgba(245,158,11,0.4)', '0 0 8px rgba(245,158,11,0.12)', '14s')}
    />
    <div
      className="orbit-ring ring-front"
      style={ringStyle(540, 136, '1.5px solid rgba(245,158,11,0.2)', undefined, '22s')}
    />
  </div>
);

export default SaturnStage;
