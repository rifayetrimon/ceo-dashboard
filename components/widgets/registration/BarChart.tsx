'use client';

import type React from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import IconCaretDown from '@/components/icon/icon-caret-down';
import SmallDropdown from '@/components/small-dropdown';

// Types
export interface BarChartDataPoint {
    label: string;
    total: number;
    approved: number;
    pending: number;
    showValue?: boolean;
}

export interface BarChartConfig {
    title: string;
    targetLine?: number;
    targetLabel?: string;
    colors?: {
        total?: string;
        approved?: string;
        pending?: string;
        targetLine?: string;
    };
    legend?: {
        total: string;
        approved: string;
        pending: string;
        target?: string;
    };
    yAxisMax?: number;
    showGrid?: boolean;
    barWidth?: number;
    filters?: {
        years?: string[];
        months?: string[];
        zones?: string[];
        schools?: string[];
    };
}

interface BarChartProps {
    data: BarChartDataPoint[];
    config: BarChartConfig;
    isRtl?: boolean;
    onFilterChange?: (filterType: 'year' | 'month' | 'zone' | 'school', value: string) => void;
}

// Default colors
const defaultColors = {
    total: '#8B5CF6',
    approved: '#FFA500',
    pending: '#10B981',
    targetLine: '#EF4444',
};

const defaultLegend = {
    total: 'Total Registration',
    approved: 'Approved Registration',
    pending: 'Pending Registration',
    target: 'Targeted Registration',
};

export const BarChart: React.FC<BarChartProps> = ({ data, config, isRtl = false, onFilterChange }) => {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const [hoveredBar, setHoveredBar] = useState<{ index: number; type: 'total' | 'approved' | 'pending' } | null>(null);

    const colors = { ...defaultColors, ...config.colors };
    const legend = { ...defaultLegend, ...config.legend };
    const barWidth = config.barWidth || 80;
    const showGrid = config.showGrid !== false;

    // Calculate max value for Y-axis
    const maxDataValue = Math.max(...data.map((d) => Math.max(d.total, d.approved, d.pending)));
    const yAxisMax = config.yAxisMax || Math.ceil(maxDataValue / 20) * 20 + 20;

    // Y-axis labels
    const yAxisSteps = 5;
    const yAxisInterval = yAxisMax / yAxisSteps;
    const yAxisLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) => yAxisMax - i * yAxisInterval);

    // Filter handlers
    const handleFilterSelect = (filterType: 'year' | 'month' | 'zone' | 'school', value: string) => {
        if (onFilterChange) {
            onFilterChange(filterType, value);
        }
    };

    return (
        <div className={`panel h-full ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            {/* Header with Filters */}
            <div className="relative z-10 mb-10 flex flex-col gap-4 px-6 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <h5 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.title}</h5>

                {/* Filter Dropdowns */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Year Filter */}
                    {config.filters?.years && (
                        <SmallDropdown
                            offset={[0, 5]}
                            placement={isRtl ? 'bottom-start' : 'bottom-end'}
                            btnClassName={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition hover:border-primary ${
                                isDark ? 'border-gray-600 bg-gray-800 text-white hover:bg-gray-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                            button={
                                <>
                                    <span>Year</span>
                                    <IconCaretDown className="h-3.5 w-3.5" />
                                </>
                            }
                        >
                            {config.filters.years.map((year, index) => (
                                <li key={index}>
                                    <button
                                        type="button"
                                        onClick={() => handleFilterSelect('year', year)}
                                        className={`block w-full px-4 py-2 text-left text-sm transition hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                            isDark ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                                        }`}
                                    >
                                        {year}
                                    </button>
                                </li>
                            ))}
                        </SmallDropdown>
                    )}

                    {/* Month Filter */}
                    {config.filters?.months && (
                        <SmallDropdown
                            offset={[0, 5]}
                            placement={isRtl ? 'bottom-start' : 'bottom-end'}
                            btnClassName={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition hover:border-primary ${
                                isDark ? 'border-gray-600 bg-gray-800 text-white hover:bg-gray-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                            button={
                                <>
                                    <span>Month</span>
                                    <IconCaretDown className="h-3.5 w-3.5" />
                                </>
                            }
                        >
                            {config.filters.months.map((month, index) => (
                                <li key={index}>
                                    <button
                                        type="button"
                                        onClick={() => handleFilterSelect('month', month)}
                                        className={`block w-full px-4 py-2 text-left text-sm transition hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                            isDark ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                                        }`}
                                    >
                                        {month}
                                    </button>
                                </li>
                            ))}
                        </SmallDropdown>
                    )}

                    {/* Zone Filter */}
                    {config.filters?.zones && (
                        <SmallDropdown
                            offset={[0, 5]}
                            placement={isRtl ? 'bottom-start' : 'bottom-end'}
                            btnClassName={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition hover:border-primary ${
                                isDark ? 'border-gray-600 bg-gray-800 text-white hover:bg-gray-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                            button={
                                <>
                                    <span>Zone</span>
                                    <IconCaretDown className="h-3.5 w-3.5" />
                                </>
                            }
                        >
                            {config.filters.zones.map((zone, index) => (
                                <li key={index}>
                                    <button
                                        type="button"
                                        onClick={() => handleFilterSelect('zone', zone)}
                                        className={`block w-full px-4 py-2 text-left text-sm transition hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                            isDark ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                                        }`}
                                    >
                                        {zone}
                                    </button>
                                </li>
                            ))}
                        </SmallDropdown>
                    )}

                    {/* School Filter */}
                    {config.filters?.schools && (
                        <SmallDropdown
                            offset={[0, 5]}
                            placement={isRtl ? 'bottom-start' : 'bottom-end'}
                            btnClassName={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition hover:border-primary ${
                                isDark ? 'border-gray-600 bg-gray-800 text-white hover:bg-gray-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                            button={
                                <>
                                    <span>School</span>
                                    <IconCaretDown className="h-3.5 w-3.5" />
                                </>
                            }
                        >
                            {config.filters.schools.map((school, index) => (
                                <li key={index}>
                                    <button
                                        type="button"
                                        onClick={() => handleFilterSelect('school', school)}
                                        className={`block w-full px-4 py-2 text-left text-sm transition hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                            isDark ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                                        }`}
                                    >
                                        {school}
                                    </button>
                                </li>
                            ))}
                        </SmallDropdown>
                    )}
                </div>
            </div>

            {/* Chart Container */}
            <div className="px-6 pb-6">
                <div className="relative overflow-x-auto">
                    <div className="flex" style={{ minWidth: `${data.length * barWidth + 60}px` }}>
                        {/* Y-axis */}
                        <div className="relative flex flex-col justify-between pr-3" style={{ width: '60px', height: '250px' }}>
                            {yAxisLabels.map((label, idx) => (
                                <div key={idx} className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} text-right leading-none`}>
                                    {label}
                                </div>
                            ))}
                        </div>

                        {/* Chart Area */}
                        <div className="relative flex-1">
                            {/* Grid lines and target line */}
                            <div className="absolute inset-0" style={{ height: '250px' }}>
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

                                {/* Target line */}
                                {config.targetLine && (
                                    <div
                                        className="absolute w-full"
                                        style={{
                                            top: `${((yAxisMax - config.targetLine) / yAxisMax) * 100}%`,
                                            borderTop: `2px dashed ${colors.targetLine}`,
                                        }}
                                    >
                                        <span className="absolute -top-5 left-2 text-xs font-medium" style={{ color: colors.targetLine }}>
                                            {config.targetLine}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Bars */}
                            <div className="relative flex justify-around" style={{ height: '250px' }}>
                                {data.map((point, idx) => {
                                    const totalHeight = (point.total / yAxisMax) * 100;
                                    const approvedHeight = (point.approved / yAxisMax) * 100;
                                    const pendingHeight = (point.pending / yAxisMax) * 100;

                                    return (
                                        <div key={idx} className="flex flex-col items-center" style={{ height: '100%' }}>
                                            {/* Bars container */}
                                            <div className="flex items-end gap-1 flex-1">
                                                {/* Total bar */}
                                                <div
                                                    className="relative w-4 rounded-t transition-all hover:opacity-80 cursor-pointer"
                                                    style={{
                                                        height: `${totalHeight}%`,
                                                        backgroundColor: colors.total,
                                                    }}
                                                    onMouseEnter={() => setHoveredBar({ index: idx, type: 'total' })}
                                                    onMouseLeave={() => setHoveredBar(null)}
                                                >
                                                    {(point.showValue || (hoveredBar?.index === idx && hoveredBar?.type === 'total')) && (
                                                        <span
                                                            className={`absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap rounded px-1.5 py-0.5 ${
                                                                isDark ? 'bg-gray-800 text-white' : 'bg-gray-900 text-white'
                                                            }`}
                                                            style={{ color: 'white', backgroundColor: colors.total }}
                                                        >
                                                            {point.total}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Approved bar */}
                                                <div
                                                    className="relative w-4 rounded-t transition-all hover:opacity-80 cursor-pointer"
                                                    style={{
                                                        height: `${approvedHeight}%`,
                                                        backgroundColor: colors.approved,
                                                    }}
                                                    onMouseEnter={() => setHoveredBar({ index: idx, type: 'approved' })}
                                                    onMouseLeave={() => setHoveredBar(null)}
                                                >
                                                    {hoveredBar?.index === idx && hoveredBar?.type === 'approved' && (
                                                        <span
                                                            className={`absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap rounded px-1.5 py-0.5`}
                                                            style={{ color: 'white', backgroundColor: colors.approved }}
                                                        >
                                                            {point.approved}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Pending bar */}
                                                <div
                                                    className="relative w-4 rounded-t transition-all hover:opacity-80 cursor-pointer"
                                                    style={{
                                                        height: `${pendingHeight}%`,
                                                        backgroundColor: colors.pending,
                                                    }}
                                                    onMouseEnter={() => setHoveredBar({ index: idx, type: 'pending' })}
                                                    onMouseLeave={() => setHoveredBar(null)}
                                                >
                                                    {hoveredBar?.index === idx && hoveredBar?.type === 'pending' && (
                                                        <span
                                                            className={`absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap rounded px-1.5 py-0.5`}
                                                            style={{ color: 'white', backgroundColor: colors.pending }}
                                                        >
                                                            {point.pending}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Labels below the chart */}
                            <div className="relative flex justify-around mt-2">
                                {data.map((point, idx) => (
                                    <div key={idx} className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                                        {point.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className={`border-t px-6 py-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded" style={{ backgroundColor: colors.total }} />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{legend.total}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded" style={{ backgroundColor: colors.approved }} />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{legend.approved}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded" style={{ backgroundColor: colors.pending }} />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{legend.pending}</span>
                    </div>
                    {config.targetLine && (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                <div className="h-0.5 w-3 bg-current" style={{ color: colors.targetLine }} />
                                <div className="ml-0.5 h-1 w-1 rounded-full bg-current" style={{ color: colors.targetLine }} />
                                <div className="h-0.5 w-3 bg-current" style={{ color: colors.targetLine }} />
                                <div className="ml-0.5 h-1 w-1 rounded-full bg-current" style={{ color: colors.targetLine }} />
                                <div className="h-0.5 w-3 bg-current" style={{ color: colors.targetLine }} />
                            </div>
                            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{config.targetLabel || legend.target}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
