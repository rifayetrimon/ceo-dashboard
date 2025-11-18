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
    height?: number;
    showDropdown?: boolean;
    dropdownOptions?: string[];
    onDropdownSelect?: (option: string) => void;
}

export default function BasicPieChart({
    chartTitle = 'Basic Pie',
    series = [44, 55, 13, 43, 22],
    labels = ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
    colors = ['#4361ee', '#805dca', '#00ab55', '#e7515a', '#e2a03f'],
    height = 320,
    showDropdown = true,
    dropdownOptions = ['View Report', 'Export Data', 'Edit Chart'],
    onDropdownSelect,
}: BasicPieChartProps) {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const pieChart: any = {
        series: series,
        options: {
            chart: {
                type: 'pie',
                fontFamily: 'Nunito, sans-serif',
                toolbar: { show: false },
                animations: { enabled: true },
            },

            labels,
            colors,

            //═══════════════════════════
            //   LEGEND (updated)
            //═══════════════════════════
            legend: {
                show: true,
                position: 'bottom',
                horizontalAlign: 'center',
                fontSize: '13px',

                // reduced wide spacing
                itemMargin: {
                    horizontal: 6,
                    vertical: 6,
                },

                // smaller circle size
                markers: {
                    width: 8,
                    height: 8,
                    radius: 4,
                    offsetX: -2,
                },
            },

            dataLabels: { enabled: false },
            stroke: { show: false },

            tooltip: {
                enabled: true,
                y: {
                    formatter: (value: number) => value.toString(),
                },
            },

            //═══════════════════════════
            //   RESPONSIVE LEGEND
            //═══════════════════════════
            responsive: [
                {
                    breakpoint: 1024, // tablet
                    options: {
                        chart: { height: 300 },
                        legend: {
                            fontSize: '12px',
                            itemMargin: { horizontal: 5, vertical: 5 },
                            markers: {
                                width: 7,
                                height: 7,
                                radius: 3,
                                offsetX: -2,
                            },
                        },
                    },
                },
                {
                    breakpoint: 600, // mobile
                    options: {
                        chart: { height: 260 },
                        legend: {
                            fontSize: '11px',
                            itemMargin: { horizontal: 3, vertical: 3 },
                            markers: {
                                width: 6,
                                height: 6,
                                radius: 2,
                                offsetX: -2,
                            },
                        },
                    },
                },
            ],
        },
    };

    return (
        <div className="panel h-full">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between dark:text-white-light">
                <h5 className="text-base sm:text-lg font-semibold">{chartTitle}</h5>

                {showDropdown && (
                    <Dropdown
                        offset={[0, 1]}
                        placement={isRtl ? 'bottom-start' : 'bottom-end'}
                        button={<IconHorizontalDots className="text-black/70 hover:!text-primary dark:text-white/70 cursor-pointer" />}
                    >
                        <ul>
                            {dropdownOptions.map((option, index) => (
                                <li key={index}>
                                    <button type="button" onClick={() => onDropdownSelect?.(option)}>
                                        {option}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </Dropdown>
                )}
            </div>

            {/* Chart Area */}
            <div className="rounded-lg bg-white dark:bg-black p-2">
                {isMounted ? (
                    <ReactApexChart series={pieChart.series} options={pieChart.options} type="pie" height={height} width="100%" />
                ) : (
                    <div className="grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08]" style={{ minHeight: height }}>
                        <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-black !border-l-transparent dark:border-white"></span>
                    </div>
                )}
            </div>
        </div>
    );
}
