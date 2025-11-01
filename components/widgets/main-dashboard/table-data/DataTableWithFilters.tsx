'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import SmallDropdown from '@/components/small-dropdown';
import IconCaretDown from '@/components/icon/icon-caret-down';

// Types
export interface TableColumn {
    key: string;
    label: string;
    align?: 'left' | 'center' | 'right';
    width?: string;
}

export interface TableRow {
    [key: string]: string | number | null | undefined;
    color?: string; // Optional color indicator
}

export interface FilterConfig {
    label: string;
    options: string[];
}

export interface DataTableWithFiltersConfig {
    title: string;
    headerColor?: string;
    headerColorDark?: string;
    showColorIndicator?: boolean;
    showTotalRow?: boolean;
    totalRowColor?: string;
    totalRowColorDark?: string;
    filters?: {
        filter1?: FilterConfig;
        filter2?: FilterConfig;
        filter3?: FilterConfig;
        filter4?: FilterConfig;
    };
}

interface DataTableWithFiltersProps {
    columns: TableColumn[];
    data: TableRow[];
    totals?: TableRow;
    config: DataTableWithFiltersConfig;
    isRtl?: boolean;
    onFilterChange?: (filterNumber: 1 | 2 | 3 | 4, value: string) => void;
}

export const DataTableWithFilters: React.FC<DataTableWithFiltersProps> = ({ columns, data, totals, config, isRtl = false, onFilterChange }) => {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);

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

    const handleFilterSelect = (filterNumber: 1 | 2 | 3 | 4, value: string) => {
        if (onFilterChange) {
            onFilterChange(filterNumber, value);
        }
    };

    // Check if any filters are configured
    const hasFilters = config.filters && (config.filters.filter1 || config.filters.filter2 || config.filters.filter3 || config.filters.filter4);

    return (
        <div className="panel h-full">
            {/* Header with Filters */}
            <div className="mb-5 flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">{config.title}</h5>

                {/* Filter Dropdowns */}
                {hasFilters && (
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Filter 1 */}
                        {config.filters?.filter1 && (
                            <SmallDropdown
                                offset={[0, 5]}
                                placement={isRtl ? 'bottom-start' : 'bottom-end'}
                                btnClassName={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition hover:border-primary ${
                                    isDark ? 'border-gray-600 bg-gray-800 text-white hover:bg-gray-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                                button={
                                    <>
                                        <span>{config.filters.filter1.label}</span>
                                        <IconCaretDown className="h-3.5 w-3.5" />
                                    </>
                                }
                            >
                                {config.filters.filter1.options.map((option, index) => (
                                    <li key={index}>
                                        <button
                                            type="button"
                                            onClick={() => handleFilterSelect(1, option)}
                                            className={`block w-full px-4 py-2 text-left text-sm transition hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                                isDark ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    </li>
                                ))}
                            </SmallDropdown>
                        )}

                        {/* Filter 2 */}
                        {config.filters?.filter2 && (
                            <SmallDropdown
                                offset={[0, 5]}
                                placement={isRtl ? 'bottom-start' : 'bottom-end'}
                                btnClassName={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition hover:border-primary ${
                                    isDark ? 'border-gray-600 bg-gray-800 text-white hover:bg-gray-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                                button={
                                    <>
                                        <span>{config.filters.filter2.label}</span>
                                        <IconCaretDown className="h-3.5 w-3.5" />
                                    </>
                                }
                            >
                                {config.filters.filter2.options.map((option, index) => (
                                    <li key={index}>
                                        <button
                                            type="button"
                                            onClick={() => handleFilterSelect(2, option)}
                                            className={`block w-full px-4 py-2 text-left text-sm transition hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                                isDark ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    </li>
                                ))}
                            </SmallDropdown>
                        )}

                        {/* Filter 3 */}
                        {config.filters?.filter3 && (
                            <SmallDropdown
                                offset={[0, 5]}
                                placement={isRtl ? 'bottom-start' : 'bottom-end'}
                                btnClassName={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition hover:border-primary ${
                                    isDark ? 'border-gray-600 bg-gray-800 text-white hover:bg-gray-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                                button={
                                    <>
                                        <span>{config.filters.filter3.label}</span>
                                        <IconCaretDown className="h-3.5 w-3.5" />
                                    </>
                                }
                            >
                                {config.filters.filter3.options.map((option, index) => (
                                    <li key={index}>
                                        <button
                                            type="button"
                                            onClick={() => handleFilterSelect(3, option)}
                                            className={`block w-full px-4 py-2 text-left text-sm transition hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                                isDark ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    </li>
                                ))}
                            </SmallDropdown>
                        )}

                        {/* Filter 4 */}
                        {config.filters?.filter4 && (
                            <SmallDropdown
                                offset={[0, 5]}
                                placement={isRtl ? 'bottom-start' : 'bottom-end'}
                                btnClassName={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition hover:border-primary ${
                                    isDark ? 'border-gray-600 bg-gray-800 text-white hover:bg-gray-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                                button={
                                    <>
                                        <span>{config.filters.filter4.label}</span>
                                        <IconCaretDown className="h-3.5 w-3.5" />
                                    </>
                                }
                            >
                                {config.filters.filter4.options.map((option, index) => (
                                    <li key={index}>
                                        <button
                                            type="button"
                                            onClick={() => handleFilterSelect(4, option)}
                                            className={`block w-full px-4 py-2 text-left text-sm transition hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                                isDark ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    </li>
                                ))}
                            </SmallDropdown>
                        )}
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    {/* Table Header */}
                    <thead>
                        <tr>
                            {columns.map((column, index) => (
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

                    {/* Table Body */}
                    <tbody className={`${isDark ? 'bg-gray-900 divide-gray-700' : 'bg-white divide-blue-200'} divide-y`}>
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex} className={`${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                                {columns.map((column, colIndex) => {
                                    const value = row[column.key];
                                    const isFirstColumn = colIndex === 0;

                                    return (
                                        <td
                                            key={colIndex}
                                            className={`px-6 py-4 whitespace-nowrap text-sm ${isFirstColumn ? 'font-medium' : ''} ${
                                                column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                                            } ${isDark ? 'text-gray-300' : 'text-gray-900'} ${isFirstColumn && config.showColorIndicator ? 'flex items-center' : ''}`}
                                        >
                                            {isFirstColumn && config.showColorIndicator && row.color && <span className={`inline-block w-2 h-2 rounded-full mr-3 ${getColorClass(row.color)}`} />}
                                            {value ?? '-'}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}

                        {/* Total Row */}
                        {config.showTotalRow && totals && (
                            <tr
                                className="font-medium"
                                style={{
                                    backgroundColor: isDark ? totalRowColorDark : totalRowColor,
                                }}
                            >
                                {columns.map((column, colIndex) => {
                                    const value = totals[column.key];
                                    const isFirstColumn = colIndex === 0;

                                    return (
                                        <td
                                            key={colIndex}
                                            className={`px-6 py-4 whitespace-nowrap text-sm ${isFirstColumn ? 'font-bold' : ''} ${
                                                column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                                            } ${isDark ? (isFirstColumn ? 'text-white' : 'text-gray-300') : 'text-gray-900'}`}
                                        >
                                            {value ?? ''}
                                        </td>
                                    );
                                })}
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
