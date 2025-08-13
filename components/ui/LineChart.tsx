import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

interface LineData {
  name: string;
  color: string;
  points: number[];
}

interface LineChartProps {
  data: LineData[];
  labels: string[];
  className?: string;
}

// Function to create a smooth path (Cardinal spline)
const createSplinePath = (points: { x: number; y: number }[]) => {
  if (points.length === 0) return "";
  let path = `M ${points[0].x},${points[0].y}`;
  const tension = 1; // Catmull-Rom spline
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[0];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;
    const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension;
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;

    path += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  return path;
};


export const LineChart: React.FC<LineChartProps> = ({ data, labels, className }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 500, height: 250 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width } = entries[0].contentRect;
        setChartDimensions({ width, height: 250 });
      }
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);
  
  const { width, height } = chartDimensions;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  
  const allPoints = data.flatMap(d => d.points);
  const maxValue = allPoints.length > 0 ? Math.max(...allPoints) : 0;
  const yAxisMax = maxValue > 0 ? Math.ceil(maxValue / 1000) * 1000 : 1000; // Round up to nearest 1000

  const getX = useCallback((index: number) => padding.left + (index / (labels.length - 1)) * (width - padding.left - padding.right), [width, labels.length]);
  const getY = useCallback((value: number) => height - padding.bottom - (value / yAxisMax) * (height - padding.top - padding.bottom), [height, yAxisMax]);

  const handleMouseMove = (event: React.MouseEvent<SVGRectElement>) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const CTM = svg.getScreenCTM();
    if (!CTM) return;

    const { x } = point.matrixTransform(CTM.inverse());

    const eachBand = (width - padding.left - padding.right) / (labels.length - 1);
    const index = Math.round((x - padding.left) / eachBand);
    
    if(index >= 0 && index < labels.length) {
      setHoveredIndex(index);
    }
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };
  
  const tooltipData = useMemo(() => {
    if (hoveredIndex === null || data.length === 0) return null;
    return {
      label: labels[hoveredIndex],
      values: data.map(series => ({
        name: series.name,
        value: series.points[hoveredIndex],
        color: series.color,
      })),
      x: getX(hoveredIndex),
      y: height / 2,
    };
  }, [hoveredIndex, data, labels, getX, height]);
  
  const memoizedPaths = useMemo(() => {
    if (data.length === 0) return [];
    return data.map(line => {
      const points = line.points.map((p, i) => ({ x: getX(i), y: getY(p) }));
      const linePath = createSplinePath(points);
      return { name: line.name, linePath };
    });
  }, [data, getX, getY]);
  
  const memoizedAreaPath = useMemo(() => {
    const sentSeries = data.find(d => d.name === 'Emails Sent');
    const receivedSeries = data.find(d => d.name === 'Emails Received');

    if (!sentSeries || !receivedSeries || sentSeries.points.length !== receivedSeries.points.length) {
      return null;
    }

    const sentPoints = sentSeries.points.map((p, i) => ({ x: getX(i), y: getY(p) }));
    const receivedPoints = receivedSeries.points.map((p, i) => ({ x: getX(i), y: getY(p) }));

    if (sentPoints.length < 2 || receivedPoints.length < 2) return null;

    const sentPath = createSplinePath(sentPoints);
    const receivedPointsReversed = [...receivedPoints].reverse();
    const reversedReceivedPath = createSplinePath(receivedPointsReversed);

    return `${sentPath} ${reversedReceivedPath.replace('M', 'L')} Z`;
  }, [data, getX, getY]);


  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto font-sans">
        <defs>
          <linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        
        {/* Y-axis labels and grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(tick => (
          <g key={tick} className="text-gray-400 dark:text-gray-500">
            <text x={padding.left - 8} y={getY(yAxisMax * tick) + 4} textAnchor="end" className="text-xs fill-current">
              {(yAxisMax * tick / 1000).toFixed(0)}k
            </text>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={getY(yAxisMax * tick)}
              y2={getY(yAxisMax * tick)}
              className="stroke-current opacity-20 dark:opacity-10"
              strokeDasharray="4 2"
              strokeWidth="1"
            />
          </g>
        ))}

        {/* X-axis labels */}
        {labels.map((label, i) => (
          <text key={label} x={getX(i)} y={height - padding.bottom + 15} textAnchor="middle" className="text-xs fill-current text-gray-500 dark:text-gray-400">
            {label}
          </text>
        ))}
        
        {/* Area Fill */}
        {memoizedAreaPath && (
          <path
            d={memoizedAreaPath}
            fill="url(#area-gradient)"
            fillOpacity={0.15}
          />
        )}

        {/* Line Paths */}
        {memoizedPaths.map(({ name, linePath }) => {
          const line = data.find(d => d.name === name);
          if (!line) return null;
          return (
            <g key={name}>
              <path d={linePath} stroke={line.color} fill="none" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          );
        })}
        
        {/* Interactive elements */}
        {tooltipData && (
          <g>
            <line x1={tooltipData.x} y1={padding.top} x2={tooltipData.x} y2={height - padding.bottom} stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-gray-400 dark:text-gray-500" />
            {tooltipData.values.map(series => (
                 <circle key={series.name} cx={tooltipData.x} cy={getY(series.value)} r="5" fill={series.color} stroke="currentColor" strokeWidth="2" className="text-white dark:text-slate-800" />
            ))}
          </g>
        )}

        {/* Mouse event capture layer */}
        <rect
          x={padding.left}
          y={padding.top}
          width={width - padding.left - padding.right}
          height={height - padding.top - padding.bottom}
          fill="transparent"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
        
        {/* Tooltip */}
        {tooltipData && (
          <g transform={`translate(${tooltipData.x > width / 2 ? tooltipData.x - 170 : tooltipData.x + 15}, ${padding.top})`}>
             <rect x="0" y="0" width="150" height={25 + tooltipData.values.length * 20} rx="5" className="fill-white/90 dark:fill-slate-900/90 stroke-gray-300 dark:stroke-slate-600" strokeWidth="0.5" />
             <text x="10" y="20" className="font-bold text-sm fill-current text-[#293c51] dark:text-gray-100">{tooltipData.label}</text>
             {tooltipData.values.map((item, index) => (
                <g key={item.name} transform={`translate(10, ${40 + index * 20})`}>
                    <circle r="4" fill={item.color} />
                    <text x="10" y="4" className="text-xs fill-current text-gray-600 dark:text-gray-300">{item.name}:</text>
                    <text x="135" y="4" textAnchor="end" className="text-xs font-semibold fill-current text-[#293c51] dark:text-gray-100">{item.value.toLocaleString()}</text>
                </g>
             ))}
          </g>
        )}
      </svg>
    </div>
  );
};