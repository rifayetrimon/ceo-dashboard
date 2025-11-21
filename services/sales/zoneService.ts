// services/sales/zoneService.ts

// ============================================================
// IMPORTS (Leveraging core types and utilities from financeService)
// ============================================================
import {
    Branch,
    ProcessedFinanceData,
    ChartSeriesData,
    CategoryData,
    calculateYearTotals, // Potentially unused if local version is preferred
    formatCurrency,
    formatLargeNumber,
    getAvailableYears, // Potentially unused if local version is preferred
    processFinanceData, // Potentially unused if local version is preferred
} from '@/services/sales/financeService'; // Assuming financeService is the source of shared interfaces

// ============================================================
// CORE FINANCIAL INTERFACES (DEFINED HERE TO SOLVE 'IMPLICIT ANY' ERROR)
// NOTE: These interfaces define the structure of the data records being iterated over.
// ============================================================

/** Monthly breakdown of revenue/cost, including category details. */
export interface MonthlyRecord {
    month: number;
    total: number;
    categories?: CategoryData[];
}

/** Yearly summary data containing monthly records. */
export interface YearlyData {
    year: number;
    total: number;
    records: MonthlyRecord[];
}

// Extend Branch to ensure we have the correct type for iteration (if Branch wasn't fully defined)
export interface FinanceBranch extends Branch {
    monthly_revenue: YearlyData[];
    monthly_cost: YearlyData[];
}

// ============================================================
// ZONE-SPECIFIC INTERFACES
// ============================================================

/** System Information tailored to a single zone. */
export interface ZoneSystemInfo {
    totalBranches: number;
    totalSchools: number;
    totalStudents: number;
    totalStaff: number;
}

/** Processed financial data specifically for one zone. */
export interface ProcessedZoneFinancialData {
    zoneName: string;
    zoneCode: string;
    years: string[];
    revenueByYear: { [year: string]: number[] };
    costByYear: { [year: string]: number[] };
    profitByYear: { [year: string]: number[] };
    zoneBranches: FinanceBranch[]; // Changed to FinanceBranch
}

/** Year-wise totals for the zone */
export interface ZoneYearTotals {
    year: string;
    totalIncome: number;
    totalCost: number;
    totalProfit: number;
    profitMargin: string;
}

/** Branch-wise financial data within a zone */
export interface ZoneBranchFinancials {
    branchId: string | number;
    branchName: string;
    branchCode: string;
    yearlyData: {
        [year: string]: {
            totalIncome: number;
            totalCost: number;
            totalProfit: number;
            monthlyIncome: number[];
            monthlyCost: number[];
            monthlyProfit: number[];
        };
    };
}

/** Company financial overview for the zone (Income/Cost/Profit) */
export interface ZoneCompanyFinancials {
    labels: string[];
    series: number[];
}

// ============================================================
// 1. ZONE DATA PREPARATION & SYSTEM INFO
// ============================================================

/**
 * Filters the raw system branches to calculate zone-specific system info.
 * @param allSystemBranches - The raw array of all branches fetched from getSystemInfo.
 * @param zoneName - The name of the zone to filter for.
 * @returns ZoneSystemInfo object with aggregated counts.
 */
export const calculateZoneSystemInfo = (allSystemBranches: any[], zoneName: string): ZoneSystemInfo => {
    // Note: The comparison uses optional chaining and trimming for robustness against varied data.
    const branchesInZone = allSystemBranches.filter((branch) => branch.zoneName?.trim().toUpperCase() === zoneName.trim().toUpperCase());

    const totalSchools = branchesInZone.reduce((sum, branch) => sum + (branch.totalClient || 0), 0);
    const totalStudents = branchesInZone.reduce((sum, branch) => sum + (branch.totalStudent || 0), 0);
    const totalStaff = branchesInZone.reduce((sum, branch) => sum + (branch.totalStaff || 0), 0);

    return {
        totalBranches: branchesInZone.length,
        totalSchools: totalSchools,
        totalStudents: totalStudents,
        totalStaff: totalStaff,
    };
};

// ============================================================
// 2. ZONE FINANCIAL DATA PROCESSING
// ============================================================

/**
 * Processes financial data by aggregating the monthly revenue, cost, and profit
 * only for the branches belonging to the specified zone.
 * @param allFinanceBranches - The raw array of all finance branches fetched from getFinanceSummary.
 * @param allSystemBranches - The raw array of all system branches.
 * @param zoneName - The name of the zone to filter and process.
 * @returns ProcessedZoneFinancialData object.
 */
export const processZoneFinancialData = (allFinanceBranches: FinanceBranch[], allSystemBranches: any[], zoneName: string): ProcessedZoneFinancialData => {
    // --- STEP 1: Identify and Filter Zone Branches ---
    // Use an object map to link finance branches (by ID) to system zone name
    const systemBranchMap: { [id: string]: any } = {};
    allSystemBranches.forEach((sb) => {
        // Assuming unique identifier is consistent, using branchId/code if _id is missing
        const idKey = sb._id?.toString() || sb.branchId?.toString();
        if (idKey) {
            systemBranchMap[idKey] = sb;
        }
    });

    const zoneBranches = allFinanceBranches.filter((financeBranch) => {
        // FIX 1: Find the corresponding system branch using a consistent ID
        const idKey = financeBranch.branchId.toString();
        const systemBranch = systemBranchMap[idKey];

        // Filter based on the system branch's zoneName
        return systemBranch?.zoneName?.trim().toUpperCase() === zoneName.trim().toUpperCase();
    }) as FinanceBranch[]; // Cast for type safety

    // Get zone code for metadata
    const zoneInfo = zoneBranches.length > 0 ? systemBranchMap[zoneBranches[0].branchId.toString()] : undefined;
    const zoneCode = zoneInfo?.zone || '';

    // --- STEP 2: Extract Years and Initialize Aggregation Storage ---
    const yearsSet = new Set<number>();
    zoneBranches.forEach((branch) => {
        branch.monthly_revenue?.forEach((yearData) => {
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

    // --- STEP 3: Aggregate Monthly Financials for the Zone ---
    zoneBranches.forEach((branch) => {
        years.forEach((year) => {
            // Process revenue
            const revenueYear = branch.monthly_revenue?.find((y) => y.year.toString() === year);
            if (revenueYear) {
                // FIX: Explicitly type 'record' using the new MonthlyRecord interface
                revenueYear.records.forEach((record: MonthlyRecord) => {
                    const monthIndex = record.month - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        revenueByYear[year][monthIndex] += record.total || 0;
                    }
                });
            }

            // Process cost
            const costYear = branch.monthly_cost?.find((y) => y.year.toString() === year);
            if (costYear) {
                // FIX: Explicitly type 'record' using the new MonthlyRecord interface
                costYear.records.forEach((record: MonthlyRecord) => {
                    const monthIndex = record.month - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        costByYear[year][monthIndex] += record.total || 0;
                    }
                });
            }
        });
    });

    // --- STEP 4: Calculate Aggregated Monthly Profit ---
    years.forEach((year) => {
        for (let i = 0; i < 12; i++) {
            profitByYear[year][i] = revenueByYear[year][i] - costByYear[year][i];
        }
    });

    return {
        zoneName,
        zoneCode,
        years,
        revenueByYear,
        costByYear,
        profitByYear,
        zoneBranches,
    };
};

// ============================================================
// 3. MONTHLY & YEARLY CALCULATIONS
// ============================================================

/**
 * Calculates total Revenue, Cost, and Profit for a single year within the zone.
 */
export const calculateZoneYearTotals = (processedZoneData: ProcessedZoneFinancialData, year: string) => {
    const revenue = processedZoneData.revenueByYear[year]?.reduce((sum, val) => sum + val, 0) || 0;
    const cost = processedZoneData.costByYear[year]?.reduce((sum, val) => sum + val, 0) || 0;
    const profit = revenue - cost;
    // Use Math.abs(revenue) to prevent division by zero in case of negative revenue,
    // although typically revenue is non-negative. Use strict zero check for margin calculation.
    const profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(2) : '0.00';

    return {
        revenue,
        cost,
        profit,
        profitMargin,
    };
};

/**
 * Gets chart series data (monthly Revenue/Cost/Profit) for a specific year in the zone.
 * Used for the Zone Financial Overview (AreaChart).
 */
export const getZoneChartSeriesForYear = (
    processedZoneData: ProcessedZoneFinancialData,
    year: string,
    includeRevenue: boolean = true,
    includeCost: boolean = true,
    includeProfit: boolean = false,
): ChartSeriesData[] => {
    const series: ChartSeriesData[] = [];

    if (includeRevenue && processedZoneData.revenueByYear[year]) {
        series.push({ name: 'Revenue', data: processedZoneData.revenueByYear[year] });
    }

    if (includeCost && processedZoneData.costByYear[year]) {
        series.push({ name: 'Cost', data: processedZoneData.costByYear[year] });
    }

    if (includeProfit && processedZoneData.profitByYear[year]) {
        series.push({ name: 'Profit', data: processedZoneData.profitByYear[year] });
    }

    return series;
};

/**
 * Calculates yearly totals for all years in the zone.
 * Returns array of year-wise financial data.
 */
export const calculateAllYearsZoneTotals = (processedZoneData: ProcessedZoneFinancialData): ZoneYearTotals[] => {
    // Sort years ascending for chronological display in tables/charts
    const yearsSortedAsc = [...processedZoneData.years].sort((a, b) => a.localeCompare(b));

    return yearsSortedAsc.map((year) => {
        const totals = calculateZoneYearTotals(processedZoneData, year);
        return {
            year,
            totalIncome: totals.revenue,
            totalCost: totals.cost,
            totalProfit: totals.profit,
            profitMargin: totals.profitMargin,
        };
    });
};

/**
 * Gets yearly financial overview series for area chart (all years).
 * Returns Income, Cost, and Profit data for each year.
 */
export const getZoneYearlyFinancialSeries = (processedZoneData: ProcessedZoneFinancialData) => {
    // Sort years ascending for chronological charts
    const yearsSortedAsc = [...processedZoneData.years].sort((a, b) => a.localeCompare(b));

    const revenueData: number[] = [];
    const costData: number[] = [];
    const profitData: number[] = [];

    yearsSortedAsc.forEach((year) => {
        const yearTotals = calculateZoneYearTotals(processedZoneData, year);
        revenueData.push(yearTotals.revenue);
        costData.push(yearTotals.cost);
        profitData.push(yearTotals.profit);
    });

    return {
        years: yearsSortedAsc, // Include years for chart categories/labels
        series: [
            { name: 'Income', data: revenueData },
            { name: 'Cost', data: costData },
            { name: 'Profit', data: profitData },
        ],
    };
};

/**
 * Gets latest N years profit data for the zone.
 * Used for yearly profit trend chart.
 */
export const getLatestYearsZoneProfitData = (processedZoneData: ProcessedZoneFinancialData, count: number = 5): { years: string[]; profitData: number[] } => {
    // Slice from the descending years list
    const latestYearsDesc = processedZoneData.years.slice(0, count);

    // Sort ascending for chart display
    const years = [...latestYearsDesc].sort((a, b) => a.localeCompare(b));

    const profitData = years.map((year) => {
        const totals = calculateZoneYearTotals(processedZoneData, year);
        return totals.profit;
    });

    return { years, profitData };
};

// ============================================================
// 4. CATEGORY-WISE CALCULATIONS
// ============================================================

/**
 * Aggregates all branch revenue data by category for a specific zone and year.
 * Used for Income By Category pie chart.
 */
export const processZoneCategoryTotalsForYear = (zoneBranches: FinanceBranch[], year: string): { labels: string[]; series: number[] } => {
    const categoryTotals: Map<string, { name: string; total: number }> = new Map();

    zoneBranches.forEach((branch) => {
        const revenueYear = branch.monthly_revenue?.find((y) => y.year.toString() === year);

        if (revenueYear) {
            revenueYear.records?.forEach((record: MonthlyRecord) => {
                // FIX: Explicitly type 'record'
                record.categories?.forEach((category: CategoryData) => {
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

    const sortedCategories = Array.from(categoryTotals.entries())
        .map(([, data]) => ({ name: data.name, total: data.total }))
        .filter((cat) => cat.total > 0)
        .sort((a, b) => b.total - a.total);

    return {
        labels: sortedCategories.map((cat) => cat.name),
        series: sortedCategories.map((cat) => cat.total),
    };
};

/**
 * Aggregates all branch cost data by category for a specific zone and year.
 * Used for Cost By Category pie chart.
 */
export const processZoneExpenseCategoryTotalsForYear = (zoneBranches: FinanceBranch[], year: string): { labels: string[]; series: number[] } => {
    const categoryTotals: Map<string, { name: string; total: number }> = new Map();

    zoneBranches.forEach((branch) => {
        const costYear = branch.monthly_cost?.find((y) => y.year.toString() === year);

        if (costYear) {
            costYear.records?.forEach((record: MonthlyRecord) => {
                // FIX: Explicitly type 'record'
                record.categories?.forEach((category: CategoryData) => {
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

    const sortedCategories = Array.from(categoryTotals.entries())
        .map(([, data]) => ({ name: data.name, total: data.total }))
        .filter((cat) => cat.total > 0)
        .sort((a, b) => b.total - a.total);

    return {
        labels: sortedCategories.map((cat) => cat.name),
        series: sortedCategories.map((cat) => cat.total),
    };
};

// ============================================================
// 5. COMPANY FINANCIAL OVERVIEW (INCOME/COST/PROFIT PIE)
// ============================================================

/**
 * Calculates zone company financials (total Income, Cost, Profit) for a specific year.
 * Used for Company Financial Overview pie chart.
 */
export const processZoneCompanyFinancialsByYear = (zoneBranches: FinanceBranch[], year: string): ZoneCompanyFinancials => {
    let totalIncome = 0;
    let totalCost = 0;

    zoneBranches.forEach((branch) => {
        // Calculate total income
        const revenueYear = branch.monthly_revenue?.find((y) => y.year.toString() === year);
        if (revenueYear) {
            revenueYear.records.forEach((record: MonthlyRecord) => {
                // FIX: Explicitly type 'record'
                totalIncome += record.total || 0;
            });
        }

        // Calculate total cost
        const costYear = branch.monthly_cost?.find((y) => y.year.toString() === year);
        if (costYear) {
            costYear.records.forEach((record: MonthlyRecord) => {
                // FIX: Explicitly type 'record'
                totalCost += record.total || 0;
            });
        }
    });

    const totalProfit = totalIncome - totalCost;

    return {
        labels: ['Income', 'Cost', 'Profit'],
        series: [totalIncome, totalCost, totalProfit],
    };
};

// ============================================================
// 6. BRANCH-WISE CALCULATIONS WITHIN ZONE
// ============================================================

/**
 * Calculates income, cost, and profit for each branch within the zone.
 * Returns detailed branch-wise financial data with monthly and yearly breakdowns.
 */
export const calculateZoneBranchFinancials = (zoneBranches: FinanceBranch[], allSystemBranches: any[]): ZoneBranchFinancials[] => {
    const branchFinancials: ZoneBranchFinancials[] = [];

    // Create a map for quick system branch lookup
    const systemBranchMap: { [id: string]: any } = {};
    allSystemBranches.forEach((sb) => {
        const idKey = sb._id?.toString() || sb.branchId?.toString();
        if (idKey) {
            systemBranchMap[idKey] = sb;
        }
    });

    zoneBranches.forEach((financeBranch) => {
        // FIX 2: Find the corresponding system branch using a consistent ID
        const idKey = financeBranch.branchId.toString();
        const systemBranch = systemBranchMap[idKey];

        if (!systemBranch) return;

        const yearlyData: { [year: string]: any } = {};

        // Extract all years for this branch
        const yearsSet = new Set<number>();
        financeBranch.monthly_revenue?.forEach((yearData) => {
            yearsSet.add(yearData.year);
        });
        const years = Array.from(yearsSet);

        years.forEach((year) => {
            const monthlyIncome = new Array(12).fill(0);
            const monthlyCost = new Array(12).fill(0);
            const monthlyProfit = new Array(12).fill(0);

            // Process revenue
            const revenueYear = financeBranch.monthly_revenue?.find((y) => y.year === year);
            if (revenueYear) {
                revenueYear.records.forEach((record: MonthlyRecord) => {
                    // FIX: Explicitly type 'record'
                    const monthIndex = record.month - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        monthlyIncome[monthIndex] = record.total || 0;
                    }
                });
            }

            // Process cost
            const costYear = financeBranch.monthly_cost?.find((y) => y.year === year);
            if (costYear) {
                costYear.records.forEach((record: MonthlyRecord) => {
                    // FIX: Explicitly type 'record'
                    const monthIndex = record.month - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        monthlyCost[monthIndex] = record.total || 0;
                    }
                });
            }

            // Calculate profit
            for (let i = 0; i < 12; i++) {
                monthlyProfit[i] = monthlyIncome[i] - monthlyCost[i];
            }

            const totalIncome = monthlyIncome.reduce((sum, val) => sum + val, 0);
            const totalCost = monthlyCost.reduce((sum, val) => sum + val, 0);
            const totalProfit = totalIncome - totalCost;

            yearlyData[year.toString()] = {
                totalIncome,
                totalCost,
                totalProfit,
                monthlyIncome,
                monthlyCost,
                monthlyProfit,
            };
        });

        branchFinancials.push({
            branchId: financeBranch.branchId,
            branchName: systemBranch.name || 'Unknown',
            branchCode: systemBranch.code || '',
            yearlyData,
        });
    });

    return branchFinancials;
};

/**
 * Get branch-wise data formatted for bar chart comparison.
 * Shows income, cost, and profit for all branches in a specific year.
 */
export const getZoneBranchComparisonData = (zoneBranches: FinanceBranch[], allSystemBranches: any[], year: string) => {
    const branchNames: string[] = [];
    const incomeData: number[] = [];
    const costData: number[] = [];
    const profitData: number[] = [];

    // Create a map for quick system branch lookup
    const systemBranchMap: { [id: string]: any } = {};
    allSystemBranches.forEach((sb) => {
        const idKey = sb._id?.toString() || sb.branchId?.toString();
        if (idKey) {
            systemBranchMap[idKey] = sb;
        }
    });

    zoneBranches.forEach((financeBranch) => {
        // FIX 3: Find the corresponding system branch using a consistent ID
        const idKey = financeBranch.branchId.toString();
        const systemBranch = systemBranchMap[idKey];

        if (!systemBranch) return;

        branchNames.push(systemBranch.name || systemBranch.code || 'Unknown');

        let totalIncome = 0;
        let totalCost = 0;

        // Calculate total income
        const revenueYear = financeBranch.monthly_revenue?.find((y) => y.year.toString() === year);
        if (revenueYear) {
            revenueYear.records.forEach((record: MonthlyRecord) => {
                // FIX: Explicitly type 'record'
                totalIncome += record.total || 0;
            });
        }

        // Calculate total cost
        const costYear = financeBranch.monthly_cost?.find((y) => y.year.toString() === year);
        if (costYear) {
            costYear.records.forEach((record: MonthlyRecord) => {
                // FIX: Explicitly type 'record'
                totalCost += record.total || 0;
            });
        }

        const totalProfit = totalIncome - totalCost;

        incomeData.push(totalIncome);
        costData.push(totalCost);
        profitData.push(totalProfit);
    });

    return {
        categories: branchNames,
        series: [
            { name: 'Income', data: incomeData },
            { name: 'Cost', data: costData },
            { name: 'Profit', data: profitData },
            // Note: The ZoneBar component currently expects a maximum of 3 series.
        ],
    };
};

// ============================================================
// 7. UTILITY FUNCTIONS
// ============================================================

/**
 * Get available years for the zone (from zone branches).
 */
export const getZoneAvailableYears = (zoneBranches: FinanceBranch[]): string[] => {
    const years = new Set<string>();

    zoneBranches.forEach((branch) => {
        branch.monthly_revenue?.forEach((yearData) => {
            if (yearData.year && yearData.total > 0) {
                years.add(yearData.year.toString());
            }
        });
    });

    return Array.from(years).sort((a, b) => b.localeCompare(a)); // Sort descending (latest first)
};

/**
 * Format zone financial summary for display.
 */
export const formatZoneFinancialSummary = (processedZoneData: ProcessedZoneFinancialData, year: string) => {
    const totals = calculateZoneYearTotals(processedZoneData, year);

    return {
        year,
        revenue: formatCurrency(totals.revenue),
        cost: formatCurrency(totals.cost),
        profit: formatCurrency(totals.profit),
        profitMargin: totals.profitMargin + '%',
        revenueRaw: totals.revenue,
        costRaw: totals.cost,
        profitRaw: totals.profit,
    };
};
