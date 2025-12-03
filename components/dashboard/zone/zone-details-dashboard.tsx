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
import { dashboardService, getFinanceSummary, getFinanceOutstandingAmount, Branch, FinanceDataRow } from '@/services/sales/financeService';

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
import OutstandingAmountChart from '@/components/widgets/main-dashboard/sales/Amount-zone-chart';

// ============================================================
// ICON COMPONENTS
// ============================================================

const IconDollar = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const getDefaultZoneInfo = (): ZoneSystemInfo => ({
    totalBranches: 0,
    totalSchools: 0,
    totalStudents: 0,
    totalStaff: 0,
});

/**
 * Calculate outstanding amounts by BRANCH using the new API structure
 * Maps data to 'month_' keys for the slider table.
 */
const calculateOutstandingAmountsByBranch = (outstandingBranches: any[], systemBranches: any[], zoneName: string, year: number): { tableData: FinanceDataRow[]; totalsRow: FinanceDataRow } => {
    // 1. Identify System Branches in this Zone
    const zoneBranchMap = new Map<number, string>(); // BranchId -> BranchName
    systemBranches.forEach((sb) => {
        const sbZone = sb.zoneName?.trim() || sb.zone?.trim();
        if (sbZone && sbZone.toUpperCase() === zoneName.toUpperCase()) {
            zoneBranchMap.set(sb.branchId, sb.name || sb.code || 'Unknown Branch');
        }
    });

    const branchDataMap = new Map<string, { months: number[]; total: number; color: string; branchName: string; branchId: string }>();
    const colors = ['#4361ee', '#00ab55', '#e2a03f', '#e7515a', '#805dca', '#2196f3', '#10b981', '#f3504d'];
    let colorIndex = 0;

    // 2. Initialize Map for Found Branches
    zoneBranchMap.forEach((name, id) => {
        branchDataMap.set(id.toString(), {
            months: new Array(12).fill(0),
            total: 0,
            color: colors[colorIndex % colors.length],
            branchName: name,
            branchId: id.toString(),
        });
        colorIndex++;
    });

    // 3. Aggregate Data from Outstanding API
    outstandingBranches.forEach((branch) => {
        if (!zoneBranchMap.has(branch.branchId)) return; // Skip if not in this zone

        const data = branchDataMap.get(branch.branchId.toString());
        if (!data) return;

        // Use 'monthly_outstanding' from API
        const yearData = branch.monthly_outstanding?.find((y: any) => y.year === year);
        if (yearData && yearData.records) {
            yearData.records.forEach((record: any) => {
                const monthIndex = record.month - 1;
                if (monthIndex >= 0 && monthIndex < 12) {
                    data.months[monthIndex] += record.total || 0;
                }
            });
        }
    });

    // 4. Build Table Rows
    const tableData: FinanceDataRow[] = [];
    const monthTotals = new Array(12).fill(0);
    let grandTotal = 0;

    branchDataMap.forEach((data, id) => {
        const rowTotal = data.months.reduce((sum, val) => sum + val, 0);
        grandTotal += rowTotal;

        data.months.forEach((val, idx) => {
            monthTotals[idx] += val;
        });

        // Using 'month_' keys for slider compatibility
        const row: FinanceDataRow = {
            zone: data.branchName, // Mapping branch name to 'zone' key for table/chart compatibility
            branchId: id,
            zoneCode: id,
            color: data.color,
            month_january: data.months[0],
            month_february: data.months[1],
            month_march: data.months[2],
            month_april: data.months[3],
            month_may: data.months[4],
            month_june: data.months[5],
            month_july: data.months[6],
            month_august: data.months[7],
            month_september: data.months[8],
            month_october: data.months[9],
            month_november: data.months[10],
            month_december: data.months[11],
            total: rowTotal,
        };
        tableData.push(row);
    });

    // 5. Build Totals Row
    const totalsRow: FinanceDataRow = {
        zone: 'Total',
        month_january: monthTotals[0],
        month_february: monthTotals[1],
        month_march: monthTotals[2],
        month_april: monthTotals[3],
        month_may: monthTotals[4],
        month_june: monthTotals[5],
        month_july: monthTotals[6],
        month_august: monthTotals[7],
        month_september: monthTotals[8],
        month_october: monthTotals[9],
        month_november: monthTotals[10],
        month_december: monthTotals[11],
        total: grandTotal,
    };

    return { tableData, totalsRow };
};

// ============================================================
// MAIN ZONE DASHBOARD COMPONENT
// ============================================================

export default function ZoneDetailsDashboard() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const zoneName = searchParams.get('name') || '';
    const zoneSlug = params.slug as string;

    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    // ============================================================
    // STATE DECLARATIONS
    // ============================================================
    const [loading, setLoading] = useState(true);

    const [zoneSystemInfo, setZoneSystemInfo] = useState<ZoneSystemInfo | null>(null);
    const [stats, setStats] = useState<StatCardData[]>([]);

    const [zoneFinancialData, setZoneFinancialData] = useState<ProcessedZoneFinancialData | null>(null);
    const [availableYears, setAvailableYears] = useState<string[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [chartSeries, setChartSeries] = useState<any[]>([]);

    const [zoneTotals, setZoneTotals] = useState({
        revenue: 0,
        cost: 0,
        profit: 0,
        profitMargin: '0.00',
    });

    const [incomeCategoryChartData, setIncomeCategoryChartData] = useState<{ labels: string[]; series: number[] }>({ labels: [], series: [] });
    const [costCategoryChartData, setCostCategoryChartData] = useState<{ labels: string[]; series: number[] }>({ labels: [], series: [] });
    const [expenseCategoryChartData, setExpenseCategoryChartData] = useState<{ labels: string[]; series: number[] }>({ labels: [], series: [] });

    const [zoneFinancialPieYear, setZoneFinancialPieYear] = useState<string>('');
    const [zoneFinancialPieData, setZoneFinancialPieData] = useState<{
        totalProfit: number;
        labels: string[];
        series: number[];
    }>({ totalProfit: 0, labels: [], series: [] });

    const [incomeCategorySelectedYear, setIncomeCategorySelectedYear] = useState<string>('');
    const [costCategorySelectedYear, setCostCategorySelectedYear] = useState<string>('');
    const [expenseCategorySelectedYear, setExpenseCategorySelectedYear] = useState<string>('');

    const [branchComparisonData, setBranchComparisonData] = useState<{ categories: string[]; series: any[] }>({ categories: [], series: [] });
    const [branchComparisonYear, setBranchComparisonYear] = useState<string>('');

    // ✅ OUTSTANDING TABLE STATES
    const [rawOutstandingData, setRawOutstandingData] = useState<any[]>([]);
    const [outstandingAmountData, setOutstandingAmountData] = useState<FinanceDataRow[]>([]);
    const [outstandingAmountTotals, setOutstandingAmountTotals] = useState<FinanceDataRow>({
        zone: 'Total',
        month_january: 0,
        month_february: 0,
        month_march: 0,
        month_april: 0,
        month_may: 0,
        month_june: 0,
        month_july: 0,
        month_august: 0,
        month_september: 0,
        month_october: 0,
        month_november: 0,
        month_december: 0,
        total: 0,
    });
    const [outstandingTableYear, setOutstandingTableYear] = useState<string>('2025');
    const [outstandingYears, setOutstandingYears] = useState<string[]>([]);

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

    useEffect(() => {
        if (zoneFinancialData && zoneFinancialData.years.length > 0 && systemBranches.length > 0) {
            const latestYear = zoneFinancialData.years[0];

            setSelectedYear(latestYear);
            setIncomeCategorySelectedYear(latestYear);
            setCostCategorySelectedYear(latestYear);
            setExpenseCategorySelectedYear(latestYear);
            setZoneFinancialPieYear(latestYear);
            setBranchComparisonYear(latestYear);
        }
    }, [zoneFinancialData, systemBranches]);

    useEffect(() => {
        if (!zoneFinancialData) return;
        const { zoneBranches } = zoneFinancialData;

        if (zoneBranches.length > 0) {
            if (selectedYear) updateZoneChartsForYear(selectedYear);
            if (incomeCategorySelectedYear) updateIncomeCategoryChart(zoneBranches, incomeCategorySelectedYear);
            if (costCategorySelectedYear) updateCostCategoryChart(zoneBranches, costCategorySelectedYear);
            if (expenseCategorySelectedYear) updateExpenseCategoryChart(zoneBranches, expenseCategorySelectedYear);
            if (zoneFinancialPieYear) updateZoneFinancialPieChart(zoneBranches, zoneFinancialPieYear);
            if (branchComparisonYear) updateBranchComparisonChart(zoneBranches, systemBranches, branchComparisonYear);
        }
    }, [selectedYear, incomeCategorySelectedYear, costCategorySelectedYear, expenseCategorySelectedYear, zoneFinancialPieYear, branchComparisonYear]);

    // ✅ UPDATE OUTSTANDING TABLE
    useEffect(() => {
        if (systemBranches.length > 0 && rawOutstandingData.length > 0 && outstandingTableYear && zoneName) {
            const yearNum = parseInt(outstandingTableYear);
            const { tableData, totalsRow } = calculateOutstandingAmountsByBranch(rawOutstandingData, systemBranches, zoneName, yearNum);
            setOutstandingAmountData(tableData);
            setOutstandingAmountTotals(totalsRow);
        }
    }, [rawOutstandingData, systemBranches, outstandingTableYear, zoneName]);

    const fetchZoneDashboardData = async (zone: string) => {
        try {
            setLoading(true);

            const [systemInfoResponse, financeSummaryResponse, outstandingResponse] = await Promise.all([dashboardService.getSystemInfo(), getFinanceSummary(), getFinanceOutstandingAmount()]);

            const allSystemBranches = systemInfoResponse?.data?.branches || [];
            const financeBranches = financeSummaryResponse?.data?.branches || [];

            setSystemBranches(allSystemBranches);

            // 1. Process System Info
            const zoneInfo = calculateZoneSystemInfo(allSystemBranches, zone);
            setZoneSystemInfo(zoneInfo);
            updateStatCards(zoneInfo);

            // 2. Process Revenue/Cost Data
            const processedFinancials = processZoneFinancialData(financeBranches as any[], allSystemBranches, zone);
            setZoneFinancialData(processedFinancials);
            setAvailableYears(processedFinancials.years);

            // 3. Process Outstanding Data
            if ((outstandingResponse as any)?.data?.branches) {
                const oData = (outstandingResponse as any).data.branches;
                setRawOutstandingData(oData);

                // Extract years from outstanding data specifically
                const yearsSet = new Set<string>();
                oData.forEach((b: any) => {
                    b.monthly_outstanding?.forEach((item: any) => {
                        if (item.year) yearsSet.add(item.year.toString());
                    });
                });
                const sortedOutstandingYears = Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
                setOutstandingYears(sortedOutstandingYears);

                // Set default year
                if (sortedOutstandingYears.length > 0 && !sortedOutstandingYears.includes(outstandingTableYear)) {
                    setOutstandingTableYear(sortedOutstandingYears[0]);
                }
            }
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
                title: 'Total Schools',
                value: info.totalBranches.toString(),
                valueSize: 'xl',
                gradient: 'bg-gradient-to-r from-cyan-500 to-cyan-400',
                icon: <Image src="/assets/images/icons/zone1.svg" alt="branches" width={35} height={35} className="brightness-0 invert opacity-90" />,
                iconSize: 'xl',
            },
            {
                title: 'Total Clients',
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
        const categoryData = processZoneCategoryTotalsForYear(zoneBranches as any[], year);
        setIncomeCategoryChartData(categoryData);
    };

    const updateCostCategoryChart = (zoneBranches: Branch[], year: string) => {
        const expenseData = processZoneExpenseCategoryTotalsForYear(zoneBranches as any[], year);
        setCostCategoryChartData(expenseData);
    };

    const updateExpenseCategoryChart = (zoneBranches: Branch[], year: string) => {
        const expenseData = processZoneExpenseCategoryTotalsForYear(zoneBranches as any[], year);
        setExpenseCategoryChartData(expenseData);
    };

    const updateZoneFinancialPieChart = (zoneBranches: Branch[], year: string) => {
        const financialData = processZoneCompanyFinancialsByYear(zoneBranches as any[], year);
        setZoneFinancialPieData(financialData);
    };

    const updateBranchComparisonChart = (zoneBranches: Branch[], allSystemBranches: any[], year: string) => {
        const comparisonData = getZoneBranchComparisonData(zoneBranches as any[], allSystemBranches, year);
        setBranchComparisonData(comparisonData);
    };

    // ============================================================
    // COMPUTED VALUES
    // ============================================================

    const yearlyFinancialSeries = useMemo(() => {
        if (!zoneFinancialData) return [];
        const result = getZoneYearlyFinancialSeries(zoneFinancialData);
        return result && result.series
            ? result.series.map((s: any) => ({
                  ...s,
                  name: s.name === 'Cost' ? 'Expense' : s.name,
              }))
            : [];
    }, [zoneFinancialData]);

    const zoneYearlyProfitData = useMemo(() => {
        if (!zoneFinancialData) return { years: [], profitData: [] };
        return getLatestYearsZoneProfitData(zoneFinancialData, 5);
    }, [zoneFinancialData]);

    // ============================================================
    // EVENT HANDLERS
    // ============================================================

    const handleYearChange = (year: string) => setSelectedYear(year);
    const handleIncomeCategoryYearChange = (year: string) => setIncomeCategorySelectedYear(year);
    const handleCostCategoryYearChange = (year: string) => setCostCategorySelectedYear(year);
    const handleExpenseCategoryYearChange = (year: string) => setExpenseCategorySelectedYear(year);
    const handleZoneFinancialPieYearChange = (year: string) => setZoneFinancialPieYear(year);
    const handleBranchComparisonYearChange = (year: string) => setBranchComparisonYear(year);
    const handleOutstandingTableYearChange = (year: string) => setOutstandingTableYear(year);

    const handleTableClick = (row: TableRow, columnKey: string) => {
        if (columnKey === 'branch') {
            console.log('Navigate to branch dashboard:', row.branch);
        }
    };

    // ============================================================
    // TABLE CONFIGURATION
    // ============================================================

    const outstandingAmountColumns: TableColumn[] = [
        { key: 'zone', label: 'Branch', align: 'left', width: '250px', clickable: true, truncate: true }, // Mapped branch name to 'zone' key for table
        { key: 'month_january', label: 'Jan', align: 'right', isAmount: true },
        { key: 'month_february', label: 'Feb', align: 'right', isAmount: true },
        { key: 'month_march', label: 'Mar', align: 'right', isAmount: true },
        { key: 'month_april', label: 'Apr', align: 'right', isAmount: true },
        { key: 'month_may', label: 'May', align: 'right', isAmount: true },
        { key: 'month_june', label: 'Jun', align: 'right', isAmount: true },
        { key: 'month_july', label: 'Jul', align: 'right', isAmount: true },
        { key: 'month_august', label: 'Aug', align: 'right', isAmount: true },
        { key: 'month_september', label: 'Sep', align: 'right', isAmount: true },
        { key: 'month_october', label: 'Oct', align: 'right', isAmount: true },
        { key: 'month_november', label: 'Nov', align: 'right', isAmount: true },
        { key: 'month_december', label: 'Dec', align: 'right', isAmount: true },
        { key: 'total', label: 'Total', align: 'right', isAmount: true, width: '120px' },
    ];

    const outstandingAmountConfig: DataTableConfig = {
        title: `Outstanding Amount by Branch in ${zoneName}`,
        showColorIndicator: true,
        showTotalRow: true,
        showYearFilter: true,
        yearOptions: outstandingYears,
        selectedYear: outstandingTableYear,
        onYearChange: handleOutstandingTableYearChange,
        showMonthSlider: true,
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

                <h1 className="text-2xl font-bold mt-5 mb-6">{zoneName}</h1>

                <div className="pt-5">
                    {/* ROW 1 - KPI STAT CARDS */}
                    <StatsGrid stats={stats} isRtl={isRtl} onViewReport={() => {}} onEditReport={() => {}} />

                    {/* ROW 2 - MONTHLY FINANCIAL OVERVIEW & ZONE FINANCIAL PIE CHART */}
                    <div className="mb-6 grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <AreaChart
                                title={`Monthly Financial Overview`}
                                showDropdown={false}
                                showYearFilter={true}
                                yearOptions={availableYears}
                                series={chartSeries.map((s: any) => ({
                                    ...s,
                                    name: s.name === 'Cost' ? 'Expense' : s.name,
                                }))}
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

                        {/* Zone Financial Overview Pie Chart */}
                        <div className="lg:col-span-1">
                            <PieChart
                                title={`${zoneName} Financial Overview`}
                                series={zoneFinancialPieData.series}
                                labels={zoneFinancialPieData.labels.map((label) => (label === 'Cost' ? 'Expense' : label))}
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
                                colors={['#00ab55', '#e7515a', '#4361ee']}
                            />
                        </div>
                    </div>

                    {/* ROW 3 - CATEGORY BREAKDOWN PIE CHARTS */}
                    <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

                        <BasicPieChart
                            chartTitle="Expense By Category (Zone)"
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

                    {/* ROW 4 - YEARLY FINANCIAL OVERVIEW & PROFIT TREND */}
                    <div className="mb-6 grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <AreaChart
                                title={`${zoneName} Yearly Financial Overview`}
                                showYearFilter={false}
                                showDropdown={false}
                                series={yearlyFinancialSeries.map((s: any) => ({
                                    ...s,
                                    name: s.name === 'Cost' ? 'Expense' : s.name,
                                }))}
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

                    {/* ROW 5 - BRANCH BAR CHART */}
                    <div className="mb-6">
                        {branchComparisonData.categories.length > 0 ? (
                            <ZoneBar
                                chartTitle={`Branch Financial Breakdown`}
                                series={branchComparisonData.series.map((s: any) => ({
                                    ...s,
                                    name: s.name === 'Cost' ? 'Expense' : s.name,
                                }))}
                                categories={branchComparisonData.categories}
                                colors={['#10b981', '#ef4444', '#8b5cf6']}
                                negativeColor="#FF4757"
                                showYearFilter={true}
                                showDropdown={false}
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

                    {/* ROW 6 - OUTSTANDING AMOUNT TABLE */}
                    <div className="mb-6">
                        <DataTable
                            columns={outstandingAmountColumns}
                            data={outstandingAmountData as unknown as TableRow[]}
                            totals={outstandingAmountTotals as unknown as TableRow}
                            config={outstandingAmountConfig}
                            isRtl={isRtl}
                            onViewReport={() => {}}
                            onEditReport={() => {}}
                            onDeleteReport={() => {}}
                            onCellClick={handleTableClick}
                        />
                    </div>

                    {/* ROW 7 - OUTSTANDING AMOUNT CHART (UPDATED with props) */}
                    <div className="mb-6">
                        <OutstandingAmountChart
                            tableData={outstandingAmountData}
                            yearOptions={outstandingYears}
                            selectedYear={outstandingTableYear}
                            onYearChange={handleOutstandingTableYearChange}
                            showOptionDropdown={false}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
