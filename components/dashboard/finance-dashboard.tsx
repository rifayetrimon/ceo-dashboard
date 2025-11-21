'use client';

// ============================================================
// IMPORTS
// ============================================================
import IconDollarSign from '@/components/icon/icon-dollar-sign';
import { IRootState } from '@/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import BasicPieChart from '../widgets/main-dashboard/basic-pie-chart/Basic-pie-chart';
import PieChart from '../widgets/main-dashboard/pie-chart/Pie-chart';
import AreaChart from '../widgets/main-dashboard/area-chart/Area-chart';
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
    processExpenseCategoryTotalsForYear,
    processCategoryTotalsForYear,
    processCompanyFinancialsByYear,
    calculateYearRangeTotals,
    getLatestYearsProfitData,
} from '@/services/sales/financeService';

// ============================================================
// HELPER FUNCTIONS (unchanged)
// ============================================================
const getAvailableYears = (branches: any[]): string[] => {
    const years = new Set<string>();
    branches.forEach((branch) => {
        branch.monthly_revenue?.forEach((yearData: any) => {
            if (yearData.year && yearData.total > 0) {
                years.add(yearData.year.toString());
            }
        });
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
};

const calculateOutstandingAmountsByZone = (branches: any[], systemBranches: any[], year: number) => {
    const zoneMap = new Map<string, { months: number[]; total: number; color: string; zoneName: string }>();
    const colors = ['blue', 'purple', 'orange', 'green', 'red', 'cyan', 'pink', 'yellow'];
    let colorIndex = 0;
    systemBranches.forEach((sysBranch: any) => {
        const zoneCode = sysBranch.zone?.trim();
        const zoneName = sysBranch.zoneName?.trim();
        if (!zoneCode || !zoneName) return;
        if (!zoneMap.has(zoneCode)) {
            zoneMap.set(zoneCode, { months: new Array(12).fill(0), total: 0, color: colors[colorIndex % colors.length], zoneName: zoneName });
            colorIndex++;
        }
    });
    branches.forEach((branch: any) => {
        const sysBranch = systemBranches.find((sb: any) => sb._id === branch.branch_id);
        if (!sysBranch?.zone) return;
        const zoneCode = sysBranch.zone.trim();
        const zoneData = zoneMap.get(zoneCode);
        if (!zoneData) return;
        const yearRevenue = branch.monthly_revenue?.find((y: any) => y.year === year);
        if (yearRevenue) {
            yearRevenue.records.forEach((record: any) => {
                const monthIndex = record.month - 1;
                if (monthIndex >= 0 && monthIndex < 12) {
                    zoneData.months[monthIndex] += record.total || 0;
                }
            });
        }
    });
    const tableData: TableRow[] = [];
    const monthTotals = new Array(8).fill(0);
    zoneMap.forEach((data, zoneCode) => {
        const rowTotal = data.months.slice(0, 7).reduce((sum, val) => sum + val, 0);
        data.total = rowTotal;
        const row: TableRow = {
            zone: data.zoneName,
            zoneCode: zoneCode,
            monthLabel: '',
            january: data.months[0] > 0 ? `RM ${data.months[0].toLocaleString()}` : null,
            february: data.months[1] > 0 ? `RM ${data.months[1].toLocaleString()}` : null,
            march: data.months[2] > 0 ? `RM ${data.months[2].toLocaleString()}` : null,
            april: data.months[3] > 0 ? `RM ${data.months[3].toLocaleString()}` : null,
            may: data.months[4] > 0 ? `RM ${data.months[4].toLocaleString()}` : null,
            june: data.months[5] > 0 ? `RM ${data.months[5].toLocaleString()}` : null,
            july: data.months[6] > 0 ? `RM ${data.months[6].toLocaleString()}` : null,
            total: `RM ${rowTotal.toLocaleString()}`,
            color: data.color,
        };
        tableData.push(row);
        for (let i = 0; i < 7; i++) {
            monthTotals[i] += data.months[i];
        }
        monthTotals[7] += rowTotal;
    });
    const totalsRow: TableRow = {
        zone: 'Total',
        monthLabel: '',
        january: `RM ${monthTotals[0].toLocaleString()}`,
        february: `RM ${monthTotals[1].toLocaleString()}`,
        march: `RM ${monthTotals[2].toLocaleString()}`,
        april: `RM ${monthTotals[3].toLocaleString()}`,
        may: `RM ${monthTotals[4].toLocaleString()}`,
        june: `RM ${monthTotals[5].toLocaleString()}`,
        july: `RM ${monthTotals[6].toLocaleString()}`,
        total: `RM ${monthTotals[7].toLocaleString()}`,
    };
    return { tableData, totalsRow };
};

// ============================================================
// ICON COMPONENTS (unchanged)
// ============================================================
const IconDollar = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconExpense = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 8V5l6 7-6 7v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 8V5L2 12l6 7v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconProfit = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function FinanceDashboard() {
    // ... (Hooks and State declarations - unchanged)
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const router = useRouter();

    const [isMounted, setIsMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<StatCardData[]>([]);
    const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
    const [financeData, setFinanceData] = useState<ProcessedFinanceData | null>(null);
    const [selectedYear, setSelectedYear] = useState<string>('2025');
    const [chartSeries, setChartSeries] = useState<ChartSeriesData[]>([]);
    const [selectedSummaryYear, setSelectedSummaryYear] = useState<string>('2025');
    const [selectedZoneYear, setSelectedZoneYear] = useState<number>(new Date().getFullYear());
    const [startYear, setStartYear] = useState('2021');
    const [endYear, setEndYear] = useState('2025');

    // Company Financial Data State (Income, Cost, Profit)
    const [companyFinancialYear, setCompanyFinancialYear] = useState<string>('2025');
    const [companyFinancialData, setCompanyFinancialData] = useState<{
        totalProfit: number; // For center display
        labels: string[];
        series: number[];
    }>({ totalProfit: 0, labels: [], series: [] });

    const [incomeCategoryChartData, setIncomeCategoryChartData] = useState<{ labels: string[]; series: number[] }>({ labels: [], series: [] });
    const [incomeCategorySelectedYear, setIncomeCategorySelectedYear] = useState<string>('2025');
    const [costCategoryChartData, setCostCategoryChartData] = useState<{ labels: string[]; series: number[] }>({ labels: [], series: [] });
    const [costCategorySelectedYear, setCostCategorySelectedYear] = useState<string>('2025');
    const [expenseCategoryChartData, setExpenseCategoryChartData] = useState<{ labels: string[]; series: number[] }>({ labels: [], series: [] });
    const [expenseCategorySelectedYear, setExpenseCategorySelectedYear] = useState<string>('2025');
    const [availableYears, setAvailableYears] = useState<string[]>([]);
    const [rawBranchData, setRawBranchData] = useState<any[]>([]);

    const [financeTotals, setFinanceTotals] = useState({ revenue: 0, cost: 0, profit: 0, profitMargin: '0.00' });
    const [yearlyProfitData, setYearlyProfitData] = useState<{ years: string[]; profitData: number[] }>({ years: [], profitData: [] });

    const [outstandingAmountData, setOutstandingAmountData] = useState<TableRow[]>([]);
    const [outstandingAmountTotals, setOutstandingAmountTotals] = useState<TableRow>({
        zone: 'Total',
        monthLabel: '',
        january: 'RM 0',
        february: 'RM 0',
        march: 'RM 0',
        april: 'RM 0',
        may: 'RM 0',
        june: 'RM 0',
        july: 'RM 0',
        total: 'RM 0',
    });
    const [outstandingTableYear, setOutstandingTableYear] = useState<string>('2025');

    // ============================================================
    // COMPUTED VALUES (useMemo)
    // ============================================================

    /**
     * Calculate year-wise totals for the yearly financial overview chart
     * FIX: Returns years sorted ASCENDINGLY for chronological order on X-axis.
     */
    const yearlyFinancialSeries = useMemo(() => {
        if (!financeData) return { series: [], labels: [] };

        // 1. Get available years and sort them in ASCENDING order (e.g., 2023, 2024, 2025)
        const years = [...financeData.years].sort((a, b) => a.localeCompare(b));

        const revenueData: number[] = [];
        const costData: number[] = [];
        const profitData: number[] = [];

        // 2. Iterate over the ASCENDING years list
        years.forEach((year) => {
            const yearTotals = calculateYearTotals(financeData, year);
            revenueData.push(yearTotals.revenue);
            costData.push(yearTotals.cost);
            profitData.push(yearTotals.profit);
        });

        // 3. Return the series and the labels (years)
        return {
            series: [
                { name: 'Income', data: revenueData },
                { name: 'Cost', data: costData },
                { name: 'Profit', data: profitData },
            ],
            labels: years, // Use the ascendingly sorted years for labels
        };
    }, [financeData]);

    /**
     * Calculate range totals for the selected year range (unchanged)
     */
    const rangeTotals = useMemo(() => {
        if (!financeData) {
            return { revenue: 0, cost: 0, profit: 0, profitMargin: '0.00', yearsIncluded: [] };
        }
        return calculateYearRangeTotals(financeData, startYear, endYear);
    }, [financeData, startYear, endYear]);

    // ============================================================
    // LIFECYCLE HOOKS (useEffect - unchanged)
    // ============================================================
    useEffect(() => {
        setIsMounted(true);
    }, []);
    useEffect(() => {
        fetchDashboardData();
    }, []);
    useEffect(() => {
        if (financeData && selectedYear) {
            updateChartForYear(selectedYear);
        }
    }, [selectedYear, financeData]);
    useEffect(() => {
        if (rawBranchData.length > 0 && companyFinancialYear) {
            updateCompanyFinancialChart(rawBranchData, companyFinancialYear);
        }
    }, [companyFinancialYear, rawBranchData]);
    useEffect(() => {
        if (dashboardMetrics?.branches && dashboardMetrics?.systemBranches && outstandingTableYear) {
            const yearNum = parseInt(outstandingTableYear);
            const { tableData, totalsRow } = calculateOutstandingAmountsByZone(dashboardMetrics.branches, dashboardMetrics.systemBranches, yearNum);
            setOutstandingAmountData(tableData);
            setOutstandingAmountTotals(totalsRow);
        }
    }, [dashboardMetrics, outstandingTableYear]);

    // ============================================================
    // DATA FETCHING FUNCTIONS (unchanged)
    // ============================================================
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [systemInfoResponse, financeSummaryResponse] = await Promise.all([dashboardService.getSystemInfo(), getFinanceSummary()]);

            if (systemInfoResponse?.data?.systemInfo && financeSummaryResponse?.data?.branches) {
                const systemInfo = systemInfoResponse.data.systemInfo;
                const branches = systemInfoResponse.data.branches || [];
                const financeBranches = financeSummaryResponse.data.branches || [];
                setRawBranchData(financeBranches);

                const yearsSet = new Set<number>();
                financeBranches.forEach((branch: any) => {
                    branch.monthly_revenue?.forEach((yearData: any) => {
                        yearsSet.add(yearData.year);
                    });
                });
                const years = Array.from(yearsSet).sort((a, b) => b - a);

                const yearWiseTotals: {
                    [year: string]: { totalIncome: number; totalExpense: number; totalProfit: number; monthlyIncome: number[]; monthlyExpense: number[]; monthlyProfit: number[] };
                } = {};
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

                financeBranches.forEach((branch: any) => {
                    years.forEach((year) => {
                        const revenueYear = branch.monthly_revenue?.find((y: any) => y.year === year);
                        if (revenueYear) {
                            revenueYear.records.forEach((record: any) => {
                                yearWiseTotals[year].totalIncome += record.total;
                            });
                        }
                        const costYear = branch.monthly_cost?.find((y: any) => y.year === year);
                        if (costYear) {
                            costYear.records.forEach((record: any) => {
                                yearWiseTotals[year].totalExpense += record.total;
                            });
                        }
                        yearWiseTotals[year].totalProfit = yearWiseTotals[year].totalIncome - yearWiseTotals[year].totalExpense;
                    });
                });

                const categoryYears = getAvailableYears(financeBranches);
                setAvailableYears(categoryYears);
                if (categoryYears.length > 0) {
                    setStartYear(categoryYears[categoryYears.length - 1]);
                    setEndYear(categoryYears[0]);
                    setOutstandingTableYear(categoryYears[0]);
                }

                const currentYear = years.length > 0 ? years[0] : new Date().getFullYear();
                const processed = processFinanceData(financeBranches);
                setFinanceData(processed);

                if (processed.years.length > 0) {
                    const latestYear = processed.years[0];
                    setSelectedYear(latestYear);
                    updateChartForYear(latestYear, processed);
                    const profitChartData = getLatestYearsProfitData(processed, 5);
                    setYearlyProfitData(profitChartData);
                }

                if (categoryYears.length > 0) {
                    const latestYear = categoryYears[0];
                    setCompanyFinancialYear(latestYear);
                    updateCompanyFinancialChart(financeBranches, latestYear);
                    setIncomeCategorySelectedYear(latestYear);
                    updateIncomeCategoryChart(financeBranches, latestYear);
                    setCostCategorySelectedYear(latestYear);
                    updateCostCategoryChart(financeBranches, latestYear);
                    setExpenseCategorySelectedYear(latestYear);
                    updateExpenseCategoryChart(financeBranches, latestYear);
                }

                const uniqueZones = new Set(branches.map((branch: any) => branch.zone).filter((zone: string) => zone && zone.trim() !== ''));
                const zoneFinancials = calculateZoneWiseFinancials(financeBranches, branches, currentYear);

                const calculatedMetrics = {
                    totalUniqueZones: uniqueZones.size,
                    years,
                    yearWiseTotals,
                    zoneFinancials,
                    zoneChartData: {
                        categories: zoneFinancials.map((z) => z.zoneName),
                        income: zoneFinancials.map((z) => z.totalIncome),
                        expense: zoneFinancials.map((z) => z.totalExpense),
                        profit: zoneFinancials.map((z) => z.totalProfit),
                    },
                    branches: financeBranches,
                    systemBranches: branches,
                };
                setDashboardMetrics(calculatedMetrics);

                if (years.length > 0) {
                    const latestYear = years[0].toString();
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

                const updatedStats: StatCardData[] = [
                    {
                        title: 'Total Zones',
                        value: calculatedMetrics.totalUniqueZones.toString(),
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
            setStats(getDefaultStats());
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // CHART UPDATE FUNCTIONS (unchanged logic)
    // ============================================================
    const updateChartForYear = (year: string, data: ProcessedFinanceData | null = null) => {
        const processedData = data || financeData;
        if (!processedData) return;
        const series = getChartSeriesForYear(processedData, year, true, true, false);
        setChartSeries(series);
        const totals = calculateYearTotals(processedData, year);
        setFinanceTotals(totals);
    };
    const updateIncomeCategoryChart = (branches: any[], year: string) => {
        const categoryData = processCategoryTotalsForYear(branches, year);
        setIncomeCategoryChartData(categoryData);
    };
    const updateCostCategoryChart = (branches: any[], year: string) => {
        const expenseData = processExpenseCategoryTotalsForYear(branches, year);
        setCostCategoryChartData(expenseData);
    };
    const updateExpenseCategoryChart = (branches: any[], year: string) => {
        const expenseData = processExpenseCategoryTotalsForYear(branches, year);
        setExpenseCategoryChartData(expenseData);
    };
    const updateCompanyFinancialChart = (branches: any[], year: string) => {
        const financialData = processCompanyFinancialsByYear(branches, year);
        setCompanyFinancialData(financialData);
    };

    // ============================================================
    // EVENT HANDLERS (unchanged logic)
    // ============================================================
    const handleYearChange = (year: string) => {
        setSelectedYear(year);
    };
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
    const handleIncomeCategoryYearChange = (year: string) => {
        setIncomeCategorySelectedYear(year);
        updateIncomeCategoryChart(rawBranchData, year);
    };
    const handleCostCategoryYearChange = (year: string) => {
        setCostCategorySelectedYear(year);
        updateCostCategoryChart(rawBranchData, year);
    };
    const handleExpenseCategoryYearChange = (year: string) => {
        setExpenseCategorySelectedYear(year);
        updateExpenseCategoryChart(rawBranchData, year);
    };
    const handleCompanyFinancialYearChange = (year: string) => {
        setCompanyFinancialYear(year);
        updateCompanyFinancialChart(rawBranchData, year);
    };
    const handleZoneYearChange = (year: string) => {
        const yearNum = parseInt(year);
        setSelectedZoneYear(yearNum);
        if (dashboardMetrics?.branches && dashboardMetrics?.systemBranches) {
            const zoneFinancials = calculateZoneWiseFinancials(dashboardMetrics.branches, dashboardMetrics.systemBranches, yearNum);
            const updatedZoneChartData = {
                categories: zoneFinancials.map((z) => z.zoneName),
                income: zoneFinancials.map((z) => z.totalIncome),
                expense: zoneFinancials.map((z) => z.totalExpense),
                profit: zoneFinancials.map((z) => z.totalProfit),
            };
            setDashboardMetrics((prev: any) => ({ ...prev, zoneChartData: updatedZoneChartData }));
        }
    };
    const handleOutstandingTableYearChange = (year: string) => {
        setOutstandingTableYear(year);
    };
    const handleYearRangeSelect = (start: string, end: string) => {
        setStartYear(start);
        setEndYear(end);
    };
    const handleViewReport = (index: number) => {
        console.log('View report for:', stats[index].title);
    };
    const handleEditReport = (index: number) => {
        console.log('Edit report for:', stats[index].title);
    };
    function handleTableView(): void {
        console.log('Table view action');
    }
    function handleTableDelete(): void {
        console.log('Table delete action');
    }
    const handleZoneClick = (row: TableRow, columnKey: string) => {
        if (columnKey === 'zone') {
            const zoneName = row.zone as string;
            const zoneSlug = zoneName.toLowerCase().replace(/\s+/g, '-');
            router.push(`/dashboard/zone/${encodeURIComponent(zoneSlug)}?name=${encodeURIComponent(zoneName)}`);
        }
    };

    // ============================================================
    // UTILITY FUNCTIONS (unchanged)
    // ============================================================
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
    const outstandingAmountConfig: DataTableConfig = {
        title: 'Outstanding Amount by Zone',
        showColorIndicator: true,
        showTotalRow: true,
        showYearFilter: true,
        selectedYear: outstandingTableYear,
        onYearChange: handleOutstandingTableYearChange,
    };

    // ============================================================
    // LOADING STATE (unchanged)
    // ============================================================
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // ============================================================
    // RENDER - MAIN RETURN
    // ============================================================
    return (
        <>
            <div className="px-4 sm:px-6 lg:px-8">
                {/* BREADCRUMB NAVIGATION */}
                <ul className="flex space-x-2 rtl:space-x-reverse">
                    <li>
                        <Link href="/" className="text-primary hover:underline">
                            CEO Dashboard
                        </Link>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <span>Finance</span>
                    </li>
                </ul>

                <div className="pt-5">
                    {/* ROW 1 - KPI STAT CARDS */}
                    <StatsGrid stats={stats} isRtl={isRtl} onViewReport={handleViewReport} onEditReport={handleEditReport} />

                    {/* ROW 2 - MONTHLY FINANCIAL OVERVIEW & COMPANY PIE CHART */}
                    <div className="mb-6 grid gap-6 lg:grid-cols-3">
                        {/* Monthly Financial Overview - 2/3 width */}
                        <div className="lg:col-span-2">
                            <AreaChart
                                title="Financial Overview"
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

                        {/* Company Financial Overview - 1/3 width */}
                        <div className="lg:col-span-1">
                            <PieChart
                                title="Company Financial Overview"
                                series={companyFinancialData.series}
                                labels={companyFinancialData.labels}
                                height={340}
                                showDropdown={false}
                                showYearFilter={true}
                                yearOptions={availableYears}
                                selectedYear={companyFinancialYear}
                                onYearChange={handleCompanyFinancialYearChange}
                                dropdownOptions={['View Report', 'Export Data', 'Share Chart']}
                                onDropdownSelect={(option) => {
                                    console.log('Selected:', option);
                                }}
                            />
                        </div>
                    </div>

                    {/* ROW 3 - CATEGORY BREAKDOWN PIE CHARTS */}
                    <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <BasicPieChart
                            chartTitle="Income By Category"
                            series={incomeCategoryChartData.series}
                            labels={incomeCategoryChartData.labels}
                            colors={['#00ab55', '#4361ee', '#805dca', '#e2a03f', '#e7515a', '#2196f3']}
                            height={340}
                            showYearFilter={true}
                            yearOptions={availableYears}
                            selectedYear={incomeCategorySelectedYear}
                            onYearChange={handleIncomeCategoryYearChange}
                            showDropdown={false}
                            onDropdownSelect={(option) => {
                                console.log('Income Category option selected:', option);
                            }}
                        />

                        <BasicPieChart
                            chartTitle="Cost By Category"
                            series={costCategoryChartData.series}
                            labels={costCategoryChartData.labels}
                            colors={['#e7515a', '#e2a03f', '#805dca', '#4361ee', '#2196f3', '#00ab55']}
                            height={340}
                            showYearFilter={true}
                            yearOptions={availableYears}
                            selectedYear={costCategorySelectedYear}
                            onYearChange={handleCostCategoryYearChange}
                            showDropdown={false}
                            onDropdownSelect={(option) => {
                                console.log('Cost Category option selected:', option);
                            }}
                        />

                        <div className="md:col-span-2 lg:col-span-1">
                            <PieChart
                                title="Expense By Category"
                                series={expenseCategoryChartData.series}
                                labels={expenseCategoryChartData.labels}
                                height={340}
                                showDropdown={false}
                                showYearFilter={true}
                                yearOptions={availableYears}
                                selectedYear={expenseCategorySelectedYear}
                                onYearChange={handleExpenseCategoryYearChange}
                                dropdownOptions={['View Report', 'Export Data', 'Share Chart']}
                                onDropdownSelect={(option) => {
                                    console.log('Selected:', option);
                                }}
                            />
                        </div>
                    </div>

                    {/* ROW 4 - YEARLY FINANCIAL OVERVIEW & PROFIT TREND */}
                    <div className="mb-6 grid gap-6 lg:grid-cols-3">
                        {/* Yearly Financial Overview - 2/3 width */}
                        <div className="lg:col-span-2">
                            <AreaChart
                                title="Yearly Financial Overview"
                                showYearFilter={false}
                                yearOptions={financeData?.years || []}
                                showDropdown={false}
                                series={yearlyFinancialSeries.series}
                                labels={yearlyFinancialSeries.labels} // FIX: Now sorted ascendingly
                                height={325}
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

                        {/* Yearly Profit Trend - 1/3 width */}
                        <div className="lg:col-span-1">
                            <GrossNetProfit
                                title="Yearly Profit Trend"
                                subtitle="Last 5 years profit overview"
                                icon={<IconDollarSign />}
                                series={[{ name: 'Profit', data: yearlyProfitData.profitData }]}
                                categories={yearlyProfitData.years}
                                height={325}
                                colors={['#00ab55']}
                            />
                        </div>
                    </div>

                    {/* ROW 5 - ZONE BAR CHART */}
                    <div className="mb-6">
                        {dashboardMetrics?.zoneChartData ? (
                            <ZoneBar
                                chartTitle={`Total Income Breakdown By Zone (${selectedZoneYear})`}
                                series={[
                                    { name: 'INCOME', data: dashboardMetrics.zoneChartData.income },
                                    { name: 'EXPENSE', data: dashboardMetrics.zoneChartData.expense },
                                    { name: 'PROFIT', data: dashboardMetrics.zoneChartData.profit },
                                ]}
                                categories={dashboardMetrics.zoneChartData.categories}
                                colors={['#10b981', '#ef4444', '#8b5cf6']}
                                negativeColor="#FF4757"
                                showYearFilter={true}
                                showDropdown={false}
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

                    {/* ROW 6 - OUTSTANDING AMOUNT TABLE */}
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

                    {/* ROW 7 - OUTSTANDING AMOUNT CHART */}
                    <div className="mb-6">
                        <OutstandingAmountChart />
                    </div>
                </div>
            </div>
        </>
    );
}
