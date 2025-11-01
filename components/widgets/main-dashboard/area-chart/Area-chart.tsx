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
    subtitle?: string;
    subtitleValue?: string;
    series: SeriesData[];
    labels: string[];
    height?: number;
    colors?: string[];
    showDropdown?: boolean;
    dropdownOptions?: string[];
    onDropdownSelect?: (option: string) => void;
    yAxisFormatter?: (value: number) => string;
    yAxisMin?: number;
    yAxisMax?: number;
    tickAmount?: number;
    colSpan?: string;
}

export default function AreaChart({
    title,
    subtitle,
    subtitleValue,
    series,
    labels,
    height = 325,
    colors,
    showDropdown = true,
    dropdownOptions = ['Weekly', 'Monthly', 'Yearly'],
    onDropdownSelect,
    yAxisFormatter = (value: number) => value / 1000 + 'K',
    colSpan = 'xl:col-span-2',
}: AreaChartProps) {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Default colors if not provided
    const defaultColors = isDark ? ['#2196F3', '#E7515A'] : ['#1B55E2', '#E7515A'];

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
        colors: colors || defaultColors,
        markers: {
            discrete: [
                {
                    seriesIndex: 0,
                    dataPointIndex: 6,
                    fillColor: (colors || defaultColors)[0],
                    strokeColor: 'transparent',
                    size: 7,
                },
                {
                    seriesIndex: 1,
                    dataPointIndex: 5,
                    fillColor: (colors || defaultColors)[1],
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
            min: 1000000,
            max: 7000000,
            tickAmount: 6,
            labels: {
                formatter: yAxisFormatter,
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
            position: 'top',
            horizontalAlign: 'right',
            fontSize: '16px',
            markers: {
                width: 10,
                height: 10,
                offsetX: -2,
            },
            itemMargin: {
                horizontal: 10,
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

    return (
        <div className={`panel h-full ${colSpan}`}>
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

            {subtitle && (
                <p className="text-lg dark:text-white-light/90">
                    {subtitle}
                    {subtitleValue && <span className="ml-2 text-primary">{subtitleValue}</span>}
                </p>
            )}

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
