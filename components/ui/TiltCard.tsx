import React, { useRef } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  mode: 'static' | 'dynamic';
  className?: string;
  perspective?: number;
}

const TiltCard: React.FC<TiltCardProps> = ({
  children,
  mode,
  className = '',
  perspective = 800,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== 'dynamic' || prefersReduced) return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rotateX = -((e.clientY - cy) / (rect.height / 2)) * 6;
    const rotateY = ((e.clientX - cx) / (rect.width / 2)) * 8;
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseEnter = () => {
    if (mode !== 'static' || prefersReduced) return;
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'rotateY(0deg) rotateX(0deg)';
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    if (mode === 'dynamic') {
      card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    } else if (mode === 'static' && !prefersReduced) {
      card.style.transform = 'rotateY(-8deg) rotateX(3deg)';
    }
  };

  const initialTransform =
    mode === 'static' && !prefersReduced
      ? 'rotateY(-8deg) rotateX(3deg)'
      : 'rotateX(0deg) rotateY(0deg)';

  return (
    <div style={{ perspective: `${perspective}px` }}>
      <div
        ref={cardRef}
        className={className}
        style={{
          transformStyle: 'preserve-3d',
          transform: initialTransform,
          transition: 'transform 200ms ease, box-shadow 200ms ease',
        }}
        onMouseMove={mode === 'dynamic' ? handleMouseMove : undefined}
        onMouseEnter={mode === 'static' ? handleMouseEnter : undefined}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
    </div>
  );
};

export default TiltCard;
