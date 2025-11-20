'use client';

// ============================================================
// IMPORTS (Reusing Finance Dashboard UI Components)
// ============================================================
import IconDollarSign from '@/components/icon/icon-dollar-sign';
import { IRootState } from '@/store';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Image from 'next/image';

// ============================================================
// ZONE SERVICE IMPORTS (Assuming these are structured as recommended)
// ============================================================
import { dashboardService, getFinanceSummary, Branch } from '@/services/sales/financeService'; // Core API fetchers & types

import {
    calculateZoneSystemInfo,
    processZoneFinancialData,
    calculateZoneYearTotals,
    getZoneChartSeriesForYear,
    processZoneCategoryTotalsForYear,
    processZoneExpenseCategoryTotalsForYear,
    ProcessedZoneFinancialData,
    ZoneSystemInfo,
} from '@/services/sales/zoneService'; // New Zone-specific logic
import { StatCardData, StatsGrid } from '@/components/widgets/main-dashboard/stat-card/StatCard';
import { TableRow } from '@/components/widgets/main-dashboard/table-data/DataTableWithFilters';
import SummaryBar from '@/components/widgets/SummaryBar';
import AreaChart from '@/components/widgets/main-dashboard/area-chart/Area-chart';
import PieChart from '@/components/widgets/main-dashboard/pie-chart/Pie-chart';
import BasicPieChart from '@/components/widgets/main-dashboard/basic-pie-chart/Basic-pie-chart';
import GrossNetProfit from '@/components/widgets/main-dashboard/sales/Gross-Net-profit';
import ZoneBar from '@/components/widgets/Zone-bar';
import { DataTable } from '@/components/widgets/main-dashboard/table-data/TableData';
import OutstandingAmountChart from '@/components/widgets/main-dashboard/sales/Amount-zone-chart';

// ============================================================
// ICON COMPONENTS (Reused)
// ============================================================

const IconDollar = () => (
    /* SVG definition */ <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const IconExpense = () => (
    /* SVG definition */ <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 8V5l6 7-6 7v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 8V5L2 12l6 7v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const IconProfit = () => (
    /* SVG definition */ <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// ============================================================
// MAIN ZONE DASHBOARD COMPONENT
// ============================================================

export default function ZoneDetailsDashboard() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    // The name of the zone (e.g., "HILL PARK")
    const zoneName = searchParams.get('name') || '';
    // The slug for URL purposes (e.g., "hill-park")
    const zoneSlug = params.slug as string;

    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    // ============================================================
    // STATE DECLARATIONS
    // ============================================================
    const [loading, setLoading] = useState(true);

    // Zone-Specific System Info
    const [zoneSystemInfo, setZoneSystemInfo] = useState<ZoneSystemInfo | null>(null);
    const [stats, setStats] = useState<StatCardData[]>([]);

    // Zone-Specific Financial Data
    const [zoneFinancialData, setZoneFinancialData] = useState<ProcessedZoneFinancialData | null>(null);
    const [availableYears, setAvailableYears] = useState<string[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [chartSeries, setChartSeries] = useState<any[]>([]);

    // Summary Bar Totals
    const [zoneTotals, setZoneTotals] = useState({
        revenue: 0,
        cost: 0,
        profit: 0,
        profitMargin: '0.00',
    });

    // Category Chart Data
    const [incomeCategoryChartData, setIncomeCategoryChartData] = useState<{ labels: string[]; series: number[] }>({ labels: [], series: [] });
    const [costCategoryChartData, setCostCategoryChartData] = useState<{ labels: string[]; series: number[] }>({ labels: [], series: [] });
    const [expenseCategoryChartData, setExpenseCategoryChartData] = useState<{ labels: string[]; series: number[] }>({ labels: [], series: [] });

    // Year selectors for category charts
    const [incomeCategorySelectedYear, setIncomeCategorySelectedYear] = useState<string>('');
    const [costCategorySelectedYear, setCostCategorySelectedYear] = useState<string>('');
    const [expenseCategorySelectedYear, setExpenseCategorySelectedYear] = useState<string>('');

    // ============================================================
    // LIFECYCLE & DATA FETCHING
    // ============================================================

    /**
     * Initial data fetch effect
     */
    useEffect(() => {
        if (zoneName) {
            fetchZoneDashboardData(zoneName);
        } else {
            setLoading(false);
        }
    }, [zoneName]);

    /**
     * Update charts when selected year or processed data changes
     */
    useEffect(() => {
        if (zoneFinancialData && selectedYear) {
            updateZoneChartsForYear(selectedYear);
        }
    }, [selectedYear, zoneFinancialData]);

    /**
     * Update category charts when initial data loads
     */
    useEffect(() => {
        if (zoneFinancialData && availableYears.length > 0) {
            const latestYear = availableYears[0];

            // Set initial year state for all charts
            setSelectedYear(latestYear);
            setIncomeCategorySelectedYear(latestYear);
            setCostCategorySelectedYear(latestYear);
            setExpenseCategorySelectedYear(latestYear);

            // Update category charts initially
            if (zoneFinancialData.zoneBranches.length > 0) {
                updateIncomeCategoryChart(zoneFinancialData.zoneBranches, latestYear);
                updateCostCategoryChart(zoneFinancialData.zoneBranches, latestYear);
                updateExpenseCategoryChart(zoneFinancialData.zoneBranches, latestYear);
            }
        }
    }, [zoneFinancialData, availableYears]);

    /**
     * Main function to fetch all dashboard data and process it for the selected zone
     */
    const fetchZoneDashboardData = async (zone: string) => {
        try {
            setLoading(true);

            // 1. Fetch raw data from APIs
            const [systemInfoResponse, financeSummaryResponse] = await Promise.all([dashboardService.getSystemInfo(), getFinanceSummary()]);

            const systemBranches = systemInfoResponse?.data?.branches || [];
            const financeBranches = financeSummaryResponse?.data?.branches || [];

            // 2. Process System Info (KPI Cards)
            const zoneInfo = calculateZoneSystemInfo(systemBranches, zone);
            setZoneSystemInfo(zoneInfo);
            updateStatCards(zoneInfo);

            // 3. Process Financial Data (Charts)
            const processedFinancials = processZoneFinancialData(financeBranches, zone);
            setZoneFinancialData(processedFinancials);

            // Set available years for filters
            setAvailableYears(processedFinancials.years);
        } catch (error) {
            console.error('Failed to fetch zone dashboard data:', error);
            // Fallback stats on error
            updateStatCards(getDefaultZoneInfo());
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // CHART & STATE UPDATE FUNCTIONS
    // ============================================================

    /**
     * Updates Stat Cards based on zone system info.
     */
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
                value: info.totalSchools.toLocaleString() || '0',
                valueSize: 'xl',
                gradient: 'bg-gradient-to-r from-violet-500 to-violet-400',
                icon: <Image src="/assets/images/icons/school.svg" alt="school" width={35} height={35} className="brightness-0 invert opacity-90" />,
                iconSize: 'xl',
            },
            {
                title: 'Total Students',
                value: info.totalStudents.toLocaleString() || '0',
                valueSize: 'xl',
                gradient: 'bg-gradient-to-r from-blue-500 to-blue-400',
                icon: <Image src="/assets/images/icons/students.svg" alt="student" width={35} height={35} className="brightness-0 invert opacity-90" />,
                iconSize: 'xl',
            },
            {
                title: 'Total Staff',
                value: info.totalStaff.toLocaleString() || '0',
                valueSize: 'xl',
                gradient: 'bg-gradient-to-b from-[#EF4649] to-[#F9797B]',
                icon: <Image src="/assets/images/icons/staff.svg" alt="staff" width={35} height={35} className="brightness-0 invert opacity-90" />,
                iconSize: 'xl',
            },
        ];
        setStats(updatedStats);
    };

    /**
     * Update monthly chart data and totals for a specific year in the zone.
     */
    const updateZoneChartsForYear = (year: string, data: ProcessedZoneFinancialData | null = null) => {
        const processedData = data || zoneFinancialData;
        if (!processedData) return;

        // Get chart series (monthly Revenue and Cost for the zone)
        const series = getZoneChartSeriesForYear(processedData, year);
        setChartSeries(series);

        // Calculate and set yearly totals for the Summary Bar
        const totals = calculateZoneYearTotals(processedData, year);
        setZoneTotals(totals);
    };

    /**
     * Update Income Category chart for the zone.
     */
    const updateIncomeCategoryChart = (zoneBranches: Branch[], year: string) => {
        const categoryData = processZoneCategoryTotalsForYear(zoneBranches, year);
        setIncomeCategoryChartData(categoryData);
    };

    /**
     * Update Cost Category chart for the zone.
     */
    const updateCostCategoryChart = (zoneBranches: Branch[], year: string) => {
        const expenseData = processZoneExpenseCategoryTotalsForYear(zoneBranches, year);
        setCostCategoryChartData(expenseData);
    };

    /**
     * Update Expense Category chart for the zone.
     */
    const updateExpenseCategoryChart = (zoneBranches: Branch[], year: string) => {
        const expenseData = processZoneExpenseCategoryTotalsForYear(zoneBranches, year);
        setExpenseCategoryChartData(expenseData);
    };

    // ============================================================
    // COMPUTED VALUES (Replicate Finance Dashboard's yearly trends)
    // ============================================================

    /**
     * Calculate year-wise totals for the zone's yearly financial overview chart
     */
    const yearlyFinancialSeries = useMemo(() => {
        if (!zoneFinancialData) return [];

        const years = zoneFinancialData.years;
        const revenueData: number[] = [];
        const costData: number[] = [];
        const profitData: number[] = [];

        years.forEach((year) => {
            const yearTotals = calculateZoneYearTotals(zoneFinancialData, year);
            revenueData.push(yearTotals.revenue);
            costData.push(yearTotals.cost);
            profitData.push(yearTotals.profit);
        });

        return [
            { name: 'Income', data: revenueData },
            { name: 'Cost', data: costData },
            { name: 'Profit', data: profitData },
        ];
    }, [zoneFinancialData]);

    /**
     * Calculate latest N years profit data for the zone's profit trend chart.
     */
    const zoneYearlyProfitData = useMemo(() => {
        if (!zoneFinancialData) return { years: [], profitData: [] };

        const numberOfYears = 5;
        const latestYears = zoneFinancialData.years.slice(0, numberOfYears).reverse(); // Oldest to newest

        const profitData = latestYears.map((year) => {
            const yearTotals = calculateZoneYearTotals(zoneFinancialData, year);
            return yearTotals.profit;
        });

        return { years: latestYears, profitData };
    }, [zoneFinancialData]);

    // ============================================================
    // EVENT HANDLERS
    // ============================================================

    const handleYearChange = (year: string) => {
        setSelectedYear(year);
    };

    const handleCategoryYearChange = (year: string, setter: React.Dispatch<React.SetStateAction<string>>, updater: (branches: Branch[], year: string) => void) => {
        setter(year);
        if (zoneFinancialData) {
            updater(zoneFinancialData.zoneBranches, year);
        }
    };

    // Placeholder for table cell click (no zone breakdown needed, maybe navigate to branch?)
    const handleTableClick = (row: TableRow, columnKey: string) => {
        if (columnKey === 'branch') {
            // Logic to navigate to branch-specific dashboard
            console.log('Navigating to Branch dashboard:', row.branch);
        }
    };

    // ============================================================
    // UTILITY/FALLBACK
    // ============================================================

    const getDefaultZoneInfo = (): ZoneSystemInfo => ({
        totalBranches: 0,
        totalSchools: 0,
        totalStudents: 0,
        totalStaff: 0,
    });

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
    // RENDER - ZONE DASHBOARD
    // ============================================================

    const chartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

                    {/* Summary Bar for current selected year */}
                    {/* <SummaryBar
                        title={`Financial Summary for ${selectedYear}`}
                        revenue={zoneTotals.revenue}
                        cost={zoneTotals.cost}
                        profit={zoneTotals.profit}
                        profitMargin={zoneTotals.profitMargin}
                        iconRevenue={<IconDollar />}
                        iconCost={<IconExpense />}
                        iconProfit={<IconProfit />}
                    /> */}

                    {/* ROW 2 - MONTHLY FINANCIAL OVERVIEW & BRANCH FINANCIAL OVERVIEW (Replaces Company Pie Chart) */}
                    <div className="mb-6 grid gap-6 lg:grid-cols-3">
                        {/* Monthly Financial Overview - 2/3 width */}
                        <div className="lg:col-span-2">
                            <AreaChart
                                title={`Monthly Financial Overview (${selectedYear})`}
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

                        {/* Branch Financial Overview - 1/3 width (Replaces Company Pie Chart) */}
                        <div className="lg:col-span-1">
                            {/* NOTE: You'll need a service function to process branch-wise income/cost/profit for this zone and year */}
                            <PieChart
                                title="Branch Financial Breakdown"
                                series={[/* branch profit series */ 100000, 50000, 25000]}
                                labels={['Branch A', 'Branch B', 'Branch C']}
                                height={340}
                                showDropdown={false}
                                showYearFilter={true}
                                yearOptions={availableYears}
                                selectedYear={selectedYear}
                                onYearChange={handleYearChange} // Reuse handler
                                colors={['#00ab55', '#e7515a', '#4361ee']}
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
                            height={340}
                            showYearFilter={true}
                            yearOptions={availableYears}
                            selectedYear={incomeCategorySelectedYear}
                            onYearChange={(year) => handleCategoryYearChange(year, setIncomeCategorySelectedYear, updateIncomeCategoryChart)}
                            showDropdown={false}
                        />

                        {/* Cost By Category Chart */}
                        <BasicPieChart
                            chartTitle="Cost By Category (Zone)"
                            series={costCategoryChartData.series}
                            labels={costCategoryChartData.labels}
                            height={340}
                            showYearFilter={true}
                            yearOptions={availableYears}
                            selectedYear={costCategorySelectedYear}
                            onYearChange={(year) => handleCategoryYearChange(year, setCostCategorySelectedYear, updateCostCategoryChart)}
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
                                onYearChange={(year) => handleCategoryYearChange(year, setExpenseCategorySelectedYear, updateExpenseCategoryChart)}
                            />
                        </div>
                    </div>

                    {/* ROW 4 - YEARLY FINANCIAL OVERVIEW & PROFIT TREND (Zone Specific) */}
                    <div className="mb-6 grid gap-6 lg:grid-cols-3">
                        {/* Yearly Financial Overview - 2/3 width */}
                        <div className="lg:col-span-2">
                            <AreaChart title={`${zoneName} Yearly Financial Overview`} showYearFilter={false} series={yearlyFinancialSeries} labels={zoneFinancialData?.years || []} height={325} />
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
                        {/* NOTE: You'll need a service function to process branch-wise income/cost/profit for this zone and year */}
                        <ZoneBar // Reusing ZoneBar component for Branch data
                            chartTitle={`Branch Financial Breakdown (${selectedYear})`}
                            series={[
                                { name: 'INCOME', data: [150000, 120000, 90000] },
                                { name: 'EXPENSE', data: [50000, 40000, 30000] },
                                { name: 'PROFIT', data: [100000, 80000, 60000] },
                            ]}
                            categories={['Branch X', 'Branch Y', 'Branch Z']}
                            colors={['#10b981', '#ef4444', '#8b5cf6']}
                            negativeColor="#FF4757"
                            showYearFilter={true}
                            yearOptions={availableYears}
                            onYearSelect={handleYearChange}
                        />
                    </div>

                    {/* ROW 6 - OUTSTANDING AMOUNT TABLE (Zone/Branch Specific) */}
                    <div className="mb-6">
                        {/* NOTE: This data needs to be filtered/fetched for the specific zone */}
                        <DataTable
                            columns={[
                                { key: 'branch', label: 'Branch', align: 'left', width: '200px', clickable: true },
                                { key: 'total', label: 'Outstanding Total', align: 'center' },
                                // Add monthly columns if needed
                            ]}
                            data={[
                                { branch: 'Branch X School 1', total: 'RM 10,000', color: 'blue' },
                                { branch: 'Branch Y School 2', total: 'RM 5,000', color: 'purple' },
                            ]}
                            totals={{ branch: 'Total', total: 'RM 15,000' }}
                            config={{ title: `Outstanding Amount by Branch in ${zoneName}`, showColorIndicator: true, showTotalRow: true }}
                            isRtl={isRtl}
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
