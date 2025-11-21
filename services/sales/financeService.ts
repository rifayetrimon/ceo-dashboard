// services/sales/financeService.ts

// API CONFIGURATION
const API_BASE_URL = 'https://ec5145c9-7c8e-4a5e-b0de-0e1dd1891859.mock.pstmn.io';

// ============================================================
// INTERFACE DEFINITIONS
// ============================================================

export interface CategoryData {
    code: string;
    name: string;
    total: number;
}

export interface Branch {
    branchId: number;
    name: string;
    zone?: string;
    monthly_revenue: any[];
    monthly_cost: any[];
    monthly_profit: any[];
}

interface FinanceSummaryResponse {
    success: boolean;
    message: string;
    data: { branches: Branch[] };
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
export interface ZoneFinancialSummary {
    zoneName: string;
    totalIncome: number;
    totalExpense: number;
    totalProfit: number;
}

// ============================================================
// 1. GENERIC & DASHBOARD SERVICE FUNCTIONS
// ============================================================

export const dashboardService = {
    getSystemInfo: async (appCode: string | null = null, dbName: string = ''): Promise<any> => {
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appCode, dbName, payload: 'SYSTEM_INFO' }),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching system info:', error);
            throw error;
        }
    },
    getDashboardData: async (payload: string, appCode: string | null = null, dbName: string = ''): Promise<any> => {
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appCode, dbName, payload }),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching dashboard data (${payload}):`, error);
            throw error;
        }
    },
};

export const getFinanceSummary = async (appCode: string | null = null, dbName: string = ''): Promise<FinanceSummaryResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appCode, dbName, payload: 'FINANCE_SUMMARY' }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: FinanceSummaryResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching finance summary:', error);
        throw error;
    }
};

// ============================================================
// 2. CORE DATA PROCESSING FUNCTIONS
// ============================================================

export const processFinanceData = (branches: Branch[]): ProcessedFinanceData => {
    const yearsSet = new Set<number>();
    branches.forEach((branch) => {
        branch.monthly_revenue.forEach((yearData) => {
            yearsSet.add(yearData.year);
        });
    });

    const years = Array.from(yearsSet)
        .sort((a, b) => b - a)
        .map(String);

    const revenueByYear: { [year: string]: number[] } = {};
    const costByYear: { [year: string]: number[] } = {};
    const profitByYear: { [year: string]: number[] } = {};

    years.forEach((year) => {
        revenueByYear[year] = new Array(12).fill(0);
        costByYear[year] = new Array(12).fill(0);
        profitByYear[year] = new Array(12).fill(0);
    });

    branches.forEach((branch) => {
        years.forEach((yearStr) => {
            const yearNum = parseInt(yearStr);
            const revenueYear = branch.monthly_revenue.find((y: any) => y.year === yearNum);
            if (revenueYear) {
                revenueYear.records.forEach((record: any) => {
                    revenueByYear[yearStr][record.month - 1] += record.total;
                });
            }

            const costYear = branch.monthly_cost.find((y: any) => y.year === yearNum);
            if (costYear) {
                costYear.records.forEach((record: any) => {
                    costByYear[yearStr][record.month - 1] += record.total;
                });
            }
        });
    });

    years.forEach((year) => {
        for (let i = 0; i < 12; i++) {
            profitByYear[year][i] = revenueByYear[year][i] - costByYear[year][i];
        }
    });

    return { years, branches, revenueByYear, costByYear, profitByYear };
};

// ============================================================
// 3. YEARLY & TIME-RANGE CALCULATION FUNCTIONS
// ============================================================

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

export const calculateYearRangeTotals = (processedData: ProcessedFinanceData, startYear: string, endYear: string) => {
    const years = processedData.years.filter((year) => year >= startYear && year <= endYear);
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

export const getLatestYearsProfitData = (processedData: ProcessedFinanceData, numberOfYears: number = 5): { years: string[]; profitData: number[] } => {
    const latestYears = processedData.years.slice(0, numberOfYears).reverse();
    const profitData = latestYears.map((year) => calculateYearTotals(processedData, year).profit);
    return { years: latestYears, profitData };
};

// ============================================================
// 4. CHART SERIES GENERATION FUNCTIONS
// ============================================================

export const getChartSeriesForYear = (
    processedData: ProcessedFinanceData,
    year: string,
    includeRevenue: boolean = true,
    includeCost: boolean = true,
    includeProfit: boolean = false,
): ChartSeriesData[] => {
    const series: ChartSeriesData[] = [];
    if (includeRevenue && processedData.revenueByYear[year]) {
        series.push({ name: 'Revenue', data: processedData.revenueByYear[year] });
    }
    if (includeCost && processedData.costByYear[year]) {
        series.push({ name: 'Cost', data: processedData.costByYear[year] });
    }
    if (includeProfit && processedData.profitByYear[year]) {
        series.push({ name: 'Profit', data: processedData.profitByYear[year] });
    }
    return series;
};

export const getChartSeriesForYearRange = (
    processedData: ProcessedFinanceData,
    startYear: string,
    endYear: string,
    includeRevenue: boolean = true,
    includeCost: boolean = true,
    includeProfit: boolean = true,
): ChartSeriesData[] => {
    const years = processedData.years.filter((year) => year >= startYear && year <= endYear);
    const aggregatedRevenue = new Array(12).fill(0);
    const aggregatedCost = new Array(12).fill(0);

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

    const aggregatedProfit = aggregatedRevenue.map((rev, idx) => rev - aggregatedCost[idx]);
    const series: ChartSeriesData[] = [];
    if (includeRevenue) series.push({ name: 'Revenue', data: aggregatedRevenue });
    if (includeCost) series.push({ name: 'Cost', data: aggregatedCost });
    if (includeProfit) series.push({ name: 'Profit', data: aggregatedProfit });

    return series;
};

// ============================================================
// 5. COMPANY & CATEGORY BREAKDOWN FUNCTIONS (Pie Charts)
// ============================================================

/**
 * Calculates company-wide financial totals.
 * FIX: Now returns Income, Cost, and Profit as slices for visualization.
 */
export const processCompanyFinancialsByYear = (branches: any[], year: string): { totalProfit: number; labels: string[]; series: number[] } => {
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

    // --- FIX: Return Income, Cost, AND Profit as separate slices ---
    // We use Math.abs for profit here. The PieChart will use series[0] - series[1] for center text.
    return {
        totalProfit: totalProfit,
        labels: ['Income', 'Cost', 'Profit'], // Three labels
        series: [totalIncome, totalCost, Math.abs(totalProfit)], // Three series values
    };
};

/**
 * Aggregates all branch revenue data by category for a specific year (unchanged).
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
                        categoryTotals.set(category.code, { name: category.name, total: category.total });
                    }
                });
            });
        }
    });

    const sortedCategories = Array.from(categoryTotals.entries())
        .map(([code, data]) => ({ code, name: data.name, total: data.total }))
        .filter((cat) => cat.total > 0)
        .sort((a, b) => b.total - a.total);

    return { labels: sortedCategories.map((cat) => cat.name), series: sortedCategories.map((cat) => cat.total) };
};

/**
 * Aggregates all branch cost data by category for a specific year (unchanged).
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
                        categoryTotals.set(category.code, { name: category.name, total: category.total });
                    }
                });
            });
        }
    });

    const sortedCategories = Array.from(categoryTotals.entries())
        .map(([code, data]) => ({ code, name: data.name, total: data.total }))
        .filter((cat) => cat.total > 0)
        .sort((a, b) => b.total - a.total);

    return { labels: sortedCategories.map((cat) => cat.name), series: sortedCategories.map((cat) => cat.total) };
};

// ============================================================
// 6. ZONE-SPECIFIC FUNCTIONS (unchanged)
// ============================================================

export const calculateZoneWiseFinancials = (financeBranches: any[], systemBranches: any[], year: number): ZoneFinancialSummary[] => {
    const branchZoneMap: { [branchId: number]: { zone: string; zoneName: string } } = {};
    systemBranches.forEach((branch: any) => {
        if (branch.zone && branch.zone.trim() !== '') {
            branchZoneMap[branch.branchId] = { zone: branch.zone, zoneName: branch.zoneName || branch.zone };
        }
    });

    const zoneData: { [zoneName: string]: { income: number; expense: number } } = {};

    financeBranches.forEach((branch: any) => {
        const zoneInfo = branchZoneMap[branch.branchId];
        if (!zoneInfo) return;
        const zoneName = zoneInfo.zoneName;
        if (!zoneData[zoneName]) {
            zoneData[zoneName] = { income: 0, expense: 0 };
        }

        const revenueYear = branch.monthly_revenue?.find((y: any) => y.year === year);
        if (revenueYear) {
            const yearRevenue = revenueYear.records.reduce((sum: number, r: any) => sum + r.total, 0);
            zoneData[zoneName].income += yearRevenue;
        }

        const costYear = branch.monthly_cost?.find((y: any) => y.year === year);
        if (costYear) {
            const yearCost = costYear.records.reduce((sum: number, r: any) => sum + r.total, 0);
            zoneData[zoneName].expense += yearCost;
        }
    });

    return Object.entries(zoneData)
        .map(([zoneName, data]) => ({ zoneName, totalIncome: data.income, totalExpense: data.expense, totalProfit: data.income - data.expense }))
        .sort((a, b) => a.zoneName.localeCompare(b.zoneName));
};

export const processCategoryTotalsForZone = (branches: any[], zoneName: string, year: string): { labels: string[]; series: number[] } => {
    const categoryTotals: Map<string, { name: string; total: number }> = new Map();
    branches
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
                            categoryTotals.set(category.code, { name: category.name, total: category.total });
                        }
                    });
                });
            }
        });

    const sortedCategories = Array.from(categoryTotals.entries())
        .map(([code, data]) => ({ code, name: data.name, total: data.total }))
        .filter((cat) => cat.total > 0)
        .sort((a, b) => b.total - a.total);

    return { labels: sortedCategories.map((cat) => cat.name), series: sortedCategories.map((cat) => cat.total) };
};

export const processExpenseCategoryTotalsForZone = (branches: any[], zoneName: string, year: string): { labels: string[]; series: number[] } => {
    const categoryTotals: Map<string, { name: string; total: number }> = new Map();

    branches
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
                            categoryTotals.set(category.code, { name: category.name, total: category.total });
                        }
                    });
                });
            }
        });

    const sortedCategories = Array.from(categoryTotals.entries())
        .map(([code, data]) => ({ code, name: data.name, total: data.total }))
        .filter((cat) => cat.total > 0)
        .sort((a, b) => b.total - a.total);

    return { labels: sortedCategories.map((cat) => cat.name), series: sortedCategories.map((cat) => cat.total) };
};

// ============================================================
// 7. UTILITY & FORMATTING FUNCTIONS
// ============================================================

export const getAvailableYears = (branches: any[]): string[] => {
    const years = new Set<string>();

    branches.forEach((branch: any) => {
        branch.monthly_revenue?.forEach((yearData: any) => {
            if (yearData.year && yearData.total > 0) {
                years.add(yearData.year.toString());
            }
        });
    });

    return Array.from(years).sort((a, b) => b.localeCompare(a));
};

export const formatCurrency = (value: number, locale: string = 'en-MY'): string => {
    return `RM ${value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatLargeNumber = (value: number): string => {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(0) + 'K';
    }
    return value.toFixed(0);
};
