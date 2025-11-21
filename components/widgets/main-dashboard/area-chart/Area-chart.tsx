'use client';

import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import Dropdown from '@/components/dropdown';
import SmallDropdown from '@/components/small-dropdown';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';
import IconCaretDown from '@/components/icon/icon-caret-down';
import { reverse } from 'lodash';

interface SeriesData {
    name: string;
    data: number[];
}

interface AreaChartProps {
    title: string;
    series: SeriesData[];
    labels: string[];
    height?: number;
    colors?: string[];
    showDropdown?: boolean;
    dropdownOptions?: string[];
    onDropdownSelect?: (option: string) => void;
    showYearFilter?: boolean;
    yearOptions?: string[];
    onYearSelect?: (year: string) => void;
    yAxisFormatter?: (value: number) => string;
    yAxisMin?: number;
    yAxisMax?: number;
    tickAmount?: number;
    colSpan?: string;
}

export default function AreaChart({
    title,
    series,
    labels,
    height = 325,
    colors,
    showDropdown = true,
    dropdownOptions = ['Weekly', 'Monthly', 'Yearly'],
    onDropdownSelect,
    showYearFilter = false,
    yearOptions = ['2021', '2022', '2023', '2024', '2025'],
    onYearSelect,
    yAxisFormatter,
    yAxisMin,
    yAxisMax,
    tickAmount,
    colSpan = 'xl:col-span-2',
}: AreaChartProps) {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const [isMounted, setIsMounted] = useState(false);
    const [selectedYear, setSelectedYear] = useState(yearOptions[yearOptions.length - 1]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Generate colors based on series names
    const generateColors = () => {
        if (colors) return colors;

        const defaultColors: string[] = [];
        series.forEach((s) => {
            const name = s.name.toLowerCase();
            if (name.includes('income') || name.includes('revenue')) {
                defaultColors.push('#1B55E2'); // Blue for Income/Revenue
            } else if (name.includes('cost') || name.includes('expense')) {
                defaultColors.push('#E7515A'); // Red for Cost/Expense
            } else if (name.includes('profit')) {
                defaultColors.push('#00ab55'); // Green for Profit
            } else {
                defaultColors.push(isDark ? '#2196F3' : '#1B55E2'); // Default blue
            }
        });

        return defaultColors;
    };

    const chartColors = generateColors();

    // Calculate dynamic min/max and tick configuration for yAxis
    const calculateYAxisConfig = () => {
        if (!series || series.length === 0) {
            return {
                min: 0,
                max: 1000000,
                tickAmount: 5,
                formatter: (value: number) => {
                    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                    if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
                    return value.toFixed(0);
                },
            };
        }

        const allValues = series.flatMap((s) => s.data).filter((v) => v != null && v > 0);
        if (allValues.length === 0) {
            return {
                min: 0,
                max: 1000000,
                tickAmount: 5,
                formatter: (value: number) => {
                    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                    if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
                    return value.toFixed(0);
                },
            };
        }

        const maxValue = Math.max(...allValues);
        let min = yAxisMin !== undefined ? yAxisMin : 0;
        let max: number;
        let ticks: number;
        let formatter: (value: number) => string;

        // Less than 1M - use K scale with professional intervals
        if (maxValue < 1000000) {
            // Round max up to nearest 100K
            max = yAxisMax !== undefined ? yAxisMax : Math.ceil(maxValue / 100000) * 100000;

            // If max is less than 100K, cap at 100K
            if (max < 100000) max = 100000;

            // Ensure minimum of 1M for better visualization
            if (max < 1000000) max = 1000000;

            ticks = tickAmount || 5;
            formatter =
                yAxisFormatter ||
                ((value: number) => {
                    if (value === 0) return '0';
                    if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
                    return value.toFixed(0);
                });
        }
        // Between 1M and 2M
        else if (maxValue >= 1000000 && maxValue < 2000000) {
            // Round up to nearest 100K
            max = yAxisMax !== undefined ? yAxisMax : Math.ceil(maxValue / 100000) * 100000;

            // Add 10% padding
            max = Math.ceil((max * 1.1) / 100000) * 100000;

            // Ensure it's at least 2M for proper scale
            if (max < 2000000) max = 2000000;

            ticks = tickAmount || 5;
            formatter =
                yAxisFormatter ||
                ((value: number) => {
                    if (value === 0) return '0';
                    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                    if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
                    return value.toFixed(0);
                });
        }
        // Greater than 2M
        else {
            // Round up to nearest 500K
            max = yAxisMax !== undefined ? yAxisMax : Math.ceil(maxValue / 500000) * 500000;

            // Add 10% padding
            max = Math.ceil((max * 1.1) / 500000) * 500000;

            ticks = tickAmount || 5;
            formatter =
                yAxisFormatter ||
                ((value: number) => {
                    if (value === 0) return '0';
                    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                    if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
                    return value.toFixed(0);
                });
        }

        return { min, max, tickAmount: ticks, formatter };
    };

    const yAxisConfig = calculateYAxisConfig();

    const chartOptions: any = {
        chart: {
            height: height,
            type: 'area',
            fontFamily: 'Nunito, sans-serif',
            zoom: {
                enabled: false,
            },
            toolbar: {
                show: false,
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: true,
            curve: 'smooth',
            width: 2,
            lineCap: 'square',
        },
        dropShadow: {
            enabled: true,
            opacity: 0.2,
            blur: 10,
            left: -7,
            top: 22,
        },
        colors: chartColors,
        markers: {
            discrete: [
                {
                    seriesIndex: 0,
                    dataPointIndex: 6,
                    fillColor: chartColors[0],
                    strokeColor: 'transparent',
                    size: 7,
                },
                {
                    seriesIndex: 1,
                    dataPointIndex: 5,
                    fillColor: chartColors[1],
                    strokeColor: 'transparent',
                    size: 7,
                },
            ],
        },
        labels: labels,
        xaxis: {
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            crosshairs: {
                show: true,
            },
            labels: {
                offsetX: isRtl ? 2 : 0,
                offsetY: 5,
                style: {
                    fontSize: '12px',
                    cssClass: 'apexcharts-xaxis-title',
                },
            },
        },
        yaxis: {
            min: yAxisConfig.min,
            max: yAxisConfig.max,
            tickAmount: yAxisConfig.tickAmount,
            labels: {
                formatter: yAxisConfig.formatter,
                offsetX: isRtl ? -30 : -10,
                offsetY: 0,
                style: {
                    fontSize: '12px',
                    cssClass: 'apexcharts-yaxis-title',
                },
            },
            opposite: isRtl ? true : false,
        },
        grid: {
            borderColor: isDark ? '#191E3A' : '#E0E6ED',
            strokeDashArray: 5,
            xaxis: {
                lines: {
                    show: false,
                },
            },
            yaxis: {
                lines: {
                    show: true,
                },
            },
            padding: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
            },
        },
        legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '12px',
            fontWeight: 500,
            offsetY: 15,
            markers: {
                width: 10,
                height: 10,
                radius: 2,
                offsetX: -2,
            },
            itemMargin: {
                horizontal: 20, // 20px gap between legend items
                vertical: 5,
            },
        },
        tooltip: {
            marker: {
                show: true,
            },
            x: {
                show: false,
            },
            y: {
                formatter: (value: number) => {
                    return (
                        'RM ' +
                        value.toLocaleString('en-MY', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })
                    );
                },
            },
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                inverseColors: false,
                opacityFrom: isDark ? 0.19 : 0.28,
                opacityTo: 0.05,
                stops: isDark ? [100, 100] : [45, 100],
            },
        },
    };

    const handleDropdownSelect = (option: string) => {
        if (onDropdownSelect) {
            onDropdownSelect(option);
        }
    };

    const handleYearSelect = (year: string) => {
        setSelectedYear(year);
        if (onYearSelect) {
            onYearSelect(year);
        }
    };

    return (
        <div className={`panel h-full ${colSpan}`}>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">
                    {title} {showYearFilter && <span className="text-gray-500 dark:text-gray-400">({selectedYear})</span>}
                </h5>

                <div className="flex items-center gap-2">
                    {/* Year Filter Dropdown */}
                    {showYearFilter && (
                        <SmallDropdown
                            offset={[0, 5]}
                            placement={isRtl ? 'bottom-start' : 'bottom-end'}
                            btnClassName={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition hover:border-primary ${
                                isDark ? 'border-gray-600 bg-gray-800 text-white hover:bg-gray-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                            button={
                                <>
                                    <span>{selectedYear}</span>
                                    <IconCaretDown className="h-3.5 w-3.5" />
                                </>
                            }
                        >
                            {yearOptions.map((year, index) => (
                                <li key={index}>
                                    <button
                                        type="button"
                                        onClick={() => handleYearSelect(year)}
                                        className={`block w-full px-4 py-2 text-left text-sm transition hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                            isDark ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                                        } ${selectedYear === year ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                                    >
                                        {year}
                                    </button>
                                </li>
                            ))}
                        </SmallDropdown>
                    )}

                    {/* Original Dropdown (Weekly/Monthly/Yearly) */}
                    {showDropdown && dropdownOptions && dropdownOptions.length > 0 && (
                        <div className="dropdown">
                            <Dropdown
                                offset={[0, 1]}
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                button={<IconHorizontalDots className="text-black/70 hover:!text-primary dark:text-white/70" />}
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

            <div className="relative">
                <div className="rounded-lg bg-white dark:bg-black">
                    {isMounted ? (
                        <ReactApexChart series={series} options={chartOptions} type="area" height={height} width={'100%'} />
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
