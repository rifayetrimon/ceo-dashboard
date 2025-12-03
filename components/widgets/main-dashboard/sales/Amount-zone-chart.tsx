'use client';

import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import Dropdown from '@/components/dropdown';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';

// Helper to parse strings/numbers
const parseAmount = (value: any): number => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    if (typeof value === 'string') {
        return parseFloat(value.replace(/,/g, '')) || 0;
    }
    return 0;
};

const monthKeys = [
    'month_january',
    'month_february',
    'month_march',
    'month_april',
    'month_may',
    'month_june',
    'month_july',
    'month_august',
    'month_september',
    'month_october',
    'month_november',
    'month_december',
];

interface OutstandingAmountChartProps {
    tableData: any[]; // Data from the table
    yearOptions: string[]; // List of years for dropdown
    selectedYear: string; // Currently selected year
    onYearChange: (year: string) => void; // Handler to update year
    showOptionDropdown?: boolean; // ✅ New Prop: Toggle the three dots menu
}

const OutstandingAmountChart = ({
    tableData = [],
    yearOptions = [],
    selectedYear = '2025',
    onYearChange,
    showOptionDropdown = true, // Default to true
}: OutstandingAmountChartProps) => {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    // Transform Table Data into Chart Series
    const series = useMemo(() => {
        if (!tableData || tableData.length === 0) return [];
        return tableData.map((row) => {
            const dataPoints = monthKeys.map((key) => parseAmount(row[key]));
            return {
                name: row.zone || 'Unknown Zone',
                data: dataPoints,
            };
        });
    }, [tableData]);

    const dropdownOptions = ['View Report', 'Export Data', 'Edit Chart'];
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const colors = ['#4361ee', '#e7515a', '#00ab55', '#e2a03f', '#805dca', '#2196f3'];

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
            tickAmount: 5,
            labels: {
                formatter: (val: number) => (val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val.toFixed(0)),
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
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '14px',
            fontFamily: 'Nunito, sans-serif',
            // ✅ Legend Config: Fixed width to force 3 items per row wrapping
            width: 500,
            itemMargin: {
                horizontal: 15,
                vertical: 8,
            },
            markers: {
                width: 10,
                height: 10,
                offsetX: -2,
            },
            labels: {
                colors: isDark ? '#ffffff' : '#374151',
            },
        },
        tooltip: {
            theme: isDark ? 'dark' : 'light',
            y: {
                formatter: (val: number) => `RM ${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            },
        },
    };

    return (
        <div className="panel h-full">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between dark:text-white-light">
                {/* ✅ Updated Title to include selectedYear */}
                <h5 className="text-lg font-semibold">Outstanding Trend ({selectedYear})</h5>

                <div className="flex items-center gap-2">
                    {/* ✅ Year Dropdown (Matches DataTable Style) */}
                    {yearOptions.length > 0 && (
                        <div className="dropdown">
                            <Dropdown
                                offset={[0, 5]}
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                btnClassName="btn btn-sm btn-outline-primary dropdown-toggle"
                                button={
                                    <span className="flex items-center">
                                        {selectedYear}
                                        <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                }
                            >
                                <ul className="max-h-60 overflow-y-auto">
                                    {yearOptions.map((year) => (
                                        <li key={year}>
                                            <button type="button" onClick={() => onYearChange(year)} className={`w-full ${selectedYear === year ? 'bg-primary/10 text-primary' : ''}`}>
                                                {year}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </Dropdown>
                        </div>
                    )}

                    {/* ✅ Options Dropdown (Three Dots) - Can be hidden via props */}
                    {showOptionDropdown && (
                        <div className="dropdown">
                            <Dropdown
                                offset={[0, 5]}
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                button={<IconHorizontalDots className="text-black/70 hover:!text-primary dark:text-white/70" />}
                            >
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
                    )}
                </div>
            </div>

            {/* Chart */}
            <div className="relative">
                <div className="rounded-lg bg-white dark:bg-black">
                    {series.length > 0 ? (
                        <ReactApexChart series={series} options={chartOptions} type="line" height={350} width="100%" />
                    ) : (
                        <div className="grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08]" style={{ minHeight: 350 }}>
                            <div className="text-center text-gray-500">{tableData.length === 0 ? 'Loading data...' : 'No outstanding data found'}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OutstandingAmountChart;
