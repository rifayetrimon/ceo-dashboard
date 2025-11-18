'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import Dropdown from '@/components/dropdown';
import SmallDropdown from '@/components/small-dropdown';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';
import IconCaretDown from '@/components/icon/icon-caret-down';

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
    showYearFilter?: boolean;
    yearOptions?: string[];
    selectedYear?: string;
    onYearSelect?: (year: string) => void;
}

export default function SummaryBar({
    title = 'Summary',
    items,
    showDropdown = true,
    dropdownOptions = ['View Report', 'Edit Report', 'Mark as Done'],
    onDropdownSelect,
    showYearFilter = true,
    yearOptions = ['2021', '2022', '2023', '2024', '2025'],
    selectedYear: propSelectedYear,
    onYearSelect,
}: SummaryBarProps) {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    // Use prop if provided, otherwise default to latest year
    const [selectedYear, setSelectedYear] = useState(propSelectedYear || yearOptions[yearOptions.length - 1]);

    // Update when prop changes
    useEffect(() => {
        if (propSelectedYear) {
            setSelectedYear(propSelectedYear);
        }
    }, [propSelectedYear]);

    const handleDropdownSelect = (option: string) => {
        if (onDropdownSelect) {
            onDropdownSelect(option);
        }
    };

    const handleYearSelect = (year: string) => {
        setSelectedYear(year);
        if (onYearSelect) {
            onYearSelect(year);
        }
    };

    return (
        <div className="panel h-full">
            <div className="mb-5 flex items-center justify-between dark:text-white-light">
                <h5 className="text-lg font-semibold">{title}</h5>

                <div className="flex items-center gap-2">
                    {/* Year Filter Dropdown */}
                    {showYearFilter && yearOptions.length > 0 && (
                        <SmallDropdown
                            offset={[0, 5]}
                            placement={isRtl ? 'bottom-start' : 'bottom-end'}
                            btnClassName={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition hover:border-primary ${
                                isDark ? 'border-gray-600 bg-gray-800 text-white hover:bg-gray-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                            button={
                                <>
                                    <span>{selectedYear}</span>
                                    <IconCaretDown className="h-3.5 w-3.5" />
                                </>
                            }
                        >
                            {yearOptions.map((year, index) => (
                                <li key={index}>
                                    <button
                                        type="button"
                                        onClick={() => handleYearSelect(year)}
                                        className={`block w-full px-4 py-2 text-left text-sm transition hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                            isDark ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                                        } ${selectedYear === year ? 'bg-gray-100 font-medium dark:bg-gray-700' : ''}`}
                                    >
                                        {year}
                                    </button>
                                </li>
                            ))}
                        </SmallDropdown>
                    )}

                    {/* Action Dropdown */}
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
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${item.percentage}%`,
                                        background: `linear-gradient(to right, ${item.gradientFrom}, ${item.gradientTo})`,
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
