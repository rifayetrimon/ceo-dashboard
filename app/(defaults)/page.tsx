import HomeMenu from '@/components/dashboard/Home/home-menu';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Sales Admin',
};

const Sales = () => {
    return <HomeMenu />;
};

export default Sales;
