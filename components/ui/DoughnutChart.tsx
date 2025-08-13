import React from 'react';

type DoughnutChartProps = {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
} & ({ color: string; gradientId?: never } | { color?: never; gradientId: string });

export const DoughnutChart: React.FC<DoughnutChartProps> = ({ percentage, color, gradientId, size = 120, strokeWidth = 10, className }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {gradientId && (
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
            </defs>
        )}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e6e6e6"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="dark:stroke-slate-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={gradientId ? `url(#${gradientId})` : color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-2xl font-bold text-[#293c51] dark:text-gray-100">
        {percentage}%
      </span>
    </div>
  );
};
