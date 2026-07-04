import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  xFrom?: number;
  yFrom?: number;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  delay = 0,
  className,
  xFrom = 0,
  yFrom = 20,
}) => {
  const prefersReduced = useReducedMotion();

  // Under reduced motion (incl. Samsung Internet's "remove animations"), keep a
  // gentle opacity-only fade instead of disabling effects entirely — no
  // movement, so it stays vestibular-safe, but the page still feels alive.
  return (
    <motion.div
      initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: yFrom, x: xFrom }}
      whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: prefersReduced ? 0.35 : 0.5,
        delay: delay / 1000,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
