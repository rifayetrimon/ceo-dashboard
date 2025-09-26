'use client';
import React from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import Dropdown from '@/components/dropdown';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';

const TableData = () => {
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    // Dropdown options and handler
    const dropdownOptions = ['View', 'Update', 'Delete'];

    const handleDropdownSelect = (option: string) => {
        console.log('Selected option:', option);
        // Add your dropdown logic here
    };

    // Demo data - replace this with API data later
    const demoData = [
        {
            zone: 'HILL PARK',
            january: 'RM 600',
            february: 'RM 13,173',
            march: 'RM 200',
            april: 'RM 1,560',
            may: 'RM 3,050',
            june: 'RM 4,810',
            july: 'RM 10,335',
            total: 'RM 35,528',
            color: 'blue',
        },
        {
            zone: 'SETIA ALAM',
            january: 'RM 1,100',
            february: 'RM 6,105',
            march: 'RM 1,775',
            april: 'RM 2,620',
            may: 'RM 2,470',
            june: 'RM 2,700',
            july: 'RM 13,528',
            total: 'RM 30,297',
            color: 'purple',
        },
        {
            zone: 'PUNCAK ALAM',
            january: 'RM 400',
            february: 'RM 6,783',
            march: 'RM 395',
            april: '-',
            may: 'RM 650',
            june: 'RM 8,680',
            july: 'RM 11,507',
            total: 'RM 28,415',
            color: 'orange',
        },
        {
            zone: 'TRANSIT',
            january: 'RM 139',
            february: '-',
            march: '-',
            april: '-',
            may: 'RM 183',
            june: 'RM 1,527',
            july: 'RM 3,645',
            total: 'RM 5,494',
            color: 'green',
        },
    ];

    const totals = {
        january: 'RM 2,239',
        february: 'RM 26,061',
        march: 'RM 4,170',
        april: 'RM 4,180',
        may: 'RM 6,353',
        june: 'RM 17,717',
        july: 'RM 39,014',
        total: 'RM 99,734',
    };

    return (
        <div className="panel h-full">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between dark:text-white-light px-6 pt-4">
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

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    {/* Table Header */}
                    <thead className="bg-blue-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Zone</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">(Month/Outstanding Amount)</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">January</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">February</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">March</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">April</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">May</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">June</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">July</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Total</th>
                        </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="bg-white divide-y divide-gray-200">
                        {demoData.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                                    {row.color && (
                                        <span
                                            className={`inline-block w-2 h-2 rounded-full mr-3 ${
                                                row.color === 'orange'
                                                    ? 'bg-orange-500'
                                                    : row.color === 'green'
                                                      ? 'bg-green-500'
                                                      : row.color === 'blue'
                                                        ? 'bg-blue-500'
                                                        : row.color === 'purple'
                                                          ? 'bg-purple-500'
                                                          : ''
                                            }`}
                                        />
                                    )}
                                    {row.zone}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center"></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{row.january}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{row.february}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{row.march}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{row.april}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{row.may}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{row.june}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{row.july}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">{row.total}</td>
                            </tr>
                        ))}

                        {/* Total Row */}
                        <tr className="bg-blue-50 font-medium">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">Total</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center"></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{totals.january}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{totals.february}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{totals.march}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{totals.april}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{totals.may}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{totals.june}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{totals.july}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">{totals.total}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TableData;
