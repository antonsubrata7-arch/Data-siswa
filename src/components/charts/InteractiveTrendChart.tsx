import React, { useState } from 'react';
import { ChartDataPoint } from '../../types/discipline';

interface InteractiveTrendChartProps {
  data: ChartDataPoint[];
  title: string;
  subtitle?: string;
}

export const InteractiveTrendChart: React.FC<InteractiveTrendChartProps> = ({
  data,
  title,
  subtitle,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        Belum ada data tren untuk periode ini
      </div>
    );
  }

  const width = 640;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  const maxVal = Math.max(...data.map((d) => d.value), 4);
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Generate coordinates
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1 || 1)) * chartWidth;
    const y = height - paddingY - (d.value / maxVal) * chartHeight;
    return { x, y, data: d };
  });

  // SVG path strings
  const linePath = points.reduce((acc, curr, i) => {
    return `${acc} ${i === 0 ? 'M' : 'L'} ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
  }, '');

  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(height - paddingY).toFixed(1)} L ${points[0].x.toFixed(1)} ${(height - paddingY).toFixed(1)} Z`;

  // Grid lines
  const gridSteps = 4;
  const yTicks = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const val = Math.round((maxVal / gridSteps) * i);
    const y = height - paddingY - (i / gridSteps) * chartHeight;
    return { val, y };
  });

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-sm">
      <div className="flex items-start justify-between pb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
            {title}
          </h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-indigo-500 rounded-full inline-block"></span>
            <span>Jumlah Pelanggaran</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500/20 inline-block border border-indigo-500/40"></span>
            <span>Area Frekuensi</span>
          </div>
        </div>
      </div>

      <div className="relative mt-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#6366f1" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#6366f1" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Horizontal Grid lines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={paddingX}
                y1={tick.y}
                x2={width - paddingX}
                y2={tick.y}
                stroke="#334155"
                strokeDasharray="4 4"
                strokeWidth="1"
                opacity="0.6"
              />
              <text
                x={paddingX - 10}
                y={tick.y + 4}
                textAnchor="end"
                className="fill-slate-500 text-[11px] font-mono"
              >
                {tick.val}
              </text>
            </g>
          ))}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Line stroke */}
          <path
            d={linePath}
            fill="none"
            stroke="#6366f1"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />

          {/* Interactive Data points */}
          {points.map((pt, i) => (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Invisible large touch target */}
              <circle cx={pt.x} cy={pt.y} r="18" fill="transparent" />

              {/* Visible Point */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIdx === i ? 6 : 4}
                fill="#ffffff"
                stroke="#6366f1"
                strokeWidth={hoveredIdx === i ? 3 : 2}
                className="transition-all duration-150"
              />

              {/* X Axis Label */}
              <text
                x={pt.x}
                y={height - paddingY + 18}
                textAnchor="middle"
                className={`text-[11px] font-medium transition-colors ${
                  hoveredIdx === i ? 'fill-indigo-400 font-bold' : 'fill-slate-400'
                }`}
              >
                {pt.data.label}
              </text>
            </g>
          ))}

          {/* Vertical Guide line on hover */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={paddingY}
              x2={activePoint.x}
              y2={height - paddingY}
              stroke="#818cf8"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          )}
        </svg>

        {/* Floating Tooltip */}
        {activePoint && (
          <div
            className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full bg-slate-950/95 border border-indigo-500/40 rounded-xl px-3 py-2 shadow-2xl backdrop-blur-md z-20 min-w-[130px]"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
              top: `${(activePoint.y / height) * 100 - 8}%`,
            }}
          >
            <div className="text-[11px] font-semibold text-slate-300 border-b border-slate-800 pb-1 mb-1">
              {activePoint.data.label}
            </div>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-400">Kejadian:</span>
              <span className="font-bold text-indigo-400 font-mono">
                {activePoint.data.value} kasus
              </span>
            </div>
            {activePoint.data.secondaryValue !== undefined && (
              <div className="flex items-center justify-between gap-3 text-xs mt-0.5">
                <span className="text-slate-400">Total Poin:</span>
                <span className="font-bold text-amber-400 font-mono">
                  {activePoint.data.secondaryValue} pts
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
