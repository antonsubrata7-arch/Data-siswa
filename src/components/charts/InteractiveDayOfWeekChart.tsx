import React, { useState } from 'react';
import { ChartDataPoint } from '../../types/discipline';

interface InteractiveDayOfWeekChartProps {
  data: ChartDataPoint[];
  title: string;
}

export const InteractiveDayOfWeekChart: React.FC<InteractiveDayOfWeekChartProps> = ({
  data,
  title,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const maxVal = Math.max(...data.map((d) => d.value), 2);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between pb-3">
        <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-violet-400"></span>
          {title}
        </h3>
        <span className="text-xs text-slate-400">Analisis Hari Rawan</span>
      </div>

      <div className="grid grid-cols-6 gap-2 sm:gap-3 items-end h-44 pt-6 pb-2 px-1">
        {data.map((d, idx) => {
          const heightPercent = Math.max(8, Math.round((d.value / maxVal) * 100));
          const isHovered = hoveredIdx === idx;
          const isPeak = d.value === maxVal && maxVal > 0;

          return (
            <div
              key={d.label}
              className="flex flex-col items-center h-full justify-end group cursor-pointer relative"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip on top of column */}
              {isHovered && (
                <div className="absolute -top-10 bg-slate-950 border border-violet-500/50 rounded-lg px-2 py-1 shadow-xl text-[11px] font-mono text-center z-20 whitespace-nowrap">
                  <div className="text-violet-300 font-bold">{d.value} kasus</div>
                  {d.secondaryValue !== undefined && (
                    <div className="text-amber-400 text-[10px]">{d.secondaryValue} pts</div>
                  )}
                </div>
              )}

              {/* Bar Value Indicator */}
              <span
                className={`text-[11px] font-mono mb-1 font-bold transition-all ${
                  isHovered || isPeak ? 'text-violet-300 scale-110' : 'text-slate-400'
                }`}
              >
                {d.value}
              </span>

              {/* Vertical Bar */}
              <div className="w-full max-w-[36px] bg-slate-800/80 rounded-t-lg overflow-hidden flex flex-col justify-end h-28 p-0.5">
                <div
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    isPeak
                      ? 'bg-gradient-to-t from-violet-600 to-fuchsia-400 shadow-lg shadow-violet-500/20'
                      : isHovered
                      ? 'bg-gradient-to-t from-violet-600 to-indigo-400'
                      : 'bg-gradient-to-t from-slate-700 to-indigo-500'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                ></div>
              </div>

              {/* Day Label */}
              <span
                className={`text-xs mt-2 font-medium transition-colors ${
                  isHovered ? 'text-violet-400 font-bold' : 'text-slate-400'
                }`}
              >
                {d.label.slice(0, 3)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
