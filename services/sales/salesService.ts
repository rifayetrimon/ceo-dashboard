// services/sales/salesService.ts

const API_BASE_URL = 'https://fedc5fb7-9b4b-4ae2-bfb6-ee11a3c5199e.mock.pstmn.io';

// ===== INTERFACES =====

// Request interface
interface DashboardRequest {
    appCode: string | null;
    dbName: string;
    payload: string;
}

// Response interface
interface DashboardResponse {
    data?: any;
    success?: boolean;
    message?: string;
}

// Finance Summary Interfaces
interface MonthlyRecord {
    month: number;
    total: number;
    categories?: CategoryData[];
}

interface CategoryData {
    code: string;
    name: string;
    total: number;
}

interface YearlyData {
    year: number;
    total: number;
    records: MonthlyRecord[];
}

export interface Branch {
    branchId: number;
    name: string;
    zone?: string;
    monthly_revenue: YearlyData[];
    monthly_cost: YearlyData[];
    monthly_profit: YearlyData[];
}

interface FinanceSummaryData {
    branches: Branch[];
}

interface FinanceSummaryResponse {
    success: boolean;
    message: string;
    data: FinanceSummaryData;
}

export interface ProcessedFinanceData {
    years: string[];
    branches: Branch[];
    revenueByYear: { [year: string]: number[] };
    costByYear: { [year: string]: number[] };
    profitByYear: { [year: string]: number[] };
}

export interface ChartSeriesData {
    name: string;
    data: number[];
}

// Zone Data Interfaces
export interface ZoneData {
    name: string;
    income: number;
    expenses: number;
    profit: number;
}

export interface ZoneFinancialData {
    year: string;
    zones: ZoneData[];
}

export interface ProcessedZoneData {
    years: string[];
    zonesByYear: {
        [year: string]: {
            zones: string[];
            income: number[];
            expenses: number[];
            profit: number[];
        };
    };
}

// Zone Financial Summary Interface
export interface ZoneFinancialSummary {
    zoneName: string;
    totalIncome: number;
    totalExpense: number;
    totalProfit: number;
}

// ===== DASHBOARD SERVICE FUNCTIONS =====

export const dashboardService = {
    // Get System Info
    getSystemInfo: async (appCode: string | null = null, dbName: string = ''): Promise<DashboardResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    appCode,
                    dbName,
                    payload: 'SYSTEM_INFO',
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching system info:', error);
            throw error;
        }
    },

    // Generic dashboard data fetch
    getDashboardData: async (payload: string, appCode: string | null = null, dbName: string = ''): Promise<DashboardResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    appCode,
                    dbName,
                    payload,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error fetching dashboard data (${payload}):`, error);
            throw error;
        }
    },
};

// ===== FINANCE SUMMARY FUNCTIONS =====

/**
 * Fetch Finance Summary from API
 */
export const getFinanceSummary = async (appCode: string | null = null, dbName: string = ''): Promise<FinanceSummaryResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                appCode,
                dbName,
                payload: 'FINANCE_SUMMARY',
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: FinanceSummaryResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching finance summary:', error);
        throw error;
    }
};

/**
 * Process raw finance data into organized format by year
 * Aggregates all branches' monthly data into year-wise totals
 */
export const processFinanceData = (branches: Branch[]): ProcessedFinanceData => {
    // Extract all unique years
    const yearsSet = new Set<number>();
    branches.forEach((branch) => {
        branch.monthly_revenue.forEach((yearData) => {
            yearsSet.add(yearData.year);
        });
    });

    const years = Array.from(yearsSet)
        .sort((a, b) => b - a)
        .map(String);

    // Initialize storage for each year (12 months)
    const revenueByYear: { [year: string]: number[] } = {};
    const costByYear: { [year: string]: number[] } = {};
    const profitByYear: { [year: string]: number[] } = {};

    years.forEach((year) => {
        revenueByYear[year] = new Array(12).fill(0);
        costByYear[year] = new Array(12).fill(0);
        profitByYear[year] = new Array(12).fill(0);
    });

    // Process each branch and sum up monthly totals
    branches.forEach((branch) => {
        years.forEach((yearStr) => {
            const yearNum = parseInt(yearStr);

            // Process revenue
            const revenueYear = branch.monthly_revenue.find((y) => y.year === yearNum);
            if (revenueYear) {
                revenueYear.records.forEach((record) => {
                    revenueByYear[yearStr][record.month - 1] += record.total;
                });
            }

            // Process cost
            const costYear = branch.monthly_cost.find((y) => y.year === yearNum);
            if (costYear) {
                costYear.records.forEach((record) => {
                    costByYear[yearStr][record.month - 1] += record.total;
                });
            }

            // Process profit
            const profitYear = branch.monthly_profit.find((y) => y.year === yearNum);
            if (profitYear) {
                profitYear.records.forEach((record) => {
                    profitByYear[yearStr][record.month - 1] += record.total;
                });
            }
        });
    });

    return {
        years,
        branches,
        revenueByYear,
        costByYear,
        profitByYear,
    };
};

/**
 * Get chart series data for a specific year
 * Can include/exclude revenue, cost, or profit
 */
export const getChartSeriesForYear = (
    processedData: ProcessedFinanceData,
    year: string,
    includeRevenue: boolean = true,
    includeCost: boolean = true,
    includeProfit: boolean = false,
): ChartSeriesData[] => {
    const series: ChartSeriesData[] = [];

    if (includeRevenue && processedData.revenueByYear[year]) {
        series.push({
            name: 'Revenue',
            data: processedData.revenueByYear[year],
        });
    }

    if (includeCost && processedData.costByYear[year]) {
        series.push({
            name: 'Cost',
            data: processedData.costByYear[year],
        });
    }

    if (includeProfit && processedData.profitByYear[year]) {
        series.push({
            name: 'Profit',
            data: processedData.profitByYear[year],
        });
    }

    return series;
};

/**
 * Calculate totals for a specific year
 */
export const calculateYearTotals = (processedData: ProcessedFinanceData, year: string) => {
    const revenue = processedData.revenueByYear[year]?.reduce((sum, val) => sum + val, 0) || 0;
    const cost = processedData.costByYear[year]?.reduce((sum, val) => sum + val, 0) || 0;
    const profit = revenue - cost; // Calculate profit from revenue - cost

    return {
        revenue,
        cost,
        profit,
        profitMargin: revenue > 0 ? ((profit / revenue) * 100).toFixed(2) : '0.00',
    };
};

/**
 * Get data for a specific branch
 */
export const getBranchData = (branches: Branch[], branchId: number, year: number) => {
    const branch = branches.find((b) => b.branchId === branchId);
    if (!branch) return null;

    const revenueYear = branch.monthly_revenue.find((y) => y.year === year);
    const costYear = branch.monthly_cost.find((y) => y.year === year);
    const profitYear = branch.monthly_profit.find((y) => y.year === year);

    const revenue = new Array(12).fill(0);
    const cost = new Array(12).fill(0);
    const profit = new Array(12).fill(0);

    revenueYear?.records.forEach((r) => {
        revenue[r.month - 1] = r.total;
    });
    costYear?.records.forEach((r) => {
        cost[r.month - 1] = r.total;
    });
    profitYear?.records.forEach((r) => {
        profit[r.month - 1] = r.total;
    });

    return {
        branchName: branch.name,
        revenue,
        cost,
        profit,
    };
};

// ===== ZONE DATA FUNCTIONS =====

/**
 * Process Zone Financial Data from Branches
 * Groups branches by zone and calculates income, expenses, and profit
 */
export const processZoneData = (branches: Branch[], year: number): ProcessedZoneData => {
    const zoneMap: {
        [zoneName: string]: {
            income: number;
            expenses: number;
            profit: number;
        };
    } = {};

    // Aggregate data by zone
    branches.forEach((branch) => {
        // Use zone if available, otherwise use branch name
        const zoneName = branch.zone || branch.name;

        // Get revenue for the year
        const revenueYear = branch.monthly_revenue.find((y) => y.year === year);
        const revenue = revenueYear?.records.reduce((sum, r) => sum + r.total, 0) || 0;

        // Get cost for the year
        const costYear = branch.monthly_cost.find((y) => y.year === year);
        const cost = costYear?.records.reduce((sum, r) => sum + r.total, 0) || 0;

        // Calculate profit
        const profit = revenue - cost;

        if (!zoneMap[zoneName]) {
            zoneMap[zoneName] = {
                income: 0,
                expenses: 0,
                profit: 0,
            };
        }

        zoneMap[zoneName].income += revenue;
        zoneMap[zoneName].expenses += cost;
        zoneMap[zoneName].profit += profit;
    });

    // Convert to arrays for chart
    const zones = Object.keys(zoneMap).sort();
    const income = zones.map((zone) => zoneMap[zone].income);
    const expenses = zones.map((zone) => zoneMap[zone].expenses);
    const profit = zones.map((zone) => zoneMap[zone].profit);

    return {
        years: [year.toString()],
        zonesByYear: {
            [year.toString()]: {
                zones,
                income,
                expenses,
                profit,
            },
        },
    };
};

/**
 * Calculate zone-wise financial data from branches
 * Maps branches to their zones using system info and aggregates financial data
 */
export const calculateZoneWiseFinancials = (financeBranches: any[], systemBranches: any[], year: number): ZoneFinancialSummary[] => {
    // Create a map of branchId to zone information
    const branchZoneMap: { [branchId: number]: { zone: string; zoneName: string } } = {};

    systemBranches.forEach((branch: any) => {
        if (branch.zone && branch.zone.trim() !== '') {
            branchZoneMap[branch.branchId] = {
                zone: branch.zone,
                zoneName: branch.zoneName || branch.zone,
            };
        }
    });

    // Aggregate financial data by zone
    const zoneData: { [zoneName: string]: { income: number; expense: number; profit: number } } = {};

    financeBranches.forEach((branch: any) => {
        const zoneInfo = branchZoneMap[branch.branchId];
        if (!zoneInfo) return; // Skip branches without zone info

        const zoneName = zoneInfo.zoneName;

        // Initialize zone if not exists
        if (!zoneData[zoneName]) {
            zoneData[zoneName] = { income: 0, expense: 0, profit: 0 };
        }

        // Calculate income for the year
        const revenueYear = branch.monthly_revenue?.find((y: any) => y.year === year);
        if (revenueYear) {
            const yearRevenue = revenueYear.records.reduce((sum: number, r: any) => sum + r.total, 0);
            zoneData[zoneName].income += yearRevenue;
        }

        // Calculate expense for the year
        const costYear = branch.monthly_cost?.find((y: any) => y.year === year);
        if (costYear) {
            const yearCost = costYear.records.reduce((sum: number, r: any) => sum + r.total, 0);
            zoneData[zoneName].expense += yearCost;
        }

        // Calculate profit for the year
        const profitYear = branch.monthly_profit?.find((y: any) => y.year === year);
        if (profitYear) {
            const yearProfit = profitYear.records.reduce((sum: number, r: any) => sum + r.total, 0);
            zoneData[zoneName].profit += yearProfit;
        }
    });

    // Convert to array format and sort by zone name
    return Object.entries(zoneData)
        .map(([zoneName, data]) => ({
            zoneName,
            totalIncome: data.income,
            totalExpense: data.expense,
            totalProfit: data.profit,
        }))
        .sort((a, b) => a.zoneName.localeCompare(b.zoneName));
};

/**
 * Get Zone Chart Series for a specific year
 */
export const getZoneChartSeries = (
    processedData: ProcessedZoneData,
    year: string,
): {
    series: { name: string; data: number[] }[];
    categories: string[];
} => {
    const yearData = processedData.zonesByYear[year];

    if (!yearData) {
        return {
            series: [],
            categories: [],
        };
    }

    return {
        series: [
            {
                name: 'Income',
                data: yearData.income,
            },
            {
                name: 'Expenses',
                data: yearData.expenses,
            },
            {
                name: 'Profit',
                data: yearData.profit,
            },
        ],
        categories: yearData.zones,
    };
};

// ===== UTILITY FUNCTIONS =====

/**
 * Format currency for display
 */
export const formatCurrency = (value: number, locale: string = 'en-MY'): string => {
    return `RM ${value.toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

/**
 * Format large numbers with K, M suffix
 */
export const formatLargeNumber = (value: number): string => {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(0) + 'K';
    }
    return value.toFixed(0);
};
