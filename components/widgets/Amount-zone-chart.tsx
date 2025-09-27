'use client';

import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import Dropdown from '@/components/dropdown';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';

const OutstandingAmountChart = () => {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const dropdownOptions = ['View Report', 'Export Data', 'Edit Chart'];

    const labels = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

    const series = [
        {
            name: 'HILL PARK',
            data: [600, 13173, 200, 1560, 3050, 4810, 10335, 0, 0, 0, 0, 0],
        },
        {
            name: 'SETIA ALAM',
            data: [1100, 6105, 1775, 2620, 2470, 2700, 13528, 0, 0, 0, 0, 0],
        },
        {
            name: 'PUNCAK ALAM',
            data: [400, 6783, 395, 0, 650, 8680, 11507, 0, 0, 0, 0, 0],
        },
        {
            name: 'TRANSIT',
            data: [139, 0, 0, 0, 183, 1527, 3645, 0, 0, 0, 0, 0],
        },
    ];

    const colors = ['#3b82f6', '#ef4444', '#f97316', '#10b981'];

    const chartOptions: any = {
        chart: {
            type: 'line',
            height: 350,
            fontFamily: 'Nunito, sans-serif',
            toolbar: { show: false },
            zoom: { enabled: false },
        },
        stroke: {
            curve: 'smooth',
            width: 2,
        },
        markers: {
            size: 4,
            strokeWidth: 2,
            hover: { size: 6 },
        },
        colors,
        xaxis: {
            categories: labels,
            labels: {
                offsetX: isRtl ? 2 : 0,
                offsetY: 5,
                style: {
                    colors: isDark ? '#ffffff' : '#374151',
                    fontSize: '12px',
                    cssClass: 'apexcharts-xaxis-title',
                },
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            min: 0,
            max: 15000,
            tickAmount: 4,
            labels: {
                formatter: (val: number) => (val >= 1000 ? `${val / 1000}K` : val.toString()),
                offsetX: isRtl ? -30 : -10,
                offsetY: 0,
                style: {
                    colors: isDark ? '#ffffff' : '#374151',
                    fontSize: '12px',
                    cssClass: 'apexcharts-yaxis-title',
                },
            },
            opposite: isRtl,
        },
        grid: {
            borderColor: isDark ? '#191E3A' : '#E0E6ED',
            strokeDashArray: 5,
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            fontSize: '16px',
            labels: {
                colors: isDark ? '#ffffff' : '#374151',
            },
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
            theme: isDark ? 'dark' : 'light',
            y: {
                formatter: (val: number) => {
                    if (val >= 1_000_000) return `RM ${(val / 1_000_000).toFixed(1)}M`;
                    if (val >= 1000) return `RM ${(val / 1000).toFixed(0)}K`;
                    return `RM ${val}`;
                },
            },
        },
    };

    return (
        <div className="panel h-full">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between dark:text-white-light">
                <h5 className="text-lg font-semibold">Outstanding Amount by Zone</h5>
                <div className="dropdown">
                    <Dropdown offset={[0, 5]} placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`} button={<IconHorizontalDots className="text-black/70 hover:!text-primary dark:text-white/70" />}>
                        <ul>
                            {dropdownOptions.map((option, index) => (
                                <li key={index}>
                                    <button type="button" onClick={() => console.log(option)}>
                                        {option}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </Dropdown>
                </div>
            </div>

            {/* Chart */}
            <div className="relative">
                <div className="rounded-lg bg-white dark:bg-black">
                    {isMounted ? (
                        <ReactApexChart series={series} options={chartOptions} type="line" height={350} width="100%" />
                    ) : (
                        <div className="grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08]" style={{ minHeight: 350 }}>
                            <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-black !border-l-transparent dark:border-white"></span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OutstandingAmountChart;
