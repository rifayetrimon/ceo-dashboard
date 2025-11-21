// API CONFIGURATION
// NOTE: In a real application, this should be an environment variable.
const API_BASE_URL = 'https://ec5145c9-7c8e-4a5e-b0de-0e1dd1891859.mock.pstmn.io';

// ============================================================
// INTERFACE DEFINITIONS
// ============================================================

// --- General API Types ---
interface DashboardResponse {
    data?: any;
    success?: boolean;
    message?: string;
}

// --- Raw Finance Data Types ---
export interface CategoryData {
    code: string;
    name: string;
    total: number;
}

interface MonthlyRecord {
    month: number;
    total: number;
    categories?: CategoryData[]; // Categories are typically present in Revenue/Cost records
}

interface YearlyData {
    year: number;
    total: number;
    records: MonthlyRecord[];
}

export interface Branch {
    branchId: number;
    name: string;
    zone?: string; // Zone assigned in system info might override this
    monthly_revenue: YearlyData[];
    monthly_cost: YearlyData[];
    monthly_profit: YearlyData[]; // Often redundant, but kept for data structure consistency
}

interface FinanceSummaryData {
    branches: Branch[];
}

interface FinanceSummaryResponse {
    success: boolean;
    message: string;
    data: FinanceSummaryData;
}

// --- Processed Data Types for Frontend ---

/** Data structure storing aggregated, month-by-month financial totals for all years. */
export interface ProcessedFinanceData {
    years: string[];
    branches: Branch[];
    revenueByYear: { [year: string]: number[] }; // 12-element array of monthly totals
    costByYear: { [year: string]: number[] }; // 12-element array of monthly totals
    profitByYear: { [year: string]: number[] }; // 12-element array of monthly totals
}

/** Format used by ApexCharts series */
export interface ChartSeriesData {
    name: string;
    data: number[];
}

/** Format for Zone Financial Summary (used in Zone Bar Chart) */
export interface ZoneFinancialSummary {
    zoneName: string;
    totalIncome: number;
    totalExpense: number;
    totalProfit: number;
}

// ============================================================
// 1. GENERIC & DASHBOARD SERVICE FUNCTIONS
// (Used to fetch raw data)
// ============================================================

export const dashboardService = {
    /**
     * Fetches general system information (e.g., total schools, students, staff).
     */
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

    /**
     * Generic function to fetch various dashboard data payloads.
     */
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

/**
 * Fetches the raw finance summary data, including branch-wise, monthly revenue/cost/profit.
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

// ============================================================
// 2. CORE DATA PROCESSING FUNCTIONS (Finance Dashboard Area Chart)
// ============================================================

/**
 * Aggregates raw branch data into company-wide monthly totals (Revenue, Cost, Profit)
 * for all available years. This is the foundation for most calculations.
 */
export const processFinanceData = (branches: Branch[]): ProcessedFinanceData => {
    // 1. Identify all unique years
    const yearsSet = new Set<number>();
    branches.forEach((branch) => {
        branch.monthly_revenue.forEach((yearData) => {
            yearsSet.add(yearData.year);
        });
    });

    const years = Array.from(yearsSet)
        .sort((a, b) => b - a) // Sort descending (latest year first)
        .map(String);

    // 2. Initialize storage for monthly totals (12 months)
    const revenueByYear: { [year: string]: number[] } = {};
    const costByYear: { [year: string]: number[] } = {};
    const profitByYear: { [year: string]: number[] } = {};

    years.forEach((year) => {
        revenueByYear[year] = new Array(12).fill(0);
        costByYear[year] = new Array(12).fill(0);
        profitByYear[year] = new Array(12).fill(0);
    });

    // 3. Process each branch and sum up monthly totals
    branches.forEach((branch) => {
        years.forEach((yearStr) => {
            const yearNum = parseInt(yearStr);

            // Aggregate Revenue
            const revenueYear = branch.monthly_revenue.find((y) => y.year === yearNum);
            if (revenueYear) {
                revenueYear.records.forEach((record) => {
                    revenueByYear[yearStr][record.month - 1] += record.total;
                });
            }

            // Aggregate Cost
            const costYear = branch.monthly_cost.find((y) => y.year === yearNum);
            if (costYear) {
                costYear.records.forEach((record) => {
                    costByYear[yearStr][record.month - 1] += record.total;
                });
            }
        });
    });

    // 4. Calculate aggregated monthly profit: Profit = Revenue - Cost
    years.forEach((year) => {
        for (let i = 0; i < 12; i++) {
            profitByYear[year][i] = revenueByYear[year][i] - costByYear[year][i];
        }
    });

    return {
        years,
        branches,
        revenueByYear,
        costByYear,
        profitByYear,
    };
};

// ============================================================
// 3. YEARLY & TIME-RANGE CALCULATION FUNCTIONS
// (Used for SummaryBar, AreaChart totals, and Yearly Financial Overview)
// ============================================================

/**
 * Calculates total Revenue, Cost, and Profit for a single year.
 * @formula Profit = Revenue - Cost
 * @formula Profit Margin = (Profit / Revenue) * 100%
 */
export const calculateYearTotals = (processedData: ProcessedFinanceData, year: string) => {
    const revenue = processedData.revenueByYear[year]?.reduce((sum, val) => sum + val, 0) || 0;
    const cost = processedData.costByYear[year]?.reduce((sum, val) => sum + val, 0) || 0;
    const profit = revenue - cost;

    return {
        revenue,
        cost,
        profit,
        profitMargin: revenue > 0 ? ((profit / revenue) * 100).toFixed(2) : '0.00',
    };
};

/**
 * Calculates financial totals aggregated across a specified year range (inclusive).
 */
export const calculateYearRangeTotals = (processedData: ProcessedFinanceData, startYear: string, endYear: string) => {
    const years = processedData.years.filter((year) => {
        return year >= startYear && year <= endYear;
    });

    let totalRevenue = 0;
    let totalCost = 0;

    years.forEach((year) => {
        totalRevenue += processedData.revenueByYear[year]?.reduce((sum, val) => sum + val, 0) || 0;
        totalCost += processedData.costByYear[year]?.reduce((sum, val) => sum + val, 0) || 0;
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
 * Retrieves the total profit for the latest N years.
 * @returns Array of years (oldest to newest) and corresponding profit data.
 * @formula Profit = Revenue - Cost for that year.
 */
export const getLatestYearsProfitData = (
    processedData: ProcessedFinanceData,
    numberOfYears: number = 5,
): {
    years: string[];
    profitData: number[];
} => {
    // Get the latest N years and reverse to display oldest-to-newest on the chart
    const latestYears = processedData.years.slice(0, numberOfYears).reverse();

    const profitData = latestYears.map((year) => {
        const yearTotals = calculateYearTotals(processedData, year);
        return yearTotals.profit;
    });

    return {
        years: latestYears,
        profitData,
    };
};

// ============================================================
// 4. CHART SERIES GENERATION FUNCTIONS
// ============================================================

/**
 * Gets chart series data (monthly Revenue/Cost/Profit) for a specific year.
 * Used for the Monthly Financial Overview (AreaChart).
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
 * Gets chart series data aggregated across a year range, showing monthly trends over the period.
 * Aggregates monthly data across all years in the range (e.g., Average/Sum for Jan, Feb, etc.).
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

    // Initialize aggregated monthly data for 12 months
    const aggregatedRevenue = new Array(12).fill(0);
    const aggregatedCost = new Array(12).fill(0);

    // Aggregate monthly data across all years in range
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
    });

    // Calculate aggregated monthly profit
    const aggregatedProfit = aggregatedRevenue.map((rev, idx) => rev - aggregatedCost[idx]);

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

// ============================================================
// 5. COMPANY & CATEGORY BREAKDOWN FUNCTIONS (Pie Charts)
// ============================================================

/**
 * Calculates company-wide financial totals (Income, Cost, Profit) for a specific year.
 * Used for the 'Company Financial Overview' Pie Chart.
 * @formula Profit = Income - Cost
 */
export const processCompanyFinancialsByYear = (branches: any[], year: string): { labels: string[]; series: number[] } => {
    let totalIncome = 0;
    let totalCost = 0;

    branches.forEach((branch: any) => {
        // Calculate income (revenue)
        const revenueYear = branch.monthly_revenue?.find((yr: any) => yr.year.toString() === year);
        if (revenueYear) {
            const yearRevenue = revenueYear.records.reduce((sum: number, r: any) => sum + r.total, 0);
            totalIncome += yearRevenue;
        }

        // Calculate cost
        const costYear = branch.monthly_cost?.find((yr: any) => yr.year.toString() === year);
        if (costYear) {
            const yearCost = costYear.records.reduce((sum: number, r: any) => sum + r.total, 0);
            totalCost += yearCost;
        }
    });

    const totalProfit = totalIncome - totalCost;

    return {
        labels: ['Income', 'Cost', 'Profit'],
        series: [totalIncome, totalCost, totalProfit],
    };
};

/**
 * Aggregates all branch revenue data by category for a specific year.
 * Used for the 'Income By Category' Pie Chart.
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

    // Convert and sort
    const sortedCategories = Array.from(categoryTotals.entries())
        .map(([code, data]) => ({ code, name: data.name, total: data.total }))
        .filter((cat) => cat.total > 0)
        .sort((a, b) => b.total - a.total);

    return {
        labels: sortedCategories.map((cat) => cat.name),
        series: sortedCategories.map((cat) => cat.total),
    };
};

/**
 * Aggregates all branch cost data by category for a specific year.
 * Used for the 'Cost By Category' and 'Expense By Category' Pie Charts.
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

    // Convert and sort
    const sortedCategories = Array.from(categoryTotals.entries())
        .map(([code, data]) => ({ code, name: data.name, total: data.total }))
        .filter((cat) => cat.total > 0)
        .sort((a, b) => b.total - a.total);

    return {
        labels: sortedCategories.map((cat) => cat.name),
        series: sortedCategories.map((cat) => cat.total),
    };
};

// ============================================================
// 6. ZONE-SPECIFIC FUNCTIONS (ZoneBar Chart & Zone Navigation)
// ============================================================

/**
 * Maps finance branches to system branch zone information and calculates
 * the total Income, Expense, and Profit for each Zone for a single year.
 * Used for the 'Total Income Breakdown By Zone' (ZoneBar).
 * @formula Profit = Income - Expense (calculated for the year)
 */
export const calculateZoneWiseFinancials = (financeBranches: any[], systemBranches: any[], year: number): ZoneFinancialSummary[] => {
    // 1. Create a map of branchId to zone information from system data
    const branchZoneMap: { [branchId: number]: { zone: string; zoneName: string } } = {};

    systemBranches.forEach((branch: any) => {
        if (branch.zone && branch.zone.trim() !== '') {
            branchZoneMap[branch.branchId] = {
                zone: branch.zone,
                zoneName: branch.zoneName || branch.zone, // Use zoneName if available, else zone
            };
        }
    });

    // 2. Aggregate financial data by zone
    const zoneData: { [zoneName: string]: { income: number; expense: number } } = {};

    financeBranches.forEach((branch: any) => {
        const zoneInfo = branchZoneMap[branch.branchId];
        if (!zoneInfo) return; // Skip branches without zone info

        const zoneName = zoneInfo.zoneName;

        if (!zoneData[zoneName]) {
            zoneData[zoneName] = { income: 0, expense: 0 };
        }

        // Calculate income (revenue) for the year
        const revenueYear = branch.monthly_revenue?.find((y: any) => y.year === year);
        if (revenueYear) {
            const yearRevenue = revenueYear.records.reduce((sum: number, r: any) => sum + r.total, 0);
            zoneData[zoneName].income += yearRevenue;
        }

        // Calculate expense (cost) for the year
        const costYear = branch.monthly_cost?.find((y: any) => y.year === year);
        if (costYear) {
            const yearCost = costYear.records.reduce((sum: number, r: any) => sum + r.total, 0);
            zoneData[zoneName].expense += yearCost;
        }
    });

    // 3. Convert to array format and calculate profit
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
 * Aggregates all branch revenue data by category for a specific zone and year.
 */
export const processCategoryTotalsForZone = (branches: any[], zoneName: string, year: string): { labels: string[]; series: number[] } => {
    const categoryTotals: Map<string, { name: string; total: number }> = new Map();

    branches
        // Filter branches belonging to the zone (using a simple name match for example)
        .filter((branch: any) => branch.name.toUpperCase().includes(zoneName.toUpperCase()))
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

    // Convert to arrays and sort
    const sortedCategories = Array.from(categoryTotals.entries())
        .map(([code, data]) => ({ code, name: data.name, total: data.total }))
        .filter((cat) => cat.total > 0)
        .sort((a, b) => b.total - a.total);

    return {
        labels: sortedCategories.map((cat) => cat.name),
        series: sortedCategories.map((cat) => cat.total),
    };
};

/**
 * Aggregates all branch cost data by category for a specific zone and year.
 */
export const processExpenseCategoryTotalsForZone = (branches: any[], zoneName: string, year: string): { labels: string[]; series: number[] } => {
    const categoryTotals: Map<string, { name: string; total: number }> = new Map();

    branches
        // Filter branches belonging to the zone
        .filter((branch: any) => branch.name.toUpperCase().includes(zoneName.toUpperCase()))
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

    // Convert to arrays and sort
    const sortedCategories = Array.from(categoryTotals.entries())
        .map(([code, data]) => ({ code, name: data.name, total: data.total }))
        .filter((cat) => cat.total > 0)
        .sort((a, b) => b.total - a.total);

    return {
        labels: sortedCategories.map((cat) => cat.name),
        series: sortedCategories.map((cat) => cat.total),
    };
};

// ============================================================
// 7. UTILITY & FORMATTING FUNCTIONS
// ============================================================

/**
 * Extracts a sorted list of all unique years available in the financial data.
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

    return Array.from(years).sort((a, b) => b.localeCompare(a)); // Sort descending (latest first)
};

/**
 * Formats a number as a currency string (e.g., RM 1,234.56).
 */
export const formatCurrency = (value: number, locale: string = 'en-MY'): string => {
    return `RM ${value.toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

/**
 * Formats a large number with K (thousands) or M (millions) suffix.
 */
export const formatLargeNumber = (value: number): string => {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(0) + 'K';
    }
    return value.toFixed(0);
};
