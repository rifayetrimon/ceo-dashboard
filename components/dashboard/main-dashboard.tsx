'use client';

import Dropdown from '@/components/dropdown';
import IconArrowLeft from '@/components/icon/icon-arrow-left';
import IconBolt from '@/components/icon/icon-bolt';
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconCashBanknotes from '@/components/icon/icon-cash-banknotes';
import IconCreditCard from '@/components/icon/icon-credit-card';
import IconDollarSign from '@/components/icon/icon-dollar-sign';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';
import IconInbox from '@/components/icon/icon-inbox';
import IconMultipleForwardRight from '@/components/icon/icon-multiple-forward-right';
import IconNetflix from '@/components/icon/icon-netflix';
import IconPlus from '@/components/icon/icon-plus';
import IconShoppingCart from '@/components/icon/icon-shopping-cart';
import IconTag from '@/components/icon/icon-tag';
import IconUser from '@/components/icon/icon-user';
import { IRootState } from '@/store';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import PerfectScrollbar from 'react-perfect-scrollbar';
import IconEye from '../icon/icon-eye';
import { Basic } from 'next/font/google';
import BasicPieChart from '../widgets/Basic-pie-chart';
import PieChart from '../widgets/Pie-chart';
import AreaChart from '../widgets/Area-chart';
import SummaryBar from '../widgets/SummaryBar';
import GrossNetProfit from '../widgets/Gross-Net-profit';
import ZoneBar from '../widgets/Zone-bar';
import { Table } from '@mantine/core';
import TableData from '../widgets/TableData';
import OutstandingAmountChart from '../widgets/Amount-zone-chart';

export default function MainDashboard() {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    //Revenue Chart
    const revenueChart: any = {
        series: [
            {
                name: 'Income',
                data: [1600000, 1800000, 2000000, 2200000, 2100000, 2500000, 2600000, 2400000, 2700000, 2800000, 3000000, 3100000],
            },
            {
                name: 'Expenses',
                data: [1400000, 1700000, 1900000, 2100000, 2000000, 2300000, 2400000, 2200000, 2600000, 2700000, 3000000, 3200000],
            },
        ],

        options: {
            chart: {
                height: 325,
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
            colors: isDark ? ['#2196F3', '#E7515A'] : ['#1B55E2', '#E7515A'],
            markers: {
                discrete: [
                    {
                        seriesIndex: 0,
                        dataPointIndex: 6,
                        fillColor: '#1B55E2',
                        strokeColor: 'transparent',
                        size: 7,
                    },
                    {
                        seriesIndex: 1,
                        dataPointIndex: 5,
                        fillColor: '#E7515A',
                        strokeColor: 'transparent',
                        size: 7,
                    },
                ],
            },
            labels: ['Jan-Apr', 'May-Aug', 'Sep-Dec', 'Jan-Apr', 'May-Aug', 'Sep-Dec', 'Jan-Apr', 'May-Aug', 'Sep-Dec', 'Jan-Aug', 'May-Aug', 'Sep-Dec'],
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
                min: 1000000, // force start at 1M
                max: 7000000, // force up to 7M
                tickAmount: 6, // creates ticks at 1M, 2M, 3M, ... 7M
                labels: {
                    formatter: (value: number) => {
                        return value / 1000000 + 'M';
                    },
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
                    inverseColors: !1,
                    opacityFrom: isDark ? 0.19 : 0.28,
                    opacityTo: 0.05,
                    stops: isDark ? [100, 100] : [45, 100],
                },
            },
        },
    };

    // Sales by Category
    // const salesByCategory: any = {
    //     series: [985, 737, 270, 450, 620],
    //     options: {
    //         chart: {
    //             type: 'donut',
    //             height: 350,
    //             fontFamily: 'Nunito, sans-serif',
    //         },
    //         labels: ['Transit', 'Azz Delight', 'Hill Park', 'Setia Alam', 'Puncak Alam'],
    //         dataLabels: {
    //             enabled: false,
    //         },
    //         stroke: {
    //             show: true,
    //             width: 2,
    //             colors: [isDark ? '#0e1726' : '#fff'],
    //         },
    //         colors: isDark ? ['#5c1ac3', '#e2a03f', '#e7515a', '#2196f3', '#4caf50'] : ['#e2a03f', '#5c1ac3', '#e7515a', '#2196f3', '#4caf50'],
    //         legend: {
    //             position: 'bottom',
    //             horizontalAlign: 'center',
    //             fontSize: '13px',
    //             fontWeight: 500,
    //             offsetY: 10,
    //             markers: {
    //                 width: 8,
    //                 height: 8,
    //                 radius: 2,
    //             },
    //         },
    //         plotOptions: {
    //             pie: {
    //                 donut: {
    //                     size: '80%',
    //                     labels: {
    //                         show: true,
    //                         name: {
    //                             show: true,
    //                             fontSize: '20px',
    //                             offsetY: -5,
    //                         },
    //                         value: {
    //                             show: true,
    //                             fontSize: '22px',
    //                             color: isDark ? '#bfc9d4' : '#111827',
    //                             offsetY: 10,
    //                             formatter: (val: any) => val,
    //                         },
    //                         total: {
    //                             show: true,
    //                             label: 'Category', // This shows "Category" as the label
    //                             fontSize: '22px',
    //                             color: isDark ? '#bfc9d4' : '#111827',
    //                             formatter: (w: any) => {
    //                                 return ''; // Return empty string so only the label shows
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //         states: {
    //             hover: {
    //                 filter: {
    //                     type: 'none',
    //                 },
    //             },
    //             active: {
    //                 filter: {
    //                     type: 'none',
    //                 },
    //             },
    //         },
    //     },
    // };

    //Daily Sales
    const dailySales: any = {
        series: [
            {
                name: 'Sales',
                data: [44, 55, 41, 67, 22, 43, 21],
            },
            {
                name: 'Last Week',
                data: [13, 23, 20, 8, 13, 27, 33],
            },
        ],
        options: {
            chart: {
                height: 160,
                type: 'bar',
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
            colors: ['#e2a03f', '#e0e6ed'],
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
                categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
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
        },
    };

    //Total Orders
    const totalOrders: any = {
        series: [
            {
                name: 'Sales',
                data: [28, 40, 36, 52, 38, 60, 38, 52, 36, 40],
            },
        ],
        options: {
            chart: {
                height: 290,
                type: 'area',
                fontFamily: 'Nunito, sans-serif',
                sparkline: {
                    enabled: true,
                },
            },
            stroke: {
                curve: 'smooth',
                width: 2,
            },
            colors: isDark ? ['#00ab55'] : ['#00ab55'],
            labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            yaxis: {
                min: 0,
                show: false,
            },
            grid: {
                padding: {
                    top: 125,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
            },
            fill: {
                opacity: 1,
                type: 'gradient',
                gradient: {
                    type: 'vertical',
                    shadeIntensity: 1,
                    inverseColors: !1,
                    opacityFrom: 0.3,
                    opacityTo: 0.05,
                    stops: [100, 100],
                },
            },
            tooltip: {
                x: {
                    show: false,
                },
            },
        },
    };

    return (
        <>
            <div>
                <ul className="flex space-x-2 rtl:space-x-reverse">
                    <li>
                        <Link href="/" className="text-primary hover:underline">
                            CEO Dashboard
                        </Link>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <span>Main</span>
                    </li>
                </ul>

                <div className="pt-5">
                    {/* 1st row  */}
                    <div className="mb-6 grid grid-cols-1 gap-6 text-white sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {/* user visit */}
                        <div className="panel bg-gradient-to-r from-cyan-500 to-cyan-400">
                            <div className="flex justify-between">
                                <div className="text-md font-semibold ltr:mr-1 rtl:ml-1">Total Zones</div>
                                <div className="dropdown">
                                    <Dropdown
                                        offset={[0, 5]}
                                        placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                        btnClassName="hover:opacity-80"
                                        button={<IconHorizontalDots className="opacity-70 hover:opacity-80" />}
                                    >
                                        <ul className="text-black dark:text-white-dark">
                                            <li>
                                                <button type="button">View Report</button>
                                            </li>
                                            <li>
                                                <button type="button">Edit Report</button>
                                            </li>
                                        </ul>
                                    </Dropdown>
                                </div>
                            </div>
                            <div className="mt-5 flex items-center">
                                <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3"> 5 </div>
                                <div className="badge bg-white/30">+ 2.35% </div>
                            </div>
                            <div className="mt-5 flex items-center font-semibold">
                                <IconEye className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                Last Week 44,700
                            </div>
                        </div>

                        {/* Sessions */}
                        <div className="panel bg-gradient-to-r from-violet-500 to-violet-400">
                            <div className="flex justify-between">
                                <div className="text-md font-semibold ltr:mr-1 rtl:ml-1">Total Schools</div>
                                <div className="dropdown">
                                    <Dropdown
                                        offset={[0, 5]}
                                        placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                        btnClassName="hover:opacity-80"
                                        button={<IconHorizontalDots className="opacity-70 hover:opacity-80" />}
                                    >
                                        <ul className="text-black dark:text-white-dark">
                                            <li>
                                                <button type="button">View Report</button>
                                            </li>
                                            <li>
                                                <button type="button">Edit Report</button>
                                            </li>
                                        </ul>
                                    </Dropdown>
                                </div>
                            </div>
                            <div className="mt-5 flex items-center">
                                <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3"> 74,137 </div>
                                <div className="badge bg-white/30">- 2.35% </div>
                            </div>
                            <div className="mt-5 flex items-center font-semibold">
                                <IconEye className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                Last Week 84,709
                            </div>
                        </div>

                        {/*  Time On-Site */}
                        <div className="panel bg-gradient-to-r from-blue-500 to-blue-400">
                            <div className="flex justify-between">
                                <div className="text-md font-semibold ltr:mr-1 rtl:ml-1">Total Students</div>
                                <div className="dropdown">
                                    <Dropdown
                                        offset={[0, 5]}
                                        placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                        btnClassName="hover:opacity-80"
                                        button={<IconHorizontalDots className="opacity-70 hover:opacity-80" />}
                                    >
                                        <ul className="text-black dark:text-white-dark">
                                            <li>
                                                <button type="button">View Report</button>
                                            </li>
                                            <li>
                                                <button type="button">Edit Report</button>
                                            </li>
                                        </ul>
                                    </Dropdown>
                                </div>
                            </div>
                            <div className="mt-5 flex items-center">
                                <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3"> 38,085 </div>
                                <div className="badge bg-white/30">+ 1.35% </div>
                            </div>
                            <div className="mt-5 flex items-center font-semibold">
                                <IconEye className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                Last Week 37,894
                            </div>
                        </div>

                        {/* Bounce Rate */}
                        <div className="panel bg-gradient-to-r from-fuchsia-500 to-fuchsia-400">
                            <div className="flex justify-between">
                                <div className="text-md font-semibold ltr:mr-1 rtl:ml-1">Total Parents</div>
                                <div className="dropdown">
                                    <Dropdown
                                        offset={[0, 5]}
                                        placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                        btnClassName="hover:opacity-80"
                                        button={<IconHorizontalDots className="opacity-70 hover:opacity-80" />}
                                    >
                                        <ul className="text-black dark:text-white-dark">
                                            <li>
                                                <button type="button">View Report</button>
                                            </li>
                                            <li>
                                                <button type="button">Edit Report</button>
                                            </li>
                                        </ul>
                                    </Dropdown>
                                </div>
                            </div>
                            <div className="mt-5 flex items-center">
                                <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3"> 49.10% </div>
                                <div className="badge bg-white/30">- 0.35% </div>
                            </div>
                            <div className="mt-5 flex items-center font-semibold">
                                <IconEye className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                Last Week 50.01%
                            </div>
                        </div>

                        {/* Bounce Rate */}
                        <div className="panel bg-gradient-to-b from-[#EF4649] to-[#F9797B]">
                            <div className="flex justify-between">
                                <div className="text-md font-semibold ltr:mr-1 rtl:ml-1">Total Staff</div>
                                <div className="dropdown">
                                    <Dropdown
                                        offset={[0, 5]}
                                        placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                        btnClassName="hover:opacity-80"
                                        button={<IconHorizontalDots className="opacity-70 hover:opacity-80" />}
                                    >
                                        <ul className="text-black dark:text-white-dark">
                                            <li>
                                                <button type="button">View Report</button>
                                            </li>
                                            <li>
                                                <button type="button">Edit Report</button>
                                            </li>
                                        </ul>
                                    </Dropdown>
                                </div>
                            </div>
                            <div className="mt-5 flex items-center">
                                <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3"> 49.10% </div>
                                <div className="badge bg-white/30">- 0.35% </div>
                            </div>
                            <div className="mt-5 flex items-center font-semibold">
                                <IconEye className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                Last Week 50.01%
                            </div>
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="mb-6 grid gap-6 xl:grid-cols-3">
                        {/* Income Chart */}
                        {/* <div className="panel h-full xl:col-span-2">
                            <h5 className="mb-5 text-lg font-semibold dark:text-white-light">Income</h5>
                            <div className="rounded-lg bg-white dark:bg-black">
                                {isMounted ? (
                                    <ReactApexChart series={revenueChart.series} options={revenueChart.options} type="area" height={325} width="100%" />
                                ) : (
                                    <div className="grid min-h-[325px] place-content-center">
                                        <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-black !border-l-transparent dark:border-white"></span>
                                    </div>
                                )}
                            </div>
                        </div> */}

                        <AreaChart
                            title="Income"
                            subtitle="Total Income"
                            subtitleValue="RM 6.1M"
                            series={[
                                {
                                    name: 'Income',
                                    data: [1600000, 1800000, 2000000, 2200000, 2100000, 2500000, 2600000, 2400000, 2700000, 2800000, 3000000, 3100000],
                                },
                                {
                                    name: 'Expenses',
                                    data: [1400000, 1700000, 1900000, 2100000, 2000000, 2300000, 2400000, 2200000, 2600000, 2700000, 3000000, 3200000],
                                },
                            ]}
                            labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
                            height={325}
                            yAxisFormatter={(value: number) => value / 1000000 + 'M'}
                        />

                        {/* ✅ Sales by Category */}
                        <PieChart
                            title="Total Income Breakdown By Category(%)"
                            series={[985, 737, 270, 450, 620]}
                            labels={['Transit', 'Azz Delight', 'Hill Park', 'Setia Alam', 'Puncak Alam']}
                            height={340}
                            showDropdown={true}
                            dropdownOptions={['View Report', 'Export Data', 'Share Chart']}
                            onDropdownSelect={(option) => {
                                console.log('Selected:', option);
                                // Handle dropdown selection
                            }}
                        />
                    </div>

                    {/* Row 3 */}
                    <div className="mb-6 grid gap-6 xl:grid-cols-3">
                        {/* pie chart 1 */}
                        <BasicPieChart
                            chartTitle="Financial Component Breakdown"
                            series={[44, 55, 13, 43]}
                            labels={['Operating Cost', '', 'Administrative Cost', 'Finance Cost']}
                            colors={['#4361ee', '#805dca', '#00ab55', '#e7515a', '#e2a03f']}
                            height={340}
                            onDropdownSelect={(option) => {
                                console.log('BasicPieChart option selected:', option);
                            }}
                        />
                        <BasicPieChart
                            chartTitle="Revenue Distribution By Category"
                            series={[44, 55, 13, 43]}
                            labels={['Actovities', 'School Fee', 'School Merchandise', 'School Activities']}
                            colors={['#4361ee', '#805dca', '#00ab55', '#e7515a']}
                            height={340}
                            onDropdownSelect={(option) => {
                                console.log('BasicPieChart option selected:', option);
                            }}
                        />

                        {/* ✅ Expenses by Category */}
                        <PieChart
                            title="Total Expenses Breakdown By Category(%)"
                            series={[985, 737, 270, 450, 620]}
                            labels={['Transit', 'Azz Delight', 'Hill Park', 'Setia Alam', 'Puncak Alam']}
                            height={340}
                            showDropdown={true}
                            dropdownOptions={['View Report', 'Export Data', 'Share Chart']}
                            onDropdownSelect={(option) => {
                                console.log('Selected:', option);
                                // Handle dropdown selection
                            }}
                        />
                    </div>

                    {/* Row 4 */}
                    <div className="mb-6 grid gap-6 xl:grid-cols-3">
                        {/* Summary - Takes 2/3 of the row (2 columns) */}
                        <div className="xl:col-span-2">
                            <SummaryBar
                                title="Financial Summary"
                                items={[
                                    {
                                        icon: <IconInbox />,
                                        label: 'Income',
                                        value: 'RM 6.1M',
                                        percentage: 92,
                                        gradientFrom: '#7579ff',
                                        gradientTo: '#b224ef',
                                        iconBgColor: 'bg-secondary-light dark:bg-secondary',
                                        iconTextColor: 'text-secondary dark:text-secondary-light',
                                    },
                                    {
                                        icon: <IconTag />,
                                        label: 'Profit',
                                        value: 'RM 1.3M',
                                        percentage: 65,
                                        gradientFrom: '#3cba92',
                                        gradientTo: '#0ba360',
                                        iconBgColor: 'bg-success-light dark:bg-success',
                                        iconTextColor: 'text-success dark:text-success-light',
                                    },
                                    {
                                        icon: <IconCreditCard />,
                                        label: 'Expenses',
                                        value: 'RM 4.8M',
                                        percentage: 80,
                                        gradientFrom: '#f09819',
                                        gradientTo: '#ff5858',
                                        iconBgColor: 'bg-warning-light dark:bg-warning',
                                        iconTextColor: 'text-warning dark:text-warning-light',
                                    },
                                ]}
                                onDropdownSelect={(option) => {
                                    console.log('Selected:', option);
                                }}
                            />
                        </div>

                        {/* Gross Net Profit - Takes 1/3 of the row (1 column) */}
                        <div className="xl:col-span-1">
                            <GrossNetProfit
                                title="Gross Net Profit"
                                subtitle="Go to columns for details."
                                icon={<IconDollarSign />}
                                series={[
                                    {
                                        name: 'Gross Profit',
                                        data: [44, 55, 41, 67, 22, 43, 21],
                                    },
                                    {
                                        name: 'Net Profit',
                                        data: [13, 23, 20, 8, 13, 27, 33],
                                    },
                                ]}
                                categories={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
                                height={160}
                                colors={['#e2a03f', '#e0e6ed']}
                            />
                        </div>
                    </div>

                    {/* Row 5 */}
                    <div className="mb-6 grid gap-6 xl:grid-cols-3">
                        <ZoneBar
                            chartTitle="Total Income Breakdown By Zone"
                            series={[
                                { name: 'PNL', data: [10000, 20000, 50000, -30000, 60000] },
                                { name: 'INCOME', data: [20000, 30000, 25000, 40000, 39000] },
                                { name: 'EXPENSE', data: [20000, 300000, 2500, 40000, 39000] },
                            ]}
                            categories={['Azz Delight', 'Hill Dark', 'Puncak Alam', 'Setia Alam', 'Transit']}
                            colors={['#6225C7', '#FEBD4A', '#21C72F']}
                            negativeColor="#FF4757"
                            className="xl:col-span-3"
                            onDropdownSelect={(option) => console.log(option)}
                        />
                    </div>
                    {/* Row 6 */}
                    <div className="mb-6 grid gap-6 xl: grid-cols-1">
                        <TableData />
                    </div>
                    {/* Row 7 */}
                    <div className="mb-6 grid gap-6 xl:grid-cols-1">
                        <OutstandingAmountChart />
                    </div>
                </div>
            </div>
        </>
    );
}
