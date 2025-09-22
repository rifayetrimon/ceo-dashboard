'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import Dropdown from '@/components/dropdown';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';

interface SummaryItem {
    icon: React.ReactNode;
    label: string;
    value: string;
    percentage: number;
    gradientFrom: string;
    gradientTo: string;
    iconBgColor: string;
    iconTextColor: string;
}

interface SummaryBarProps {
    title?: string;
    items: SummaryItem[];
    showDropdown?: boolean;
    dropdownOptions?: string[];
    onDropdownSelect?: (option: string) => void;
}

export default function SummaryBar({ title = 'Summary', items, showDropdown = true, dropdownOptions = ['View Report', 'Edit Report', 'Mark as Done'], onDropdownSelect }: SummaryBarProps) {
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const handleDropdownSelect = (option: string) => {
        if (onDropdownSelect) {
            onDropdownSelect(option);
        }
    };

    return (
        <div className="panel h-full">
            <div className="mb-5 flex items-center justify-between dark:text-white-light">
                <h5 className="text-lg font-semibold">{title}</h5>
                {showDropdown && (
                    <div className="dropdown">
                        <Dropdown placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`} button={<IconHorizontalDots className="h-5 w-5 text-black/70 hover:!text-primary dark:text-white/70" />}>
                            <ul>
                                {dropdownOptions.map((option, index) => (
                                    <li key={index}>
                                        <button type="button" onClick={() => handleDropdownSelect(option)}>
                                            {option}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </Dropdown>
                    </div>
                )}
            </div>
            <div className="space-y-9">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center">
                        <div className="h-9 w-9 ltr:mr-3 rtl:ml-3">
                            <div className={`grid h-9 w-9 place-content-center rounded-full ${item.iconBgColor} ${item.iconTextColor}`}>{item.icon}</div>
                        </div>
                        <div className="flex-1">
                            <div className="mb-2 flex font-semibold text-white-dark">
                                <h6>{item.label}</h6>
                                <p className="ltr:ml-auto rtl:mr-auto">{item.value}</p>
                            </div>
                            <div className="h-2 w-full rounded-full bg-dark-light shadow dark:bg-[#1b2e4b]">
                                <div className={`h-full rounded-full bg-gradient-to-r from-[${item.gradientFrom}] to-[${item.gradientTo}]`} style={{ width: `${item.percentage}%` }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
