'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

export interface TableColumn {
    key: string;
    label: string;
    align?: 'left' | 'center' | 'right';
    width?: string;
}

export interface TableRow {
    [key: string]: string | number | boolean | null | undefined;
    isEmptyRow?: boolean;
}

export interface TableConfig {
    columns: TableColumn[];
    data: TableRow[];
    totals?: TableRow;
}

export interface MultiTableLayoutConfig {
    mainTitle: string;
    tables: TableConfig[];
    layout?: 'grid-2' | 'grid-4';
}

interface MultiTableLayoutProps {
    config: MultiTableLayoutConfig;
}

export const MultiTableLayout: React.FC<MultiTableLayoutProps> = ({ config }) => {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);

    const headerColor = '#BAE7FF';
    const headerColorDark = '#374151';
    const totalRowColor = '#E3F5FF';
    const totalRowColorDark = '#1F2937';

    return (
        <div className={`panel ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            {/* Main Title */}
            <div className="pt-5 pb-4">
                <h5 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.mainTitle}</h5>
            </div>

            {/* First Row - Gender and Age Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {config.tables.slice(0, 2).map((table, tableIndex) => {
                    const isLeftColumn = tableIndex === 0;

                    return (
                        <div
                            key={tableIndex}
                            className={`
                                ${isLeftColumn ? '' : 'lg:border-l lg:border-dotted'}
                                ${isDark ? 'border-gray-700' : 'border-gray-400'}
                            `}
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    {/* Header */}
                                    <thead>
                                        <tr>
                                            {table.columns.map((column, colIndex) => (
                                                <th
                                                    key={colIndex}
                                                    className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${
                                                        column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                                                    }`}
                                                    style={{
                                                        backgroundColor: isDark ? headerColorDark : headerColor,
                                                        color: isDark ? '#FFFFFF' : '#374151',
                                                        width: column.width,
                                                    }}
                                                >
                                                    {column.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    {/* Body */}
                                    <tbody className={`${isDark ? 'bg-gray-900' : 'bg-white'}`}>
                                        {table.data.map((row, rowIndex) => {
                                            if (row.isEmptyRow) {
                                                return (
                                                    <tr key={rowIndex}>
                                                        <td colSpan={table.columns.length} className="px-6 py-2" style={{ height: '20px' }}>
                                                            &nbsp;
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            return (
                                                <tr key={rowIndex} className={`border-b ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-blue-200 hover:bg-gray-50'}`}>
                                                    {table.columns.map((column, colIndex) => {
                                                        const value = row[column.key];
                                                        const isFirstColumn = colIndex === 0;

                                                        return (
                                                            <td
                                                                key={colIndex}
                                                                className={`px-6 py-4 whitespace-nowrap text-sm ${isFirstColumn ? 'font-medium' : ''} ${
                                                                    column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                                                                } ${isDark ? 'text-gray-300' : 'text-gray-900'}`}
                                                            >
                                                                {value ?? '-'}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Combined Totals Row for First Row Tables */}
            {config.tables[0]?.totals && config.tables[1]?.totals && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                    {[config.tables[0], config.tables[1]].map((table, tableIndex) => {
                        const isLeftColumn = tableIndex === 0;

                        return (
                            <div
                                key={tableIndex}
                                className={`
                                    ${isLeftColumn ? '' : 'lg:border-l lg:border-dotted'}
                                    ${isDark ? 'border-gray-700' : 'border-gray-400'}
                                `}
                            >
                                <table className="w-full border-collapse">
                                    <tbody>
                                        <tr
                                            style={{
                                                backgroundColor: isDark ? totalRowColorDark : totalRowColor,
                                            }}
                                        >
                                            {table.columns.map((column, colIndex) => {
                                                const value = table.totals![column.key];
                                                return (
                                                    <td
                                                        key={colIndex}
                                                        className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
                                                            column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                                                        } ${isDark ? 'text-white' : 'text-gray-900'}`}
                                                        style={{ width: column.width }}
                                                    >
                                                        {value ?? ''}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Dotted Divider */}
            <div className="my-6">
                <div className={`border-t border-dotted ${isDark ? 'border-gray-700' : 'border-gray-400'}`}></div>
            </div>

            {/* Second Row - Race/Ethnicity and Zone Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {config.tables.slice(2, 4).map((table, tableIndex) => {
                    const isLeftColumn = tableIndex === 0;

                    return (
                        <div
                            key={tableIndex}
                            className={`
                                ${isLeftColumn ? '' : 'lg:border-l lg:border-dotted'}
                                ${isDark ? 'border-gray-700' : 'border-gray-400'}
                            `}
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    {/* Header */}
                                    <thead>
                                        <tr>
                                            {table.columns.map((column, colIndex) => (
                                                <th
                                                    key={colIndex}
                                                    className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${
                                                        column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                                                    }`}
                                                    style={{
                                                        backgroundColor: isDark ? headerColorDark : headerColor,
                                                        color: isDark ? '#FFFFFF' : '#374151',
                                                        width: column.width,
                                                    }}
                                                >
                                                    {column.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    {/* Body */}
                                    <tbody className={`${isDark ? 'bg-gray-900' : 'bg-white'}`}>
                                        {table.data.map((row, rowIndex) => (
                                            <tr key={rowIndex} className={`border-b ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-blue-200 hover:bg-gray-50'}`}>
                                                {table.columns.map((column, colIndex) => {
                                                    const value = row[column.key];
                                                    const isFirstColumn = colIndex === 0;

                                                    return (
                                                        <td
                                                            key={colIndex}
                                                            className={`px-6 py-4 whitespace-nowrap text-sm ${isFirstColumn ? 'font-medium' : ''} ${
                                                                column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                                                            } ${isDark ? 'text-gray-300' : 'text-gray-900'}`}
                                                        >
                                                            {value ?? '-'}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}

                                        {/* Totals Row */}
                                        {table.totals && (
                                            <tr
                                                style={{
                                                    backgroundColor: isDark ? totalRowColorDark : totalRowColor,
                                                }}
                                            >
                                                {table.columns.map((column, colIndex) => {
                                                    const value = table.totals![column.key];
                                                    return (
                                                        <td
                                                            key={colIndex}
                                                            className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
                                                                column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                                                            } ${isDark ? 'text-white' : 'text-gray-900'}`}
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
                })}
            </div>
        </div>
    );
};
