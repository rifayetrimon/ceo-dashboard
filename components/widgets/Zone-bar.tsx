'use client';

import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import Dropdown from '@/components/dropdown';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';

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
}

export default function ZoneBar({
    chartTitle = 'Total Income Breakdown by Zone',
    series = [
        {
            name: 'Income',
            data: [95000, 88000, 92000, 89000, 105000],
        },
        {
            name: 'Expenses',
            data: [110000, 165000, 152000, 158000, 130000],
        },
    ],
    categories = ['AZZ DELIGHT', 'HILL PARK', 'PUNCAK ALAM', 'SETIA ALAM', 'TRANSIT'],
    colors = ['#8b5cf6', '#fb923c'],
    negativeColor = '#ef4444',
    height = 400,
    showDropdown = true,
    dropdownOptions = ['View', 'Update', 'Delete'],
    onDropdownSelect,
    columnWidth = '60%',
    borderRadius = 6,
    className = '',
}: ZoneBarProps) {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Process series to handle negative values with different colors
    const processedSeries = series
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
                bottom: 20,
                left: 20,
            },
        },
        xaxis: {
            categories: categories,
            axisBorder: {
                show: true,
                color: isDark ? '#374151' : '#e5e7eb',
            },
            axisTicks: { show: false },
            labels: {
                style: {
                    colors: isDark ? '#9ca3af' : '#374151',
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
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
                <h5 className="text-lg font-semibold">{chartTitle}</h5>
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

            {/* Chart */}
            <div className="px-5 pb-5">
                {isMounted ? (
                    <ReactApexChart options={chartOptions} series={processedSeries} type="bar" height={height} width="100%" />
                ) : (
                    <div className="grid place-content-center" style={{ height: height }}>
                        <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-black !border-l-transparent dark:border-white"></span>
                    </div>
                )}
            </div>
        </div>
    );
}
