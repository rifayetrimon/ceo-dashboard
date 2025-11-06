'use client';

import Link from 'next/dist/client/link';
import { StatCardData, StatsGrid } from '../widgets/main-dashboard/stat-card/StatCard';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { BarChartSimple, BarChartSimpleConfig, BarChartDataPoint } from '../widgets/Bar-chart-simple';

export default function AcademicDashboard() {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    // Stat cards data
    const registrationStats: StatCardData[] = [
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
            title: 'Best Performing School',
            value: 'SM - HILL PARK',
            change: '1.35%',
            changeType: 'positive',
            lastWeekValue: '0.5',
            gradient: 'bg-gradient-to-r from-blue-500 to-blue-400',
        },
        {
            title: 'Weakest Performing School',
            value: '12%',
            change: '0.35%',
            changeType: 'negative',
            lastWeekValue: '9.6%',
            gradient: 'bg-gradient-to-r from-fuchsia-500 to-fuchsia-400',
        },
    ];

    function handleViewReport(index: number): void {
        console.log('View report for:', index);
    }

    // Bar chart data
    const subjectPerformanceData: BarChartDataPoint[] = [
        { label: 'BAHASA MELAYU', value: 2.2, color: '#3B82F6' },
        { label: 'BAHASA INGGERIS', value: 1.6, color: '#8B5CF6' },
        { label: 'BIOLOGI', value: 2.7, color: '#EF4444' },
        { label: 'MATEMATIK', value: 1.9, color: '#10B981' },
        { label: 'MATEMATIK TAMBAHAN', value: 3.2, color: '#F59E0B' },
        { label: 'SEJARAH', value: 2.9, color: '#3B82F6' },
        { label: 'EKONOMI', value: 2.8, color: '#6B7280' },
        { label: 'SAINS', value: 2.3, color: '#60A5FA' },
        { label: 'AGAMA', value: 2, color: '#EC4899' },
        { label: 'ARAB', value: 2.6, color: '#06B6D4' },
    ];

    const subjectPerformanceConfig: BarChartSimpleConfig = {
        title: 'Total Performance Breakdown by Subject',
        yAxisMax: 4,
        showGrid: true,
        enableHover: true,
        barWidth: 70,
        filters: {
            filter1: {
                label: 'School',
                options: ['All Schools', 'PUNCAK ALAM', 'Hill Park', 'Setia Alam', 'Transit'],
            },
            filter2: {
                label: 'Year',
                options: ['2024', '2023', '2022', '2021'],
            },
            filter3: {
                label: 'Zone',
                options: ['Zone 1', 'Zone 2', 'Zone 3'],
            },
            filter4: {
                label: 'Examination',
                options: ['All Classes', 'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5'],
            },
            filter5: {
                label: 'CGPA / %',
                options: ['All Classes', 'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5'],
            },
        },
    };

    const handleFilterChange = (filterNumber: 1 | 2 | 3 | 4 | 5, value: string) => {
        console.log(`Filter ${filterNumber} changed to:`, value);
    };

    const zonePerformanceData: BarChartDataPoint[] = [
        { label: 'HILL PARK', value: 2.2, color: '#3B82F6' },
        { label: 'PUNCAK ALAM', value: 1.6, color: '#8B5CF6' },
        { label: 'SETIA ALAM', value: 2.7, color: '#EF4444' },
        { label: 'TRANSIT', value: 1.9, color: '#10B981' },
    ];

    const zonePerformanceConfig: BarChartSimpleConfig = {
        title: 'Total Performance Breakdown by Zone',
        yAxisMax: 4,
        showGrid: true,
        enableHover: true,
        barWidth: 70,
        filters: {
            filter1: {
                label: 'Year',
                options: ['2024', '2023', '2022', '2021'],
            },
            filter2: {
                label: 'Month',
                options: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            },
            filter3: {
                label: 'CGPA / %',
                options: ['Zone 1', 'Zone 2', 'Zone 3'],
            },
        },
    };

    const schoolPerformanceData: BarChartDataPoint[] = [
        { label: 'SRI-HILL PARK', value: 2.2, color: '#3B82F6' },
        { label: 'SRI-PUNCAK ALAM', value: 1.6, color: '#8B5CF6' },
        { label: 'SRI-SETIA ALAM', value: 2.7, color: '#EF4444' },
    ];

    const schoolPerformanceConfig: BarChartSimpleConfig = {
        title: 'Total Performance Breakdown by School',
        yAxisMax: 4,
        showGrid: true,
        enableHover: true,
        barWidth: 70,
        filters: {
            filter1: {
                label: 'School',
                options: ['All Schools', 'PUNCAK ALAM', 'Hill Park', 'Setia Alam', 'Transit'],
            },
            filter2: {
                label: 'Year',
                options: ['2024', '2023', '2022', '2021'],
            },
            filter3: {
                label: 'Zone',
                options: ['Zone 1', 'Zone 2', 'Zone 3'],
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
                        <span>Academic</span>
                    </li>
                </ul>

                {/* Row 1: Stats Grid */}
                <div className="mt-6">
                    <StatsGrid stats={registrationStats} isRtl={isRtl} onViewReport={handleViewReport} onEditReport={handleViewReport} />
                </div>

                {/* ROw 2 */}
                <h2>Total Performance Breakdown</h2>
                <div className="mb-6 grid gap-6 lg:grid-cols-4">
                    <div className="lg:col-span-2">
                        <BarChartSimple data={zonePerformanceData} config={zonePerformanceConfig} onFilterChange={handleFilterChange} />
                    </div>
                    <div className="lg:col-span-2">
                        <BarChartSimple data={schoolPerformanceData} config={schoolPerformanceConfig} onFilterChange={handleFilterChange} />
                    </div>
                </div>
                {/* Row 3: Bar Chart */}
                <div className="mb-6">
                    <BarChartSimple data={subjectPerformanceData} config={subjectPerformanceConfig} onFilterChange={handleFilterChange} />
                </div>
            </div>
        </>
    );
}
