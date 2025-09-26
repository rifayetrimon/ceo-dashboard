'use client';

import { ReactNode } from 'react';
import Dropdown from '@/components/dropdown';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';
import IconEye from '@/components/icon/icon-eye';

interface StatCardProps {
    title: string;
    value: string | number;
    badge: string;
    subtitle: string;
    gradient: string; // Tailwind gradient classes
    subtitleIcon?: ReactNode;
}

export default function StatCard({ title, value, badge, subtitle, gradient, subtitleIcon = <IconEye /> }: StatCardProps) {
    const isRtl = false; // replace with actual RTL state if you have one

    return (
        <div className={`panel bg-gradient-to-r ${gradient}`}>
            {/* Header */}
            <div className="flex justify-between">
                <div className="text-md font-semibold ltr:mr-1 rtl:ml-1">{title}</div>
                <div className="dropdown">
                    <Dropdown
                        offset={[0, 5]}
                        placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                        btnClassName="hover:opacity-80"
                        button={<IconHorizontalDots className="opacity-70 hover:opacity-80" />}
                    >
                        <ul className="text-black dark:text-white-dark">
                            <li>
                                <button type="button">View Report</button>
                            </li>
                            <li>
                                <button type="button">Edit Report</button>
                            </li>
                        </ul>
                    </Dropdown>
                </div>
            </div>

            {/* Value + Badge */}
            <div className="mt-5 flex items-center">
                <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">{value}</div>
                <div className="badge bg-white/30">{badge}</div>
            </div>

            {/* Subtitle */}
            <div className="mt-5 flex items-center font-semibold">
                {subtitleIcon && <span className="shrink-0 ltr:mr-2 rtl:ml-2">{subtitleIcon}</span>}
                {subtitle}
            </div>
        </div>
    );
}
