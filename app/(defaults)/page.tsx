import MainDashboard from '@/components/dashboard/main-dashboard';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Sales Admin',
};

const Sales = () => {
    return <MainDashboard />;
};

export default Sales;
