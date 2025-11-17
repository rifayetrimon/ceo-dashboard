'use client';

import type React from 'react';
import Dropdown from '@/components/dropdown';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';
import IconEye from '@/components/icon/icon-eye';

// Types
export interface StatCardData {
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative';
    lastWeekValue?: string | number;
    gradient: string;
    valueSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    icon?: React.ReactNode;
    iconSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'; // Add icon size option
    hideDropdown?: boolean;
}

interface StatCardProps {
    data: StatCardData;
    isRtl?: boolean;
    onViewReport?: () => void;
    onEditReport?: () => void;
}

// Individual Card Component
export const StatCard: React.FC<StatCardProps> = ({ data, isRtl = false, onViewReport, onEditReport }) => {
    // Map valueSize to Tailwind classes
    const getValueSizeClass = () => {
        switch (data.valueSize) {
            case 'sm':
                return 'text-sm sm:text-base md:text-sm lg:text-base xl:text-lg';
            case 'md':
                return 'text-base sm:text-lg md:text-base lg:text-lg xl:text-xl';
            case 'lg':
                return 'text-lg sm:text-xl md:text-lg lg:text-xl xl:text-2xl';
            case 'xl':
                return 'text-xl sm:text-2xl md:text-xl lg:text-2xl xl:text-3xl';
            case '2xl':
                return 'text-2xl sm:text-3xl md:text-2xl lg:text-3xl xl:text-4xl';
            default:
                return 'text-lg sm:text-lg md:text-lg lg:text-xl xl:text-xl';
        }
    };

    // Map iconSize to container classes
    const getIconSizeClass = () => {
        switch (data.iconSize) {
            case 'sm':
                return 'h-4 w-4';
            case 'md':
                return 'h-5 w-5';
            case 'lg':
                return 'h-7 w-7';
            case 'xl':
                return 'h-10 w-10';
            case '2xl':
                return 'h-12 w-12';
            default:
                return 'h-5 w-5'; // Default size for dropdown icons
        }
    };

    return (
        <div className={`panel ${data.gradient} min-h-[160px] md:min-h-[140px] lg:min-h-[160px]`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="text-xs font-semibold leading-tight sm:text-sm md:text-xs lg:text-base ltr:mr-1 rtl:ml-1 line-clamp-2">{data.title}</div>

                {/* Show custom icon or dropdown */}
                {!data.hideDropdown && (
                    <div className="shrink-0">
                        {data.icon ? (
                            // Show custom icon if provided - size is now flexible
                            <div className={`flex items-center justify-center ${getIconSizeClass()}`}>{data.icon}</div>
                        ) : (
                            // Show dropdown with horizontal dots if no icon
                            <div className="dropdown">
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
                        )}
                    </div>
                )}
            </div>

            {/* Value and Change Badge */}
            <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4 md:mt-3 lg:mt-5">
                <div className={`font-bold ltr:mr-2 rtl:ml-2 ${getValueSizeClass()}`}>{data.value}</div>
                {data.change && data.changeType && (
                    <div className="badge bg-white/30 text-xs xs:text-[10px] xs:text-xs px-2 py-1">
                        {data.changeType === 'positive' ? '+' : '-'} {data.change}
                    </div>
                )}
            </div>

            {/* Last Week Info */}
            {data.lastWeekValue && (
                <div className="mt-3 flex items-center text-xs font-semibold sm:mt-4 md:mt-3 md:text-[11px] lg:mt-5 lg:text-sm">
                    <IconEye className="h-4 w-4 shrink-0 md:h-3.5 md:w-3.5 lg:h-5 lg:w-5 ltr:mr-1.5 rtl:ml-1.5 sm:ltr:mr-2 sm:rtl:ml-2" />
                    <span className="truncate">Last Week {data.lastWeekValue}</span>
                </div>
            )}
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
