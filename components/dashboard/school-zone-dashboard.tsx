'use client';
import Link from 'next/link';
import { StatCardData, StatsGrid } from '../widgets/main-dashboard/stat-card/StatCard';
import { IRootState } from '@/store';
import { useSelector } from 'react-redux';
import { DataTableWithFilters, DataTableWithFiltersConfig, TableColumn, TableRow } from '../widgets/main-dashboard/table-data/DataTableWithFilters';
import { LineChart, LineChartConfig, LineChartDataPoint } from '../widgets/registration/line-chart/LineChart';
import BasicPieChart from '../widgets/main-dashboard/basic-pie-chart/Basic-pie-chart';

export default function SchoolZone() {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    // Stat cards data
    const schoolZone: StatCardData[] = [
        {
            title: 'Overal CGPA(Zone)',
            value: '2.5', // Changed to string
            change: '2.35%',
            changeType: 'positive',
            lastWeekValue: '44,700(?)',
            gradient: 'bg-gradient-to-r from-cyan-500 to-cyan-400',
        },
        {
            title: 'Total Students',
            value: '1,010',
            change: '2.35%',
            changeType: 'negative',
            lastWeekValue: '3',
            gradient: 'bg-gradient-to-r from-violet-500 to-violet-400',
        },
        {
            title: 'Total Schools',
            value: 'SM - HILL PARK',
            change: '1.35%',
            changeType: 'positive',
            lastWeekValue: '0.5',
            gradient: 'bg-gradient-to-r from-blue-500 to-blue-400',
        },
        {
            title: 'Highest CGPA(Zone)',
            value: 'SM - HILL PARK',
            change: '0.5',
            changeType: 'negative',
            lastWeekValue: '',
            gradient: 'bg-gradient-to-r from-fuchsia-500 to-fuchsia-400',
        },
        {
            title: 'Lowest CGPA(Zone)',
            value: 'SM - SETIA ALAM',
            change: '0.35%',
            changeType: 'negative',
            lastWeekValue: '',
            gradient: 'bg-gradient-to-r from-fuchsia-500 to-fuchsia-400',
        },
    ];

    // TABLE 1: CGPA Breakdown by Zone
    const cgpaBreakdownZoneColumns: TableColumn[] = [
        { key: 'zone', label: 'Zone', align: 'left', width: '200px' },
        { key: 'avg_cgpa', label: 'Average CGPA', align: 'left', width: '150px' },
        { key: 'score', label: 'Score(%)', align: 'center', width: '200px' },
        { key: 'num_of_stu', label: 'No. of Students', align: 'center' },
        { key: 'best_performing_school', label: 'Best Performing School', align: 'center' },
        { key: 'worst_performing_school', label: 'Worst Performing School', align: 'center' },
    ];

    const cgpaBreakdownZoneData: TableRow[] = [
        {
            zone: 'HILL PARK',
            avg_cgpa: 2.9,
            score: 70,
            num_of_stu: 350,
            best_performing_school: 'SM-HILL PARK',
            worst_performing_school: 'SRI-HILL PARK',
            color: 'red',
        },
        {
            zone: 'HILL PARK',
            avg_cgpa: 2.9,
            score: 70,
            num_of_stu: 350,
            best_performing_school: 'SM-HILL PARK',
            worst_performing_school: 'SRI-HILL PARK',
            color: 'yellow',
        },
        {
            zone: 'HILL PARK',
            avg_cgpa: 2.9,
            score: 70,
            num_of_stu: 350,
            best_performing_school: 'SM-HILL PARK',
            worst_performing_school: 'SRI-HILL PARK',
            color: 'green',
        },
        {
            zone: 'HILL PARK',
            avg_cgpa: 2.9,
            score: 70,
            num_of_stu: 350,
            best_performing_school: 'SM-HILL PARK',
            worst_performing_school: 'SRI-HILL PARK',
            color: 'purple',
        },
    ];

    // const cgpaBreakdownZoneTotals: TableRow = {
    //     school: 'Total',
    //     level: '',
    //     total_reg: 115,
    //     approved_reg: 95,
    //     rejected_reg: 11,
    //     pending_reg: 9,
    // };

    const cgpaBreakdownZoneConfig: DataTableWithFiltersConfig = {
        title: 'CGPA Breakdown by Zone',
        showColorIndicator: true,
        showTotalRow: true,
        filters: {
            filter1: {
                label: 'Year',
                options: ['2024', '2023', '2022', '2021'],
            },
        },
    };

    // line chart data point and config
    const zoneData: LineChartDataPoint[] = [
        { label: 'HILL PARK', value: 2, color: '#EF4444' },
        { label: 'PUNCAK ALAM', value: 1.8, color: '#8B5CF6' },
        { label: 'SETIA ALAM', value: 3, color: '#3B82F6' },
        { label: 'TRANSIT', value: 1.2, color: '#10B981' },
    ];

    const zoneConfig: LineChartConfig = {
        title: 'Registration Trend Vs Marketing Tools',
        yAxisMax: 4,
    };

    function handleViewReport(index: number): void {
        console.log('View report for:', index);
    }

    function handleZoneTableFilter(filterNumber: 1 | 2 | 3 | 4 | 5 | 6, value: string): void {
        throw new Error('Function not implemented.');
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link href="/" className="text-primary hover:underline">
                        CEO Dashboard
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>School / Zone</span>
                </li>
            </ul>

            {/* Row 1: Stats Grid */}
            <div className="mt-6">
                <StatsGrid stats={schoolZone} isRtl={isRtl} onViewReport={handleViewReport} onEditReport={handleViewReport} />
            </div>

            {/* Row 2 */}
            <div className="mb-6">
                <DataTableWithFilters columns={cgpaBreakdownZoneColumns} data={cgpaBreakdownZoneData} config={cgpaBreakdownZoneConfig} isRtl={isRtl} onFilterChange={handleZoneTableFilter} />
            </div>

            {/* Row 3 */}
            <div className="mb-6 grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <LineChart data={zoneData} config={zoneConfig} />
                </div>
                <div className="lg:col-span-1">
                    <BasicPieChart
                        chartTitle="Financial Component Breakdown"
                        series={[115, 95, 11]}
                        labels={['Operating Cost', 'Administrative Cost', 'Finance Cost']}
                        colors={['#8B5CF6', '#10B981', '#EF4444']}
                        height={340}
                        onDropdownSelect={(option) => {
                            console.log('Zone Pie Chart option selected:', option);
                        }}
                    />
                </div>
            </div>
            {/* Row 4 */}
            <div className="mb-6 grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <BasicPieChart
                        chartTitle="Financial Component Breakdown"
                        series={[115, 95]}
                        labels={['Pre-school Permata Cilik AZ-ZAHRAWI', 'SRI-PUNCAK ALAM']}
                        colors={['#8B5CF6', '#10B981']}
                        height={340}
                        onDropdownSelect={(option) => {
                            console.log('Zone Pie Chart option selected:', option);
                        }}
                    />
                </div>
                <div className="lg:col-span-1">
                    <BasicPieChart
                        chartTitle="Financial Component Breakdown"
                        series={[95, 11]}
                        labels={['SRI-Setia Alam,', 'Pre-school Permata Cilik AZ-ZAHRAWI']}
                        colors={['#EF4444', '#8B5CF6']}
                        height={340}
                        onDropdownSelect={(option) => {
                            console.log('Zone Pie Chart option selected:', option);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
