'use client';

import type React from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { IRootState } from '@/store';
import SmallDropdown from '@/components/small-dropdown';
import IconCaretDown from '@/components/icon/icon-caret-down';

// Types
export interface BarChartDataPoint {
    label: string;
    value: number;
    color?: string;
}

export interface FilterConfig {
    label: string;
    options: string[];
}

export interface BarChartSimpleConfig {
    title: string;
    yAxisMax?: number;
    showGrid?: boolean;
    enableHover?: boolean;
    barWidth?: number;
    filters?: {
        filter1?: FilterConfig;
        filter2?: FilterConfig;
        filter3?: FilterConfig;
        filter4?: FilterConfig;
        filter5?: FilterConfig;
    };
}

interface BarChartSimpleProps {
    data: BarChartDataPoint[];
    config: BarChartSimpleConfig;
    isRtl?: boolean;
    onFilterChange?: (filterNumber: 1 | 2 | 3 | 4 | 5, value: string) => void;
}

const defaultBarColors = [
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Amber
    '#3B82F6', // Blue
    '#6B7280', // Gray
    '#60A5FA', // Light Blue
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
];

export const BarChartSimple: React.FC<BarChartSimpleProps> = ({ data, config, isRtl = false, onFilterChange }) => {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const [hoveredBar, setHoveredBar] = useState<number | null>(null);

    const enableHover = config.enableHover !== false;
    const showGrid = config.showGrid !== false;
    const barWidth = config.barWidth || 80;

    // Calculate dimensions
    const maxValue = config.yAxisMax || Math.max(...data.map((d) => d.value)) + 1;
    const yAxisSteps = 4;
    const yAxisInterval = maxValue / yAxisSteps;
    const yAxisLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) => maxValue - i * yAxisInterval);

    // Filter handler
    const handleFilterSelect = (filterNumber: 1 | 2 | 3 | 4 | 5, value: string) => {
        if (onFilterChange) {
            onFilterChange(filterNumber, value);
        }
    };

    const hasFilters = config.filters && (config.filters.filter1 || config.filters.filter2 || config.filters.filter3 || config.filters.filter4 || config.filters.filter5);

    return (
        <div className={`panel h-full ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            {/* Header with Filters */}
            <div className="mb-6 flex flex-col gap-4 px-6 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <h5 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.title}</h5>

                {hasFilters && (
                    <div className="flex flex-wrap items-center gap-2">
                        {[config.filters?.filter1, config.filters?.filter2, config.filters?.filter3, config.filters?.filter4, config.filters?.filter5].filter(Boolean).map((filter, idx) => (
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
                                            onClick={() => handleFilterSelect((idx + 1) as 1 | 2 | 3 | 4 | 5, option)}
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
                <div className="relative overflow-x-auto">
                    <div className="flex" style={{ minWidth: `${data.length * barWidth + 60}px` }}>
                        {/* Y-axis */}
                        <div className="relative flex flex-col justify-between pr-3" style={{ width: '60px', height: '300px' }}>
                            {yAxisLabels.map((label, idx) => (
                                <div key={idx} className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} text-right leading-none`}>
                                    {label}
                                </div>
                            ))}
                        </div>

                        {/* Chart Area */}
                        <div className="relative flex-1">
                            {/* Grid lines */}
                            <div className="absolute inset-0" style={{ height: '300px' }}>
                                {showGrid &&
                                    yAxisLabels.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`absolute w-full ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                                            style={{
                                                top: `${(idx / yAxisSteps) * 100}%`,
                                                borderTop: idx === yAxisLabels.length - 1 ? '2px solid' : '1px solid',
                                                borderColor: idx === yAxisLabels.length - 1 ? (isDark ? '#4B5563' : '#9CA3AF') : isDark ? '#374151' : '#E5E7EB',
                                            }}
                                        />
                                    ))}
                            </div>

                            {/* Bars */}
                            <div className="relative flex justify-around" style={{ height: '300px' }}>
                                {data.map((point, idx) => {
                                    const barHeight = (point.value / maxValue) * 100;
                                    const color = point.color || defaultBarColors[idx % defaultBarColors.length];

                                    return (
                                        <div key={idx} className="flex flex-col items-center" style={{ height: '100%' }}>
                                            {/* Bar - aligned to bottom */}
                                            <div className="flex items-end flex-1" style={{ width: `${barWidth * 0.8}px` }}>
                                                <div
                                                    className={`relative w-full rounded-t-lg transition-all ${enableHover ? 'cursor-pointer' : ''}`}
                                                    style={{
                                                        height: `${barHeight}%`,
                                                        backgroundColor: color,
                                                        opacity: hoveredBar === idx ? 0.8 : 1,
                                                    }}
                                                    onMouseEnter={() => enableHover && setHoveredBar(idx)}
                                                    onMouseLeave={() => enableHover && setHoveredBar(null)}
                                                >
                                                    {/* Value tooltip on hover */}
                                                    {hoveredBar === idx && (
                                                        <div
                                                            className={`absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-xs font-medium shadow-lg ${
                                                                isDark ? 'bg-gray-800 text-white' : 'bg-gray-900 text-white'
                                                            }`}
                                                            style={{ zIndex: 10 }}
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
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Labels below the chart - with improved spacing and sizing */}
                            <div className="relative flex justify-around mt-1">
                                {data.map((point, idx) => (
                                    <div
                                        key={idx}
                                        className={`text-[10px] sm:text-[11px] font-medium text-center ${isDark ? 'text-gray-400' : 'text-gray-700'}`}
                                        style={{
                                            width: `${barWidth * 0.95}px`,
                                            maxWidth: `${barWidth * 0.95}px`,
                                            lineHeight: '1.2',
                                        }}
                                    >
                                        <div
                                            className="break-words text-center"
                                            style={{
                                                wordBreak: 'normal',
                                                overflowWrap: 'break-word',
                                                whiteSpace: 'normal',
                                            }}
                                        >
                                            {point.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
