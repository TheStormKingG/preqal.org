import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { publicAssetAbsoluteUrl } from './slideAssetUrl';

export type TextRun = {
  text: string;
  fontSizePt: number;
  color: string;
  fontFamily: string;
  fontWeight: number;
  fontStyle: string;
  lineSpacingPt?: number;
};

export type TextParagraph = {
  align: 'left' | 'center' | 'right' | 'justify';
  lineSpacingPt?: number;
  runs: TextRun[];
};

export type SlideRectLayer = {
  type: 'rect';
  z: number;
  left: number;
  top: number;
  width: number;
  height: number;
  fill: string;
  stroke?: string;
  strokeWidthPx?: number;
  borderRadiusPx?: number;
};

export type SlideImageLayer = {
  type: 'image';
  z: number;
  left: number;
  top: number;
  width: number;
  height: number;
  src: string;
};

export type SlideTextLayer = {
  type: 'text';
  z: number;
  left: number;
  top: number;
  width: number;
  height: number;
  align: 'left' | 'center' | 'right' | 'justify';
  verticalAlign: 'top' | 'middle' | 'bottom';
  background?: string;
  borderRadiusPx?: number;
  paragraphs: TextParagraph[];
};

export type SlideLayer = SlideRectLayer | SlideImageLayer | SlideTextLayer;

export type SlideLayerFile = {
  version: 2;
  widthEmu: number;
  heightEmu: number;
  refWidth: number;
  refHeight: number;
  layers: SlideLayer[];
};

function justifyContentFor(verticalAlign: SlideTextLayer['verticalAlign']) {
  if (verticalAlign === 'middle') return 'center';
  if (verticalAlign === 'bottom') return 'flex-end';
  return 'flex-start';
}

const SlideLayerStage: React.FC<{ data: SlideLayerFile; className?: string }> = ({ data, className }) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(0);

  useLayoutEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCw(el.clientWidth));
    ro.observe(el);
    setCw(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const scale = useMemo(() => {
    if (!cw || !data.refWidth) return 1;
    return cw / data.refWidth;
  }, [cw, data.refWidth]);

  const sorted = useMemo(() => [...data.layers].sort((a, b) => a.z - b.z), [data.layers]);

  const aspect = data.widthEmu / data.heightEmu;

  return (
    <div
      ref={outerRef}
      className={['relative w-full overflow-hidden bg-black', className || ''].join(' ')}
      style={{ aspectRatio: aspect }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left will-change-transform"
        style={{
          width: data.refWidth,
          height: data.refHeight,
          transform: `scale(${scale})`,
        }}
      >
        {sorted.map((layer, idx) => {
          const base = {
            position: 'absolute' as const,
            left: layer.left,
            top: layer.top,
            width: layer.width,
            height: layer.height,
            zIndex: layer.z,
          };

          if (layer.type === 'rect') {
            return (
              <div
                key={`r-${idx}-${layer.z}`}
                style={{
                  ...base,
                  background: layer.fill,
                  border: layer.stroke && layer.strokeWidthPx ? `${layer.strokeWidthPx}px solid ${layer.stroke}` : undefined,
                  borderRadius: layer.borderRadiusPx ? `${layer.borderRadiusPx}px` : undefined,
                }}
              />
            );
          }

          if (layer.type === 'image') {
            const src = publicAssetAbsoluteUrl(layer.src);
            return (
              <img
                key={`i-${idx}-${layer.z}`}
                src={src}
                alt=""
                className="pointer-events-none select-none"
                style={{
                  ...base,
                  objectFit: 'fill',
                }}
                loading="lazy"
                decoding="async"
              />
            );
          }

          return (
            <div
              key={`t-${idx}-${layer.z}`}
              style={{
                ...base,
                background: layer.background,
                borderRadius: layer.borderRadiusPx ? `${layer.borderRadiusPx}px` : undefined,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: justifyContentFor(layer.verticalAlign),
                gap: '0.35em',
                overflow: 'hidden',
                boxSizing: 'border-box',
                padding: 0,
              }}
            >
              {layer.paragraphs.map((para, pi) => {
                const line =
                  para.lineSpacingPt ??
                  para.runs.find((r) => r.lineSpacingPt != null)?.lineSpacingPt ??
                  para.runs[0]?.fontSizePt * 1.25;
                return (
                  <div
                    key={pi}
                    style={{
                      textAlign: para.align,
                      lineHeight: line ? `${line}pt` : undefined,
                      margin: 0,
                    }}
                  >
                    {para.runs.map((run, ri) => (
                      <span
                        key={ri}
                        style={{
                          fontFamily: run.fontFamily,
                          fontSize: `${run.fontSizePt}pt`,
                          color: run.color,
                          fontWeight: run.fontWeight,
                          fontStyle: run.fontStyle,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {run.text}
                      </span>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SlideLayerStage;
