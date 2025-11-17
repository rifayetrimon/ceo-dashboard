'use client';

import IconCreditCard from '@/components/icon/icon-credit-card';
import IconDollarSign from '@/components/icon/icon-dollar-sign';
import IconInbox from '@/components/icon/icon-inbox';
import IconTag from '@/components/icon/icon-tag';
import { IRootState } from '@/store';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import BasicPieChart from '../widgets/main-dashboard/basic-pie-chart/Basic-pie-chart';
import PieChart from '../widgets/main-dashboard/pie-chart/Pie-chart';
import AreaChart from '../widgets/main-dashboard/area-chart/Area-chart';
import SummaryBar from '../widgets/SummaryBar';
import GrossNetProfit from '../widgets/main-dashboard/sales/Gross-Net-profit';
import ZoneBar from '../widgets/Zone-bar';
import OutstandingAmountChart from '../widgets/main-dashboard/sales/Amount-zone-chart';
import { StatCardData, StatsGrid } from '../widgets/main-dashboard/stat-card/StatCard';
import { DataTable, DataTableConfig, TableColumn, TableRow } from '../widgets/main-dashboard/table-data/TableData';
import IconUser from '../icon/icon-user';
import Image from 'next/image';
import { dashboardService } from '@/services/sales/salesService';

export default function MainDashboard() {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<StatCardData[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await dashboardService.getSystemInfo();
            console.log('Dashboard data:', response);

            // Check if response has the expected structure
            if (response?.data?.systemInfo) {
                const systemInfo = response.data.systemInfo;

                // Update stats with API data
                const updatedStats: StatCardData[] = [
                    {
                        title: 'Total Zones',
                        value: systemInfo.totalBranch?.toString() || '0',
                        valueSize: 'xl',
                        gradient: 'bg-gradient-to-r from-cyan-500 to-cyan-400',
                        iconSize: 'xl',
                        icon: <Image src="/assets/images/icons/zone1.svg" alt="zones" width={35} height={35} className="brightness-0 invert opacity-90" />,
                    },
                    {
                        title: 'Total Schools',
                        value: systemInfo.totalClient?.toLocaleString() || '0',
                        valueSize: 'xl',
                        gradient: 'bg-gradient-to-r from-violet-500 to-violet-400',
                        iconSize: 'xl',
                        icon: <Image src="/assets/images/icons/school.svg" alt="school" width={35} height={35} className="brightness-0 invert opacity-90" />,
                    },
                    {
                        title: 'Total Students',
                        value: systemInfo.totalStudent?.toLocaleString() || '0',
                        valueSize: 'xl',
                        gradient: 'bg-gradient-to-r from-blue-500 to-blue-400',
                        iconSize: 'xl',
                        icon: <Image src="/assets/images/icons/students.svg" alt="student" width={35} height={35} className="brightness-0 invert opacity-90" />,
                    },
                    {
                        title: 'Total Staff',
                        value: systemInfo.totalStaff?.toLocaleString() || '0',
                        valueSize: 'xl',
                        gradient: 'bg-gradient-to-b from-[#EF4649] to-[#F9797B]',
                        iconSize: 'xl',
                        icon: <Image src="/assets/images/icons/staff.svg" alt="staff" width={35} height={35} className="brightness-0 invert opacity-90" />,
                    },
                ];

                setStats(updatedStats);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            // Set default stats on error
            setStats(getDefaultStats());
        } finally {
            setLoading(false);
        }
    };

    // Default stats function for fallback
    const getDefaultStats = (): StatCardData[] => [
        {
            title: 'Total Zones',
            value: '0',
            valueSize: 'xl',
            gradient: 'bg-gradient-to-r from-cyan-500 to-cyan-400',
            iconSize: 'xl',
            icon: <Image src="/assets/images/icons/zone1.svg" alt="zones" width={35} height={35} className="brightness-0 invert opacity-90" />,
        },
        {
            title: 'Total Schools',
            value: '0',
            valueSize: 'xl',
            gradient: 'bg-gradient-to-r from-violet-500 to-violet-400',
            iconSize: 'xl',
            icon: <Image src="/assets/images/icons/school.svg" alt="school" width={35} height={35} className="brightness-0 invert opacity-90" />,
        },
        {
            title: 'Total Students',
            value: '0',
            valueSize: 'xl',
            gradient: 'bg-gradient-to-r from-blue-500 to-blue-400',
            iconSize: 'xl',
            icon: <Image src="/assets/images/icons/students.svg" alt="student" width={35} height={35} className="brightness-0 invert opacity-90" />,
        },
        {
            title: 'Total Staff',
            value: '0',
            valueSize: 'xl',
            gradient: 'bg-gradient-to-b from-[#EF4649] to-[#F9797B]',
            iconSize: 'xl',
            icon: <Image src="/assets/images/icons/staff.svg" alt="staff" width={35} height={35} className="brightness-0 invert opacity-90" />,
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Handle report actions
    const handleViewReport = (index: number) => {
        const stat = stats[index];
        console.log('View report for:', stat.title);
        // Add your view report logic here
    };

    const handleEditReport = (index: number) => {
        const stat = stats[index];
        console.log('Edit report for:', stat.title);
        // Add your edit report logic here
    };

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
                min: 1000000,
                max: 7000000,
                tickAmount: 6,
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

    function handleTableView(): void {
        throw new Error('Function not implemented.');
    }

    function handleTableDelete(): void {
        throw new Error('Function not implemented.');
    }

    // DataTable configuration
    const outstandingAmountColumns: TableColumn[] = [
        { key: 'zone', label: 'Zone', align: 'left', width: '200px' },
        { key: 'monthLabel', label: '(Month/Outstanding Amount)', align: 'center', width: '200px' },
        { key: 'january', label: 'January', align: 'center' },
        { key: 'february', label: 'February', align: 'center' },
        { key: 'march', label: 'March', align: 'center' },
        { key: 'april', label: 'April', align: 'center' },
        { key: 'may', label: 'May', align: 'center' },
        { key: 'june', label: 'June', align: 'center' },
        { key: 'july', label: 'July', align: 'center' },
        { key: 'total', label: 'Total', align: 'center' },
    ];

    const outstandingAmountData: TableRow[] = [
        {
            zone: 'HILL PARK',
            monthLabel: '',
            january: 'RM 600',
            february: 'RM 13,173',
            march: 'RM 200',
            april: 'RM 1,560',
            may: 'RM 3,050',
            june: 'RM 4,810',
            july: 'RM 10,335',
            total: 'RM 35,528',
            color: 'blue',
        },
        {
            zone: 'SETIA ALAM',
            monthLabel: '',
            january: 'RM 1,100',
            february: 'RM 6,105',
            march: 'RM 1,775',
            april: 'RM 2,620',
            may: 'RM 2,470',
            june: 'RM 2,700',
            july: 'RM 13,528',
            total: 'RM 30,297',
            color: 'purple',
        },
        {
            zone: 'PUNCAK ALAM',
            monthLabel: '',
            january: 'RM 400',
            february: 'RM 6,783',
            march: 'RM 395',
            april: null,
            may: 'RM 650',
            june: 'RM 8,680',
            july: 'RM 11,507',
            total: 'RM 28,415',
            color: 'orange',
        },
        {
            zone: 'TRANSIT',
            monthLabel: '',
            january: 'RM 139',
            february: null,
            march: null,
            april: null,
            may: 'RM 183',
            june: 'RM 1,527',
            july: 'RM 3,645',
            total: 'RM 5,494',
            color: 'green',
        },
    ];

    const outstandingAmountTotals: TableRow = {
        zone: 'Total',
        monthLabel: '',
        january: 'RM 2,239',
        february: 'RM 26,061',
        march: 'RM 4,170',
        april: 'RM 4,180',
        may: 'RM 6,353',
        june: 'RM 17,717',
        july: 'RM 39,014',
        total: 'RM 99,734',
    };

    const outstandingAmountConfig: DataTableConfig = {
        title: 'Outstanding Amount by Zone',
        showColorIndicator: true,
        showTotalRow: true,
    };

    return (
        <>
            <div className="px-4 sm:px-6 lg:px-8">
                <ul className="flex space-x-2 rtl:space-x-reverse">
                    <li>
                        <Link href="/" className="text-primary hover:underline">
                            CEO Dashboard
                        </Link>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <span>Sales</span>
                    </li>
                </ul>

                <div className="pt-5">
                    {/* 1st row - KPI Cards with improved tablet responsiveness */}
                    <StatsGrid stats={stats} isRtl={isRtl} onViewReport={handleViewReport} onEditReport={handleEditReport} />

                    {/* Row 2 - Charts with better tablet layout */}
                    <div className="mb-6 grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
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
                        </div>

                        <div className="lg:col-span-1">
                            <PieChart
                                title="Total Income Breakdown By Category(%)"
                                series={[985, 737, 270, 450, 620]}
                                labels={['Transit', 'Azz Delight', 'Hill Park', 'Setia Alam', 'Puncak Alam']}
                                height={340}
                                showDropdown={true}
                                dropdownOptions={['View Report', 'Export Data', 'Share Chart']}
                                onDropdownSelect={(option) => {
                                    console.log('Selected:', option);
                                }}
                            />
                        </div>
                    </div>

                    {/* Row 3 - Three pie charts with tablet responsiveness */}
                    <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                            labels={['Activities', 'School Fee', 'School Merchandise', 'School Activities']}
                            colors={['#4361ee', '#805dca', '#00ab55', '#e7515a']}
                            height={340}
                            onDropdownSelect={(option) => {
                                console.log('BasicPieChart option selected:', option);
                            }}
                        />

                        <div className="md:col-span-2 lg:col-span-1">
                            <PieChart
                                title="Total Expenses Breakdown By Category(%)"
                                series={[985, 737, 270, 450, 620]}
                                labels={['Transit', 'Azz Delight', 'Hill Park', 'Setia Alam', 'Puncak Alam']}
                                height={340}
                                showDropdown={true}
                                dropdownOptions={['View Report', 'Export Data', 'Share Chart']}
                                onDropdownSelect={(option) => {
                                    console.log('Selected:', option);
                                }}
                            />
                        </div>
                    </div>

                    {/* Row 4 - Summary and Gross Net Profit */}
                    <div className="mb-6 grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
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

                        <div className="lg:col-span-1">
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

                    {/* Row 5 - Zone Bar Chart */}
                    <div className="mb-6">
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
                            onDropdownSelect={(option) => console.log(option)}
                        />
                    </div>

                    {/* Row 6 - Table Data */}
                    <div className="mb-6">
                        <DataTable
                            columns={outstandingAmountColumns}
                            data={outstandingAmountData}
                            totals={outstandingAmountTotals}
                            config={outstandingAmountConfig}
                            isRtl={isRtl}
                            onViewReport={handleTableView}
                            onEditReport={handleTableView}
                            onDeleteReport={handleTableDelete}
                        />
                    </div>

                    {/* Row 7 - Outstanding Amount Chart */}
                    <div className="mb-6">
                        <OutstandingAmountChart />
                    </div>
                </div>
            </div>
        </>
    );
}
