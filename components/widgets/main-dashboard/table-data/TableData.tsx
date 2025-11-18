'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import Dropdown from '@/components/dropdown';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';

// Types
export interface TableColumn {
    key: string;
    label: string;
    align?: 'left' | 'center' | 'right';
    width?: string;
    clickable?: boolean; // New: Mark column as clickable
}

export interface TableRow {
    [key: string]: string | number | null | undefined;
    color?: string; // Optional color indicator
    id?: string | number; // New: Optional ID for row identification
}

export interface DataTableConfig {
    title: string;
    headerColor?: string; // Custom header background color (light mode)
    headerColorDark?: string; // Custom header background color (dark mode)
    showColorIndicator?: boolean; // Show color dot in first column
    showTotalRow?: boolean; // Show total row at bottom
    totalRowColor?: string; // Custom total row background (light mode)
    totalRowColorDark?: string; // Custom total row background (dark mode)
}

interface DataTableProps {
    columns: TableColumn[];
    data: TableRow[];
    totals?: TableRow; // Optional totals row
    config: DataTableConfig;
    isRtl?: boolean;
    onViewReport?: () => void;
    onEditReport?: () => void;
    onDeleteReport?: () => void;
    onCellClick?: (row: TableRow, columnKey: string) => void; // New: Handler for cell clicks
}

export const DataTable: React.FC<DataTableProps> = ({ columns, data, totals, config, isRtl = false, onViewReport, onEditReport, onDeleteReport, onCellClick }) => {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);

    // Default colors
    const headerColor = config.headerColor || '#BAE7FF';
    const headerColorDark = config.headerColorDark || '#374151'; // gray-700
    const totalRowColor = config.totalRowColor || '#E3F5FF';
    const totalRowColorDark = config.totalRowColorDark || '#1F2937'; // gray-800

    const dropdownOptions = [
        { label: 'View', action: onViewReport },
        { label: 'Edit', action: onEditReport },
        { label: 'Delete', action: onDeleteReport },
    ].filter((option) => option.action); // Only show options with handlers

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

    return (
        <div className="panel h-full">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between dark:text-white-light pb-4 pt-4">
                <h5 className="text-lg font-semibold">{config.title}</h5>
                {dropdownOptions.length > 0 && (
                    <div className="dropdown">
                        <Dropdown
                            offset={[0, 5]}
                            placement={isRtl ? 'bottom-start' : 'bottom-end'}
                            btnClassName="hover:text-primary"
                            button={<IconHorizontalDots className="text-black/70 hover:!text-primary dark:text-white/70" />}
                        >
                            <ul>
                                {dropdownOptions.map((option, index) => (
                                    <li key={index}>
                                        <button type="button" onClick={option.action} className="w-full text-left">
                                            {option.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </Dropdown>
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
                                    const isClickable = column.clickable && onCellClick;

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
                                                    {value ?? '-'}
                                                </button>
                                            ) : (
                                                (value ?? '-')
                                            )}
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
