'use client';

import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import Dropdown from '@/components/dropdown';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';

interface MultiLegendPieChartProps {
    chartTitle?: string;
    series?: number[];
    labels?: string[];
    colors?: string[];
    height?: number;
    showDropdown?: boolean;
    dropdownOptions?: string[];
    onDropdownSelect?: (option: string) => void;
    legendsPerRow?: number;
}

export default function MultiLegendPieChart({
    chartTitle = 'Multi Legend Pie',
    series = [10, 8, 15, 12, 9, 11, 13, 7, 14, 10, 8, 12],
    labels = ['Selangor', 'Penang', 'Johor', 'Kedah', 'Perak', 'Pahang', 'Terengganu', 'Kelantan', 'Sabah', 'Sarawak', 'WP KL', 'WP Putrajaya'],
    colors = ['#4361ee', '#805dca', '#00ab55', '#e7515a', '#e2a03f', '#2196f3', '#3b3f5c', '#009688', '#ff9800', '#e91e63', '#00bcd4', '#607d8b'],
    height = 300,
    showDropdown = true,
    dropdownOptions = ['View Report', 'Export Data', 'Edit Chart'],
    onDropdownSelect,
    legendsPerRow = 4,
}: MultiLegendPieChartProps) {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const [isMounted, setIsMounted] = useState(false);
    const [hoveredLegend, setHoveredLegend] = useState<number | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const pieChart: any = {
        series: series,
        options: {
            chart: {
                height: height,
                type: 'pie',
                fontFamily: 'Nunito, sans-serif',
                zoom: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
            },
            labels: labels,
            colors: colors,
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
            stroke: {
                show: false,
            },
            legend: {
                show: false,
            },
            dataLabels: {
                enabled: false,
            },
            tooltip: {
                y: {
                    formatter: function (val: number) {
                        return val.toString();
                    },
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
        <div className="panel h-full">
            <div className="mb-5 flex items-center justify-between dark:text-white-light">
                <h5 className="text-lg font-semibold">{chartTitle}</h5>
                {showDropdown && (
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

            <div>
                {/* Pie Chart */}
                <div className="rounded-lg bg-white dark:bg-black flex items-center justify-center mb-4" style={{ minHeight: height }}>
                    {isMounted ? (
                        <div className="flex items-center justify-center w-full h-full">
                            <ReactApexChart series={pieChart.series} options={pieChart.options} type="pie" height={height} width="100%" />
                        </div>
                    ) : (
                        <div className="grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08]" style={{ minHeight: height }}>
                            <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-black !border-l-transparent dark:border-white"></span>
                        </div>
                    )}
                </div>

                {/* Custom Legend Grid - 4 per row */}
                <div className="px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
                        {labels.map((label, index) => (
                            <div
                                key={index}
                                className="flex items-center min-w-0 relative group cursor-pointer"
                                onMouseEnter={() => setHoveredLegend(index)}
                                onMouseLeave={() => setHoveredLegend(null)}
                            >
                                <div className="w-2 h-2 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: colors[index] }} />
                                <span className={`text-xs font-medium truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>

                                {/* Custom Tooltip */}
                                {hoveredLegend === index && (
                                    <div
                                        className={`absolute bottom-full left-0 mb-2 px-3 py-1.5 rounded shadow-lg whitespace-nowrap z-50 ${
                                            isDark ? 'bg-gray-800 text-white border border-gray-700' : 'bg-gray-900 text-white'
                                        }`}
                                        style={{
                                            animation: 'fadeIn 0.2s ease-in',
                                        }}
                                    >
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors[index] }} />
                                            <span className="text-sm font-medium">{label}</span>
                                        </div>
                                        {/* Tooltip arrow */}
                                        <div
                                            className={`absolute left-3 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${isDark ? 'border-t-gray-800' : 'border-t-gray-900'}`}
                                            style={{
                                                marginLeft: '-4px',
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Fade-in animation */}
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(5px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
