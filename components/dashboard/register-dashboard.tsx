'use client';
import Link from 'next/link';
import { StatCardData, StatsGrid } from '../widgets/main-dashboard/stat-card/StatCard';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { BarChart, BarChartConfig, BarChartDataPoint } from '../widgets/registration/BarChart';
import { DataTableWithFilters, DataTableWithFiltersConfig, TableColumn, TableRow } from '../widgets/main-dashboard/table-data/DataTableWithFilters';
import BasicPieChart from '../widgets/main-dashboard/basic-pie-chart/Basic-pie-chart';
import { LineChart, LineChartConfig, LineChartDataPoint } from '../widgets/registration/line-chart/LineChart';
import { MultiTableLayout, MultiTableLayoutConfig } from '../widgets/main-dashboard/table-data/MultiTableLayout';
import MultiLegendPieChart from '../widgets/registration/reg-pie-chart/MultiLegendPieChart';

export default function RegisterDashboard() {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    // Stat cards data
    const registrationStats: StatCardData[] = [
        {
            title: 'Total Registrations',
            value: 5,
            change: '2.35%',
            changeType: 'positive',
            lastWeekValue: '44,700',
            gradient: 'bg-gradient-to-r from-cyan-500 to-cyan-400',
        },
        {
            title: 'Pending Approval',
            value: '74,137',
            change: '2.35%',
            changeType: 'negative',
            lastWeekValue: '84,709',
            gradient: 'bg-gradient-to-r from-violet-500 to-violet-400',
        },
        {
            title: 'Approved Registration',
            value: '38,085',
            change: '1.35%',
            changeType: 'positive',
            lastWeekValue: '37,894',
            gradient: 'bg-gradient-to-r from-blue-500 to-blue-400',
        },
        {
            title: 'Rejected/Incomplete',
            value: '49.10%',
            change: '0.35%',
            changeType: 'negative',
            lastWeekValue: '50.01%',
            gradient: 'bg-gradient-to-r from-fuchsia-500 to-fuchsia-400',
        },
        {
            title: 'New Registration (month)',
            value: '49.10%',
            change: '0.35%',
            changeType: 'negative',
            lastWeekValue: '50.01%',
            gradient: 'bg-gradient-to-b from-[#EF4649] to-[#F9797B]',
        },
    ];

    // Bar Chart Data - Registration Breakdown by Time
    const registrationData: BarChartDataPoint[] = [
        { label: 'Jan', total: 50, approved: 45, pending: 10 },
        { label: 'Feb', total: 70, approved: 60, pending: 15 },
        { label: 'Mar', total: 40, approved: 35, pending: 5 },
        { label: 'Apr', total: 80, approved: 70, pending: 20 },
        { label: 'May', total: 60, approved: 55, pending: 10 },
        { label: 'Jun', total: 90, approved: 85, pending: 25 },
        { label: 'Jul', total: 90, approved: 95, pending: 30 },
        { label: 'Aug', total: 100, approved: 99, pending: 35 },
        { label: 'Sep', total: 95, approved: 90, pending: 20 },
        { label: 'Oct', total: 85, approved: 80, pending: 15 },
        { label: 'Nov', total: 75, approved: 70, pending: 10 },
        { label: 'Dec', total: 95, approved: 95, pending: 40 },
    ];

    const registrationConfig: BarChartConfig = {
        title: 'Registration Breakdown by Time',
        targetLine: 95,
        targetLabel: 'Targeted Registration',
        yAxisMax: 100,
        showGrid: true,
        barWidth: 70,
        filters: {
            years: ['2024', '2023', '2022', '2021'],
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            zones: ['All Zones', 'Hill Park', 'Setia Alam', 'Puncak Alam', 'Transit'],
            schools: ['All Schools', 'School A', 'School B', 'School C', 'School D'],
        },
    };

    // TABLE 1: Registration Breakdown by Zone
    const registrationBreakdownZoneColumns: TableColumn[] = [
        { key: 'school', label: 'School', align: 'left', width: '200px' },
        { key: 'level', label: 'Level', align: 'center', width: '150px' },
        { key: 'total_reg', label: 'Total', align: 'center' },
        { key: 'approved_reg', label: 'Approved', align: 'center' },
        { key: 'rejected_reg', label: 'Rejected', align: 'center' },
        { key: 'pending_reg', label: 'Pending', align: 'center' },
    ];

    const registrationBreakdownZoneData: TableRow[] = [
        {
            school: 'SM-HP',
            level: 'Level 1',
            total_reg: 25,
            approved_reg: 20,
            rejected_reg: 2,
            pending_reg: 3,
            color: 'blue',
        },
        {
            school: 'SM-HP',
            level: 'Level 2',
            total_reg: 30,
            approved_reg: 25,
            rejected_reg: 3,
            pending_reg: 2,
            color: 'blue',
        },
        {
            school: 'SM-HP',
            level: 'Level 3',
            total_reg: 28,
            approved_reg: 22,
            rejected_reg: 4,
            pending_reg: 2,
            color: 'blue',
        },
        {
            school: 'SM-HP',
            level: 'Level 4',
            total_reg: 32,
            approved_reg: 28,
            rejected_reg: 2,
            pending_reg: 2,
            color: 'blue',
        },
    ];

    const registrationBreakdownZoneTotals: TableRow = {
        school: 'Total',
        level: '',
        total_reg: 115,
        approved_reg: 95,
        rejected_reg: 11,
        pending_reg: 9,
    };

    const registrationBreakdownZoneConfig: DataTableWithFiltersConfig = {
        title: 'Registration Breakdown by Zone (School)',
        showColorIndicator: false,
        showTotalRow: true,
        filters: {
            filter1: {
                label: 'Year',
                options: ['2024', '2023', '2022', '2021'],
            },
            filter2: {
                label: 'Zone',
                options: ['All Zones', 'Hill Park', 'Setia Alam', 'Puncak Alam', 'Transit'],
            },
            filter3: {
                label: 'Level',
                options: ['All Levels', 'Level 1', 'Level 2', 'Level 3', 'Level 4'],
            },
            filter4: {
                label: 'Month',
                options: ['All Months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            },
        },
    };

    // TABLE 2: Registration Breakdown by State
    const registrationBreakdownStateColumns: TableColumn[] = [
        { key: 'state', label: 'State', align: 'left', width: '200px' },
        { key: 'total_reg', label: 'Total', align: 'center' },
        { key: 'approved_reg', label: 'Approved', align: 'center' },
        { key: 'rejected_reg', label: 'Rejected', align: 'center' },
        { key: 'pending_reg', label: 'Pending', align: 'center' },
    ];

    const registrationBreakdownStateData: TableRow[] = [
        {
            state: 'Subang Jaya',
            total_reg: 45,
            approved_reg: 38,
            rejected_reg: 3,
            pending_reg: 4,
            color: 'purple',
        },
        {
            state: 'Shah Alam',
            total_reg: 52,
            approved_reg: 45,
            rejected_reg: 4,
            pending_reg: 3,
            color: 'blue',
        },
        {
            state: 'Petaling Jaya',
            total_reg: 38,
            approved_reg: 32,
            rejected_reg: 3,
            pending_reg: 3,
            color: 'green',
        },
        {
            state: 'Klang',
            total_reg: 42,
            approved_reg: 36,
            rejected_reg: 2,
            pending_reg: 4,
            color: 'orange',
        },
        {
            state: 'Kajang',
            total_reg: 35,
            approved_reg: 30,
            rejected_reg: 2,
            pending_reg: 3,
            color: 'pink',
        },
        {
            state: 'Selayang',
            total_reg: 28,
            approved_reg: 24,
            rejected_reg: 2,
            pending_reg: 2,
            color: 'cyan',
        },
    ];

    const registrationBreakdownStateTotals: TableRow = {
        state: 'Total',
        total_reg: 240,
        approved_reg: 205,
        rejected_reg: 16,
        pending_reg: 19,
    };

    const registrationBreakdownStateConfig: DataTableWithFiltersConfig = {
        title: 'Registration Breakdown by State',
        showColorIndicator: false,
        showTotalRow: true,
        filters: {
            filter1: {
                label: 'State',
                options: ['Selangor', 'Penang', 'Johor', 'Kedah', 'Perak', 'Pahang', 'Terengganu', 'Kelantan', 'Sabah', 'Sarawak', 'WP Kuala Lumpur', 'WP Labuan', 'WP Putrajaya'],
            },
        },
    };

    // Demographics Multi-Table Data
    const demographicsMultiTableConfig: MultiTableLayoutConfig = {
        mainTitle: 'Registration Breakdown by Demographics (Approved Only)',
        layout: 'grid-4',
        tables: [
            {
                columns: [
                    { key: 'category', label: 'Gender Category', align: 'left' },
                    { key: 'total', label: 'Total Registration', align: 'center' },
                    { key: 'percentage', label: 'Percentage of Total Registration', align: 'center' },
                ],
                data: [
                    { category: 'Male', total: 28, percentage: '56%' },
                    { category: 'Female', total: 22, percentage: '44%' },
                    { category: '', total: '', percentage: '' }, // Empty spacing row
                ],
                totals: { category: 'Total', total: 50, percentage: '100%' },
            },
            {
                columns: [
                    { key: 'category', label: 'Gender Category', align: 'left' },
                    { key: 'total', label: 'Total Registration', align: 'center' },
                    { key: 'percentage', label: 'Percentage of Total Registration', align: 'center' },
                ],
                data: [
                    { category: '3-6', total: 26, percentage: '52%' },
                    { category: '7-12', total: 15, percentage: '30%' },
                    { category: '13-17', total: 9, percentage: '18%' },
                ],
                totals: { category: 'Total', total: 50, percentage: '100%' },
            },
            {
                columns: [
                    { key: 'category', label: 'Race/Ethnicity', align: 'left' },
                    { key: 'total', label: 'Total Registration', align: 'center' },
                    { key: 'percentage', label: 'Percentage of Total Registration', align: 'center' },
                ],
                data: [
                    { category: 'Malay', total: 41, percentage: '82%' },
                    { category: 'Chinese', total: 4, percentage: '8%' },
                    { category: 'Indian', total: 3, percentage: '6%' },
                    { category: 'Others', total: 2, percentage: '4%' },
                ],
                totals: { category: 'Total', total: 50, percentage: '100%' },
            },
            {
                columns: [
                    { key: 'category', label: 'Zone Category', align: 'left' },
                    { key: 'total', label: 'Total Registration', align: 'center' },
                    { key: 'percentage', label: 'Percentage of Total Registration', align: 'center' },
                ],
                data: [
                    { category: 'Hill Park', total: 15, percentage: '30%' },
                    { category: 'Setia Alam', total: 12, percentage: '24%' },
                    { category: 'Puncak Alam', total: 13, percentage: '26%' },
                    { category: 'Transit', total: 10, percentage: '20%' },
                ],
                totals: { category: 'Total', total: 50, percentage: '100%' },
            },
        ],
    };

    // Event Handlers

    // Handle stat card actions
    const handleViewReport = (index: number) => {
        const stat = registrationStats[index];
        console.log('View report for:', stat.title);
    };

    const handleEditReport = (index: number) => {
        const stat = registrationStats[index];
        console.log('Edit report for:', stat.title);
    };

    // Handle bar chart filter changes
    const handleChartFilterChange = (filterType: 'year' | 'month' | 'zone' | 'school', value: string) => {
        console.log(`Chart Filter ${filterType} changed to:`, value);
        // Add your filter logic here - fetch new data based on selected filter
    };

    // Handle zone table filter changes
    const handleZoneTableFilter = (filterNumber: 1 | 2 | 3 | 4, value: string) => {
        console.log(`Zone Table - Filter ${filterNumber} changed to:`, value);
        // Fetch new data based on selected filter
    };

    // Handle state table filter changes
    const handleStateTableFilter = (filterNumber: 1 | 2 | 3 | 4, value: string) => {
        console.log(`State Table - Filter ${filterNumber} changed to:`, value);
        // Fetch new data based on selected filter
    };

    const cityData: LineChartDataPoint[] = [
        { label: 'Subang Jaya', value: 2, color: '#EF4444' },
        { label: 'Shah Alam', value: 1.8, color: '#8B5CF6' },
        { label: 'Petaling Jaya', value: 3, color: '#3B82F6' },
        { label: 'Klang', value: 1.2, color: '#10B981' },
        { label: 'Kajang', value: 2, color: '#F59E0B' },
        { label: 'Selayang', value: 2.7, color: '#06B6D4' },
    ];

    const config: LineChartConfig = {
        title: 'Registration Vs City Breakdown',
        yAxisMax: 8,
        filters: {
            filter1: {
                label: 'State',
                options: ['Selangor', 'Kuala Lumpur', 'Johor'],
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
                        <span>Registration</span>
                    </li>
                </ul>

                <div className="pt-5">
                    {/* Row 1: KPI Cards */}
                    <StatsGrid stats={registrationStats} isRtl={isRtl} onViewReport={handleViewReport} onEditReport={handleEditReport} />

                    {/* Row 2: Bar Chart with Filters */}
                    <div className="mb-6">
                        <BarChart data={registrationData} config={registrationConfig} isRtl={isRtl} onFilterChange={handleChartFilterChange} />
                    </div>

                    {/* Row 3: Table (Zone) and Pie Chart */}
                    <div className="mb-6 grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <DataTableWithFilters
                                columns={registrationBreakdownZoneColumns}
                                data={registrationBreakdownZoneData}
                                totals={registrationBreakdownZoneTotals}
                                config={registrationBreakdownZoneConfig}
                                isRtl={isRtl}
                                onFilterChange={handleZoneTableFilter}
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <BasicPieChart
                                chartTitle="Registration by Zone (Total)"
                                series={[115, 95, 11, 9]}
                                labels={['Total', 'Approved', 'Rejected', 'Pending']}
                                colors={['#8B5CF6', '#10B981', '#EF4444', '#F59E0B']}
                                height={340}
                                onDropdownSelect={(option) => {
                                    console.log('Zone Pie Chart option selected:', option);
                                }}
                            />
                        </div>
                    </div>

                    {/* Row 4: Pie Chart and Table (State) */}
                    <div className="mb-6 grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-1">
                            <BasicPieChart
                                chartTitle="Registration by State (Total)"
                                series={[205, 16, 19]}
                                labels={['Approved', 'Rejected', 'Pending']}
                                colors={['#10B981', '#EF4444', '#F59E0B']}
                                height={340}
                                onDropdownSelect={(option) => {
                                    console.log('State Pie Chart option selected:', option);
                                }}
                            />
                        </div>
                        <div className="lg:col-span-2">
                            <DataTableWithFilters
                                columns={registrationBreakdownStateColumns}
                                data={registrationBreakdownStateData}
                                totals={registrationBreakdownStateTotals}
                                config={registrationBreakdownStateConfig}
                                isRtl={isRtl}
                                onFilterChange={handleStateTableFilter}
                            />
                        </div>
                    </div>
                    {/* Row 5: Pie Chart and chart */}
                    <div className="mb-6 grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-1">
                            <MultiLegendPieChart
                                chartTitle="Registration by State (Total)"
                                series={[205, 150, 180, 120, 95, 85, 70, 60, 110, 90, 140, 75]}
                                labels={['Selangor', 'Penang', 'Johor', 'Kedah', 'Perak', 'Pahang', 'Terengganu', 'Kelantan', 'Sabah', 'Sarawak', 'WP Kuala Lumpur', 'WP Putrajaya']}
                                colors={[
                                    '#4361ee', // Blue
                                    '#805dca', // Purple
                                    '#00ab55', // Green
                                    '#e7515a', // Red
                                    '#e2a03f', // Orange
                                    '#2196f3', // Light Blue
                                    '#3b3f5c', // Dark Gray
                                    '#009688', // Teal
                                    '#ff9800', // Amber
                                    '#e91e63', // Pink
                                    '#00bcd4', // Cyan
                                    '#607d8b', // Blue Gray
                                ]}
                                height={340}
                                legendsPerRow={4}
                                onDropdownSelect={(option) => {
                                    console.log('Multi Legend Pie Chart option selected:', option);
                                }}
                            />
                        </div>
                        <div className="lg:col-span-2">
                            <LineChart data={cityData} config={config} />
                        </div>
                    </div>

                    {/* Row 6: Pie Chart and chart */}
                    <div className="mb-6">
                        <MultiTableLayout config={demographicsMultiTableConfig} />
                    </div>
                </div>
            </div>
        </>
    );
}
