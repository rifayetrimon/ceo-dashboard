'use client';
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Dropdown from '../dropdown';
import IconHorizontalDots from '../icon/icon-horizontal-dots';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

const OutstandingAmountChart = () => {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    // Dropdown options and handler
    const dropdownOptions = ['View Report', 'Export Data', 'Edit Chart'];

    const handleDropdownSelect = (option: string) => {
        console.log(`Selected option: ${option}`);
        // Add your dropdown logic here
    };

    // Demo data based on your image - replace with API data later
    const chartData = [
        {
            month: 'JANUARY',
            'HILL PARK': 600,
            'SETIA ALAM': 1100,
            'PUNCAK ALAM': 400,
            TRANSIT: 139,
        },
        {
            month: 'FEBRUARY',
            'HILL PARK': 13173,
            'SETIA ALAM': 6105,
            'PUNCAK ALAM': 6783,
            TRANSIT: 0,
        },
        {
            month: 'MARCH',
            'HILL PARK': 200,
            'SETIA ALAM': 1775,
            'PUNCAK ALAM': 395,
            TRANSIT: 0,
        },
        {
            month: 'APRIL',
            'HILL PARK': 1560,
            'SETIA ALAM': 2620,
            'PUNCAK ALAM': 0,
            TRANSIT: 0,
        },
        {
            month: 'MAY',
            'HILL PARK': 3050,
            'SETIA ALAM': 2470,
            'PUNCAK ALAM': 650,
            TRANSIT: 183,
        },
        {
            month: 'JUNE',
            'HILL PARK': 4810,
            'SETIA ALAM': 2700,
            'PUNCAK ALAM': 8680,
            TRANSIT: 1527,
        },
        {
            month: 'JULY',
            'HILL PARK': 10335,
            'SETIA ALAM': 13528,
            'PUNCAK ALAM': 11507,
            TRANSIT: 3645,
        },
        {
            month: 'AUGUST',
            'HILL PARK': 0,
            'SETIA ALAM': 0,
            'PUNCAK ALAM': 0,
            TRANSIT: 0,
        },
        {
            month: 'SEPTEMBER',
            'HILL PARK': 0,
            'SETIA ALAM': 0,
            'PUNCAK ALAM': 0,
            TRANSIT: 0,
        },
        {
            month: 'OCTOBER',
            'HILL PARK': 0,
            'SETIA ALAM': 0,
            'PUNCAK ALAM': 0,
            TRANSIT: 0,
        },
        {
            month: 'NOVEMBER',
            'HILL PARK': 0,
            'SETIA ALAM': 0,
            'PUNCAK ALAM': 0,
            TRANSIT: 0,
        },
        {
            month: 'DECEMBER',
            'HILL PARK': 0,
            'SETIA ALAM': 0,
            'PUNCAK ALAM': 0,
            TRANSIT: 0,
        },
    ];

    // Custom Y-axis tick formatter
    const formatYAxisTick = (value: number) => {
        if (value >= 1000) {
            return `${value / 1000}K`;
        }
        return value.toString();
    };

    // Custom tooltip formatter similar to ZoneBar
    const formatTooltipValue = (value: number, name: string) => {
        if (value >= 1000000) {
            return [`RM ${(value / 1000000).toFixed(1)}M`, name];
        }
        if (value >= 1000) {
            return [`RM ${(value / 1000).toFixed(0)}K`, name];
        }
        return [`RM ${value}`, name];
    };

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-[#1b2e4b] p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
                    <p className="text-sm font-medium text-gray-800 dark:text-white mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                            <span className="text-gray-600 dark:text-gray-300">{entry.dataKey}:</span>
                            <span className="font-semibold text-gray-800 dark:text-white">{formatTooltipValue(entry.value, '')[0]}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Custom legend component
    const CustomLegend = () => (
        <div className="flex justify-end items-center space-x-6 mb-4 text-sm">
            <div className="flex items-center space-x-1">
                <div className="w-3 h-0.5 bg-green-500"></div>
                <span className="text-gray-700 dark:text-gray-300">TRANSIT</span>
            </div>
            <div className="flex items-center space-x-1">
                <div className="w-3 h-0.5 bg-red-500"></div>
                <span className="text-gray-700 dark:text-gray-300">SETIA ALAM</span>
            </div>
            <div className="flex items-center space-x-1">
                <div className="w-3 h-0.5 bg-blue-500"></div>
                <span className="text-gray-700 dark:text-gray-300">HILL PARK</span>
            </div>
            <div className="flex items-center space-x-1">
                <div className="w-3 h-0.5 bg-orange-500"></div>
                <span className="text-gray-700 dark:text-gray-300">PUNCAK ALAM</span>
            </div>
        </div>
    );

    return (
        <div className="panel h-full">
            <div className="mb-5 flex items-center justify-between dark:text-white-light">
                <h5 className="text-lg font-semibold">Outstanding Amount by Zone</h5>
                <div className="dropdown">
                    <Dropdown
                        offset={[0, 5]}
                        placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                        btnClassName="hover:text-primary"
                        button={<IconHorizontalDots className="text-black/70 hover:!text-primary dark:text-white/70" />}
                    >
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
            </div>

            <CustomLegend />

            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#666' }} />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#666' }}
                            tickFormatter={formatYAxisTick}
                            domain={[-500, 15000]}
                            ticks={[0, 5000, 10000, 15000]}
                        />

                        {/* Add the custom tooltip */}
                        <Tooltip content={<CustomTooltip />} />

                        <Line
                            type="monotone"
                            dataKey="TRANSIT"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#10b981' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="SETIA ALAM"
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2, fill: '#ef4444' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="HILL PARK"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#3b82f6' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="PUNCAK ALAM"
                            stroke="#f97316"
                            strokeWidth={2}
                            dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#f97316', strokeWidth: 2, fill: '#f97316' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default OutstandingAmountChart;
