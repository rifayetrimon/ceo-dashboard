'use client';

import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import Dropdown from '@/components/dropdown'; // Use the standard Dropdown
import SmallDropdown from '@/components/small-dropdown'; // Still imported, but we'll replace its usage for the year filter
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';
import IconCaretDown from '@/components/icon/icon-caret-down';

interface ZoneBarProps {
    chartTitle?: string;
    series?: {
        name: string;
        data: number[];
    }[];
    categories?: string[];
    colors?: string[];
    negativeColor?: string;
    height?: number;
    showDropdown?: boolean;
    dropdownOptions?: string[];
    onDropdownSelect?: (option: string) => void;
    columnWidth?: string;
    borderRadius?: number;
    className?: string;
    showYearFilter?: boolean;
    yearOptions?: string[];
    onYearSelect?: (year: string) => void;
    zonesPerPage?: number;
}

export default function ZoneBar({
    chartTitle = 'Total Income Breakdown by Zone',
    series: initialSeries = [
        {
            name: 'Income',
            data: [95000, 88000, 92000, 89000, 105000],
        },
        {
            name: 'Expenses',
            data: [110000, 165000, 152000, 158000, 130000],
        },
    ],
    categories: initialCategories = ['AZZ DELIGHT', 'HILL PARK', 'PUNCAK ALAM', 'SETIA ALAM', 'TRANSIT'],
    colors = ['#10b981', '#ef4444', '#8b5cf6'],
    negativeColor = '#ef4444',
    height = 400,
    showDropdown = true,
    dropdownOptions = ['View', 'Update', 'Delete'],
    onDropdownSelect,
    columnWidth = '60%',
    borderRadius = 6,
    className = '',
    showYearFilter = true,
    yearOptions = ['2021', '2022', '2023', '2024', '2025'],
    onYearSelect,
    zonesPerPage = 5,
}: ZoneBarProps) {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const [isMounted, setIsMounted] = useState(false);
    const [selectedYear, setSelectedYear] = useState(yearOptions[yearOptions.length - 1]);
    const [series, setSeries] = useState(initialSeries);
    const [categories, setCategories] = useState(initialCategories);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Update series when initialSeries changes
    useEffect(() => {
        setSeries(initialSeries);
        setCurrentPage(0); // Reset to first page when data changes
    }, [initialSeries]);

    // Update categories when initialCategories changes
    useEffect(() => {
        setCategories(initialCategories);
        setCurrentPage(0); // Reset to first page when categories change
    }, [initialCategories]);

    const handleYearSelect = (year: string) => {
        setSelectedYear(year);
        setCurrentPage(0); // Reset to first page when year changes
        if (onYearSelect) {
            onYearSelect(year);
        }
    };

    // Calculate pagination
    const totalPages = Math.ceil(categories.length / zonesPerPage);
    const startIndex = currentPage * zonesPerPage;
    const endIndex = startIndex + zonesPerPage;

    // Get paginated data
    const paginatedCategories = categories.slice(startIndex, endIndex);
    const paginatedSeries = series.map((s) => ({
        ...s,
        data: s.data.slice(startIndex, endIndex),
    }));

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(0, prev - 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
    };

    // Process series to handle negative values with different colors
    const processedSeries = paginatedSeries
        .map((seriesItem, seriesIndex) => {
            // Only apply negative/positive split to the first series (PNL)
            if (seriesIndex === 0 && seriesItem.name.toLowerCase().includes('pnl')) {
                const positiveData = seriesItem.data.map((val) => (val >= 0 ? val : null));
                const negativeData = seriesItem.data.map((val) => (val < 0 ? Math.abs(val) : null));

                return [
                    {
                        name: seriesItem.name + ' (Positive)',
                        data: positiveData,
                    },
                    {
                        name: seriesItem.name + ' (Negative)',
                        data: negativeData,
                    },
                ];
            }
            return [seriesItem];
        })
        .flat();

    // Adjust colors for processed series
    const processedColors = series[0]?.name.toLowerCase().includes('pnl') ? [colors[0], negativeColor, ...colors.slice(1)] : colors;

    const chartOptions: any = {
        chart: {
            height: height,
            type: 'bar',
            fontFamily: 'Inter, sans-serif',
            toolbar: { show: false },
            background: 'transparent',
        },
        dataLabels: { enabled: false },
        stroke: {
            width: 1,
            colors: ['transparent'],
        },
        colors: processedColors,
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: columnWidth,
                borderRadius: borderRadius,
                borderRadiusApplication: 'end',
                dataLabels: { position: 'top' },
            },
        },
        legend: {
            show: true,
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            labels: {
                colors: isDark ? '#bfc9d4' : '#374151',
            },
            markers: {
                width: 12,
                height: 12,
                radius: 2,
            },
            itemMargin: {
                horizontal: 16,
                vertical: 8,
            },
            containerMargin: {
                top: 0,
                bottom: 0,
            },
        },
        grid: {
            show: true,
            borderColor: isDark ? '#1f2937' : '#e5e7eb',
            strokeDashArray: 0,
            position: 'back',
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } },
            padding: {
                top: 20,
                right: 20,
                bottom: 10,
                left: 20,
            },
        },
        xaxis: {
            categories: paginatedCategories,
            axisBorder: {
                show: true,
                color: isDark ? '#374151' : '#e5e7eb',
            },
            axisTicks: { show: false },
            labels: {
                rotate: 0,
                rotateAlways: false,
                hideOverlappingLabels: false,
                trim: false,
                style: {
                    colors: isDark ? '#9ca3af' : '#374151',
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                },
                offsetY: 0,
                formatter: function (value: string) {
                    // Split long labels into multiple lines
                    if (value && value.length > 15) {
                        const words = value.split(' ');
                        const lines: string[] = [];
                        let currentLine = '';

                        words.forEach((word) => {
                            if ((currentLine + ' ' + word).trim().length <= 15) {
                                currentLine = currentLine ? currentLine + ' ' + word : word;
                            } else {
                                if (currentLine) lines.push(currentLine);
                                currentLine = word;
                            }
                        });

                        if (currentLine) lines.push(currentLine);

                        // Return first 2 lines max
                        return lines.slice(0, 2).join('\n');
                    }
                    return value;
                },
            },
        },
        yaxis: {
            opposite: isRtl ? true : false,
            labels: {
                style: {
                    colors: isDark ? '#9ca3af' : '#6b7280',
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                },
                formatter: function (val: number) {
                    if (val >= 1000000) return (val / 1000000).toFixed(0) + 'M';
                    if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
                    if (val === 0) return '0';
                    if (val <= -1000000) return (val / 1000000).toFixed(0) + 'M';
                    if (val <= -1000) return (val / 1000).toFixed(0) + 'k';
                    return val.toString();
                },
                offsetX: isRtl ? -10 : 0,
            },
            min: 0,
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: isDark ? 'dark' : 'light',
                type: 'vertical',
                shadeIntensity: 0.1,
                gradientToColors: undefined,
                inverseColors: false,
                opacityFrom: 0.9,
                opacityTo: 0.7,
                stops: [0, 100],
            },
        },
        tooltip: {
            enabled: true,
            theme: isDark ? 'dark' : 'light',
            style: {
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif',
            },
            y: {
                formatter: function (val: number) {
                    if (val >= 1000000) return 'RM ' + (val / 1000000).toFixed(1) + 'M';
                    if (val >= 1000) return 'RM ' + (val / 1000).toFixed(0) + 'k';
                    return 'RM ' + val.toString();
                },
            },
        },
        responsive: [
            {
                breakpoint: 768,
                options: {
                    plotOptions: {
                        bar: { columnWidth: '70%' },
                    },
                    legend: {
                        position: 'bottom',
                    },
                },
            },
        ],
    };

    const handleDropdownSelect = (option: string) => {
        if (onDropdownSelect) {
            onDropdownSelect(option);
        }
    };

    return (
        <div className={`panel h-full p-0 ${className}`}>
            {/* Header */}
            <div className="mb-5 flex items-start justify-between border-b border-white-light p-5 dark:border-[#1b2e4b] dark:text-white-light">
                <h5 className="text-lg font-semibold">
                    {chartTitle}
                    {showYearFilter && selectedYear && <span className="ml-2">({selectedYear})</span>}
                </h5>

                <div className="flex items-center gap-2">
                    {/* Year Filter Dropdown - Updated to use the standard Dropdown component with AreaChart styling */}
                    {showYearFilter && yearOptions.length > 0 && (
                        <div className="dropdown">
                            <Dropdown
                                offset={[0, 5]}
                                placement={isRtl ? 'bottom-start' : 'bottom-end'}
                                // Applying the style from AreaChart for consistency
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

                    {/* Dropdown Menu (Three dots) - Uses the standard Dropdown and IconHorizontalDots */}
                    {showDropdown && (
                        <div className="dropdown">
                            <Dropdown
                                offset={[0, 5]}
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                btnClassName="hover:text-primary"
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

            {/* Chart */}
            <div className="px-5 pb-5">
                {isMounted ? (
                    <ReactApexChart options={chartOptions} series={processedSeries} type="bar" height={height} width="100%" />
                ) : (
                    <div className="grid place-content-center" style={{ height: height }}>
                        <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-black !border-l-transparent dark:border-white"></span>
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-end gap-2">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 0}
                            className={`flex h-8 w-8 items-center justify-center rounded border transition-colors ${
                                currentPage === 0
                                    ? 'cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-600'
                                    : 'border-gray-300 bg-white text-gray-700 hover:border-primary hover:bg-primary hover:text-white dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-primary dark:hover:bg-primary'
                            }`}
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i)}
                                    className={`flex h-8 w-8 items-center justify-center rounded border text-sm font-medium transition-colors ${
                                        currentPage === i
                                            ? 'border-primary bg-primary text-white'
                                            : 'border-gray-300 bg-white text-gray-700 hover:border-primary hover:bg-primary hover:text-white dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-primary dark:hover:bg-primary'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages - 1}
                            className={`flex h-8 w-8 items-center justify-center rounded border transition-colors ${
                                currentPage === totalPages - 1
                                    ? 'cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-600'
                                    : 'border-gray-300 bg-white text-gray-700 hover:border-primary hover:bg-primary hover:text-white dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-primary dark:hover:bg-primary'
                            }`}
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
