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
            fontSize: '13px',
            fontWeight: 500,
            offsetY: 10,
            markers: {
                width: 8,
                height: 8,
                radius: 2,
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
                                      formatter: (val: any) => val,
                                  },
                                  total: {
                                      show: true,
                                      label: 'Category',
                                      fontSize: '16px',
                                      fontWeight: 600,
                                      color: isDark ? '#bfc9d4' : '#111827',
                                      formatter: (w: any) => {
                                          return '';
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
    };

    const handleDropdownSelect = (option: string) => {
        if (onDropdownSelect) {
            onDropdownSelect(option);
        }
    };

    return (
        <div className="panel h-full">
            <div className="mb-5 flex items-center justify-between dark:text-white-light">
                <h5 className="text-lg font-semibold">{title}</h5>
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
                <div className="rounded-lg bg-white dark:bg-black">
                    {isMounted ? (
                        <ReactApexChart series={series} options={chartOptions} type={type} height={height} width={'100%'} />
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
