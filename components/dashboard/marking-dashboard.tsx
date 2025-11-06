'use client';

import Link from 'next/link';
import { StatCardData, StatsGrid } from '../widgets/main-dashboard/stat-card/StatCard';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { LineChart, LineChartConfig, LineChartDataPoint } from '../widgets/registration/line-chart/LineChart';
import { DataTableWithFilters, DataTableWithFiltersConfig, TableColumn, TableRow } from '../widgets/main-dashboard/table-data/DataTableWithFilters';

export default function MarketingDashboard() {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    // Stat cards data
    const registrationStats: StatCardData[] = [
        {
            title: 'Total Registrations',
            value: 50,
            change: '2.35%',
            changeType: 'positive',
            lastWeekValue: '44,700',
            gradient: 'bg-gradient-to-r from-cyan-500 to-cyan-400',
        },
        {
            title: 'This Month Registrations',
            value: '18',
            change: 'NOV',
            changeType: 'negative',
            lastWeekValue: '3',
            gradient: 'bg-gradient-to-r from-violet-500 to-violet-400',
        },
        {
            title: 'Cost Per Registration (CPR)',
            value: '38,085',
            change: '1.35%',
            changeType: 'positive',
            lastWeekValue: '37,894',
            gradient: 'bg-gradient-to-r from-blue-500 to-blue-400',
        },
        {
            title: 'Conversion Rate',
            value: '12%',
            change: '0.35%',
            changeType: 'negative',
            lastWeekValue: '9.6%',
            gradient: 'bg-gradient-to-r from-fuchsia-500 to-fuchsia-400',
        },
    ];
    function handleViewReport(index: number): void {
        throw new Error('Function not implemented.');
    }

    // line chart data point and config
    const cityData: LineChartDataPoint[] = [
        { label: 'OCT', value: 2, color: '#EF4444' },
        { label: 'NOV', value: 1.8, color: '#8B5CF6' },
        { label: 'JAN', value: 3, color: '#3B82F6' },
        { label: 'FEB', value: 1.2, color: '#10B981' },
        { label: 'MARCH', value: 2, color: '#F59E0B' },
        { label: 'APR', value: 2.7, color: '#06B6D4' },
    ];

    const config: LineChartConfig = {
        title: 'Registration Trend Vs Marketing Tools',
        yAxisMax: 8,
        // filters: {
        //     filter1: {
        //         label: 'State',
        //         options: ['Selangor', 'Kuala Lumpur', 'Johor'],
        //     },
        // },
    };

    // TABLE 1: Registration Breakdown by State
    const registrationBreakdownStateColumns: TableColumn[] = [
        { key: 'marketing_tool', label: 'Marketing Tool', align: 'left', width: '200px' },
        { key: 'total_reg', label: 'Total Registration', align: 'center' },
        { key: 'per_total_reg', label: 'Percentage of Total Registration', align: 'center' },
        { key: 'cost', label: 'Cost(RM)', align: 'center' },
        { key: 'cost_per_reg', label: 'Cost Per Registration(CPR)', align: 'center' },
    ];

    const registrationBreakdownStateData: TableRow[] = [
        {
            marketing_tool: 'Facebook Ads',
            total_reg: 45,
            per_total_reg: '30%',
            cost: 3,
            cost_per_reg: 4,
        },
        {
            marketing_tool: 'Tiktok Ads',
            total_reg: 45,
            per_total_reg: '24%',
            cost: 3,
            cost_per_reg: 4,
        },
        {
            marketing_tool: 'Google Ads',
            total_reg: 45,
            per_total_reg: '16%',
            cost: 3,
            cost_per_reg: 4,
        },
        {
            marketing_tool: 'Flyers',
            total_reg: 45,
            per_total_reg: '18%',
            cost: 3,
            cost_per_reg: 4,
        },
        {
            marketing_tool: 'Referrals',
            total_reg: 45,
            per_total_reg: '12%',
            cost: 3,
            cost_per_reg: 4,
        },
    ];

    const registrationBreakdownStateTotals: TableRow = {
        marketing_tool: 'Total',
        total_reg: 240,
        per_total_reg: '100%',
        cost: 16,
        cost_per_reg: 19,
    };

    const registrationBreakdownStateConfig: DataTableWithFiltersConfig = {
        title: 'Marketing Trend Vs Total Registrations',
        showColorIndicator: false,
        showTotalRow: true,
        filters: {
            filter1: {
                label: 'Month',
                options: ['OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR'],
            },
        },
    };

    function handleStateTableFilter(filterNumber: 1 | 2 | 3 | 4 | 5 | 6, value: string): void {
        throw new Error('Function not implemented.');
    }

    // line chart data point and config
    const adsData: LineChartDataPoint[] = [
        { label: 'Facebook Ads', value: 2, color: '#EF4444' },
        { label: 'Tiktok Ads', value: 1.8, color: '#8B5CF6' },
        { label: 'Google Ads', value: 3, color: '#3B82F6' },
        { label: 'Flyers', value: 1.2, color: '#10B981' },
        { label: 'Referrals', value: 2, color: '#F59E0B' },
    ];

    const adsConfig: LineChartConfig = {
        title: 'Registration Trend Vs Marketing Tools',
        yAxisMax: 8,
        filters: {
            filter1: {
                label: 'Month',
                options: ['OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR'],
            },
        },
    };

    // TABLE 2: marketing activities
    const marketingBreakdownStateColumns: TableColumn[] = [
        { key: 'marketing_tool', label: 'Marketing Tool', align: 'left', width: '200px' },
        { key: 'total_reg', label: 'Total Registration', align: 'center' },
        { key: 'marketing_tools', label: 'Marketing Tools', align: 'center' },
        { key: 'cost', label: 'Cost(RM)', align: 'center' },
        { key: 'cost_per_reg', label: 'Cost Per Registration(CPR)', align: 'center' },
    ];

    const marketingBreakdownStateData: TableRow[] = [
        {
            marketing_tool: 'OCTOBER',
            total_reg: 4,
            marketing_tools: 'Facebook Ads, Tiktok Ads, Google Ads, Flyers, Referrals',
            cost: 720,
            cost_per_reg: 120,
        },
        {
            marketing_tool: 'NOVEMBER',
            total_reg: 6,
            marketing_tools: 'Tiktok Ads',
            cost: 480,
            cost_per_reg: 120,
        },
        {
            marketing_tool: 'DECEMBER',
            total_reg: 7,
            marketing_tools: 'Facebook Ads',
            cost: 480,
            cost_per_reg: 120,
        },
        {
            marketing_tool: 'JANUARY',
            total_reg: 8,
            marketing_tools: 'Referrals',
            cost: 480,
            cost_per_reg: 120,
        },
        {
            marketing_tool: 'FEBRUARY',
            total_reg: 14,
            marketing_tools: 'Referrals',
            cost: 480,
            cost_per_reg: 120,
        },
        {
            marketing_tool: 'MARCH',
            total_reg: 11,
            marketing_tools: 'Tiktok Ads',
            cost: 480,
            cost_per_reg: 120,
        },
        {
            marketing_tool: 'APRIL',
            total_reg: 9,
            marketing_tools: 'Google Ads',
            cost: 480,
            cost_per_reg: 120,
        },
    ];

    const marketingBreakdownStateTotals: TableRow = {
        marketing_tool: 'Total',
        total_reg: 75,
        marketing_tools: '100%',
        cost: 6000,
        cost_per_reg: 120,
    };

    const marketingBreakdownStateConfig: DataTableWithFiltersConfig = {
        title: 'Breakdown of Registrations and Marketing Activities',
        showColorIndicator: false,
        showTotalRow: true,
        filters: {
            filter1: {
                label: 'Campaign',
                options: ['OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR'],
            },
            filter2: {
                label: 'Month',
                options: ['OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR'],
            },
        },
    };

    return (
        <>
            <div className="px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <ul className="flex space-x-2 rtl:space-x-reverse">
                    <li>
                        <Link href="/" className="text-primary hover:underline">
                            CEO Dashboard
                        </Link>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <span>Marketing</span>
                    </li>
                </ul>

                <div className="pt-5">
                    {/* Row 1: KPI Cards */}
                    <StatsGrid stats={registrationStats} isRtl={isRtl} onViewReport={handleViewReport} onEditReport={handleViewReport} />

                    {/* Row 2: KPI Cards */}
                    <div className="mb-5">
                        <LineChart data={cityData} config={config} />
                    </div>

                    {/* row 3: Additional Insights */}
                    <div className="mb-5">
                        <DataTableWithFilters
                            columns={registrationBreakdownStateColumns}
                            data={registrationBreakdownStateData}
                            totals={registrationBreakdownStateTotals}
                            config={registrationBreakdownStateConfig}
                            isRtl={isRtl}
                            onFilterChange={handleStateTableFilter}
                        />
                    </div>
                    {/* row 4: Additional Insights */}
                    <div className="mb-5">
                        <LineChart data={adsData} config={adsConfig} />
                    </div>

                    {/* row 4: Additional Insights */}
                    <div className="mb-5">
                        <DataTableWithFilters
                            columns={marketingBreakdownStateColumns}
                            data={marketingBreakdownStateData}
                            totals={marketingBreakdownStateTotals}
                            config={marketingBreakdownStateConfig}
                            isRtl={isRtl}
                            onFilterChange={handleStateTableFilter}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
