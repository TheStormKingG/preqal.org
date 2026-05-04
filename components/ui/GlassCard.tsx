import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => (
  <div
    className={className}
    style={{
      background: 'rgba(224,229,236,0.78)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderRadius: '18px',
      padding: '28px 24px',
      boxShadow:
        '6px 6px 18px rgba(163,177,198,0.55), -4px -4px 14px rgba(255,255,255,0.9), inset 0 1px 0 rgba(255,255,255,0.65)',
      border: '1px solid rgba(255,255,255,0.55)',
    }}
  >
    {children}
  </div>
);

export default GlassCard;
