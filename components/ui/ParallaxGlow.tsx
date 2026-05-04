import React, { useEffect, useRef } from 'react';

interface ParallaxGlowProps {
  className?: string;
  top?: string | number;
  left?: string | number;
}

const ParallaxGlow: React.FC<ParallaxGlowProps> = ({
  className = '',
  top = 0,
  left = 0,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const handleScroll = () => {
      if (!ref.current) return;
      ref.current.style.transform = `translateY(${window.scrollY * 0.15}px)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`absolute pointer-events-none rounded-full ${className}`}
      style={{
        width: '320px',
        height: '320px',
        top,
        left,
        background:
          'radial-gradient(circle, rgba(245,158,11,0.12), transparent 68%)',
        zIndex: 0,
      }}
    />
  );
};

export default ParallaxGlow;
