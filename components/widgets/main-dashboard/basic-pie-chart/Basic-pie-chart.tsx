'use client';

import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import Dropdown from '@/components/dropdown';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';

interface BasicPieChartProps {
    chartTitle?: string;
    series?: number[];
    labels?: string[];
    colors?: string[];
    title?: string;
    height?: number;
    showDropdown?: boolean;
    dropdownOptions?: string[];
    onDropdownSelect?: (option: string) => void;
    showYearFilter?: boolean;
    yearOptions?: string[];
    selectedYear?: string;
    onYearChange?: (year: string) => void;
}

export default function BasicPieChart({
    chartTitle = 'Basic Pie',
    series = [44, 55, 13, 43, 22],
    labels = ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
    colors,
    height = 340,
    showDropdown = true,
    dropdownOptions = ['View Report', 'Export Data', 'Edit Chart'],
    onDropdownSelect,
    showYearFilter = false,
    yearOptions = [],
    selectedYear,
    onYearChange,
}: BasicPieChartProps) {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Format value to M/K
    const formatValue = (value: number): string => {
        if (value === 0) return '0';
        if (value >= 1000000) {
            const millions = value / 1000000;
            return millions.toFixed(2) + 'M';
        }
        if (value >= 1000) {
            const thousands = value / 1000;
            return thousands.toFixed(2) + 'K';
        }
        return value.toFixed(2);
    };

    // Default colors if not provided
    const defaultColors = isDark ? ['#5c1ac3', '#e2a03f', '#e7515a', '#2196f3', '#4caf50'] : ['#e2a03f', '#5c1ac3', '#e7515a', '#2196f3', '#4caf50'];

    const pieChart: any = {
        series: series,
        options: {
            chart: {
                type: 'pie',
                height: height,
                fontFamily: 'Nunito, sans-serif',
                toolbar: { show: false },
                animations: { enabled: true },
                zoom: {
                    enabled: false,
                },
            },

            labels: labels,
            colors: colors || defaultColors,

            dataLabels: { enabled: false },

            stroke: {
                show: false,
                width: 0,
            },

            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                fontSize: '12px',
                fontWeight: 500,
                offsetY: 10,
                height: 50,
                markers: {
                    width: 10,
                    height: 10,
                    radius: 2,
                },
                itemMargin: {
                    horizontal: 15,
                    vertical: 4,
                },
                formatter: function (seriesName: string, opts: any) {
                    // Truncate long labels
                    const maxLength = 18;
                    if (seriesName.length > maxLength) {
                        return seriesName.substring(0, maxLength) + '...';
                    }
                    return seriesName;
                },
                onItemClick: {
                    toggleDataSeries: true,
                },
                onItemHover: {
                    highlightDataSeries: true,
                },
            },

            states: {
                hover: {
                    filter: {
                        type: 'none',
                    },
                },
                active: {
                    filter: {
                        type: 'none',
                    },
                },
            },

            tooltip: {
                enabled: true,
                y: {
                    formatter: (value: number) => `RM ${formatValue(value)}`,
                },
            },

            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: 200,
                        },
                    },
                },
            ],
        },
    };

    const handleDropdownSelect = (option: string) => {
        if (onDropdownSelect) {
            onDropdownSelect(option);
        }
    };

    const handleYearChange = (year: string) => {
        if (onYearChange) {
            onYearChange(year);
        }
    };

    return (
        <div className="panel h-full">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between dark:text-white-light">
                <h5 className="text-lg font-semibold">{chartTitle}</h5>

                <div className="flex items-center gap-3">
                    {/* Year Filter Dropdown */}
                    {showYearFilter && yearOptions.length > 0 && (
                        <div className="dropdown">
                            <Dropdown
                                offset={[0, 5]}
                                placement={isRtl ? 'bottom-start' : 'bottom-end'}
                                btnClassName="btn btn-sm btn-outline-primary dropdown-toggle"
                                button={
                                    <span className="flex items-center">
                                        {selectedYear || 'Select Year'}
                                        <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                }
                            >
                                <ul className="max-h-60 overflow-y-auto">
                                    {yearOptions.map((year) => (
                                        <li key={year}>
                                            <button type="button" onClick={() => handleYearChange(year)} className={`w-full ${selectedYear === year ? 'bg-primary/10 text-primary' : ''}`}>
                                                {year}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </Dropdown>
                        </div>
                    )}

                    {/* Options Dropdown */}
                    {showDropdown && dropdownOptions.length > 0 && (
                        <div className="dropdown">
                            <Dropdown
                                offset={[0, 1]}
                                placement={isRtl ? 'bottom-start' : 'bottom-end'}
                                button={<IconHorizontalDots className="text-black/70 hover:!text-primary dark:text-white/70 cursor-pointer" />}
                            >
                                <ul>
                                    {dropdownOptions.map((option, index) => (
                                        <li key={index}>
                                            <button type="button" onClick={() => handleDropdownSelect(option)}>
                                                {option}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </Dropdown>
                        </div>
                    )}
                </div>
            </div>

            {/* Chart Area */}
            <div>
                <div className="rounded-lg bg-white dark:bg-black">
                    {isMounted ? (
                        <>
                            <ReactApexChart series={pieChart.series} options={pieChart.options} type="pie" height={height} width="100%" />
                            <style jsx global>{`
                                .apexcharts-legend {
                                    display: flex !important;
                                    flex-wrap: wrap !important;
                                    justify-content: center !important;
                                    gap: 8px 20px !important;
                                    max-width: 100% !important;
                                    padding: 0 20px !important;
                                }
                                .apexcharts-legend-series {
                                    display: inline-flex !important;
                                    align-items: center !important;
                                    margin: 0 !important;
                                    flex: 0 0 calc(50% - 10px) !important;
                                    max-width: calc(50% - 10px) !important;
                                }
                                .apexcharts-legend-text {
                                    white-space: nowrap !important;
                                    overflow: hidden !important;
                                    text-overflow: ellipsis !important;
                                    max-width: 120px !important;
                                }
                                @media (max-width: 768px) {
                                    .apexcharts-legend-series {
                                        flex: 0 0 100% !important;
                                        max-width: 100% !important;
                                    }
                                }
                            `}</style>
                        </>
                    ) : (
                        <div className="grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08]" style={{ minHeight: height }}>
                            <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-black !border-l-transparent dark:border-white"></span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
