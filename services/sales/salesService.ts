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

export interface CategoryData {
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

// Category Data Interfaces
export interface MonthlyRecordWithCategories {
    month: number;
    total: number;
    categories: CategoryData[];
}

export interface YearlyRevenue {
    year: string;
    total: number;
    records: MonthlyRecordWithCategories[];
}

export interface BranchData {
    branchId: number;
    name: string;
    monthly_revenue: YearlyRevenue[];
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

        // Calculate profit = revenue - cost
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
 * FIXED: Profit = Income - Expense (not using monthly_profit directly)
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
    const zoneData: { [zoneName: string]: { income: number; expense: number } } = {};

    financeBranches.forEach((branch: any) => {
        const zoneInfo = branchZoneMap[branch.branchId];
        if (!zoneInfo) return; // Skip branches without zone info

        const zoneName = zoneInfo.zoneName;

        // Initialize zone if not exists
        if (!zoneData[zoneName]) {
            zoneData[zoneName] = { income: 0, expense: 0 };
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
    });

    // Convert to array format and calculate profit (income - expense)
    return Object.entries(zoneData)
        .map(([zoneName, data]) => ({
            zoneName,
            totalIncome: data.income,
            totalExpense: data.expense,
            totalProfit: data.income - data.expense, // FIXED: Calculate profit correctly
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

// ===== CATEGORY DATA FUNCTIONS =====

/**
 * Process category totals for a specific year across all branches (Revenue)
 */
export const processCategoryTotalsForYear = (branches: any[], year: string): { labels: string[]; series: number[] } => {
    const categoryTotals: Map<string, { name: string; total: number }> = new Map();

    branches.forEach((branch) => {
        const yearData = branch.monthly_revenue?.find((yr: any) => yr.year.toString() === year);

        if (yearData) {
            yearData.records?.forEach((record: any) => {
                record.categories?.forEach((category: any) => {
                    const existing = categoryTotals.get(category.code);
                    if (existing) {
                        existing.total += category.total;
                    } else {
                        categoryTotals.set(category.code, {
                            name: category.name,
                            total: category.total,
                        });
                    }
                });
            });
        }
    });

    // Convert to arrays and sort by total (descending)
    const sortedCategories = Array.from(categoryTotals.entries())
        .map(([code, data]) => ({
            code,
            name: data.name,
            total: data.total,
        }))
        .filter((cat) => cat.total > 0)
        .sort((a, b) => b.total - a.total);

    return {
        labels: sortedCategories.map((cat) => cat.name),
        series: sortedCategories.map((cat) => cat.total),
    };
};

/**
 * Process expense category totals for a specific year across all branches
 */
export const processExpenseCategoryTotalsForYear = (branches: any[], year: string): { labels: string[]; series: number[] } => {
    const categoryTotals: Map<string, { name: string; total: number }> = new Map();

    branches.forEach((branch) => {
        const yearData = branch.monthly_cost?.find((yr: any) => yr.year.toString() === year);

        if (yearData) {
            yearData.records?.forEach((record: any) => {
                record.categories?.forEach((category: any) => {
                    const existing = categoryTotals.get(category.code);
                    if (existing) {
                        existing.total += category.total;
                    } else {
                        categoryTotals.set(category.code, {
                            name: category.name,
                            total: category.total,
                        });
                    }
                });
            });
        }
    });

    // Convert to arrays and sort by total (descending)
    const sortedCategories = Array.from(categoryTotals.entries())
        .map(([code, data]) => ({
            code,
            name: data.name,
            total: data.total,
        }))
        .filter((cat) => cat.total > 0)
        .sort((a, b) => b.total - a.total);

    return {
        labels: sortedCategories.map((cat) => cat.name),
        series: sortedCategories.map((cat) => cat.total),
    };
};

/**
 * Process category totals for a specific zone and year (Revenue)
 */
export const processCategoryTotalsForZone = (branches: any[], zoneName: string, year: string): { labels: string[]; series: number[] } => {
    const categoryTotals: Map<string, { name: string; total: number }> = new Map();

    branches
        .filter((branch: any) => branch.name.toLowerCase().includes(zoneName.toLowerCase()))
        .forEach((branch: any) => {
            const yearData = branch.monthly_revenue?.find((yr: any) => yr.year.toString() === year);

            if (yearData) {
                yearData.records?.forEach((record: any) => {
                    record.categories?.forEach((category: any) => {
                        const existing = categoryTotals.get(category.code);
                        if (existing) {
                            existing.total += category.total;
                        } else {
                            categoryTotals.set(category.code, {
                                name: category.name,
                                total: category.total,
                            });
                        }
                    });
                });
            }
        });

    // Convert to arrays and sort by total (descending)
    const sortedCategories = Array.from(categoryTotals.entries())
        .map(([code, data]) => ({
            code,
            name: data.name,
            total: data.total,
        }))
        .filter((cat) => cat.total > 0)
        .sort((a, b) => b.total - a.total);

    return {
        labels: sortedCategories.map((cat) => cat.name),
        series: sortedCategories.map((cat) => cat.total),
    };
};

/**
 * Process expense category totals for a specific zone and year
 */
export const processExpenseCategoryTotalsForZone = (branches: any[], zoneName: string, year: string): { labels: string[]; series: number[] } => {
    const categoryTotals: Map<string, { name: string; total: number }> = new Map();

    branches
        .filter((branch: any) => branch.name.toLowerCase().includes(zoneName.toLowerCase()))
        .forEach((branch: any) => {
            const yearData = branch.monthly_cost?.find((yr: any) => yr.year.toString() === year);

            if (yearData) {
                yearData.records?.forEach((record: any) => {
                    record.categories?.forEach((category: any) => {
                        const existing = categoryTotals.get(category.code);
                        if (existing) {
                            existing.total += category.total;
                        } else {
                            categoryTotals.set(category.code, {
                                name: category.name,
                                total: category.total,
                            });
                        }
                    });
                });
            }
        });

    // Convert to arrays and sort by total (descending)
    const sortedCategories = Array.from(categoryTotals.entries())
        .map(([code, data]) => ({
            code,
            name: data.name,
            total: data.total,
        }))
        .filter((cat) => cat.total > 0)
        .sort((a, b) => b.total - a.total);

    return {
        labels: sortedCategories.map((cat) => cat.name),
        series: sortedCategories.map((cat) => cat.total),
    };
};

/**
 * Get all available years from the data
 */
export const getAvailableYears = (branches: any[]): string[] => {
    const years = new Set<string>();

    branches.forEach((branch: any) => {
        branch.monthly_revenue?.forEach((yearData: any) => {
            if (yearData.year && yearData.total > 0) {
                years.add(yearData.year.toString());
            }
        });
    });

    return Array.from(years).sort((a, b) => b.localeCompare(a)); // Sort descending
};

/**
 * Process zone-wise totals for a specific year
 */
export const processZoneTotalsForYear = (branches: any[], year: string): { labels: string[]; series: number[] } => {
    const zoneTotals: Map<string, number> = new Map();

    branches.forEach((branch: any) => {
        const yearData = branch.monthly_revenue?.find((yr: any) => yr.year.toString() === year);

        if (yearData && yearData.total > 0) {
            // Extract zone name from branch name
            const zoneName = extractZoneName(branch.name);
            const existing = zoneTotals.get(zoneName) || 0;
            zoneTotals.set(zoneName, existing + yearData.total);
        }
    });

    // Convert to arrays and sort by total (descending)
    const sortedZones = Array.from(zoneTotals.entries())
        .map(([zone, total]) => ({ zone, total }))
        .sort((a, b) => b.total - a.total);

    return {
        labels: sortedZones.map((z) => z.zone),
        series: sortedZones.map((z) => z.total),
    };
};

/**
 * Extract zone name from branch name
 */
const extractZoneName = (branchName: string): string => {
    const zones = ['PUNCAK ALAM', 'HILLPARK', 'SETIA ALAM', 'TRANSIT', 'DENGKIL'];

    const upperBranchName = branchName.toUpperCase();
    for (const zone of zones) {
        if (upperBranchName.includes(zone)) {
            return zone;
        }
    }

    return 'OTHER';
};

// ===== UTILITY FUNCTIONS =====

/**
 * Format currency for display
 * This is the single, consolidated formatCurrency function
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

/**
 * Process company-wide financial totals (Income, Cost, Profit) for a specific year
 * Aggregates all branches' data for the selected year
 * FIXED: Profit = Income - Expense (calculated correctly)
 */
export const processCompanyFinancialsByYear = (branches: any[], year: string): { labels: string[]; series: number[] } => {
    let totalIncome = 0;
    let totalCost = 0;

    branches.forEach((branch: any) => {
        // Calculate income (revenue) for the year
        const revenueYear = branch.monthly_revenue?.find((yr: any) => yr.year.toString() === year);
        if (revenueYear) {
            const yearRevenue = revenueYear.records.reduce((sum: number, r: any) => sum + r.total, 0);
            totalIncome += yearRevenue;
        }

        // Calculate cost for the year
        const costYear = branch.monthly_cost?.find((yr: any) => yr.year.toString() === year);
        if (costYear) {
            const yearCost = costYear.records.reduce((sum: number, r: any) => sum + r.total, 0);
            totalCost += yearCost;
        }
    });

    // Calculate profit correctly: Income - Expense
    const totalProfit = totalIncome - totalCost;

    return {
        labels: ['Income', 'Cost', 'Profit'],
        series: [totalIncome, totalCost, totalProfit],
    };
};

/**
 * Calculate financial totals across a year range
 * Aggregates data from startYear to endYear (inclusive)
 */
export const calculateYearRangeTotals = (processedData: ProcessedFinanceData, startYear: string, endYear: string) => {
    const years = processedData.years.filter((year) => {
        return year >= startYear && year <= endYear;
    });

    let totalRevenue = 0;
    let totalCost = 0;

    years.forEach((year) => {
        if (processedData.revenueByYear[year]) {
            totalRevenue += processedData.revenueByYear[year].reduce((sum, val) => sum + val, 0);
        }
        if (processedData.costByYear[year]) {
            totalCost += processedData.costByYear[year].reduce((sum, val) => sum + val, 0);
        }
    });

    const totalProfit = totalRevenue - totalCost;

    return {
        revenue: totalRevenue,
        cost: totalCost,
        profit: totalProfit,
        profitMargin: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : '0.00',
        yearsIncluded: years,
    };
};

/**
 * Calculate zone-wise financial data across a year range
 */
export const calculateZoneWiseFinancialsForRange = (financeBranches: any[], systemBranches: any[], startYear: number, endYear: number): ZoneFinancialSummary[] => {
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

    // Aggregate financial data by zone across year range
    const zoneData: { [zoneName: string]: { income: number; expense: number } } = {};

    financeBranches.forEach((branch: any) => {
        const zoneInfo = branchZoneMap[branch.branchId];
        if (!zoneInfo) return;

        const zoneName = zoneInfo.zoneName;

        // Initialize zone if not exists
        if (!zoneData[zoneName]) {
            zoneData[zoneName] = { income: 0, expense: 0 };
        }

        // Sum up income across the year range
        branch.monthly_revenue?.forEach((yearData: any) => {
            if (yearData.year >= startYear && yearData.year <= endYear) {
                const yearRevenue = yearData.records.reduce((sum: number, r: any) => sum + r.total, 0);
                zoneData[zoneName].income += yearRevenue;
            }
        });

        // Sum up expenses across the year range
        branch.monthly_cost?.forEach((yearData: any) => {
            if (yearData.year >= startYear && yearData.year <= endYear) {
                const yearCost = yearData.records.reduce((sum: number, r: any) => sum + r.total, 0);
                zoneData[zoneName].expense += yearCost;
            }
        });
    });

    // Convert to array format and calculate profit
    return Object.entries(zoneData)
        .map(([zoneName, data]) => ({
            zoneName,
            totalIncome: data.income,
            totalExpense: data.expense,
            totalProfit: data.income - data.expense,
        }))
        .sort((a, b) => a.zoneName.localeCompare(b.zoneName));
};

/**
 * Process category totals across a year range
 */
export const processCategoryTotalsForYearRange = (branches: any[], startYear: string, endYear: string): { labels: string[]; series: number[] } => {
    const categoryTotals: Map<string, { name: string; total: number }> = new Map();

    branches.forEach((branch) => {
        branch.monthly_revenue?.forEach((yearData: any) => {
            const yearStr = yearData.year.toString();

            // Check if year is in range
            if (yearStr >= startYear && yearStr <= endYear) {
                yearData.records?.forEach((record: any) => {
                    record.categories?.forEach((category: any) => {
                        const existing = categoryTotals.get(category.code);
                        if (existing) {
                            existing.total += category.total;
                        } else {
                            categoryTotals.set(category.code, {
                                name: category.name,
                                total: category.total,
                            });
                        }
                    });
                });
            }
        });
    });

    // Convert to arrays and sort by total (descending)
    const sortedCategories = Array.from(categoryTotals.entries())
        .map(([code, data]) => ({
            code,
            name: data.name,
            total: data.total,
        }))
        .filter((cat) => cat.total > 0)
        .sort((a, b) => b.total - a.total);

    return {
        labels: sortedCategories.map((cat) => cat.name),
        series: sortedCategories.map((cat) => cat.total),
    };
};

/**
 * Process expense category totals across a year range
 */
export const processExpenseCategoryTotalsForYearRange = (branches: any[], startYear: string, endYear: string): { labels: string[]; series: number[] } => {
    const categoryTotals: Map<string, { name: string; total: number }> = new Map();

    branches.forEach((branch) => {
        branch.monthly_cost?.forEach((yearData: any) => {
            const yearStr = yearData.year.toString();

            // Check if year is in range
            if (yearStr >= startYear && yearStr <= endYear) {
                yearData.records?.forEach((record: any) => {
                    record.categories?.forEach((category: any) => {
                        const existing = categoryTotals.get(category.code);
                        if (existing) {
                            existing.total += category.total;
                        } else {
                            categoryTotals.set(category.code, {
                                name: category.name,
                                total: category.total,
                            });
                        }
                    });
                });
            }
        });
    });

    // Convert to arrays and sort by total (descending)
    const sortedCategories = Array.from(categoryTotals.entries())
        .map(([code, data]) => ({
            code,
            name: data.name,
            total: data.total,
        }))
        .filter((cat) => cat.total > 0)
        .sort((a, b) => b.total - a.total);

    return {
        labels: sortedCategories.map((cat) => cat.name),
        series: sortedCategories.map((cat) => cat.total),
    };
};

/**
 * Get chart series data aggregated across a year range
 */
export const getChartSeriesForYearRange = (
    processedData: ProcessedFinanceData,
    startYear: string,
    endYear: string,
    includeRevenue: boolean = true,
    includeCost: boolean = true,
    includeProfit: boolean = false,
): ChartSeriesData[] => {
    const years = processedData.years.filter((year) => year >= startYear && year <= endYear);

    // Aggregate monthly data across all years in range
    const aggregatedRevenue = new Array(12).fill(0);
    const aggregatedCost = new Array(12).fill(0);
    const aggregatedProfit = new Array(12).fill(0);

    years.forEach((year) => {
        if (processedData.revenueByYear[year]) {
            processedData.revenueByYear[year].forEach((val, idx) => {
                aggregatedRevenue[idx] += val;
            });
        }
        if (processedData.costByYear[year]) {
            processedData.costByYear[year].forEach((val, idx) => {
                aggregatedCost[idx] += val;
            });
        }
        if (processedData.profitByYear[year]) {
            processedData.profitByYear[year].forEach((val, idx) => {
                aggregatedProfit[idx] += val;
            });
        }
    });

    const series: ChartSeriesData[] = [];

    if (includeRevenue) {
        series.push({
            name: 'Revenue',
            data: aggregatedRevenue,
        });
    }

    if (includeCost) {
        series.push({
            name: 'Cost',
            data: aggregatedCost,
        });
    }

    if (includeProfit) {
        series.push({
            name: 'Profit',
            data: aggregatedProfit,
        });
    }

    return series;
};

/**
 * Get latest N years of profit data for yearly profit chart
 * Returns year labels and profit amounts for bar chart display
 * The data will show oldest to newest (left to right on chart)
 * Hover will display exact profit amount
 *
 * @param processedData - The processed finance data
 * @param numberOfYears - Number of recent years to include (default: 5)
 * @returns Object with years array and profitData array
 */
export const getLatestYearsProfitData = (
    processedData: ProcessedFinanceData,
    numberOfYears: number = 5,
): {
    years: string[];
    profitData: number[];
} => {
    // Get the latest N years (already sorted descending in processedData.years)
    const latestYears = processedData.years.slice(0, numberOfYears).reverse(); // Reverse to show oldest to newest

    // Calculate profit for each year (Revenue - Cost)
    const profitData = latestYears.map((year) => {
        const revenue = processedData.revenueByYear[year]?.reduce((sum, val) => sum + val, 0) || 0;
        const cost = processedData.costByYear[year]?.reduce((sum, val) => sum + val, 0) || 0;
        return revenue - cost; // Calculate profit
    });

    return {
        years: latestYears,
        profitData,
    };
};
