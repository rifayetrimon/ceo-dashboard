'use client';

// ============================================================
// IMPORTS
// ============================================================
import IconDollarSign from '@/components/icon/icon-dollar-sign';
import { IRootState } from '@/store';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Image from 'next/image';

// ============================================================
// SERVICE IMPORTS
// ============================================================
import { dashboardService, getFinanceSummary, Branch } from '@/services/sales/financeService';

import {
    calculateZoneSystemInfo,
    processZoneFinancialData,
    calculateZoneYearTotals,
    getZoneChartSeriesForYear,
    processZoneCategoryTotalsForYear,
    processZoneExpenseCategoryTotalsForYear,
    processZoneCompanyFinancialsByYear,
    getZoneYearlyFinancialSeries,
    getLatestYearsZoneProfitData,
    getZoneBranchComparisonData,
    ProcessedZoneFinancialData,
    ZoneSystemInfo,
} from '@/services/sales/zoneService';

// ============================================================
// COMPONENT IMPORTS
// ============================================================
import { StatCardData, StatsGrid } from '@/components/widgets/main-dashboard/stat-card/StatCard';
import { DataTable, DataTableConfig, TableColumn, TableRow } from '@/components/widgets/main-dashboard/table-data/TableData';
import AreaChart from '@/components/widgets/main-dashboard/area-chart/Area-chart';
import PieChart from '@/components/widgets/main-dashboard/pie-chart/Pie-chart';
import BasicPieChart from '@/components/widgets/main-dashboard/basic-pie-chart/Basic-pie-chart';
import GrossNetProfit from '@/components/widgets/main-dashboard/sales/Gross-Net-profit';
import ZoneBar from '@/components/widgets/Zone-bar';

// ============================================================
// ICON COMPONENTS
// ============================================================

const IconDollar = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// ============================================================
// HELPER FUNCTIONS (Outstanding Amount Logic FIX)
// ============================================================

const getDefaultZoneInfo = (): ZoneSystemInfo => ({
    totalBranches: 0,
    totalSchools: 0,
    totalStudents: 0,
    totalStaff: 0,
});

/**
 * Calculate outstanding amounts by branch for the zone
 * NOTE: Using 'monthly_revenue' as a placeholder for outstanding amount.
 */
const calculateOutstandingAmountsByBranch = (zoneBranches: Branch[], systemBranches: any[], year: number): { tableData: TableRow[]; totalsRow: TableRow } => {
    const branchMap = new Map<string, { months: number[]; total: number; color: string; branchName: string }>();
    const colors = ['#4361ee', '#00ab55', '#e2a03f', '#e7515a', '#805dca', '#2196f3', '#10b981', '#f3504d'];
    let colorIndex = 0;

    // Helper to format currency consistently
    const formatRm = (value: number) => `RM ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Initialize & calculate branch data
    zoneBranches.forEach((financeBranch) => {
        // Assume branchId is the unique key for joining systemBranches
        const sysBranch = systemBranches.find((sb) => sb.branchId === financeBranch.branchId);
        if (!sysBranch) return;

        const branchId = financeBranch.branchId.toString();
        const branchName = sysBranch.name || sysBranch.code || 'Unknown';

        // Initialize/Update Map entry
        if (!branchMap.has(branchId)) {
            branchMap.set(branchId, {
                months: new Array(12).fill(0),
                total: 0,
                color: colors[colorIndex % colors.length],
                branchName: branchName,
            });
            colorIndex++;
        }

        const branchData = branchMap.get(branchId)!;

        // Calculate outstanding amounts using revenue data
        const yearRevenue = financeBranch.monthly_revenue?.find((y: any) => y.year === year);
        if (yearRevenue) {
            yearRevenue.records.forEach((record: any) => {
                const monthIndex = record.month - 1;
                if (monthIndex >= 0 && monthIndex < 12) {
                    // Placeholder: Replace 'record.total' with the actual outstanding amount field
                    branchData.months[monthIndex] += record.total || 0;
                }
            });
        }
    });

    // Convert to table data format (showing first 7 months)
    const tableData: TableRow[] = [];
    const monthTotals = new Array(8).fill(0); // 7 months + total

    branchMap.forEach((data, branchId) => {
        const rowTotal = data.months.slice(0, 7).reduce((sum, val) => sum + val, 0);

        const row: TableRow = {
            branch: data.branchName,
            branchId: branchId,
            monthLabel: '',
            january: formatRm(data.months[0]),
            february: formatRm(data.months[1]),
            march: formatRm(data.months[2]),
            april: formatRm(data.months[3]),
            may: formatRm(data.months[4]),
            june: formatRm(data.months[5]),
            july: formatRm(data.months[6]),
            total: formatRm(rowTotal),
            color: data.color, // <-- FIX: Ensure this is correctly set
        };

        tableData.push(row);

        // Accumulate totals
        for (let i = 0; i < 7; i++) {
            monthTotals[i] += data.months[i];
        }
        monthTotals[7] += rowTotal;
    });

    // Create totals row
    const totalsRow: TableRow = {
        branch: 'Total',
        monthLabel: '',
        january: formatRm(monthTotals[0]),
        february: formatRm(monthTotals[1]),
        march: formatRm(monthTotals[2]),
        april: formatRm(monthTotals[3]),
        may: formatRm(monthTotals[4]),
        june: formatRm(monthTotals[5]),
        july: formatRm(monthTotals[6]),
        total: formatRm(monthTotals[7]),
    };

    return { tableData, totalsRow };
};

const OutstandingAmountChart = () => (
    <div className="panel flex justify-center items-center h-full min-h-[340px]">
        <p className="text-gray-500">Outstanding Amount Chart Placeholder (Zone-Specific Data Integration Required)</p>
    </div>
);

// ============================================================
// MAIN ZONE DASHBOARD COMPONENT
// ============================================================

export default function ZoneDetailsDashboard() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Zone identification
    const zoneName = searchParams.get('name') || '';
    const zoneSlug = params.slug as string;

    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    // ============================================================
    // STATE DECLARATIONS
    // ============================================================
    const [loading, setLoading] = useState(true);

    // System Info
    const [zoneSystemInfo, setZoneSystemInfo] = useState<ZoneSystemInfo | null>(null);
    const [stats, setStats] = useState<StatCardData[]>([]);

    // Financial Data
    const [zoneFinancialData, setZoneFinancialData] = useState<ProcessedZoneFinancialData | null>(null);
    const [availableYears, setAvailableYears] = useState<string[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [chartSeries, setChartSeries] = useState<any[]>([]);

    // Totals
    const [zoneTotals, setZoneTotals] = useState({
        revenue: 0,
        cost: 0,
        profit: 0,
        profitMargin: '0.00',
    });

    // Category Charts
    const [incomeCategoryChartData, setIncomeCategoryChartData] = useState<{ labels: string[]; series: number[] }>({
        labels: [],
        series: [],
    });
    const [costCategoryChartData, setCostCategoryChartData] = useState<{ labels: string[]; series: number[] }>({
        labels: [],
        series: [],
    });
    const [expenseCategoryChartData, setExpenseCategoryChartData] = useState<{ labels: string[]; series: number[] }>({
        labels: [],
        series: [],
    });

    // Company Financial Data (Zone Financial Pie)
    const [zoneFinancialPieData, setZoneFinancialPieData] = useState<{ labels: string[]; series: number[] }>({
        labels: [],
        series: [],
    });

    // Year selectors
    const [incomeCategorySelectedYear, setIncomeCategorySelectedYear] = useState<string>('');
    const [costCategorySelectedYear, setCostCategorySelectedYear] = useState<string>('');
    const [expenseCategorySelectedYear, setExpenseCategorySelectedYear] = useState<string>('');
    const [zoneFinancialPieYear, setZoneFinancialPieYear] = useState<string>('');

    // Branch Comparison Data
    const [branchComparisonData, setBranchComparisonData] = useState<{
        categories: string[];
        series: any[];
    }>({ categories: [], series: [] });
    const [branchComparisonYear, setBranchComparisonYear] = useState<string>('');

    // Outstanding Amount Table
    const [outstandingAmountData, setOutstandingAmountData] = useState<TableRow[]>([]);
    const [outstandingAmountTotals, setOutstandingAmountTotals] = useState<TableRow>(
        calculateOutstandingAmountsByBranch([], [], 0).totalsRow, // Default empty totals
    );
    const [outstandingTableYear, setOutstandingTableYear] = useState<string>('');

    // Raw data
    const [systemBranches, setSystemBranches] = useState<any[]>([]);

    // ============================================================
    // LIFECYCLE & DATA FETCHING
    // ============================================================

    useEffect(() => {
        if (zoneName) {
            fetchZoneDashboardData(zoneName);
        } else {
            setLoading(false);
        }
    }, [zoneName]);

    // Initial chart and state setup once data is processed
    useEffect(() => {
        if (zoneFinancialData && zoneFinancialData.years.length > 0 && systemBranches.length > 0) {
            const latestYear = zoneFinancialData.years[0];

            // Set all initial year states
            setSelectedYear(latestYear);
            setIncomeCategorySelectedYear(latestYear);
            setCostCategorySelectedYear(latestYear);
            setExpenseCategorySelectedYear(latestYear);
            setZoneFinancialPieYear(latestYear);
            setBranchComparisonYear(latestYear);
            setOutstandingTableYear(latestYear);
        }
    }, [zoneFinancialData, systemBranches]);

    // Handlers for year changes: Category Pie Charts, Financial Pie, Branch Comparison, Outstanding Table
    useEffect(() => {
        if (!zoneFinancialData) return;
        const { zoneBranches } = zoneFinancialData;

        // Update charts/tables based on their specific year state
        if (zoneBranches.length > 0) {
            // Check if selected year is part of the zone's available years before attempting update
            if (selectedYear) updateZoneChartsForYear(selectedYear); // Monthly Area Chart & Totals
            if (incomeCategorySelectedYear) updateIncomeCategoryChart(zoneBranches, incomeCategorySelectedYear);
            if (costCategorySelectedYear) updateCostCategoryChart(zoneBranches, costCategorySelectedYear);
            if (expenseCategorySelectedYear) updateExpenseCategoryChart(zoneBranches, expenseCategorySelectedYear);
            if (zoneFinancialPieYear) updateZoneFinancialPieChart(zoneBranches, zoneFinancialPieYear);
            if (branchComparisonYear) updateBranchComparisonChart(zoneBranches, systemBranches, branchComparisonYear);
            if (outstandingTableYear) updateOutstandingAmountTable(zoneBranches, systemBranches, parseInt(outstandingTableYear));
        }
    }, [selectedYear, incomeCategorySelectedYear, costCategorySelectedYear, expenseCategorySelectedYear, zoneFinancialPieYear, branchComparisonYear, outstandingTableYear]);

    /**
     * Main function to fetch all dashboard data
     */
    const fetchZoneDashboardData = async (zone: string) => {
        try {
            setLoading(true);

            const [systemInfoResponse, financeSummaryResponse] = await Promise.all([dashboardService.getSystemInfo(), getFinanceSummary()]);

            const allSystemBranches = systemInfoResponse?.data?.branches || [];
            const financeBranches = financeSummaryResponse?.data?.branches || [];

            setSystemBranches(allSystemBranches);

            // Calculate zone system info
            const zoneInfo = calculateZoneSystemInfo(allSystemBranches, zone);
            setZoneSystemInfo(zoneInfo);
            updateStatCards(zoneInfo);

            // Process zone financial data
            const processedFinancials = processZoneFinancialData(financeBranches, allSystemBranches, zone);
            setZoneFinancialData(processedFinancials);
            setAvailableYears(processedFinancials.years);
        } catch (error) {
            console.error('Failed to fetch zone dashboard data:', error);
            updateStatCards(getDefaultZoneInfo());
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // CHART UPDATE FUNCTIONS
    // ============================================================

    const updateStatCards = (info: ZoneSystemInfo) => {
        const updatedStats: StatCardData[] = [
            {
                title: 'Total Branches',
                value: info.totalBranches.toString(),
                valueSize: 'xl',
                gradient: 'bg-gradient-to-r from-cyan-500 to-cyan-400',
                icon: <Image src="/assets/images/icons/zone1.svg" alt="branches" width={35} height={35} className="brightness-0 invert opacity-90" />,
                iconSize: 'xl',
            },
            {
                title: 'Total Schools',
                value: info.totalSchools.toLocaleString(),
                valueSize: 'xl',
                gradient: 'bg-gradient-to-r from-violet-500 to-violet-400',
                icon: <Image src="/assets/images/icons/school.svg" alt="school" width={35} height={35} className="brightness-0 invert opacity-90" />,
                iconSize: 'xl',
            },
            {
                title: 'Total Students',
                value: info.totalStudents.toLocaleString(),
                valueSize: 'xl',
                gradient: 'bg-gradient-to-r from-blue-500 to-blue-400',
                icon: <Image src="/assets/images/icons/students.svg" alt="student" width={35} height={35} className="brightness-0 invert opacity-90" />,
                iconSize: 'xl',
            },
            {
                title: 'Total Staff',
                value: info.totalStaff.toLocaleString(),
                valueSize: 'xl',
                gradient: 'bg-gradient-to-b from-[#EF4649] to-[#F9797B]',
                icon: <Image src="/assets/images/icons/staff.svg" alt="staff" width={35} height={35} className="brightness-0 invert opacity-90" />,
                iconSize: 'xl',
            },
        ];
        setStats(updatedStats);
    };

    const updateZoneChartsForYear = (year: string, data: ProcessedZoneFinancialData | null = null) => {
        const processedData = data || zoneFinancialData;
        if (!processedData) return;

        const series = getZoneChartSeriesForYear(processedData, year, true, true, false);
        setChartSeries(series);

        const totals = calculateZoneYearTotals(processedData, year);
        setZoneTotals(totals);
    };

    const updateIncomeCategoryChart = (zoneBranches: Branch[], year: string) => {
        const categoryData = processZoneCategoryTotalsForYear(zoneBranches, year);
        setIncomeCategoryChartData(categoryData);
    };

    const updateCostCategoryChart = (zoneBranches: Branch[], year: string) => {
        const expenseData = processZoneExpenseCategoryTotalsForYear(zoneBranches, year);
        setCostCategoryChartData(expenseData);
    };

    const updateExpenseCategoryChart = (zoneBranches: Branch[], year: string) => {
        const expenseData = processZoneExpenseCategoryTotalsForYear(zoneBranches, year);
        setExpenseCategoryChartData(expenseData);
    };

    const updateZoneFinancialPieChart = (zoneBranches: Branch[], year: string) => {
        const financialData = processZoneCompanyFinancialsByYear(zoneBranches, year);
        setZoneFinancialPieData(financialData);
    };

    const updateBranchComparisonChart = (zoneBranches: Branch[], allSystemBranches: any[], year: string) => {
        const comparisonData = getZoneBranchComparisonData(zoneBranches, allSystemBranches, year);
        setBranchComparisonData(comparisonData);
    };

    const updateOutstandingAmountTable = (zoneBranches: Branch[], allSystemBranches: any[], year: number) => {
        const { tableData, totalsRow } = calculateOutstandingAmountsByBranch(zoneBranches, allSystemBranches, year);
        setOutstandingAmountData(tableData);
        setOutstandingAmountTotals(totalsRow);
    };

    // ============================================================
    // COMPUTED VALUES
    // ============================================================

    const yearlyFinancialSeries = useMemo(() => {
        if (!zoneFinancialData) return [];
        const result = getZoneYearlyFinancialSeries(zoneFinancialData);
        // Only return the series part of the result
        return result && result.series ? result.series : [];
    }, [zoneFinancialData]);

    const zoneYearlyProfitData = useMemo(() => {
        if (!zoneFinancialData) return { years: [], profitData: [] };
        return getLatestYearsZoneProfitData(zoneFinancialData, 5);
    }, [zoneFinancialData]);

    // ============================================================
    // EVENT HANDLERS
    // ============================================================

    /**
     * Handle year change for monthly financial overview chart
     */
    const handleYearChange = (year: string) => {
        setSelectedYear(year);
    };

    const handleIncomeCategoryYearChange = (year: string) => setIncomeCategorySelectedYear(year);
    const handleCostCategoryYearChange = (year: string) => setCostCategorySelectedYear(year);
    const handleExpenseCategoryYearChange = (year: string) => setExpenseCategorySelectedYear(year);
    const handleZoneFinancialPieYearChange = (year: string) => setZoneFinancialPieYear(year);
    const handleBranchComparisonYearChange = (year: string) => setBranchComparisonYear(year);
    const handleOutstandingTableYearChange = (year: string) => setOutstandingTableYear(year);

    const handleTableClick = (row: TableRow, columnKey: string) => {
        if (columnKey === 'branch') {
            console.log('Navigate to branch dashboard:', row.branch);
            // router.push(`/dashboard/branch/${row.branchId}`);
        }
    };

    // ============================================================
    // TABLE CONFIGURATION
    // ============================================================

    const outstandingAmountColumns: TableColumn[] = [
        { key: 'branch', label: 'Branch', align: 'left', width: '200px', clickable: true },
        { key: 'monthLabel', label: `Outstanding Amount (${outstandingTableYear})`, align: 'center', width: '200px' },
        { key: 'january', label: 'Jan', align: 'center' },
        { key: 'february', label: 'Feb', align: 'center' },
        { key: 'march', label: 'Mar', align: 'center' },
        { key: 'april', label: 'Apr', align: 'center' },
        { key: 'may', label: 'May', align: 'center' },
        { key: 'june', label: 'Jun', align: 'center' },
        { key: 'july', label: 'Jul', align: 'center' },
        { key: 'total', label: 'Total', align: 'center' },
    ];

    const outstandingAmountConfig: DataTableConfig = {
        title: `Outstanding Amount by Branch in ${zoneName}`,
        showColorIndicator: true, // This enables the color indicator
        showTotalRow: true,
        showYearFilter: true,
        yearOptions: availableYears,
        selectedYear: outstandingTableYear,
        onYearChange: handleOutstandingTableYearChange,
    };

    // ============================================================
    // LOADING STATE
    // ============================================================

    if (loading || !zoneName) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <span className="ml-3">Loading data for {zoneName || zoneSlug}...</span>
            </div>
        );
    }

    // ============================================================
    // RENDER
    // ============================================================

    const chartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const zoneYearlyChartLabels = getZoneYearlyFinancialSeries(zoneFinancialData!)?.years || [];

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
                        <Link href="/dashboard/finance" className="text-primary hover:underline">
                            Finance
                        </Link>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <span>{zoneName} Zone Overview</span>
                    </li>
                </ul>

                <h1 className="text-2xl font-bold mt-5 mb-6">Finance Dashboard: {zoneName} Zone</h1>

                <div className="pt-5">
                    {/* ROW 1 - KPI STAT CARDS: Total Branches, Schools, Students, Staff in Zone */}
                    <StatsGrid stats={stats} isRtl={isRtl} onViewReport={() => {}} onEditReport={() => {}} />

                    {/* ROW 2 - MONTHLY FINANCIAL OVERVIEW & ZONE FINANCIAL PIE CHART */}
                    <div className="mb-6 grid gap-6 lg:grid-cols-3">
                        {/* Monthly Financial Overview - 2/3 width */}
                        <div className="lg:col-span-2">
                            <AreaChart
                                title={`Monthly Financial Overview (${selectedYear})`}
                                showDropdown={false}
                                showYearFilter={true}
                                yearOptions={availableYears}
                                series={chartSeries}
                                labels={chartLabels}
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

                        {/* Zone Financial Overview - 1/3 width (Income/Cost/Profit Pie) */}
                        <div className="lg:col-span-1">
                            <PieChart
                                title={`${zoneName} Financial Overview`}
                                series={zoneFinancialPieData.series}
                                labels={zoneFinancialPieData.labels}
                                height={340}
                                showDropdown={false}
                                showYearFilter={true}
                                yearOptions={availableYears}
                                selectedYear={zoneFinancialPieYear}
                                onYearChange={handleZoneFinancialPieYearChange}
                                dropdownOptions={['View Report', 'Export Data', 'Share Chart']}
                                onDropdownSelect={(option) => {
                                    console.log('Selected:', option);
                                }}
                                colors={['#00ab55', '#e7515a', '#4361ee']} // Green, Red, Blue
                            />
                        </div>
                    </div>

                    {/* ROW 3 - CATEGORY BREAKDOWN PIE CHARTS (Zone Specific) */}
                    <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* Income By Category Chart */}
                        <BasicPieChart
                            chartTitle="Income By Category (Zone)"
                            series={incomeCategoryChartData.series}
                            labels={incomeCategoryChartData.labels}
                            colors={['#00ab55', '#4361ee', '#805dca', '#e2a03f', '#e7515a', '#2196f3']}
                            height={340}
                            showYearFilter={true}
                            yearOptions={availableYears}
                            selectedYear={incomeCategorySelectedYear}
                            onYearChange={handleIncomeCategoryYearChange}
                            showDropdown={false}
                        />

                        {/* Cost By Category Chart */}
                        <BasicPieChart
                            chartTitle="Cost By Category (Zone)"
                            series={costCategoryChartData.series}
                            labels={costCategoryChartData.labels}
                            colors={['#e7515a', '#e2a03f', '#805dca', '#4361ee', '#2196f3', '#00ab55']}
                            height={340}
                            showYearFilter={true}
                            yearOptions={availableYears}
                            selectedYear={costCategorySelectedYear}
                            onYearChange={handleCostCategoryYearChange}
                            showDropdown={false}
                        />

                        {/* Expense Category PieChart (Donut) */}
                        <div className="md:col-span-2 lg:col-span-1">
                            <PieChart
                                title="Expense By Category (Zone)"
                                series={expenseCategoryChartData.series}
                                labels={expenseCategoryChartData.labels}
                                height={340}
                                showDropdown={false}
                                showYearFilter={true}
                                yearOptions={availableYears}
                                selectedYear={expenseCategorySelectedYear}
                                onYearChange={handleExpenseCategoryYearChange}
                            />
                        </div>
                    </div>

                    {/* ROW 4 - YEARLY FINANCIAL OVERVIEW & PROFIT TREND (Zone Specific) */}
                    <div className="mb-6 grid gap-6 lg:grid-cols-3">
                        {/* Yearly Financial Overview - 2/3 width */}
                        <div className="lg:col-span-2">
                            <AreaChart
                                title={`${zoneName} Yearly Financial Overview`}
                                showYearFilter={false}
                                series={yearlyFinancialSeries}
                                labels={zoneYearlyChartLabels}
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
                                title={`${zoneName} Profit Trend`}
                                subtitle="Last 5 years profit overview"
                                icon={<IconDollarSign />}
                                series={[{ name: 'Profit', data: zoneYearlyProfitData.profitData }]}
                                categories={zoneYearlyProfitData.years}
                                height={325}
                                colors={['#00ab55']}
                            />
                        </div>
                    </div>

                    {/* ROW 5 - BRANCH BAR CHART (Replaces Zone Bar Chart) */}
                    <div className="mb-6">
                        {branchComparisonData.categories.length > 0 ? (
                            <ZoneBar // Reusing ZoneBar component for Branch data
                                chartTitle={`Branch Financial Breakdown (${branchComparisonYear})`}
                                series={branchComparisonData.series}
                                categories={branchComparisonData.categories}
                                colors={['#10b981', '#ef4444', '#8b5cf6']}
                                negativeColor="#FF4757"
                                showYearFilter={true}
                                yearOptions={availableYears}
                                onYearSelect={handleBranchComparisonYearChange}
                            />
                        ) : (
                            <div className="panel p-5">
                                <div className="flex items-center justify-center">
                                    <span className="text-gray-500">
                                        No Branch Financial Data Available for {zoneName} in {branchComparisonYear}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ROW 6 - OUTSTANDING AMOUNT TABLE (Zone/Branch Specific) */}
                    <div className="mb-6">
                        <DataTable
                            columns={outstandingAmountColumns}
                            data={outstandingAmountData}
                            totals={outstandingAmountTotals}
                            config={outstandingAmountConfig}
                            isRtl={isRtl}
                            onViewReport={() => {}}
                            onEditReport={() => {}}
                            onDeleteReport={() => {}}
                            onCellClick={handleTableClick} // Use branch click handler
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
