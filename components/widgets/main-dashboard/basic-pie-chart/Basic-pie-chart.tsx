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
    height = 300,
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

    // Determine legend count for styling
    const legendCount = labels.length;
    const isEvenCount = legendCount % 2 === 0 && legendCount >= 4;

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
                position: 'bottom',
                horizontalAlign: 'center',
                fontSize: '13px',
                fontWeight: 500,
                offsetY: 15,
                floating: false,
                itemMargin: {
                    horizontal: 12,
                    vertical: 8,
                },
                markers: {
                    width: 8,
                    height: 8,
                    radius: 2,
                },
                formatter: function (seriesName: string, opts: any) {
                    return seriesName || 'Unknown';
                },
            },
            dataLabels: {
                enabled: false,
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
                <div className="rounded-lg bg-white dark:bg-black flex items-center justify-center" style={{ minHeight: height + 50 }}>
                    {isMounted ? (
                        <div className={`flex items-center justify-center w-full h-full pie-chart-container ${isEvenCount ? 'even-legend' : ''}`}>
                            <ReactApexChart series={pieChart.series} options={pieChart.options} type="pie" height={height} width="100%" />
                        </div>
                    ) : (
                        <div className="grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08]" style={{ minHeight: height }}>
                            <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-black !border-l-transparent dark:border-white"></span>
                        </div>
                    )}
                </div>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                        /* Default styling - for odd numbers or less than 4 items */
                        .pie-chart-container .apexcharts-legend {
                            display: flex !important;
                            flex-wrap: wrap !important;
                            justify-content: center !important;
                            align-items: center !important;
                            max-width: 100% !important;
                            margin: 0 auto !important;
                        }
                        .pie-chart-container .apexcharts-legend-series {
                            margin: 4px 10px !important;
                            display: flex !important;
                            align-items: center !important;
                            justify-content: center !important;
                            text-align: center !important;
                        }
                        
                        /* Special styling for even count (4 or more items) */
                        .pie-chart-container.even-legend .apexcharts-legend {
                            justify-content: flex-start !important;
                            padding-left: 20px !important;
                        }
                        .pie-chart-container.even-legend .apexcharts-legend-series {
                            flex: 0 0 calc(50% - 20px) !important;
                            max-width: calc(50% - 20px) !important;
                            justify-content: flex-start !important;
                            text-align: left !important;
                        }
                        .pie-chart-container.even-legend .apexcharts-legend-series:nth-child(odd) {
                            padding-right: 10px !important;
                        }
                        .pie-chart-container.even-legend .apexcharts-legend-series:nth-child(even) {
                            padding-left: 10px !important;
                        }
                        
                        .pie-chart-container .apexcharts-legend-marker {
                            margin-right: 6px !important;
                        }
                        .pie-chart-container .apexcharts-legend-text {
                            font-size: 13px !important;
                            line-height: 1.2 !important;
                        }
                    `,
                    }}
                />
            </div>
        </div>
    );
}
