'use client';

import Link from 'next/dist/client/link';
import { StatCard, StatCardData, StatsGrid } from '../widgets/main-dashboard/stat-card/StatCard';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

export default function AcademicDashboard() {
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

                {/* Row 1 */}
                <div className="mt-6">
                    <StatsGrid stats={registrationStats} isRtl={isRtl} onViewReport={handleViewReport} onEditReport={handleViewReport} />{' '}
                </div>
            </div>
        </>
    );
}
