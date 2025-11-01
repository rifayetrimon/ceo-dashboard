'use client';

import type React from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { IRootState } from '@/store';
import SmallDropdown from '@/components/small-dropdown';
import IconCaretDown from '@/components/icon/icon-caret-down';

// Types
export interface LineChartDataPoint {
    label: string;
    value: number;
    color?: string;
}

export interface FilterConfig {
    label: string;
    options: string[];
}

export interface LineChartConfig {
    title: string;
    yAxisMax?: number;
    showGrid?: boolean;
    lineColor?: string;
    enableHover?: boolean;
    filters?: {
        filter1?: FilterConfig;
        filter2?: FilterConfig;
        filter3?: FilterConfig;
        filter4?: FilterConfig;
    };
}

interface LineChartProps {
    data: LineChartDataPoint[];
    config: LineChartConfig;
    isRtl?: boolean;
    onFilterChange?: (filterNumber: 1 | 2 | 3 | 4, value: string) => void;
}

const defaultPointColors = ['#EF4444', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#06B6D4'];

export const LineChart: React.FC<LineChartProps> = ({ data, config, isRtl = false, onFilterChange }) => {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

    const lineColor = config.lineColor || (isDark ? '#9CA3AF' : '#9CA3AF');
    const enableHover = config.enableHover !== false;
    const showGrid = config.showGrid !== false;

    // Calculate dimensions
    const maxValue = config.yAxisMax || Math.max(...data.map((d) => d.value)) + 2;
    const yAxisSteps = 4;
    const yAxisInterval = maxValue / yAxisSteps;
    const yAxisLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) => maxValue - i * yAxisInterval);

    // Calculate point positions with proper centering
    const points = data.map((point, index) => {
        // Calculate position so labels and lines are perfectly centered
        const x = (index / (data.length - 1)) * 100;
        const y = ((maxValue - point.value) / maxValue) * 100;
        const color = point.color || defaultPointColors[index % defaultPointColors.length];
        return { x, y, label: point.label, value: point.value, color };
    });

    // Create line path
    const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

    // Filter handler
    const handleFilterSelect = (filterNumber: 1 | 2 | 3 | 4, value: string) => {
        if (onFilterChange) {
            onFilterChange(filterNumber, value);
        }
    };

    const hasFilters = config.filters && (config.filters.filter1 || config.filters.filter2 || config.filters.filter3 || config.filters.filter4);

    return (
        <div className={`panel h-full ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            {/* Header with Filters */}
            <div className="mb-6 flex flex-col gap-4 px-6 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <h5 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.title}</h5>

                {hasFilters && (
                    <div className="flex flex-wrap items-center gap-2">
                        {[config.filters?.filter1, config.filters?.filter2, config.filters?.filter3, config.filters?.filter4].filter(Boolean).map((filter, idx) => (
                            <SmallDropdown
                                key={idx}
                                offset={[0, 5]}
                                placement={isRtl ? 'bottom-start' : 'bottom-end'}
                                btnClassName={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition hover:border-primary ${
                                    isDark ? 'border-gray-600 bg-gray-800 text-white hover:bg-gray-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                                button={
                                    <>
                                        <span>{filter!.label}</span>
                                        <IconCaretDown className="h-3.5 w-3.5" />
                                    </>
                                }
                            >
                                {filter!.options.map((option, optIdx) => (
                                    <li key={optIdx}>
                                        <button
                                            type="button"
                                            onClick={() => handleFilterSelect((idx + 1) as 1 | 2 | 3 | 4, option)}
                                            className={`block w-full px-4 py-2 text-left text-sm transition hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                                isDark ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    </li>
                                ))}
                            </SmallDropdown>
                        ))}
                    </div>
                )}
            </div>

            {/* Chart Container */}
            <div className="px-6 pb-6">
                <div className="relative w-full" style={{ height: '280px' }}>
                    {/* Y-axis */}
                    <div className="absolute left-0 top-0 flex flex-col justify-between" style={{ width: '40px', height: '240px' }}>
                        {yAxisLabels.map((label, idx) => (
                            <div key={idx} className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} text-left leading-none`}>
                                {label}
                            </div>
                        ))}
                    </div>

                    {/* Chart SVG */}
                    <div className="absolute" style={{ left: '60px', right: '20px', top: '0', height: '240px' }}>
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                            {/* Grid */}
                            {showGrid &&
                                yAxisLabels.map((_, idx) => (
                                    <line
                                        key={idx}
                                        x1="0"
                                        y1={(idx / yAxisSteps) * 100}
                                        x2="100"
                                        y2={(idx / yAxisSteps) * 100}
                                        stroke={isDark ? '#374151' : '#E5E7EB'}
                                        strokeWidth="0.3"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                ))}

                            {/* Vertical lines at each data point */}
                            {points.map((point, index) => (
                                <line key={`vline-${index}`} x1={point.x} y1="0" x2={point.x} y2="100" stroke={point.color} strokeWidth="0.8" opacity="0.25" vectorEffect="non-scaling-stroke" />
                            ))}

                            {/* Line */}
                            <path d={linePath} fill="none" stroke={lineColor} strokeWidth="1" vectorEffect="non-scaling-stroke" />
                        </svg>

                        {points.map((point, index) => (
                            <div
                                key={index}
                                className="absolute"
                                style={{
                                    left: `${point.x}%`,
                                    top: `${point.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                }}
                            >
                                {/* Hover area */}
                                <div
                                    className="relative flex items-center justify-center"
                                    style={{
                                        width: hoveredPoint === index ? '18px' : '10px',
                                        height: hoveredPoint === index ? '18px' : '10px',
                                        cursor: enableHover ? 'pointer' : 'default',
                                    }}
                                    onMouseEnter={() => enableHover && setHoveredPoint(index)}
                                    onMouseLeave={() => enableHover && setHoveredPoint(null)}
                                >
                                    {/* Circle - perfectly round */}
                                    <div
                                        className="rounded-full transition-all duration-200"
                                        style={{
                                            width: hoveredPoint === index ? '18px' : '10px',
                                            height: hoveredPoint === index ? '18px' : '10px',
                                            backgroundColor: point.color,
                                            opacity: hoveredPoint === index ? 0.95 : 1,
                                        }}
                                    />

                                    {hoveredPoint === index && (
                                        <div
                                            className={`absolute bottom-full mb-2 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium shadow-lg ${
                                                isDark ? 'bg-gray-800 text-white' : 'bg-gray-900 text-white'
                                            }`}
                                            style={{
                                                zIndex: 10,
                                            }}
                                        >
                                            {point.value}
                                            {/* Tooltip arrow */}
                                            <div
                                                className="absolute left-1/2 top-full -translate-x-1/2"
                                                style={{
                                                    width: 0,
                                                    height: 0,
                                                    borderLeft: '4px solid transparent',
                                                    borderRight: '4px solid transparent',
                                                    borderTop: `4px solid ${isDark ? '#1F2937' : '#111827'}`,
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* X-axis labels - perfectly centered under vertical lines */}
                        <div className="absolute left-0 right-0" style={{ top: '250px' }}>
                            <div className="relative" style={{ height: '40px' }}>
                                {data.map((point, index) => {
                                    const pointPosition = points[index].x;
                                    return (
                                        <div
                                            key={index}
                                            className={`absolute text-sm ${isDark ? 'text-gray-400' : 'text-gray-700'} font-medium`}
                                            style={{
                                                left: `${pointPosition}%`,
                                                transform: 'translateX(-50%)',
                                                whiteSpace: 'nowrap',
                                                textAlign: 'center',
                                            }}
                                        >
                                            {point.label}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
