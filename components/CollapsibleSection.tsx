import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  headingLevel?: 'h2' | 'h3';
  defaultOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  headingLevel = 'h3',
  defaultOpen = false,
  onToggle,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<string>(defaultOpen ? 'none' : '0px');

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setMaxHeight(`${contentRef.current.scrollHeight}px`);
    } else {
      setMaxHeight('0px');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const el = contentRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setMaxHeight(`${el.scrollHeight}px`);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [isOpen]);

  const Heading = headingLevel;
  const headingSizeClass = headingLevel === 'h2'
    ? 'text-2xl md:text-3xl font-bold'
    : 'text-lg md:text-xl font-semibold';

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => { const next = !isOpen; setIsOpen(next); onToggle?.(next); }}
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-300 cursor-pointer ${
          isOpen
            ? 'bg-white/70 neu-raised-sm'
            : 'bg-white/40 neu-pressed-sm hover:bg-white/55'
        }`}
      >
        <Heading className={`${headingSizeClass} text-slate-800 m-0 text-left`}>
          {title}
        </Heading>
        <ChevronDown
          className="collapsible-chevron h-5 w-5 text-amber-600 flex-shrink-0 ml-4"
          data-open={isOpen ? 'true' : 'false'}
        />
      </button>
      <div
        ref={contentRef}
        className="collapsible-content"
        data-open={isOpen ? 'true' : 'false'}
        style={{ maxHeight: isOpen ? maxHeight : '0px' }}
      >
        <div className="px-5 pt-4 pb-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
