'use client';

import type React from 'react';
import Dropdown from '@/components/dropdown';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';
import IconEye from '@/components/icon/icon-eye';

// Types
export interface StatCardData {
    title: string;
    value: string | number;
    change: string;
    changeType: 'positive' | 'negative';
    lastWeekValue: string | number;
    gradient: string;
}

interface StatCardProps {
    data: StatCardData;
    isRtl?: boolean;
    onViewReport?: () => void;
    onEditReport?: () => void;
}

// Individual Card Component
export const StatCard: React.FC<StatCardProps> = ({ data, isRtl = false, onViewReport, onEditReport }) => {
    return (
        <div className={`panel ${data.gradient} min-h-[160px] md:min-h-[140px] lg:min-h-[160px]`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="text-xs font-semibold leading-tight sm:text-sm md:text-xs lg:text-base ltr:mr-1 rtl:ml-1 line-clamp-2">{data.title}</div>
                <div className="dropdown shrink-0">
                    <Dropdown
                        offset={[0, 5]}
                        placement={isRtl ? 'bottom-start' : 'bottom-end'}
                        btnClassName="hover:opacity-80"
                        button={<IconHorizontalDots className="h-5 w-5 opacity-70 hover:opacity-80" />}
                    >
                        <ul className="text-black dark:text-white-dark">
                            <li>
                                <button type="button" onClick={onViewReport} className="w-full text-left">
                                    View Report
                                </button>
                            </li>
                            <li>
                                <button type="button" onClick={onEditReport} className="w-full text-left">
                                    Edit Report
                                </button>
                            </li>
                        </ul>
                    </Dropdown>
                </div>
            </div>

            {/* Value and Change Badge */}
            <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4 md:mt-3 lg:mt-5">
                <div className="text-lg font-bold sm:text-lg md:text-lg lg:text-xl xl:text-xl ltr:mr-2 rtl:ml-2">{data.value}</div>
                <div className="badge bg-white/30 text-xs xs:text-[10px] xs:text-xs px-2 py-1">
                    {data.changeType === 'positive' ? '+' : '-'} {data.change}
                </div>
            </div>

            {/* Last Week Info */}
            <div className="mt-3 flex items-center text-xs font-semibold sm:mt-4 md:mt-3 md:text-[11px] lg:mt-5 lg:text-sm">
                <IconEye className="h-4 w-4 shrink-0 md:h-3.5 md:w-3.5 lg:h-5 lg:w-5 ltr:mr-1.5 rtl:ml-1.5 sm:ltr:mr-2 sm:rtl:ml-2" />
                <span className="truncate">Last Week {data.lastWeekValue}</span>
            </div>
        </div>
    );
};

// Grid Container Component
interface StatsGridProps {
    stats: StatCardData[];
    isRtl?: boolean;
    onViewReport?: (index: number) => void;
    onEditReport?: (index: number) => void;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, isRtl = false, onViewReport, onEditReport }) => {
    // Determine grid columns based on number of cards
    const getGridClass = () => {
        const count = stats.length;

        if (count === 1) {
            return 'grid-cols-1';
        } else if (count === 2) {
            return 'grid-cols-1 xs:grid-cols-2';
        } else if (count === 3) {
            return 'grid-cols-1 xs:grid-cols-2 md:grid-cols-3';
        } else if (count === 4) {
            return 'grid-cols-1 xs:grid-cols-2 md:grid-cols-4';
        } else {
            // 5 or more cards - default behavior
            return 'grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
        }
    };

    return (
        <div className={`mb-6 grid gap-3 text-white sm:gap-4 ${getGridClass()}`}>
            {stats.map((stat, index) => (
                <StatCard key={index} data={stat} isRtl={isRtl} onViewReport={() => onViewReport?.(index)} onEditReport={() => onEditReport?.(index)} />
            ))}
        </div>
    );
};
