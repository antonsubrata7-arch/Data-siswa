import React, { useState } from 'react';
import { ChartDataPoint } from '../../types/discipline';

interface InteractiveCategoryDonutProps {
  data: ChartDataPoint[];
  title: string;
}

export const InteractiveCategoryDonut: React.FC<InteractiveCategoryDonutProps> = ({
  data,
  title,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const totalValue = data.reduce((sum, d) => sum + d.value, 0);

  const size = 260;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  const segments = data.map((d, index) => {
    const fraction = totalValue > 0 ? d.value / totalValue : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += fraction;

    return {
      ...d,
      index,
      fraction,
      strokeDasharray,
      strokeDashoffset,
      color: d.color || '#64748b',
    };
  });

  const activeSegment = hoveredIdx !== null ? segments[hoveredIdx] : null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-sm flex flex-col justify-between">
      <div className="flex items-center justify-between pb-2">
        <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          {title}
        </h3>
        <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded-md">
          Total: {totalValue} kasus
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center my-auto py-2">
        {/* SVG Donut */}
        <div className="sm:col-span-6 flex justify-center relative">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90 select-none overflow-visible"
          >
            {/* Background Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#1e293b"
              strokeWidth={strokeWidth}
            />

            {/* Segments */}
            {segments.map((seg) => {
              const isHovered = hoveredIdx === seg.index;
              return (
                <circle
                  key={seg.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(seg.index)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>

          {/* Center Info Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
            {activeSegment ? (
              <>
                <span className="text-2xl font-bold font-mono text-white">
                  {Math.round(activeSegment.fraction * 100)}%
                </span>
                <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                  {activeSegment.label}
                </span>
                <span className="text-[11px] text-slate-400">
                  {activeSegment.value} kasus
                </span>
              </>
            ) : (
              <>
                <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                  {totalValue}
                </span>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                  Kasus Dicatat
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="sm:col-span-6 space-y-2">
          {segments.map((seg) => {
            const isHovered = hoveredIdx === seg.index;
            const pct = Math.round(seg.fraction * 100);
            return (
              <div
                key={seg.label}
                onMouseEnter={() => setHoveredIdx(seg.index)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                  isHovered
                    ? 'bg-slate-800/90 ring-1 ring-slate-600 scale-[1.02]'
                    : 'hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span
                    className="w-3 h-3 rounded-md shrink-0 shadow-sm"
                    style={{ backgroundColor: seg.color }}
                  ></span>
                  <span className="text-xs font-medium text-slate-300 truncate">
                    {seg.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                  <span className="text-slate-400">{seg.value}</span>
                  <span className="text-slate-500 font-light">|</span>
                  <span className="text-slate-200 font-bold min-w-[32px] text-right">
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
