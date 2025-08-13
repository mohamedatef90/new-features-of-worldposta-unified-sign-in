import React from 'react';

interface Segment {
  value: number;
  color: string;
  label: string;
}

interface MultiSegmentDoughnutChartProps {
  segments: Segment[];
  size?: number;
  strokeWidth?: number;
  className?: string;
  showTotal?: boolean;
}

export const MultiSegmentDoughnutChart: React.FC<MultiSegmentDoughnutChartProps> = ({ segments, size = 150, strokeWidth = 15, className, showTotal = true }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const totalValue = segments.reduce((sum, s) => sum + s.value, 0);

  let accumulatedPercentage = 0;

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {segments.map((segment, index) => {
          const percentage = totalValue > 0 ? (segment.value / totalValue) * 100 : 0;
          const offset = circumference - (percentage / 100) * circumference;
          const rotation = (accumulatedPercentage / 100) * 360;
          accumulatedPercentage += percentage;

          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={segment.color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="butt"
              style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '50% 50%' }}
            />
          );
        })}
      </svg>
      {showTotal && (
        <div className="absolute text-center">
            <div className="text-3xl font-bold text-[#293c51] dark:text-gray-100">{totalValue > 0 ? '100%' : '0%'}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
        </div>
      )}
    </div>
  );
};
