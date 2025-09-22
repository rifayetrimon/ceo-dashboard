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
    chartTitle = 'Unique Visitors',
    series = [
        {
            name: 'Direct',
            data: [58, 44, 55, 57, 56, 61, 58, 63, 60, 66, 56, 63],
        },
        {
            name: 'Organic',
            data: [91, 76, 85, 101, 98, 87, 105, 91, 114, 94, 66, 70],
        },
    ],
    categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    colors = ['#5c1ac3', '#ffbb44'],
    negativeColor = '#e74c3c',
    height = 360,
    showDropdown = true,
    dropdownOptions = ['View', 'Update', 'Delete'],
    onDropdownSelect,
    columnWidth = '55%',
    borderRadius = 8,
    className = 'lg:col-span-2',
}: ZoneBarProps) {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Process series data to handle negative values with different colors
    const processedSeries = series
        .map((seriesItem, seriesIndex) => {
            if (seriesIndex === 0) {
                const positiveData = seriesItem.data.map((val) => (val >= 0 ? val : null));
                const negativeData = seriesItem.data.map((val) => (val < 0 ? val : null));

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

    const processedColors = [colors[0], negativeColor, ...colors.slice(1)];

    // Calculate min and max values for y-axis
    const allValues = series.flatMap((s) => s.data);
    const maxValue = Math.max(...allValues);
    const minValue = Math.min(...allValues);

    // Set y-axis range with 0 as the center
    const yAxisMax = Math.max(maxValue, Math.abs(minValue));

    // Define custom tick values
    const tickValues = [-1000, 0, 1000, 100000, 1000000];

    // Filter tick values to only include those within our range
    const filteredTickValues = tickValues.filter((val) => Math.abs(val) <= yAxisMax || val === 0);

    // If we don't have enough ticks, add some more
    if (filteredTickValues.length < 3) {
        const step = yAxisMax / 4;
        for (let i = 1; i <= 4; i++) {
            filteredTickValues.push(-step * i);
            filteredTickValues.push(step * i);
        }
        filteredTickValues.sort((a, b) => a - b);
    }

    const uniqueVisitorSeries: any = {
        series: processedSeries,
        options: {
            chart: {
                height: height,
                type: 'bar',
                fontFamily: 'Nunito, sans-serif',
                toolbar: {
                    show: false,
                },
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                width: 2,
                colors: ['transparent'],
            },
            colors: processedColors,
            dropShadow: {
                enabled: true,
                blur: 3,
                color: '#515365',
                opacity: 0.4,
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: columnWidth,
                    borderRadius: borderRadius,
                    borderRadiusApplication: 'end',
                },
            },
            annotations: {
                yaxis: [
                    {
                        y: 0,
                        borderColor: isDark ? '#3b3f5c' : '#e0e6ed',
                        strokeDashArray: 2,
                    },
                ],
            },
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                fontSize: '14px',
                itemMargin: {
                    horizontal: 8,
                    vertical: 8,
                },
            },
            grid: {
                borderColor: isDark ? '#191e3a' : '#e0e6ed',
                padding: {
                    left: 20,
                    right: 20,
                },
            },
            xaxis: {
                categories: categories,
                axisBorder: {
                    show: true,
                    color: isDark ? '#3b3f5c' : '#e0e6ed',
                },
            },
            yaxis: {
                opposite: isRtl ? true : false,
                labels: {
                    offsetX: isRtl ? -10 : 0,
                    formatter: function (val: number) {
                        if (val === -1000) return '-1k';
                        if (val === 0) return '0';
                        if (val === 1000) return '1k';
                        if (val === 100000) return '100k';
                        if (val === 1000000) return '1M';

                        // For other values, format them appropriately
                        if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
                        if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
                        if (val <= -1000000) return (val / 1000000).toFixed(1) + 'M';
                        if (val <= -1000) return (val / 1000).toFixed(1) + 'k';

                        return val.toString();
                    },
                },
                min: -yAxisMax,
                max: yAxisMax,
                forceNiceScale: false,
                tickAmount: filteredTickValues.length,
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shade: isDark ? 'dark' : 'light',
                    type: 'vertical',
                    shadeIntensity: 0.3,
                    inverseColors: false,
                    opacityFrom: 1,
                    opacityTo: 0.8,
                    stops: [0, 100],
                },
            },
            tooltip: {
                marker: {
                    show: true,
                },
            },
        },
    };

    const handleDropdownSelect = (option: string) => {
        if (onDropdownSelect) {
            onDropdownSelect(option);
        }
    };

    return (
        <div className={`panel h-full p-0 ${className}`}>
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

            {isMounted && <ReactApexChart options={uniqueVisitorSeries.options} series={uniqueVisitorSeries.series} type="bar" height={height} width={'100%'} />}
        </div>
    );
}
