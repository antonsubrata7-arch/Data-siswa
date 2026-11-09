import React, { useState } from 'react';
import { ChartDataPoint } from '../../types/discipline';

interface InteractiveClassBarChartProps {
  data: ChartDataPoint[];
  title: string;
}

export const InteractiveClassBarChart: React.FC<InteractiveClassBarChartProps> = ({
  data,
  title,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxCases = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between pb-3">
        <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          {title}
        </h3>
        <span className="text-xs text-slate-400">Peringkat per Kelas</span>
      </div>

      <div className="space-y-3.5 mt-2">
        {data.slice(0, 6).map((item, index) => {
          const percent = Math.round((item.value / maxCases) * 100);
          const isHovered = hoveredIdx === index;

          return (
            <div
              key={item.label}
              onMouseEnter={() => setHoveredIdx(index)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`p-2 rounded-xl transition-all ${
                isHovered ? 'bg-slate-800/80 ring-1 ring-amber-500/30' : 'hover:bg-slate-800/30'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px] flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-slate-200">{item.label}</span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-slate-400">
                    <strong className="text-amber-400 font-bold">{item.value}</strong> kasus
                  </span>
                  {item.secondaryValue !== undefined && (
                    <span className="text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded text-[11px] border border-rose-500/20">
                      {item.secondaryValue} Poin
                    </span>
                  )}
                </div>
              </div>

              {/* Bar track */}
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    index === 0
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                      : index === 1
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                      : 'bg-gradient-to-r from-indigo-500 to-sky-400'
                  }`}
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>
          );
        })}

        {data.length === 0 && (
          <div className="py-8 text-center text-xs text-slate-500">
            Belum ada data catatan pelanggaran per kelas
          </div>
        )}
      </div>
    </div>
  );
};
