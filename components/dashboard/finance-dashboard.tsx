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
    getFinanceOutstandingAmount,
    processFinanceData,
    getChartSeriesForYear,
    calculateYearTotals,
    calculateOutstandingAmountsByZone,
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

// Type alias for local calculations
type LocalYearTotals = {
    revenue: number;
    cost: number;
    profit: number;
    profitMargin: string;
    expense: number;
};

// ============================================================
// HELPER FUNCTIONS
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

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function FinanceDashboard() {
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

    // ✅ STATE: Zone & Summary Years
    const [selectedSummaryYear, setSelectedSummaryYear] = useState<string>('2025');
    const [selectedZoneYear, setSelectedZoneYear] = useState<number>(new Date().getFullYear());

    const [startYear, setStartYear] = useState('2021');
    const [endYear, setEndYear] = useState('2025');

    // Company Financial Data State
    const [companyFinancialYear, setCompanyFinancialYear] = useState<string>('2025');
    const [companyFinancialData, setCompanyFinancialData] = useState<{
        totalProfit: number;
        labels: string[];
        series: number[];
    }>({ totalProfit: 0, labels: [], series: [] });

    // Category Charts State
    const [incomeCategoryChartData, setIncomeCategoryChartData] = useState<{ labels: string[]; series: number[] }>({ labels: [], series: [] });
    const [incomeCategorySelectedYear, setIncomeCategorySelectedYear] = useState<string>('2025');
    const [costCategoryChartData, setCostCategoryChartData] = useState<{ labels: string[]; series: number[] }>({ labels: [], series: [] });
    const [costCategorySelectedYear, setCostCategorySelectedYear] = useState<string>('2025');
    const [expenseCategoryChartData, setExpenseCategoryChartData] = useState<{ labels: string[]; series: number[] }>({ labels: [], series: [] });
    const [expenseCategorySelectedYear, setExpenseCategorySelectedYear] = useState<string>('2025');

    // General Data State
    const [availableYears, setAvailableYears] = useState<string[]>([]);
    const [rawBranchData, setRawBranchData] = useState<any[]>([]);
    const [financeTotals, setFinanceTotals] = useState({ revenue: 0, cost: 0, profit: 0, profitMargin: '0.00' });
    const [yearlyProfitData, setYearlyProfitData] = useState<{ years: string[]; profitData: number[] }>({ years: [], profitData: [] });

    // ✅ OUTSTANDING AMOUNT STATES
    const [rawOutstandingData, setRawOutstandingData] = useState<any[]>([]);
    const [outstandingAmountData, setOutstandingAmountData] = useState<TableRow[]>([]);
    const [outstandingAmountTotals, setOutstandingAmountTotals] = useState<TableRow>({
        zone: 'Total',
        monthLabel: '',
        january: '0',
        february: '0',
        march: '0',
        april: '0',
        may: '0',
        june: '0',
        july: '0',
        total: '0',
    });
    const [outstandingTableYear, setOutstandingTableYear] = useState<string>('2025');
    const [outstandingYears, setOutstandingYears] = useState<string[]>([]); // New state for dropdown options

    // ============================================================
    // COMPUTED VALUES
    // ============================================================
    const yearlyFinancialSeries = useMemo(() => {
        if (!financeData) return { series: [], labels: [] };
        const years = [...financeData.years].sort((a, b) => a.localeCompare(b));
        const revenueData: number[] = [];
        const costData: number[] = [];
        const profitData: number[] = [];

        years.forEach((year) => {
            const yearTotals = calculateYearTotals(financeData, year) as LocalYearTotals;
            revenueData.push(yearTotals.revenue);
            costData.push(yearTotals.cost);
            profitData.push(yearTotals.profit);
        });

        return {
            series: [
                { name: 'Income', data: revenueData },
                { name: 'Expense', data: costData },
                { name: 'Profit', data: profitData },
            ],
            labels: years,
        };
    }, [financeData]);

    // ============================================================
    // LIFECYCLE HOOKS
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

    // ✅ UPDATE OUTSTANDING TABLE WHEN YEAR OR DATA CHANGES
    useEffect(() => {
        if (dashboardMetrics?.systemBranches && rawOutstandingData.length > 0 && outstandingTableYear) {
            const yearNum = parseInt(outstandingTableYear);

            // Use service function to calculate data for the selected year
            const { tableData, totalsRow } = calculateOutstandingAmountsByZone(rawOutstandingData, dashboardMetrics.systemBranches, yearNum);

            // Cast to TableRow[] to match component type
            setOutstandingAmountData(tableData as unknown as TableRow[]);
            setOutstandingAmountTotals(totalsRow as unknown as TableRow);
        }
    }, [dashboardMetrics, rawOutstandingData, outstandingTableYear]);

    // ============================================================
    // DATA FETCHING
    // ============================================================
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [systemInfoResponse, financeSummaryResponse, outstandingResponse] = await Promise.all([dashboardService.getSystemInfo(), getFinanceSummary(), getFinanceOutstandingAmount()]);

            // --- Process Finance Summary (Charts) ---
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

                const categoryYears = getAvailableYears(financeBranches);
                setAvailableYears(categoryYears);
                if (categoryYears.length > 0) {
                    setStartYear(categoryYears[categoryYears.length - 1]);
                    setEndYear(categoryYears[0]);
                }

                const currentYear = years.length > 0 ? years[0] : new Date().getFullYear();
                const processed = processFinanceData(financeBranches);
                setFinanceData(processed);

                // Initialize Charts
                if (processed.years.length > 0) {
                    const latestYear = processed.years[0];
                    setSelectedYear(latestYear);
                    updateChartForYear(latestYear, processed);
                    const profitChartData = getLatestYearsProfitData(processed, 5);
                    setYearlyProfitData(profitChartData);
                }

                // Initialize Category Charts
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

                // Initialize Stats Cards
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
                        title: 'Total Clients',
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

            // --- Process Outstanding Data (Table) ---
            if ((outstandingResponse as any)?.data?.branches) {
                const oData = (outstandingResponse as any).data.branches;
                setRawOutstandingData(oData);

                // ✅ EXTRACT AVAILABLE YEARS FOR DROPDOWN
                const yearsSet = new Set<string>();
                oData.forEach((b: any) => {
                    b.monthly_outstanding?.forEach((item: any) => {
                        if (item.year) yearsSet.add(item.year.toString());
                    });
                });
                const sortedOutstandingYears = Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
                setOutstandingYears(sortedOutstandingYears);

                // Default to latest year if current isn't valid
                if (sortedOutstandingYears.length > 0 && !sortedOutstandingYears.includes(outstandingTableYear)) {
                    setOutstandingTableYear(sortedOutstandingYears[0]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            setStats(getDefaultStats());
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // CHART UPDATES
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
    // EVENT HANDLERS
    // ============================================================
    const handleYearChange = (year: string) => setSelectedYear(year);
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
    const handleViewReport = (index: number) => console.log('View report for:', stats[index].title);
    const handleEditReport = (index: number) => console.log('Edit report for:', stats[index].title);
    function handleTableView(): void {
        console.log('Table view action');
    }
    function handleTableDelete(): void {
        console.log('Table delete action');
    }

    const handleZoneClick = (row: TableRow, columnKey: string) => {
        if (columnKey === 'zone') {
            const zoneName = row.zone as string;
            const zoneCode = row.zoneCode as string;
            const systemBranch = dashboardMetrics?.systemBranches?.find((sb: any) => sb.zone?.trim() === zoneCode?.trim());
            const hasZoneName = systemBranch?.zoneName && systemBranch.zoneName.trim() !== '';
            const navigationValue = hasZoneName ? systemBranch.zoneName : zoneCode;
            const zoneSlug = navigationValue.toLowerCase().replace(/\s+/g, '-');
            router.push(`/dashboard/zone/${encodeURIComponent(zoneSlug)}?name=${encodeURIComponent(navigationValue)}`);
        }
    };

    // ============================================================
    // UTILITY & CONFIG
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
        // ... (other default stats)
    ];

    // ✅ FIXED COLUMN KEYS: Using 'month_' prefix ensures the slider works
    const outstandingAmountColumns: TableColumn[] = [
        { key: 'zone', label: 'Zone', align: 'left', width: '200px', clickable: true },
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

    // ✅ CONFIG WITH YEAR DROPDOWN
    const outstandingAmountConfig: DataTableConfig = {
        title: 'Outstanding Amount by Zone',
        showColorIndicator: true,
        showTotalRow: true,
        showYearFilter: true,
        yearOptions: outstandingYears,
        selectedYear: outstandingTableYear,
        onYearChange: handleOutstandingTableYearChange,
        showMonthSlider: true,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

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
                        <span>Finance</span>
                    </li>
                </ul>

                <div className="pt-5">
                    <StatsGrid stats={stats} isRtl={isRtl} onViewReport={handleViewReport} onEditReport={handleEditReport} />

                    {/* Charts omitted for brevity, they are same as before */}
                    <div className="mb-6 grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <AreaChart
                                title="Financial Overview"
                                showYearFilter={true}
                                yearOptions={financeData?.years || []}
                                showDropdown={false}
                                series={chartSeries.map((s) => ({ ...s, name: s.name === 'Cost' ? 'Expense' : s.name }))}
                                labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
                                height={325}
                                onYearSelect={handleYearChange}
                                yAxisFormatter={(value: number) => (value >= 1000 ? (value / 1000).toFixed(0) + 'K' : value.toFixed(0))}
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <PieChart
                                title="Company Financial Overview"
                                series={companyFinancialData.series}
                                labels={companyFinancialData.labels.map((label) => (label === 'Cost' ? 'Expense' : label))}
                                height={340}
                                showDropdown={false}
                                showYearFilter={true}
                                yearOptions={availableYears}
                                selectedYear={companyFinancialYear}
                                onYearChange={handleCompanyFinancialYearChange}
                            />
                        </div>
                    </div>

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
                        />
                        <BasicPieChart
                            chartTitle="Expense By Category"
                            series={costCategoryChartData.series}
                            labels={costCategoryChartData.labels}
                            colors={['#e7515a', '#e2a03f', '#805dca', '#4361ee', '#2196f3', '#00ab55']}
                            height={340}
                            showYearFilter={true}
                            selectedYear={costCategorySelectedYear}
                            onYearChange={handleCostCategoryYearChange}
                            showDropdown={false}
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
                            />
                        </div>
                    </div>

                    <div className="mb-6 grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <AreaChart
                                title="Yearly Financial Overview"
                                showYearFilter={false}
                                yearOptions={financeData?.years || []}
                                showDropdown={false}
                                series={yearlyFinancialSeries.series.map((s) => ({ ...s, name: s.name === 'Cost' ? 'Expense' : s.name }))}
                                labels={yearlyFinancialSeries.labels}
                                height={325}
                                yAxisFormatter={(value: number) => (value >= 1000 ? (value / 1000).toFixed(0) + 'K' : value.toFixed(0))}
                            />
                        </div>
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

                    <div className="mb-6">
                        {dashboardMetrics?.zoneChartData ? (
                            <ZoneBar
                                chartTitle={`Total Income Breakdown By Zone`}
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
                            />
                        ) : (
                            <div className="panel p-5 text-center">Loading zone data...</div>
                        )}
                    </div>

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

                    <div className="mb-6">
                        <OutstandingAmountChart />
                    </div>
                </div>
            </div>
        </>
    );
}
