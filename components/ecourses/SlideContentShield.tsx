import React, { forwardRef, useCallback } from 'react';

export type SlideContentShieldProps = React.PropsWithChildren<{
  className?: string;
  style?: React.CSSProperties;
}>;

/**
 * Reduces casual saving of slide visuals: blocks context menu, image drag, and copy/cut
 * while the pointer is over this subtree. Determined users can still use devtools, cache,
 * extensions, or OS-level capture; **screenshots cannot be prevented from a normal web page.**
 */
export const SlideContentShield = forwardRef<HTMLDivElement, SlideContentShieldProps>(
  function SlideContentShield({ children, className, style }, ref) {
    const block = useCallback((e: React.SyntheticEvent) => {
      e.preventDefault();
    }, []);

    return (
      <div
        ref={ref}
        role="presentation"
        className={['slide-content-shield select-none', className].filter(Boolean).join(' ')}
        onContextMenu={block}
        onCopy={block}
        onCut={block}
        onDragStart={block}
        style={{ WebkitTouchCallout: 'none', ...style }}
      >
        {children}
      </div>
    );
  }
);
