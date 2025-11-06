'use client';
import Link from 'next/link';
import { StatCardData, StatsGrid } from '../widgets/main-dashboard/stat-card/StatCard';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { DataTableWithFilters, DataTableWithFiltersConfig, TableColumn, TableRow } from '../widgets/main-dashboard/table-data/DataTableWithFilters';
import { LineChart, LineChartConfig, LineChartDataPoint } from '../widgets/registration/line-chart/LineChart';

export default function Subject() {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    // Stat cards data
    const schoolZone: StatCardData[] = [
        {
            title: 'No. of Subjects',
            value: '2.5', // Changed to string
            change: '2.35%',
            changeType: 'positive',
            lastWeekValue: '44,700(?)',
            gradient: 'bg-gradient-to-r from-cyan-500 to-cyan-400',
        },
        {
            title: 'Overall CGPA(Subject)',
            value: '1,010',
            change: '2.35%',
            changeType: 'negative',
            lastWeekValue: '3',
            gradient: 'bg-gradient-to-r from-violet-500 to-violet-400',
        },
        {
            title: 'Most Performed Subject',
            value: 'SM - HILL PARK',
            change: '1.35%',
            changeType: 'positive',
            lastWeekValue: '0.5',
            gradient: 'bg-gradient-to-r from-blue-500 to-blue-400',
        },
        {
            title: 'Least Performed Subject',
            value: 'SM - HILL PARK',
            change: '0.5',
            changeType: 'negative',
            lastWeekValue: '',
            gradient: 'bg-gradient-to-r from-fuchsia-500 to-fuchsia-400',
        },
    ];

    // TABLE 1: CGPA Breakdown by Zone
    const subBreakdownZoneColumns: TableColumn[] = [
        { key: 'sub', label: 'Subject', align: 'left', width: '200px' },
        { key: 'avg_cgpa', label: 'Average CGPA', align: 'center', width: '150px' },
        { key: 'score', label: 'Score(%)', align: 'center', width: '200px' },
        { key: 'num_of_stu', label: 'No. of Students', align: 'center' },
        { key: 'best_performing_stu', label: 'Best Performing Student', align: 'center' },
        { key: 'worst_performing_stu', label: 'Worst Performing Student', align: 'center' },
    ];

    const subBreakdownZoneData: TableRow[] = [
        {
            sub: 'BAHASA INGGERIS',
            avg_cgpa: 2.9,
            score: 70,
            num_of_stu: 350,
            best_performing_stu: 'SM-HILL PARK',
            worst_performing_stu: 'SRI-HILL PARK',
            color: 'red',
        },
        {
            sub: 'BAHASA MELAYU',
            avg_cgpa: 2.9,
            score: 70,
            num_of_stu: 350,
            best_performing_stu: 'SM-HILL PARK',
            worst_performing_stu: 'SRI-HILL PARK',
            color: 'yellow',
        },
        {
            sub: 'BAHASA ARAB',
            avg_cgpa: 2.9,
            score: 70,
            num_of_stu: 350,
            best_performing_stu: 'SM-HILL PARK',
            worst_performing_stu: 'SRI-HILL PARK',
            color: 'green',
        },
        {
            sub: 'FISIK',
            avg_cgpa: 2.9,
            score: 70,
            num_of_stu: 350,
            best_performing_stu: 'SM-HILL PARK',
            worst_performing_stu: 'SRI-HILL PARK',
            color: 'purple',
        },
        {
            sub: 'KIMIA',
            avg_cgpa: 2.9,
            score: 70,
            num_of_stu: 350,
            best_performing_stu: 'SM-HILL PARK',
            worst_performing_stu: 'SRI-HILL PARK',
            color: 'purple',
        },
    ];

    const subBreakdownZoneConfig: DataTableWithFiltersConfig = {
        title: 'CGPA Breakdown by Subject',
        showColorIndicator: true,
        showTotalRow: true,
        filters: {
            filter1: {
                label: 'Year',
                options: ['2024', '2023', '2022', '2021'],
            },
            filter2: {
                label: 'Zone',
                options: ['2024', '2023', '2022', '2021'],
            },
            filter3: {
                label: 'School',
                options: ['2024', '2023', '2022', '2021'],
            },
            filter4: {
                label: 'Examination',
                options: ['2024', '2023', '2022', '2021'],
            },
            filter5: {
                label: 'CGPA / %',
                options: ['2024', '2023', '2022', '2021'],
            },
            filter6: {
                label: 'Class',
                options: ['2024', '2023', '2022', '2021'],
            },
        },
    };

    // line chart data point and config
    const subData: LineChartDataPoint[] = [
        { label: 'BAHASA MELAYU', value: 2, color: '#EF4444' }, // red
        { label: 'MATEMATIK', value: 1.8, color: '#F59E0B' }, // amber
        { label: 'BAHASA INGGERIS', value: 3, color: '#3B82F6' }, // blue
        { label: 'BIOLOGI', value: 2.5, color: '#10B981' }, // green
        { label: 'ARAB', value: 4, color: '#6366F1' }, // indigo
        { label: 'MATEMATIK TAMBAHAN', value: 1.2, color: '#EC4899' }, // pink
        { label: 'SEJARAH', value: 3, color: '#F97316' }, // orange
        { label: 'EKONOMI', value: 4, color: '#14B8A6' }, // teal
        { label: 'SAINS', value: 3.5, color: '#84CC16' }, // lime
        { label: 'AGAMA', value: 2, color: '#8B5CF6' }, // violet
    ];

    const subConfig: LineChartConfig = {
        title: 'CGPA Brakdown by Subject',
        yAxisMax: 4,
    };

    // line chart data point and config
    const examData: LineChartDataPoint[] = [
        { label: 'PASA-F4', value: 2, color: '#EF4444' }, // red
        { label: 'GG1-F5', value: 1.8, color: '#F59E0B' }, // amber
        { label: 'GG2-F5', value: 3, color: '#3B82F6' }, // blue
        { label: 'TRIAL', value: 2.5, color: '#10B981' }, // green
        { label: 'SPM', value: 3, color: '#6366F1' }, // indigo
    ];

    const examConfig: LineChartConfig = {
        title: 'Total Performance Breakdown by Examination',
        yAxisMax: 4,
        filters: {
            filter1: {
                label: 'Year',
                options: ['2024', '2023', '2022', '2021'],
            },
            filter2: {
                label: 'Zone',
                options: ['2024', '2023', '2022', '2021'],
            },
            filter3: {
                label: 'School',
                options: ['2024', '2023', '2022', '2021'],
            },
            filter4: {
                label: 'Examination',
                options: ['2024', '2023', '2022', '2021'],
            },
            filter5: {
                label: 'CGPA / %',
                options: ['2024', '2023', '2022', '2021'],
            },
            filter6: {
                label: 'Class',
                options: ['2024', '2023', '2022', '2021'],
            },
        },
    };

    function handleViewReport(index: number): void {
        console.log(`View report for stat card at index: ${index}`);
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
                    <span>Subject</span>
                </li>
            </ul>

            {/* Row 1: Stats Grid */}
            <div className="mt-6">
                <StatsGrid stats={schoolZone} isRtl={isRtl} onViewReport={handleViewReport} onEditReport={handleViewReport} />
            </div>

            {/* Row 2 */}
            <div className="mb-6">
                <DataTableWithFilters columns={subBreakdownZoneColumns} data={subBreakdownZoneData} config={subBreakdownZoneConfig} isRtl={isRtl} onFilterChange={handleZoneTableFilter} />
            </div>

            {/* Row 3 */}
            <div className="mb-6">
                <LineChart data={subData} config={subConfig} />
            </div>

            {/* Row 4 */}
            <div className="mb-6">
                <LineChart data={examData} config={examConfig} />
            </div>
        </div>
    );
}
