'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IRootState } from '@/store';
import { useSelector } from 'react-redux';
import ZoneDetailsDashboard from '@/components/dashboard/zone-details-dashboard';

export default function ZoneDashboard() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const zoneName = searchParams.get('name') || '';
    const zoneSlug = params.slug as string;

    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);

    const [loading, setLoading] = useState(true);
    const [zoneData, setZoneData] = useState<any>(null);

    useEffect(() => {
        // Fetch zone-specific data
        fetchZoneData(zoneName);
    }, [zoneName]);

    const fetchZoneData = async (zone: string) => {
        try {
            setLoading(true);
            // Call your API to get zone-specific data
            // const response = await dashboardService.getZoneData(zone);
            // setZoneData(response.data);

            // For now, simulate loading
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Failed to fetch zone data:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li>
                    <Link href="/" className="text-primary hover:underline">
                        Sales
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span className="font-semibold">{zoneName}</span>
                </li>
            </ul>
            <ZoneDetailsDashboard />
        </div>
    );
}
