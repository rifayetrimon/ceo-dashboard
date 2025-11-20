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
    processExpenseCategoryTotalsForYear,
    processCategoryTotalsForYear,
    processCompanyFinancialsByYear,
    calculateYearRangeTotals,
    getLatestYearsProfitData,
} from '@/services/sales/financeService';

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Extract all available years from branch data
 */
const getAvailableYears = (branches: any[]): string[] => {
    const years = new Set<string>();

    branches.forEach((branch) => {
        branch.monthly_revenue?.forEach((yearData: any) => {
            if (yearData.year && yearData.total > 0) {
                years.add(yearData.year.toString());
            }
        });
    });

    return Array.from(years).sort((a, b) => b.localeCompare(a)); // Sort descending
};

// ============================================================
// ICON COMPONENTS
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
    // ============================================================
    // REDUX & ROUTER HOOKS
    // ============================================================
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const router = useRouter();

    // ============================================================
    // STATE DECLARATIONS
    // ============================================================
    const [isMounted, setIsMounted] = useState(false);
    const [loading, setLoading] = useState(true);

    // System Info State
    const [stats, setStats] = useState<StatCardData[]>([]);
    const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);

    // Finance Data State
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
        labels: string[];
        series: number[];
    }>({ labels: [], series: [] });

    // Income Category Chart State
    const [incomeCategoryChartData, setIncomeCategoryChartData] = useState<{
        labels: string[];
        series: number[];
    }>({ labels: [], series: [] });
    const [incomeCategorySelectedYear, setIncomeCategorySelectedYear] = useState<string>('2025');

    // Cost Category Chart State
    const [costCategoryChartData, setCostCategoryChartData] = useState<{
        labels: string[];
        series: number[];
    }>({ labels: [], series: [] });
    const [costCategorySelectedYear, setCostCategorySelectedYear] = useState<string>('2025');

    // Expense Category Chart State
    const [expenseCategoryChartData, setExpenseCategoryChartData] = useState<{
        labels: string[];
        series: number[];
    }>({ labels: [], series: [] });
    const [expenseCategorySelectedYear, setExpenseCategorySelectedYear] = useState<string>('2025');

    // Available Years & Raw Data
    const [availableYears, setAvailableYears] = useState<string[]>([]);
    const [rawBranchData, setRawBranchData] = useState<any[]>([]);

    // Finance Totals State
    const [financeTotals, setFinanceTotals] = useState({
        revenue: 0,
        cost: 0,
        profit: 0,
        profitMargin: '0.00',
    });

    // Yearly Profit Data State
    const [yearlyProfitData, setYearlyProfitData] = useState<{
        years: string[];
        profitData: number[];
    }>({ years: [], profitData: [] });

    // ============================================================
    // COMPUTED VALUES (useMemo)
    // ============================================================

    /**
     * Calculate year-wise totals for the yearly financial overview chart
     * This shows total Income, Cost, and Profit for each year
     */
    const yearlyFinancialSeries = useMemo(() => {
        if (!financeData) return [];

        const years = financeData.years;
        const revenueData: number[] = [];
        const costData: number[] = [];
        const profitData: number[] = [];

        years.forEach((year) => {
            const yearTotals = calculateYearTotals(financeData, year);
            revenueData.push(yearTotals.revenue);
            costData.push(yearTotals.cost);
            profitData.push(yearTotals.profit);
        });

        return [
            {
                name: 'Income',
                data: revenueData,
            },
            {
                name: 'Cost',
                data: costData,
            },
            {
                name: 'Profit',
                data: profitData,
            },
        ];
    }, [financeData]);

    /**
     * Calculate range totals for the selected year range
     */
    const rangeTotals = useMemo(() => {
        if (!financeData) {
            return { revenue: 0, cost: 0, profit: 0, profitMargin: '0.00', yearsIncluded: [] };
        }
        return calculateYearRangeTotals(financeData, startYear, endYear);
    }, [financeData, startYear, endYear]);

    // ============================================================
    // LIFECYCLE HOOKS (useEffect)
    // ============================================================

    /**
     * Component mount effect
     */
    useEffect(() => {
        setIsMounted(true);
    }, []);

    /**
     * Initial data fetch effect
     */
    useEffect(() => {
        fetchDashboardData();
    }, []);

    /**
     * Update chart when selected year changes
     */
    useEffect(() => {
        if (financeData && selectedYear) {
            updateChartForYear(selectedYear);
        }
    }, [selectedYear, financeData]);

    /**
     * Update company financial data when year changes
     */
    useEffect(() => {
        if (rawBranchData.length > 0 && companyFinancialYear) {
            updateCompanyFinancialChart(rawBranchData, companyFinancialYear);
        }
    }, [companyFinancialYear, rawBranchData]);

    // ============================================================
    // DATA FETCHING FUNCTIONS
    // ============================================================

    /**
     * Main function to fetch all dashboard data from APIs
     * Fetches system info and finance summary, then processes the data
     */
    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch both APIs in parallel
            const [systemInfoResponse, financeSummaryResponse] = await Promise.all([dashboardService.getSystemInfo(), getFinanceSummary()]);

            console.log('System Info:', systemInfoResponse);
            console.log('Finance Summary:', financeSummaryResponse);

            // Validate API responses
            if (systemInfoResponse?.data?.systemInfo && financeSummaryResponse?.data?.branches) {
                const systemInfo = systemInfoResponse.data.systemInfo;
                const branches = systemInfoResponse.data.branches || [];
                const financeBranches = financeSummaryResponse.data.branches || [];

                // Store raw branch data for category processing
                setRawBranchData(financeBranches);

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

                        // Calculate profit = income - expense
                        yearWiseTotals[year].totalProfit = yearWiseTotals[year].totalIncome - yearWiseTotals[year].totalExpense;
                    });
                });

                // ===== GET AVAILABLE YEARS FOR CATEGORY CHART =====
                const categoryYears = getAvailableYears(financeBranches);
                setAvailableYears(categoryYears);

                // Set initial year range
                if (categoryYears.length > 0) {
                    setStartYear(categoryYears[categoryYears.length - 1]); // Oldest year
                    setEndYear(categoryYears[0]); // Latest year
                }

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

                // Set initial year and update charts
                if (processed.years.length > 0) {
                    const latestYear = processed.years[0];
                    setSelectedYear(latestYear);
                    updateChartForYear(latestYear, processed);

                    // Get latest 5 years profit data for yearly profit chart
                    const profitChartData = getLatestYearsProfitData(processed, 5);
                    setYearlyProfitData(profitChartData);
                }

                // ===== UPDATE CATEGORY CHARTS =====
                if (categoryYears.length > 0) {
                    const latestYear = categoryYears[0];
                    setCompanyFinancialYear(latestYear);
                    setIncomeCategorySelectedYear(latestYear);
                    setCostCategorySelectedYear(latestYear);
                    setExpenseCategorySelectedYear(latestYear);

                    updateCompanyFinancialChart(financeBranches, latestYear);
                    updateIncomeCategoryChart(financeBranches, latestYear);
                    updateCostCategoryChart(financeBranches, latestYear);
                    updateExpenseCategoryChart(financeBranches, latestYear);
                }

                // ===== STORE ALL CALCULATED METRICS =====
                const calculatedMetrics = {
                    totalUniqueZones,
                    years,
                    yearWiseTotals,
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

                // ===== SET INITIAL SUMMARY YEAR DATA =====
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

    // ============================================================
    // CHART UPDATE FUNCTIONS
    // ============================================================

    /**
     * Update monthly chart data for a specific year
     */
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

    /**
     * Update income category chart for a specific year
     */
    const updateIncomeCategoryChart = (branches: any[], year: string) => {
        const categoryData = processCategoryTotalsForYear(branches, year);
        setIncomeCategoryChartData(categoryData);
    };

    /**
     * Update cost category chart for a specific year
     */
    const updateCostCategoryChart = (branches: any[], year: string) => {
        const expenseData = processExpenseCategoryTotalsForYear(branches, year);
        setCostCategoryChartData(expenseData);
    };

    /**
     * Update expense category chart for a specific year
     */
    const updateExpenseCategoryChart = (branches: any[], year: string) => {
        const expenseData = processExpenseCategoryTotalsForYear(branches, year);
        setExpenseCategoryChartData(expenseData);
    };

    /**
     * Update company financial overview chart for a specific year
     */
    const updateCompanyFinancialChart = (branches: any[], year: string) => {
        const financialData = processCompanyFinancialsByYear(branches, year);
        setCompanyFinancialData(financialData);
    };

    // ============================================================
    // EVENT HANDLERS
    // ============================================================

    /**
     * Handle year change for monthly financial overview chart
     */
    const handleYearChange = (year: string) => {
        setSelectedYear(year);
    };

    /**
     * Handle year change for summary bar
     */
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

    /**
     * Handle year change for income category chart
     */
    const handleIncomeCategoryYearChange = (year: string) => {
        setIncomeCategorySelectedYear(year);
        updateIncomeCategoryChart(rawBranchData, year);
    };

    /**
     * Handle year change for cost category chart
     */
    const handleCostCategoryYearChange = (year: string) => {
        setCostCategorySelectedYear(year);
        updateCostCategoryChart(rawBranchData, year);
    };

    /**
     * Handle year change for expense category chart
     */
    const handleExpenseCategoryYearChange = (year: string) => {
        setExpenseCategorySelectedYear(year);
        updateExpenseCategoryChart(rawBranchData, year);
    };

    /**
     * Handle year change for company financial overview chart
     */
    const handleCompanyFinancialYearChange = (year: string) => {
        setCompanyFinancialYear(year);
        updateCompanyFinancialChart(rawBranchData, year);
    };

    /**
     * Handle year change for zone chart
     */
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

    /**
     * Handle year range selection
     */
    const handleYearRangeSelect = (start: string, end: string) => {
        setStartYear(start);
        setEndYear(end);
    };

    /**
     * Handle stat card view report action
     */
    const handleViewReport = (index: number) => {
        const stat = stats[index];
        console.log('View report for:', stat.title);
    };

    /**
     * Handle stat card edit report action
     */
    const handleEditReport = (index: number) => {
        const stat = stats[index];
        console.log('Edit report for:', stat.title);
    };

    /**
     * Handle table view action
     */
    function handleTableView(): void {
        console.log('Table view action');
    }

    /**
     * Handle table delete action
     */
    function handleTableDelete(): void {
        console.log('Table delete action');
    }

    /**
     * Handle zone click - navigate to zone dashboard
     */
    const handleZoneClick = (row: TableRow, columnKey: string) => {
        if (columnKey === 'zone') {
            const zoneName = row.zone as string;
            // Convert zone name to URL-friendly format
            const zoneSlug = zoneName.toLowerCase().replace(/\s+/g, '-');

            // Navigate to zone-specific dashboard
            router.push(`/dashboard/zone/${encodeURIComponent(zoneSlug)}?name=${encodeURIComponent(zoneName)}`);
        }
    };

    // ============================================================
    // UTILITY FUNCTIONS
    // ============================================================

    /**
     * Get default stat cards for fallback
     */
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

    // ============================================================
    // TABLE CONFIGURATION
    // ============================================================

    /**
     * DataTable columns configuration for outstanding amount
     */
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

    /**
     * DataTable data for outstanding amount
     */
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

    /**
     * DataTable totals row for outstanding amount
     */
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

    /**
     * DataTable configuration for outstanding amount
     */
    const outstandingAmountConfig: DataTableConfig = {
        title: 'Outstanding Amount by Zone',
        showColorIndicator: true,
        showTotalRow: true,
    };

    // ============================================================
    // LOADING STATE
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
                {/* ============================================================ */}
                {/* BREADCRUMB NAVIGATION */}
                {/* ============================================================ */}
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
                    {/* ============================================================ */}
                    {/* ROW 1 - KPI STAT CARDS */}
                    {/* Total Zones, Schools, Students, Staff */}
                    {/* ============================================================ */}
                    <StatsGrid stats={stats} isRtl={isRtl} onViewReport={handleViewReport} onEditReport={handleEditReport} />

                    {/* ============================================================ */}
                    {/* ROW 2 - MONTHLY FINANCIAL OVERVIEW & COMPANY PIE CHART */}
                    {/* Left: Area Chart (Monthly Revenue/Cost by selected year) */}
                    {/* Right: Pie Chart (Income/Cost/Profit breakdown) */}
                    {/* ============================================================ */}
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
                                colors={['#00ab55', '#e7515a', '#4361ee']} // Green, Red, Blue
                            />
                        </div>
                    </div>

                    {/* ============================================================ */}
                    {/* ROW 3 - CATEGORY BREAKDOWN PIE CHARTS */}
                    {/* Left: Income by Category */}
                    {/* Center: Cost by Category */}
                    {/* Right: Expense by Category (Donut) */}
                    {/* ============================================================ */}
                    <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* Income By Category Chart */}
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

                        {/* Cost By Category Chart */}
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

                        {/* Expense Category PieChart (Donut) */}
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

                    {/* ============================================================ */}
                    {/* ROW 4 - YEARLY FINANCIAL OVERVIEW & PROFIT TREND */}
                    {/* Left: Area Chart (Yearly Income/Cost/Profit totals) */}
                    {/* Right: Bar Chart (5-year profit trend) */}
                    {/* ============================================================ */}
                    <div className="mb-6 grid gap-6 lg:grid-cols-3">
                        {/* Yearly Financial Overview - 2/3 width */}
                        <div className="lg:col-span-2">
                            <AreaChart
                                title="Yearly Financial Overview"
                                showYearFilter={false}
                                yearOptions={financeData?.years || []}
                                showDropdown={false}
                                series={yearlyFinancialSeries}
                                labels={financeData?.years || []}
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
                                series={[
                                    {
                                        name: 'Profit',
                                        data: yearlyProfitData.profitData,
                                    },
                                ]}
                                categories={yearlyProfitData.years}
                                height={325}
                                colors={['#00ab55']}
                            />
                        </div>
                    </div>

                    {/* ============================================================ */}
                    {/* ROW 5 - ZONE BAR CHART */}
                    {/* Income/Expense/Profit breakdown by zone */}
                    {/* ============================================================ */}
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

                    {/* ============================================================ */}
                    {/* ROW 6 - OUTSTANDING AMOUNT TABLE */}
                    {/* Clickable zone rows that navigate to zone dashboard */}
                    {/* ============================================================ */}
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

                    {/* ============================================================ */}
                    {/* ROW 7 - OUTSTANDING AMOUNT CHART */}
                    {/* Visual representation of outstanding amounts */}
                    {/* ============================================================ */}
                    <div className="mb-6">
                        <OutstandingAmountChart />
                    </div>
                </div>
            </div>
        </>
    );
}
