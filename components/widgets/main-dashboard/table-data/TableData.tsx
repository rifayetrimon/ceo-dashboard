'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import Dropdown from '@/components/dropdown';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

// Types
export interface TableColumn {
    key: string;
    label: string;
    align?: 'left' | 'center' | 'right';
    width?: string;
    clickable?: boolean;
    isAmount?: boolean;
    truncate?: boolean; // ✅ Added option to truncate text
}

export interface TableRow {
    [key: string]: string | number | null | undefined;
    color?: string;
    id?: string | number;
}

export interface DataTableConfig {
    title: string;
    headerColor?: string;
    headerColorDark?: string;
    showColorIndicator?: boolean;
    showTotalRow?: boolean;
    totalRowColor?: string;
    totalRowColorDark?: string;
    showYearFilter?: boolean;
    yearOptions?: string[];
    selectedYear?: string;
    onYearChange?: (year: string) => void;
    showMonthSlider?: boolean;
}

interface DataTableProps {
    columns: TableColumn[];
    data: TableRow[];
    totals?: TableRow;
    config: DataTableConfig;
    isRtl?: boolean;
    onViewReport?: () => void;
    onEditReport?: () => void;
    onDeleteReport?: () => void;
    onCellClick?: (row: TableRow, columnKey: string) => void;
}

// Month names
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Helper function to format numbers with K and M
const formatAmount = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return '-';

    let numValue: number;
    if (typeof value === 'string') {
        numValue = parseFloat(value.replace(/RM|,|\s/g, ''));
    } else {
        numValue = value;
    }

    if (isNaN(numValue)) return '-';

    const absValue = Math.abs(numValue);
    const isNegative = numValue < 0;
    const sign = isNegative ? '-' : '';

    if (absValue >= 1000000) {
        return `${sign}${(absValue / 1000000).toFixed(2)}M`;
    } else if (absValue >= 1000) {
        return `${sign}${(absValue / 1000).toFixed(2)}K`;
    } else {
        return `${sign}${absValue.toFixed(2)}`;
    }
};

export const DataTable: React.FC<DataTableProps> = ({ columns, data, totals, config, isRtl = false, onCellClick }) => {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const [currentMonthStart, setCurrentMonthStart] = useState(0);

    // Default colors
    const headerColor = config.headerColor || '#BAE7FF';
    const headerColorDark = config.headerColorDark || '#374151';
    const totalRowColor = config.totalRowColor || '#E3F5FF';
    const totalRowColorDark = config.totalRowColorDark || '#1F2937';

    const getColorClass = (color?: string) => {
        if (!color) return '';
        const colorMap: { [key: string]: string } = {
            blue: 'bg-blue-500',
            purple: 'bg-purple-500',
            orange: 'bg-orange-500',
            green: 'bg-green-500',
            red: 'bg-red-500',
            yellow: 'bg-yellow-500',
            pink: 'bg-pink-500',
            indigo: 'bg-indigo-500',
            cyan: 'bg-cyan-500',
            teal: 'bg-teal-500',
        };
        return colorMap[color.toLowerCase()] || '';
    };

    const handleCellClick = (row: TableRow, columnKey: string) => {
        if (onCellClick) {
            onCellClick(row, columnKey);
        }
    };

    const handleYearChange = (year: string) => {
        if (config.onYearChange) {
            config.onYearChange(year);
        }
    };

    const formatCellValue = (value: string | number | null | undefined, isAmount: boolean = false): string => {
        if (isAmount) {
            return formatAmount(value);
        }
        return value?.toString() ?? '-';
    };

    // Handle month navigation
    const handlePrevMonths = () => {
        setCurrentMonthStart((prev) => Math.max(0, prev - 6));
    };

    const handleNextMonths = () => {
        setCurrentMonthStart((prev) => Math.min(6, prev + 6));
    };

    const getVisibleMonthColumns = () => {
        if (!config.showMonthSlider) return columns;

        const monthColumns = columns.filter((col) => col.key.includes('month_'));
        const nonMonthColumns = columns.filter((col) => !col.key.includes('month_'));

        const visibleMonths = monthColumns.slice(currentMonthStart, currentMonthStart + 6);

        const leftFixedColumn = nonMonthColumns.length > 0 ? nonMonthColumns[0] : null;
        const rightFixedColumn = nonMonthColumns.length > 1 ? nonMonthColumns[nonMonthColumns.length - 1] : null;

        const finalColumns: TableColumn[] = [];

        if (leftFixedColumn) finalColumns.push(leftFixedColumn);
        finalColumns.push(...visibleMonths);
        if (rightFixedColumn) finalColumns.push(rightFixedColumn);

        return finalColumns;
    };

    const visibleColumns = getVisibleMonthColumns();
    const canGoPrev = currentMonthStart > 0;
    const canGoNext = currentMonthStart < 6;

    return (
        <div className="panel h-full flex flex-col">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between dark:text-white-light pb-4 pt-4">
                <h5 className="text-lg font-semibold">
                    {config.title}
                    <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">(RM)</span>
                </h5>

                {/* Year Filter Dropdown */}
                {config.showYearFilter && config.yearOptions && config.yearOptions.length > 0 && (
                    <div className="dropdown">
                        <Dropdown
                            offset={[0, 5]}
                            placement={isRtl ? 'bottom-start' : 'bottom-end'}
                            btnClassName="btn btn-sm btn-outline-primary dropdown-toggle"
                            button={
                                <span className="flex items-center">
                                    {config.selectedYear || 'Select Year'}
                                    <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            }
                        >
                            <ul className="max-h-60 overflow-y-auto">
                                {config.yearOptions.map((year) => (
                                    <li key={year}>
                                        <button type="button" onClick={() => handleYearChange(year)} className={`w-full ${config.selectedYear === year ? 'bg-primary/10 text-primary' : ''}`}>
                                            {year}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </Dropdown>
                    </div>
                )}
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto flex-1">
                <table className="w-full">
                    <thead>
                        <tr>
                            {visibleColumns.map((column, index) => (
                                <th
                                    key={index}
                                    className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${
                                        column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                                    }`}
                                    style={{
                                        backgroundColor: isDark ? headerColorDark : headerColor,
                                        color: isDark ? '#ffffff' : '#374151',
                                        width: column.width,
                                    }}
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className={`${isDark ? 'bg-gray-900 divide-gray-700' : 'bg-white divide-blue-200'} divide-y`}>
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex} className={`${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                                {visibleColumns.map((column, colIndex) => {
                                    const value = row[column.key];
                                    const isFirstColumn = colIndex === 0;
                                    const isClickable = column.clickable && onCellClick;
                                    const formattedValue = formatCellValue(value, column.isAmount);

                                    // ✅ TRUNCATION LOGIC HERE
                                    let cellContent: React.ReactNode = formattedValue;

                                    if (column.truncate && typeof value === 'string') {
                                        const words = value.split(' ');
                                        if (words.length > 3) {
                                            const truncatedText = words.slice(0, 3).join(' ') + '...';
                                            cellContent = (
                                                <Tippy content={value} theme="light">
                                                    <span className="cursor-help border-b border-dotted border-gray-400">{truncatedText}</span>
                                                </Tippy>
                                            );
                                        }
                                    }

                                    return (
                                        <td
                                            key={colIndex}
                                            className={`px-6 py-4 whitespace-nowrap text-sm ${isFirstColumn ? 'font-medium' : ''} ${
                                                column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                                            } ${isDark ? 'text-gray-300' : 'text-gray-900'} ${isFirstColumn && config.showColorIndicator ? 'flex items-center' : ''}`}
                                        >
                                            {isFirstColumn && config.showColorIndicator && row.color && <span className={`inline-block w-2 h-2 rounded-full mr-3 ${getColorClass(row.color)}`} />}
                                            {isClickable ? (
                                                <button
                                                    onClick={() => handleCellClick(row, column.key)}
                                                    className={`${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} hover:underline focus:outline-none`}
                                                >
                                                    {cellContent}
                                                </button>
                                            ) : (
                                                cellContent
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}

                        {config.showTotalRow && totals && (
                            <tr
                                className="font-medium"
                                style={{
                                    backgroundColor: isDark ? totalRowColorDark : totalRowColor,
                                }}
                            >
                                {visibleColumns.map((column, colIndex) => {
                                    const value = totals[column.key];
                                    const isFirstColumn = colIndex === 0;
                                    const formattedValue = formatCellValue(value, column.isAmount);

                                    return (
                                        <td
                                            key={colIndex}
                                            className={`px-6 py-4 whitespace-nowrap text-sm ${isFirstColumn ? 'font-bold' : ''} ${
                                                column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                                            } ${isDark ? (isFirstColumn ? 'text-white' : 'text-gray-300') : 'text-gray-900'}`}
                                        >
                                            {formattedValue}
                                        </td>
                                    );
                                })}
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {config.showMonthSlider && (
                <div className="mt-4 flex items-center justify-center gap-4">
                    <button
                        onClick={handlePrevMonths}
                        disabled={!canGoPrev}
                        className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                            canGoPrev
                                ? isDark
                                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                    : 'bg-primary hover:bg-primary-dark text-white'
                                : isDark
                                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {MONTH_NAMES[currentMonthStart]} - {MONTH_NAMES[currentMonthStart + 5]}
                    </span>

                    <button
                        onClick={handleNextMonths}
                        disabled={!canGoNext}
                        className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                            canGoNext
                                ? isDark
                                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                    : 'bg-primary hover:bg-primary-dark text-white'
                                : isDark
                                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};
