'use client';

import IconCreditCard from '@/components/icon/icon-credit-card';
import IconDollarSign from '@/components/icon/icon-dollar-sign';
import IconInbox from '@/components/icon/icon-inbox';
import IconTag from '@/components/icon/icon-tag';
import { IRootState } from '@/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import BasicPieChart from '../widgets/main-dashboard/basic-pie-chart/Basic-pie-chart';
import PieChart from '../widgets/main-dashboard/pie-chart/Pie-chart';
import AreaChart from '../widgets/main-dashboard/area-chart/Area-chart';
import SummaryBar from '../widgets/SummaryBar';
import GrossNetProfit from '../widgets/main-dashboard/sales/Gross-Net-profit';
import ZoneBar from '../widgets/Zone-bar';
import OutstandingAmountChart from '../widgets/main-dashboard/sales/Amount-zone-chart';
import { StatCardData, StatsGrid } from '../widgets/main-dashboard/stat-card/StatCard';
import { DataTable, DataTableConfig, TableColumn, TableRow } from '../widgets/main-dashboard/table-data/TableData';
import Image from 'next/image';
import {
    getFinanceSummary,
    processFinanceData,
    getChartSeriesForYear,
    calculateYearTotals,
    formatCurrency,
    dashboardService,
    ProcessedFinanceData,
    ChartSeriesData,
    calculateZoneWiseFinancials,
} from '@/services/sales/salesService';

export default function MainDashboard() {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();

    // System Info State
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<StatCardData[]>([]);
    const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);

    // Finance Data State
    const [financeData, setFinanceData] = useState<ProcessedFinanceData | null>(null);
    const [selectedYear, setSelectedYear] = useState<string>('2025');
    const [chartSeries, setChartSeries] = useState<ChartSeriesData[]>([]);
    // SummaryBar selected year
    const [selectedSummaryYear, setSelectedSummaryYear] = useState<string>('2025');
    // Add this state near the top with other states
    const [selectedZoneYear, setSelectedZoneYear] = useState<number>(new Date().getFullYear());

    const [financeTotals, setFinanceTotals] = useState({
        revenue: 0,
        cost: 0,
        profit: 0,
        profitMargin: '0.00',
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Update chart when year changes
    useEffect(() => {
        if (financeData && selectedYear) {
            updateChartForYear(selectedYear);
        }
    }, [selectedYear, financeData]);

    const handleSummaryYearChange = (year: string) => {
        setSelectedSummaryYear(year);

        if (dashboardMetrics?.yearWiseTotals && dashboardMetrics.yearWiseTotals[year]) {
            const yearData = dashboardMetrics.yearWiseTotals[year];
            setFinanceTotals({
                revenue: yearData.totalIncome,
                cost: yearData.totalExpense,
                profit: yearData.totalProfit,
                profitMargin: yearData.totalIncome > 0 ? ((yearData.totalProfit / yearData.totalIncome) * 100).toFixed(2) : '0.00',
            });
        }
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch both APIs
            const [systemInfoResponse, financeSummaryResponse] = await Promise.all([dashboardService.getSystemInfo(), getFinanceSummary()]);

            console.log('System Info:', systemInfoResponse);
            console.log('Finance Summary:', financeSummaryResponse);

            // Check if responses have the expected structure
            if (systemInfoResponse?.data?.systemInfo && financeSummaryResponse?.data?.branches) {
                const systemInfo = systemInfoResponse.data.systemInfo;
                const branches = systemInfoResponse.data.branches || [];
                const financeBranches = financeSummaryResponse.data.branches || [];

                // ===== CALCULATE UNIQUE ZONES =====
                const uniqueZones = new Set(branches.map((branch: any) => branch.zone).filter((zone: string) => zone && zone.trim() !== ''));
                const totalUniqueZones = uniqueZones.size;

                // ===== CALCULATE YEAR-WISE TOTALS FOR ALL BRANCHES =====
                const yearWiseTotals: {
                    [year: string]: {
                        totalIncome: number;
                        totalExpense: number;
                        totalProfit: number;
                        monthlyIncome: number[];
                        monthlyExpense: number[];
                        monthlyProfit: number[];
                    };
                } = {};

                // Extract all unique years
                const yearsSet = new Set<number>();
                financeBranches.forEach((branch: any) => {
                    branch.monthly_revenue?.forEach((yearData: any) => {
                        yearsSet.add(yearData.year);
                    });
                });
                const years = Array.from(yearsSet).sort((a, b) => b - a);

                // Initialize year-wise data
                years.forEach((year) => {
                    yearWiseTotals[year] = {
                        totalIncome: 0,
                        totalExpense: 0,
                        totalProfit: 0,
                        monthlyIncome: new Array(12).fill(0),
                        monthlyExpense: new Array(12).fill(0),
                        monthlyProfit: new Array(12).fill(0),
                    };
                });

                // Calculate totals for all branches combined
                financeBranches.forEach((branch: any) => {
                    years.forEach((year) => {
                        // Process revenue
                        const revenueYear = branch.monthly_revenue?.find((y: any) => y.year === year);
                        if (revenueYear) {
                            revenueYear.records.forEach((record: any) => {
                                yearWiseTotals[year].monthlyIncome[record.month - 1] += record.total;
                                yearWiseTotals[year].totalIncome += record.total;
                            });
                        }

                        // Process cost
                        const costYear = branch.monthly_cost?.find((y: any) => y.year === year);
                        if (costYear) {
                            costYear.records.forEach((record: any) => {
                                yearWiseTotals[year].monthlyExpense[record.month - 1] += record.total;
                                yearWiseTotals[year].totalExpense += record.total;
                            });
                        }

                        // Process profit
                        const profitYear = branch.monthly_profit?.find((y: any) => y.year === year);
                        if (profitYear) {
                            profitYear.records.forEach((record: any) => {
                                yearWiseTotals[year].monthlyProfit[record.month - 1] += record.total;
                                yearWiseTotals[year].totalProfit += record.total;
                            });
                        }
                    });
                });

                // ===== CALCULATE ZONE-WISE TOTALS =====
                const zoneWiseData: {
                    [zoneName: string]: {
                        [year: string]: {
                            totalIncome: number;
                            totalExpense: number;
                            totalProfit: number;
                            branches: string[];
                        };
                    };
                } = {};

                // Map branchId to zone from system info
                const branchZoneMap: { [branchId: number]: string } = {};
                branches.forEach((branch: any) => {
                    if (branch.zone && branch.zone.trim() !== '') {
                        branchZoneMap[branch.branchId] = branch.zoneName || branch.zone;
                    }
                });

                // Calculate zone-wise totals
                financeBranches.forEach((branch: any) => {
                    const zoneName = branchZoneMap[branch.branchId] || 'Unknown Zone';

                    if (!zoneWiseData[zoneName]) {
                        zoneWiseData[zoneName] = {};
                    }

                    years.forEach((year) => {
                        if (!zoneWiseData[zoneName][year]) {
                            zoneWiseData[zoneName][year] = {
                                totalIncome: 0,
                                totalExpense: 0,
                                totalProfit: 0,
                                branches: [],
                            };
                        }

                        // Add branch name if not already added
                        if (!zoneWiseData[zoneName][year].branches.includes(branch.name)) {
                            zoneWiseData[zoneName][year].branches.push(branch.name);
                        }

                        // Calculate revenue
                        const revenueYear = branch.monthly_revenue?.find((y: any) => y.year === year);
                        if (revenueYear) {
                            const yearRevenue = revenueYear.records.reduce((sum: number, r: any) => sum + r.total, 0);
                            zoneWiseData[zoneName][year].totalIncome += yearRevenue;
                        }

                        // Calculate cost
                        const costYear = branch.monthly_cost?.find((y: any) => y.year === year);
                        if (costYear) {
                            const yearCost = costYear.records.reduce((sum: number, r: any) => sum + r.total, 0);
                            zoneWiseData[zoneName][year].totalExpense += yearCost;
                        }

                        // Calculate profit
                        const profitYear = branch.monthly_profit?.find((y: any) => y.year === year);
                        if (profitYear) {
                            const yearProfit = profitYear.records.reduce((sum: number, r: any) => sum + r.total, 0);
                            zoneWiseData[zoneName][year].totalProfit += yearProfit;
                        }
                    });
                });

                // ===== CALCULATE ZONE-WISE FINANCIALS FOR CHART =====
                const currentYear = years.length > 0 ? years[0] : new Date().getFullYear();
                setSelectedZoneYear(currentYear);

                const zoneFinancials = calculateZoneWiseFinancials(financeBranches, branches, currentYear);

                // Prepare data for ZoneBar chart
                const zoneCategories = zoneFinancials.map((z) => z.zoneName);
                const zoneIncome = zoneFinancials.map((z) => z.totalIncome);
                const zoneExpense = zoneFinancials.map((z) => z.totalExpense);
                const zoneProfit = zoneFinancials.map((z) => z.totalProfit);

                // ===== PROCESS FINANCE DATA FOR CHARTS =====
                const processed = processFinanceData(financeBranches);
                setFinanceData(processed);

                // Set initial year
                if (processed.years.length > 0) {
                    const latestYear = processed.years[0];
                    setSelectedYear(latestYear);
                    updateChartForYear(latestYear, processed);
                }

                // ===== STORE ALL CALCULATED METRICS =====
                const calculatedMetrics = {
                    totalUniqueZones,
                    years,
                    yearWiseTotals,
                    zoneWiseData,
                    zoneFinancials,
                    zoneChartData: {
                        categories: zoneCategories,
                        income: zoneIncome,
                        expense: zoneExpense,
                        profit: zoneProfit,
                    },
                    branches: financeBranches,
                    systemBranches: branches,
                };

                setDashboardMetrics(calculatedMetrics);
                console.log('Calculated Metrics:', calculatedMetrics);
                console.log('Zone Financials:', zoneFinancials);

                setDashboardMetrics(calculatedMetrics);

                // ---------- SET INITIAL SUMMARY YEAR DATA ----------
                if (years.length > 0) {
                    const latestYear = years[0].toString();
                    setSelectedSummaryYear(latestYear);

                    const latestYearData = yearWiseTotals[latestYear];
                    if (latestYearData) {
                        setFinanceTotals({
                            revenue: latestYearData.totalIncome,
                            cost: latestYearData.totalExpense,
                            profit: latestYearData.totalProfit,
                            profitMargin: latestYearData.totalIncome > 0 ? ((latestYearData.totalProfit / latestYearData.totalIncome) * 100).toFixed(2) : '0.00',
                        });
                    }
                }

                // ===== UPDATE STAT CARDS =====
                const updatedStats: StatCardData[] = [
                    {
                        title: 'Total Zones',
                        value: totalUniqueZones.toString(),
                        valueSize: 'xl',
                        gradient: 'bg-gradient-to-r from-cyan-500 to-cyan-400',
                        iconSize: 'xl',
                        icon: <Image src="/assets/images/icons/zone1.svg" alt="zones" width={35} height={35} className="brightness-0 invert opacity-90" />,
                    },
                    {
                        title: 'Total Schools',
                        value: systemInfo.totalClient?.toLocaleString() || '0',
                        valueSize: 'xl',
                        gradient: 'bg-gradient-to-r from-violet-500 to-violet-400',
                        iconSize: 'xl',
                        icon: <Image src="/assets/images/icons/school.svg" alt="school" width={35} height={35} className="brightness-0 invert opacity-90" />,
                    },
                    {
                        title: 'Total Students',
                        value: systemInfo.totalStudent?.toLocaleString() || '0',
                        valueSize: 'xl',
                        gradient: 'bg-gradient-to-r from-blue-500 to-blue-400',
                        iconSize: 'xl',
                        icon: <Image src="/assets/images/icons/students.svg" alt="student" width={35} height={35} className="brightness-0 invert opacity-90" />,
                    },
                    {
                        title: 'Total Staff',
                        value: systemInfo.totalStaff?.toLocaleString() || '0',
                        valueSize: 'xl',
                        gradient: 'bg-gradient-to-b from-[#EF4649] to-[#F9797B]',
                        iconSize: 'xl',
                        icon: <Image src="/assets/images/icons/staff.svg" alt="staff" width={35} height={35} className="brightness-0 invert opacity-90" />,
                    },
                ];

                setStats(updatedStats);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            // Set default stats on error
            setStats(getDefaultStats());
        } finally {
            setLoading(false);
        }
    };

    const updateChartForYear = (year: string, data: ProcessedFinanceData | null = null) => {
        const processedData = data || financeData;
        if (!processedData) return;

        // Get chart series for the selected year (Revenue and Cost)
        const series = getChartSeriesForYear(processedData, year, true, true, false);
        setChartSeries(series);

        // Calculate totals
        const totals = calculateYearTotals(processedData, year);
        setFinanceTotals(totals);
    };

    const handleYearChange = (year: string) => {
        setSelectedYear(year);
    };

    // Default stats function for fallback
    const getDefaultStats = (): StatCardData[] => [
        {
            title: 'Total Zones',
            value: '0',
            valueSize: 'xl',
            gradient: 'bg-gradient-to-r from-cyan-500 to-cyan-400',
            iconSize: 'xl',
            icon: <Image src="/assets/images/icons/zone1.svg" alt="zones" width={35} height={35} className="brightness-0 invert opacity-90" />,
        },
        {
            title: 'Total Schools',
            value: '0',
            valueSize: 'xl',
            gradient: 'bg-gradient-to-r from-violet-500 to-violet-400',
            iconSize: 'xl',
            icon: <Image src="/assets/images/icons/school.svg" alt="school" width={35} height={35} className="brightness-0 invert opacity-90" />,
        },
        {
            title: 'Total Students',
            value: '0',
            valueSize: 'xl',
            gradient: 'bg-gradient-to-r from-blue-500 to-blue-400',
            iconSize: 'xl',
            icon: <Image src="/assets/images/icons/students.svg" alt="student" width={35} height={35} className="brightness-0 invert opacity-90" />,
        },
        {
            title: 'Total Staff',
            value: '0',
            valueSize: 'xl',
            gradient: 'bg-gradient-to-b from-[#EF4649] to-[#F9797B]',
            iconSize: 'xl',
            icon: <Image src="/assets/images/icons/staff.svg" alt="staff" width={35} height={35} className="brightness-0 invert opacity-90" />,
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Handle report actions
    const handleViewReport = (index: number) => {
        const stat = stats[index];
        console.log('View report for:', stat.title);
    };

    const handleEditReport = (index: number) => {
        const stat = stats[index];
        console.log('Edit report for:', stat.title);
    };

    function handleTableView(): void {
        console.log('Table view action');
    }

    function handleTableDelete(): void {
        console.log('Table delete action');
    }

    // Handle zone click - navigate to zone dashboard
    const handleZoneClick = (row: TableRow, columnKey: string) => {
        if (columnKey === 'zone') {
            const zoneName = row.zone as string;
            // Convert zone name to URL-friendly format
            const zoneSlug = zoneName.toLowerCase().replace(/\s+/g, '-');

            // Navigate to zone-specific dashboard
            router.push(`/dashboard/zone/${encodeURIComponent(zoneSlug)}?name=${encodeURIComponent(zoneName)}`);
        }
    };
    // Add this handler after handleSummaryYearChange
    const handleZoneYearChange = (year: string) => {
        const yearNum = parseInt(year);
        setSelectedZoneYear(yearNum);

        // Recalculate zone financials for the selected year
        if (dashboardMetrics?.branches && dashboardMetrics?.systemBranches) {
            const zoneFinancials = calculateZoneWiseFinancials(dashboardMetrics.branches, dashboardMetrics.systemBranches, yearNum);

            // Update zone chart data
            const updatedZoneChartData = {
                categories: zoneFinancials.map((z) => z.zoneName),
                income: zoneFinancials.map((z) => z.totalIncome),
                expense: zoneFinancials.map((z) => z.totalExpense),
                profit: zoneFinancials.map((z) => z.totalProfit),
            };

            // Update dashboard metrics with new zone data
            setDashboardMetrics((prev: any) => ({
                ...prev,
                zoneChartData: updatedZoneChartData,
            }));
        }
    };
    // DataTable configuration
    const outstandingAmountColumns: TableColumn[] = [
        { key: 'zone', label: 'Zone', align: 'left', width: '200px', clickable: true },
        { key: 'monthLabel', label: '(Month/Outstanding Amount)', align: 'center', width: '200px' },
        { key: 'january', label: 'January', align: 'center' },
        { key: 'february', label: 'February', align: 'center' },
        { key: 'march', label: 'March', align: 'center' },
        { key: 'april', label: 'April', align: 'center' },
        { key: 'may', label: 'May', align: 'center' },
        { key: 'june', label: 'June', align: 'center' },
        { key: 'july', label: 'July', align: 'center' },
        { key: 'total', label: 'Total', align: 'center' },
    ];

    const outstandingAmountData: TableRow[] = [
        {
            zone: 'HILL PARK',
            monthLabel: '',
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
            monthLabel: '',
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
            monthLabel: '',
            january: 'RM 400',
            february: 'RM 6,783',
            march: 'RM 395',
            april: null,
            may: 'RM 650',
            june: 'RM 8,680',
            july: 'RM 11,507',
            total: 'RM 28,415',
            color: 'orange',
        },
        {
            zone: 'TRANSIT',
            monthLabel: '',
            january: 'RM 139',
            february: null,
            march: null,
            april: null,
            may: 'RM 183',
            june: 'RM 1,527',
            july: 'RM 3,645',
            total: 'RM 5,494',
            color: 'green',
        },
    ];

    const outstandingAmountTotals: TableRow = {
        zone: 'Total',
        monthLabel: '',
        january: 'RM 2,239',
        february: 'RM 26,061',
        march: 'RM 4,170',
        april: 'RM 4,180',
        may: 'RM 6,353',
        june: 'RM 17,717',
        july: 'RM 39,014',
        total: 'RM 99,734',
    };

    const outstandingAmountConfig: DataTableConfig = {
        title: 'Outstanding Amount by Zone',
        showColorIndicator: true,
        showTotalRow: true,
    };

    return (
        <>
            <div className="px-4 sm:px-6 lg:px-8">
                <ul className="flex space-x-2 rtl:space-x-reverse">
                    <li>
                        <Link href="/" className="text-primary hover:underline">
                            CEO Dashboard
                        </Link>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <span>Sales</span>
                    </li>
                </ul>

                <div className="pt-5">
                    {/* 1st row - KPI Cards */}
                    <StatsGrid stats={stats} isRtl={isRtl} onViewReport={handleViewReport} onEditReport={handleEditReport} />

                    {/* Row 2 - Charts with Finance Data from API */}
                    <div className="mb-6 grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <AreaChart
                                title="Income"
                                subtitle="Total Revenue"
                                subtitleValue={formatCurrency(financeTotals.revenue)}
                                showYearFilter={true}
                                yearOptions={financeData?.years || []}
                                showDropdown={false}
                                series={chartSeries}
                                labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
                                height={325}
                                onYearSelect={handleYearChange}
                                yAxisFormatter={(value: number) => {
                                    if (value >= 1000000) {
                                        return (value / 1000000).toFixed(1) + 'M';
                                    } else if (value >= 1000) {
                                        return (value / 1000).toFixed(0) + 'K';
                                    }
                                    return value.toFixed(0);
                                }}
                            />
                        </div>

                        <div className="lg:col-span-1">
                            <PieChart
                                title="Total Income Breakdown By Category(%)"
                                series={[985, 737, 270, 450, 620]}
                                labels={['Transit', 'Azz Delight', 'Hill Park', 'Setia Alam', 'Puncak Alam']}
                                height={340}
                                showDropdown={true}
                                dropdownOptions={['View Report', 'Export Data', 'Share Chart']}
                                onDropdownSelect={(option) => {
                                    console.log('Selected:', option);
                                }}
                            />
                        </div>
                    </div>

                    {/* Row 3 - Three pie charts */}
                    <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <BasicPieChart
                            chartTitle="Financial Component Breakdown"
                            series={[44, 55, 13, 43]}
                            labels={['Operating Cost', '', 'Administrative Cost', 'Finance Cost']}
                            colors={['#4361ee', '#805dca', '#00ab55', '#e7515a', '#e2a03f']}
                            height={340}
                            onDropdownSelect={(option) => {
                                console.log('BasicPieChart option selected:', option);
                            }}
                        />

                        <BasicPieChart
                            chartTitle="Revenue Distribution By Category"
                            series={[44, 55, 13, 43]}
                            labels={['Activities', 'School Fee', 'School Merchandise', 'School Activities']}
                            colors={['#4361ee', '#805dca', '#00ab55', '#e7515a']}
                            height={340}
                            onDropdownSelect={(option) => {
                                console.log('BasicPieChart option selected:', option);
                            }}
                        />

                        <div className="md:col-span-2 lg:col-span-1">
                            <PieChart
                                title="Total Expenses Breakdown By Category(%)"
                                series={[985, 737, 270, 450, 620]}
                                labels={['Transit', 'Azz Delight', 'Hill Park', 'Setia Alam', 'Puncak Alam']}
                                height={340}
                                showDropdown={true}
                                dropdownOptions={['View Report', 'Export Data', 'Share Chart']}
                                onDropdownSelect={(option) => {
                                    console.log('Selected:', option);
                                }}
                            />
                        </div>
                    </div>

                    {/* Row 4 - Summary and Gross Net Profit */}
                    <div className="mb-6 grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <SummaryBar
                                title="Financial Summary"
                                showYearFilter={true}
                                yearOptions={dashboardMetrics?.years.map(String) || []}
                                selectedYear={selectedSummaryYear}
                                onYearSelect={handleSummaryYearChange}
                                items={[
                                    {
                                        icon: <IconInbox />,
                                        label: 'Income',
                                        value: formatCurrency(financeTotals.revenue),
                                        percentage: 92,
                                        gradientFrom: '#7579ff',
                                        gradientTo: '#b224ef',
                                        iconBgColor: 'bg-secondary-light dark:bg-secondary',
                                        iconTextColor: 'text-secondary dark:text-secondary-light',
                                    },
                                    {
                                        icon: <IconTag />,
                                        label: 'Profit',
                                        value: formatCurrency(financeTotals.profit),
                                        percentage: 65,
                                        gradientFrom: '#3cba92',
                                        gradientTo: '#0ba360',
                                        iconBgColor: 'bg-success-light dark:bg-success',
                                        iconTextColor: 'text-success dark:text-success-light',
                                    },
                                    {
                                        icon: <IconCreditCard />,
                                        label: 'Expenses',
                                        value: formatCurrency(financeTotals.cost),
                                        percentage: 80,
                                        gradientFrom: '#f09819',
                                        gradientTo: '#ff5858',
                                        iconBgColor: 'bg-warning-light dark:bg-warning',
                                        iconTextColor: 'text-warning dark:text-warning-light',
                                    },
                                ]}
                                onDropdownSelect={(option) => {
                                    console.log('Selected:', option);
                                }}
                            />
                            {/* <SummaryBar
                                title="Financial Summary"
                                items={[
                                    {
                                        icon: <IconInbox />,
                                        label: 'Income',
                                        value: formatCurrency(financeTotals.revenue),
                                        percentage: 92,
                                        gradientFrom: '#7579ff',
                                        gradientTo: '#b224ef',
                                        iconBgColor: 'bg-secondary-light dark:bg-secondary',
                                        iconTextColor: 'text-secondary dark:text-secondary-light',
                                    },
                                    {
                                        icon: <IconTag />,
                                        label: 'Profit',
                                        value: formatCurrency(financeTotals.profit),
                                        percentage: 65,
                                        gradientFrom: '#3cba92',
                                        gradientTo: '#0ba360',
                                        iconBgColor: 'bg-success-light dark:bg-success',
                                        iconTextColor: 'text-success dark:text-success-light',
                                    },
                                    {
                                        icon: <IconCreditCard />,
                                        label: 'Expenses',
                                        value: formatCurrency(financeTotals.cost),
                                        percentage: 80,
                                        gradientFrom: '#f09819',
                                        gradientTo: '#ff5858',
                                        iconBgColor: 'bg-warning-light dark:bg-warning',
                                        iconTextColor: 'text-warning dark:text-warning-light',
                                    },
                                ]}
                                onDropdownSelect={(option) => {
                                    console.log('Selected:', option);
                                }}
                            /> */}
                        </div>

                        <div className="lg:col-span-1">
                            <GrossNetProfit
                                title="Gross Net Profit"
                                subtitle="Go to columns for details."
                                icon={<IconDollarSign />}
                                series={[
                                    {
                                        name: 'Gross Profit',
                                        data: [44, 55, 41, 67, 22, 43, 21],
                                    },
                                    {
                                        name: 'Net Profit',
                                        data: [13, 23, 20, 8, 13, 27, 33],
                                    },
                                ]}
                                categories={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
                                height={160}
                                colors={['#e2a03f', '#e0e6ed']}
                            />
                        </div>
                    </div>

                    {/* Row 5 - Zone Bar Chart */}
                    <div className="mb-6">
                        {dashboardMetrics?.zoneChartData ? (
                            <ZoneBar
                                chartTitle={`Total Income Breakdown By Zone (${selectedZoneYear})`}
                                series={[
                                    {
                                        name: 'INCOME',
                                        data: dashboardMetrics.zoneChartData.income,
                                    },
                                    {
                                        name: 'EXPENSE',
                                        data: dashboardMetrics.zoneChartData.expense,
                                    },
                                    {
                                        name: 'PROFIT',
                                        data: dashboardMetrics.zoneChartData.profit,
                                    },
                                ]}
                                categories={dashboardMetrics.zoneChartData.categories}
                                colors={['#10b981', '#ef4444', '#8b5cf6']}
                                negativeColor="#FF4757"
                                showYearFilter={true}
                                yearOptions={dashboardMetrics?.years.map(String) || []}
                                onYearSelect={handleZoneYearChange}
                                onDropdownSelect={(option) => console.log(option)}
                            />
                        ) : (
                            <div className="panel p-5">
                                <div className="flex items-center justify-center">
                                    <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
                                    <span className="ml-3">Loading zone data...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Row 6 - Table Data with Clickable Zones */}
                    <div className="mb-6">
                        <DataTable
                            columns={outstandingAmountColumns}
                            data={outstandingAmountData}
                            totals={outstandingAmountTotals}
                            config={outstandingAmountConfig}
                            isRtl={isRtl}
                            onViewReport={handleTableView}
                            onEditReport={handleTableView}
                            onDeleteReport={handleTableDelete}
                            onCellClick={handleZoneClick}
                        />
                    </div>

                    {/* Row 7 - Outstanding Amount Chart */}
                    <div className="mb-6">
                        <OutstandingAmountChart />
                    </div>
                </div>
            </div>
        </>
    );
}
