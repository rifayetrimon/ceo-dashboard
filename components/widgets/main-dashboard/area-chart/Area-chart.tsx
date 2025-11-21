'use client';

import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import Dropdown from '@/components/dropdown';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';

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
            max = yAxisMax !== undefined ? yAxisMax : Math.ceil(maxValue / 100000) * 100000;
            if (max < 100000) max = 100000;
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
            max = yAxisMax !== undefined ? yAxisMax : Math.ceil(maxValue / 100000) * 100000;
            max = Math.ceil((max * 1.1) / 100000) * 100000;
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
            max = yAxisMax !== undefined ? yAxisMax : Math.ceil(maxValue / 500000) * 500000;
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
                horizontal: 20,
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
            {/* Header - Same style as PieChart */}
            <div className="mb-5 flex items-center justify-between dark:text-white-light">
                <h5 className="text-lg font-semibold">
                    {title}
                    {showYearFilter && selectedYear && <span className="ml-2">({selectedYear})</span>}
                </h5>

                <div className="flex items-center gap-3">
                    {/* Year Filter Dropdown - Same style as PieChart */}
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
                                            <button type="button" onClick={() => handleYearSelect(year)} className={`w-full ${selectedYear === year ? 'bg-primary/10 text-primary' : ''}`}>
                                                {year}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </Dropdown>
                        </div>
                    )}

                    {/* Options Dropdown - Same style as PieChart */}
                    {showDropdown && dropdownOptions && dropdownOptions.length > 0 && (
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
