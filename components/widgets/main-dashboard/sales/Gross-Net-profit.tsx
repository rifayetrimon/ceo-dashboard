'use client';

import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

interface SeriesData {
    name: string;
    data: number[];
}

interface GrossNetProfitProps {
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
    iconBgColor?: string;
    iconTextColor?: string;
    series: SeriesData[];
    categories?: string[];
    height?: number;
    colors?: string[];
    colSpan?: string;
    chartType?: 'bar' | 'area' | 'line';
}

export default function GrossNetProfit({
    title = 'Gross Net Profit',
    subtitle = 'Go to columns for details.',
    icon,
    iconBgColor = 'bg-[#ffeccb] dark:bg-warning',
    iconTextColor = 'text-warning dark:text-[#ffeccb]',
    series,
    categories = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
    height = 160,
    colors = ['#e2a03f', '#e0e6ed'],
    colSpan = 'sm:col-span-2 xl:col-span-1',
    chartType = 'bar',
}: GrossNetProfitProps) {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const chartOptions: any = {
        chart: {
            height: height,
            type: chartType,
            fontFamily: 'Nunito, sans-serif',
            toolbar: {
                show: false,
            },
            stacked: true,
            stackType: '100%',
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: true,
            width: 1,
        },
        colors: colors,
        responsive: [
            {
                breakpoint: 480,
                options: {
                    legend: {
                        position: 'bottom',
                        offsetX: -10,
                        offsetY: 0,
                    },
                },
            },
        ],
        xaxis: {
            labels: {
                show: false,
            },
            categories: categories,
        },
        yaxis: {
            show: false,
        },
        fill: {
            opacity: 1,
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '25%',
            },
        },
        legend: {
            show: false,
        },
        grid: {
            show: false,
            xaxis: {
                lines: {
                    show: false,
                },
            },
            padding: {
                top: 10,
                right: -20,
                bottom: -20,
                left: -20,
            },
        },
    };

    return (
        <div className={`panel h-full ${colSpan}`}>
            <div className="mb-5 flex items-center">
                <h5 className="text-lg font-semibold dark:text-white-light">
                    {title}
                    <span className="block text-sm font-normal text-white-dark">{subtitle}</span>
                </h5>
                <div className="relative ltr:ml-auto rtl:mr-auto">
                    <div className={`grid h-11 w-11 place-content-center rounded-full ${iconBgColor} ${iconTextColor}`}>{icon}</div>
                </div>
            </div>
            <div>
                <div className="rounded-lg bg-white dark:bg-black">
                    {isMounted ? (
                        <ReactApexChart series={series} options={chartOptions} type={chartType} height={height} width={'100%'} />
                    ) : (
                        <div className="grid min-h-[325px] place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08]">
                            <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-black !border-l-transparent dark:border-white"></span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
