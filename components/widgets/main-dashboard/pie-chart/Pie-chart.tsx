'use client';

import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import Dropdown from '@/components/dropdown';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';

interface PieChartProps {
    title: string;
    series: number[];
    labels: string[];
    height?: number;
    colors?: string[];
    type?: 'pie' | 'donut';
    showDropdown?: boolean;
    dropdownOptions?: string[];
    onDropdownSelect?: (option: string) => void;
    showYearFilter?: boolean;
    yearOptions?: string[];
    selectedYear?: string;
    onYearChange?: (year: string) => void;
}

export default function PieChart({
    title,
    series,
    labels,
    height = 340,
    colors,
    type = 'donut',
    showDropdown = true,
    dropdownOptions = ['View Report', 'Export Data', 'Edit Chart'],
    onDropdownSelect,
    showYearFilter = false,
    yearOptions = [],
    selectedYear,
    onYearChange,
}: PieChartProps) {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Default colors if not provided
    const defaultColors = isDark ? ['#5c1ac3', '#e2a03f', '#e7515a', '#2196f3', '#4caf50'] : ['#e2a03f', '#5c1ac3', '#e7515a', '#2196f3', '#4caf50'];

    const chartOptions: any = {
        chart: {
            type: type,
            height: height,
            fontFamily: 'Nunito, sans-serif',
            zoom: {
                enabled: false,
            },
            toolbar: {
                show: false,
            },
        },
        labels: labels,
        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: type === 'donut',
            width: type === 'donut' ? 2 : 0,
            colors: [isDark ? '#0e1726' : '#fff'],
        },
        colors: colors || defaultColors,
        legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '12px',
            fontWeight: 500,
            offsetY: 15,
            height: 50,
            markers: {
                width: 10,
                height: 10,
                radius: 2,
            },
            itemMargin: {
                horizontal: 20,
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
        plotOptions:
            type === 'donut'
                ? {
                      pie: {
                          donut: {
                              size: '80%',
                              labels: {
                                  show: true,
                                  name: {
                                      show: true,
                                      fontSize: '16px',
                                      fontWeight: 600,
                                      offsetY: -8,
                                  },
                                  value: {
                                      show: true,
                                      fontSize: '18px',
                                      fontWeight: 700,
                                      color: isDark ? '#bfc9d4' : '#111827',
                                      offsetY: 8,
                                      formatter: (val: any) => `RM ${Number(val).toLocaleString()}`,
                                  },
                                  total: {
                                      show: true,
                                      label: 'Total',
                                      fontSize: '16px',
                                      fontWeight: 600,
                                      color: isDark ? '#bfc9d4' : '#111827',
                                      formatter: (w: any) => {
                                          const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                                          return `RM ${total.toLocaleString()}`;
                                      },
                                  },
                              },
                          },
                      },
                  }
                : {},
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
            y: {
                formatter: (val: number) => `RM ${val.toLocaleString()}`,
            },
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
            <div className="mb-5 flex items-center justify-between dark:text-white-light">
                <h5 className="text-lg font-semibold">{title}</h5>
                <div className="flex items-center gap-3">
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
                    {showDropdown && dropdownOptions.length > 0 && (
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
            <div>
                <div className="rounded-lg bg-white dark:bg-black">
                    {isMounted ? (
                        <>
                            <ReactApexChart series={series} options={chartOptions} type={type} height={height} width={'100%'} />
                            <style jsx global>{`
                                .apexcharts-legend {
                                    display: flex !important;
                                    flex-wrap: wrap !important;
                                    justify-content: center !important;
                                    align-items: center !important;
                                    gap: 8px 20px !important;
                                    max-width: 100% !important;
                                    padding: 15px 20px 0 20px !important;
                                    margin: 0 auto !important;
                                }
                                .apexcharts-legend-series {
                                    display: inline-flex !important;
                                    align-items: center !important;
                                    justify-content: center !important;
                                    margin: 0 !important;
                                }
                                .apexcharts-legend-text {
                                    white-space: nowrap !important;
                                    overflow: hidden !important;
                                    text-overflow: ellipsis !important;
                                    max-width: 150px !important;
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
