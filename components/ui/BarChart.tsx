import React from 'react';

interface BarChartData {
  label: string;
  value: number;
  color: string;
}

interface BarChartProps {
  data: BarChartData[];
  className?: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, className }) => {
  const maxValue = Math.max(...data.map(d => d.value), 0);
  const chartHeight = 200;
  const barWidth = 30;
  const barMargin = 20;
  const totalWidth = data.length * (barWidth + barMargin);

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <svg width={totalWidth} height={chartHeight + 40} className="font-sans">
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * chartHeight : 0;
          const x = index * (barWidth + barMargin) + barMargin / 2;
          const y = chartHeight - barHeight;
          return (
            <g key={item.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={item.color}
                className="transition-all duration-300"
                rx="4"
              />
              <text
                x={x + barWidth / 2}
                y={y - 8}
                textAnchor="middle"
                className="text-xs font-semibold fill-current text-[#293c51] dark:text-gray-200"
              >
                {item.value}
              </text>
              <text
                x={x + barWidth / 2}
                y={chartHeight + 20}
                textAnchor="middle"
                className="text-xs fill-current text-gray-500 dark:text-gray-400"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
