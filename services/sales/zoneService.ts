// services/sales/zoneService.ts

// ============================================================
// IMPORTS (Leveraging core types and utilities from financeService)
// ============================================================
import {
    Branch,
    ProcessedFinanceData,
    ChartSeriesData,
    CategoryData,
    calculateYearTotals,
    formatCurrency,
    formatLargeNumber,
    getAvailableYears,
    processFinanceData,
} from '@/services/sales/financeService';

// ============================================================
// CORE FINANCIAL INTERFACES
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

// Extend Branch to ensure we have the correct type for iteration
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
    zoneBranches: FinanceBranch[];
}

/** Year-wise totals for the zone */
export interface ZoneYearTotals {
    year: string;
    totalIncome: number;
    totalCost: number;
    totalProfit: number;
    profitMargin: string;
}

/** Company financial overview for the zone (Income/Cost/Profit). */
export interface ZoneCompanyFinancials {
    totalProfit: number;
    labels: string[];
    series: number[];
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

// ============================================================
// 1. ZONE DATA PREPARATION & SYSTEM INFO
// ============================================================

/**
 * ✅ FIXED: Prioritizes zoneName, falls back to zone code if zoneName doesn't exist
 */
export const calculateZoneSystemInfo = (allSystemBranches: any[], zoneName: string): ZoneSystemInfo => {
    console.log('🔍 [ZoneService] Calculating system info for zone:', zoneName);
    console.log('📊 [ZoneService] Total system branches:', allSystemBranches.length);

    const branchesInZone = allSystemBranches.filter((branch) => {
        const branchZoneName = branch.zoneName?.trim();
        const branchZoneCode = branch.zone?.trim();
        const searchZone = zoneName.trim();

        let matches = false;

        // ✅ CONDITION: If branch has zoneName, match by zoneName. Otherwise match by zone code.
        if (branchZoneName && branchZoneName !== '') {
            matches = branchZoneName.toUpperCase() === searchZone.toUpperCase();
            if (matches) {
                console.log('✓ [ZoneService] Matched by ZONENAME:', {
                    branchId: branch.branchId,
                    name: branch.name,
                    zoneName: branchZoneName
                });
            }
        } else if (branchZoneCode && branchZoneCode !== '') {
            matches = branchZoneCode.toUpperCase() === searchZone.toUpperCase();
            if (matches) {
                console.log('✓ [ZoneService] Matched by ZONE CODE:', {
                    branchId: branch.branchId,
                    name: branch.name,
                    zone: branchZoneCode
                });
            }
        }

        return matches;
    });

    console.log(`✅ [ZoneService] Found ${branchesInZone.length} system branches for zone "${zoneName}"`);

    const totalSchools = branchesInZone.reduce((sum, branch) => sum + (branch.totalClient || 0), 0);
    const totalStudents = branchesInZone.reduce((sum, branch) => sum + (branch.totalStudent || 0), 0);
    const totalStaff = branchesInZone.reduce((sum, branch) => sum + (branch.totalStaff || 0), 0);

    return {
        totalBranches: branchesInZone.length,
        totalSchools,
        totalStudents,
        totalStaff,
    };
};

// ============================================================
// 2. ZONE FINANCIAL DATA PROCESSING
// ============================================================

/**
 * ✅ FIXED: Uses branchId consistently and prioritizes zoneName over zone code
 */
export const processZoneFinancialData = (
    allFinanceBranches: FinanceBranch[],
    allSystemBranches: any[],
    zoneName: string
): ProcessedZoneFinancialData => {
    console.log('🔍 [ZoneService] Processing financial data for zone:', zoneName);
    console.log('📊 [ZoneService] Total finance branches:', allFinanceBranches.length);
    console.log('📊 [ZoneService] Total system branches:', allSystemBranches.length);

    // --- STEP 1: Create branchId-based lookup map ---
    const systemBranchMap: { [branchId: number]: any } = {};

    allSystemBranches.forEach((sb) => {
        if (sb.branchId) {
            systemBranchMap[sb.branchId] = sb;
        }
    });

    console.log('🗺️ [ZoneService] System branch map created with', Object.keys(systemBranchMap).length, 'entries');

    // --- STEP 2: Filter zone branches with conditional matching ---
    const zoneBranches = allFinanceBranches.filter((financeBranch) => {
        const systemBranch = systemBranchMap[financeBranch.branchId];

        if (!systemBranch) {
            console.warn('⚠️ [ZoneService] No system branch found for finance branch:', {
                branchId: financeBranch.branchId,
                name: financeBranch.name
            });
            return false;
        }

        const branchZoneName = systemBranch.zoneName?.trim();
        const branchZoneCode = systemBranch.zone?.trim();
        const searchZone = zoneName.trim();

        let matches = false;

        // ✅ CONDITION: If branch has zoneName, match by zoneName. Otherwise match by zone code.
        if (branchZoneName && branchZoneName !== '') {
            matches = branchZoneName.toUpperCase() === searchZone.toUpperCase();
            if (matches) {
                console.log('✓ [ZoneService] Matched by ZONENAME:', {
                    branchId: financeBranch.branchId,
                    name: financeBranch.name,
                    zoneName: branchZoneName
                });
            }
        } else if (branchZoneCode && branchZoneCode !== '') {
            matches = branchZoneCode.toUpperCase() === searchZone.toUpperCase();
            if (matches) {
                console.log('✓ [ZoneService] Matched by ZONE CODE:', {
                    branchId: financeBranch.branchId,
                    name: financeBranch.name,
                    zone: branchZoneCode
                });
            }
        }

        return matches;
    }) as FinanceBranch[];

    console.log(`✅ [ZoneService] Found ${zoneBranches.length} finance branches for zone "${zoneName}"`);

    if (zoneBranches.length === 0) {
        console.error('❌ [ZoneService] NO BRANCHES FOUND FOR ZONE:', zoneName);
        console.log('📋 [ZoneService] Available zones:');
        allSystemBranches.forEach(sb => {
            console.log(`  - ${sb.zoneName || sb.zone || 'UNNAMED'} (branchId: ${sb.branchId}, name: ${sb.name})`);
        });
    }

    const zoneInfo = zoneBranches.length > 0 ? systemBranchMap[zoneBranches[0].branchId] : undefined;
    const zoneCode = zoneInfo?.zone || '';

    // --- STEP 3: Extract Years ---
    const yearsSet = new Set<number>();
    zoneBranches.forEach((branch) => {
        branch.monthly_revenue?.forEach((yearData) => {
            yearsSet.add(yearData.year);
        });
    });

    const years = Array.from(yearsSet)
        .sort((a, b) => b - a)
        .map(String);

    console.log('📅 [ZoneService] Years found:', years);

    // --- STEP 4: Initialize aggregation storage ---
    const revenueByYear: { [year: string]: number[] } = {};
    const costByYear: { [year: string]: number[] } = {};
    const profitByYear: { [year: string]: number[] } = {};

    years.forEach((year) => {
        revenueByYear[year] = new Array(12).fill(0);
        costByYear[year] = new Array(12).fill(0);
        profitByYear[year] = new Array(12).fill(0);
    });

    // --- STEP 5: Aggregate Monthly Financials ---
    zoneBranches.forEach((branch) => {
        years.forEach((year) => {
            const revenueYear = branch.monthly_revenue?.find((y) => y.year.toString() === year);
            if (revenueYear) {
                revenueYear.records.forEach((record: MonthlyRecord) => {
                    const monthIndex = record.month - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        revenueByYear[year][monthIndex] += record.total || 0;
                    }
                });
            }

            const costYear = branch.monthly_cost?.find((y) => y.year.toString() === year);
            if (costYear) {
                costYear.records.forEach((record: MonthlyRecord) => {
                    const monthIndex = record.month - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        costByYear[year][monthIndex] += record.total || 0;
                    }
                });
            }
        });
    });

    // --- STEP 6: Calculate Profit ---
    years.forEach((year) => {
        for (let i = 0; i < 12; i++) {
            profitByYear[year][i] = revenueByYear[year][i] - costByYear[year][i];
        }
    });

    console.log('💰 [ZoneService] Revenue summary:', years.map(year => ({
        year,
        total: revenueByYear[year].reduce((sum, val) => sum + val, 0)
    })));

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

export const calculateZoneYearTotals = (processedZoneData: ProcessedZoneFinancialData, year: string) => {
    const revenue = processedZoneData.revenueByYear[year]?.reduce((sum, val) => sum + val, 0) || 0;
    const cost = processedZoneData.costByYear[year]?.reduce((sum, val) => sum + val, 0) || 0;
    const profit = revenue - cost;
    const profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(2) : '0.00';

    return {
        revenue,
        cost,
        profit,
        profitMargin,
    };
};

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

export const calculateAllYearsZoneTotals = (processedZoneData: ProcessedZoneFinancialData): ZoneYearTotals[] => {
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

export const getZoneYearlyFinancialSeries = (processedZoneData: ProcessedZoneFinancialData) => {
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
        years: yearsSortedAsc,
        series: [
            { name: 'Income', data: revenueData },
            { name: 'Cost', data: costData },
            { name: 'Profit', data: profitData },
        ],
    };
};

export const getLatestYearsZoneProfitData = (
    processedZoneData: ProcessedZoneFinancialData,
    count: number = 5
): { years: string[]; profitData: number[] } => {
    const latestYearsDesc = processedZoneData.years.slice(0, count);
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

export const processZoneCategoryTotalsForYear = (
    zoneBranches: FinanceBranch[],
    year: string
): { labels: string[]; series: number[] } => {
    const categoryTotals: Map<string, { name: string; total: number }> = new Map();

    zoneBranches.forEach((branch) => {
        const revenueYear = branch.monthly_revenue?.find((y) => y.year.toString() === year);

        if (revenueYear) {
            revenueYear.records?.forEach((record: MonthlyRecord) => {
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

export const processZoneExpenseCategoryTotalsForYear = (
    zoneBranches: FinanceBranch[],
    year: string
): { labels: string[]; series: number[] } => {
    const categoryTotals: Map<string, { name: string; total: number }> = new Map();

    zoneBranches.forEach((branch) => {
        const costYear = branch.monthly_cost?.find((y) => y.year.toString() === year);

        if (costYear) {
            costYear.records?.forEach((record: MonthlyRecord) => {
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

export const processZoneCompanyFinancialsByYear = (
    zoneBranches: FinanceBranch[],
    year: string
): ZoneCompanyFinancials => {
    let totalIncome = 0;
    let totalCost = 0;

    zoneBranches.forEach((branch) => {
        const revenueYear = branch.monthly_revenue?.find((y) => y.year.toString() === year);
        if (revenueYear) {
            revenueYear.records.forEach((record: MonthlyRecord) => {
                totalIncome += record.total || 0;
            });
        }

        const costYear = branch.monthly_cost?.find((y) => y.year.toString() === year);
        if (costYear) {
            costYear.records.forEach((record: MonthlyRecord) => {
                totalCost += record.total || 0;
            });
        }
    });

    const totalProfit = totalIncome - totalCost;
    const profitSeriesValue = Math.abs(totalProfit);

    return {
        totalProfit,
        labels: ['Income', 'Cost', 'Profit'],
        series: [totalIncome, totalCost, profitSeriesValue],
    };
};

// ============================================================
// 6. BRANCH-WISE CALCULATIONS WITHIN ZONE
// ============================================================

export const calculateZoneBranchFinancials = (
    zoneBranches: FinanceBranch[],
    allSystemBranches: any[]
): ZoneBranchFinancials[] => {
    const branchFinancials: ZoneBranchFinancials[] = [];

    const systemBranchMap: { [branchId: number]: any } = {};
    allSystemBranches.forEach((sb) => {
        if (sb.branchId) {
            systemBranchMap[sb.branchId] = sb;
        }
    });

    zoneBranches.forEach((financeBranch) => {
        const systemBranch = systemBranchMap[financeBranch.branchId];

        if (!systemBranch) {
            console.warn('⚠️ [ZoneService] No system branch for branchId:', financeBranch.branchId);
            return;
        }

        const yearlyData: { [year: string]: any } = {};

        const yearsSet = new Set<number>();
        financeBranch.monthly_revenue?.forEach((yearData) => {
            yearsSet.add(yearData.year);
        });
        const years = Array.from(yearsSet);

        years.forEach((year) => {
            const monthlyIncome = new Array(12).fill(0);
            const monthlyCost = new Array(12).fill(0);
            const monthlyProfit = new Array(12).fill(0);

            const revenueYear = financeBranch.monthly_revenue?.find((y) => y.year === year);
            if (revenueYear) {
                revenueYear.records.forEach((record: MonthlyRecord) => {
                    const monthIndex = record.month - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        monthlyIncome[monthIndex] = record.total || 0;
                    }
                });
            }

            const costYear = financeBranch.monthly_cost?.find((y) => y.year === year);
            if (costYear) {
                costYear.records.forEach((record: MonthlyRecord) => {
                    const monthIndex = record.month - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        monthlyCost[monthIndex] = record.total || 0;
                    }
                });
            }

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

export const getZoneBranchComparisonData = (
    zoneBranches: FinanceBranch[],
    allSystemBranches: any[],
    year: string
) => {
    const branchNames: string[] = [];
    const incomeData: number[] = [];
    const costData: number[] = [];
    const profitData: number[] = [];

    const systemBranchMap: { [branchId: number]: any } = {};
    allSystemBranches.forEach((sb) => {
        if (sb.branchId) {
            systemBranchMap[sb.branchId] = sb;
        }
    });

    zoneBranches.forEach((financeBranch) => {
        const systemBranch = systemBranchMap[financeBranch.branchId];

        if (!systemBranch) return;

        branchNames.push(systemBranch.name || systemBranch.code || 'Unknown');

        let totalIncome = 0;
        let totalCost = 0;

        const revenueYear = financeBranch.monthly_revenue?.find((y) => y.year.toString() === year);
        if (revenueYear) {
            revenueYear.records.forEach((record: MonthlyRecord) => {
                totalIncome += record.total || 0;
            });
        }

        const costYear = financeBranch.monthly_cost?.find((y) => y.year.toString() === year);
        if (costYear) {
            costYear.records.forEach((record: MonthlyRecord) => {
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
        ],
    };
};

// ============================================================
// 7. UTILITY FUNCTIONS
// ============================================================

export const getZoneAvailableYears = (zoneBranches: FinanceBranch[]): string[] => {
    const years = new Set<string>();

    zoneBranches.forEach((branch) => {
        branch.monthly_revenue?.forEach((yearData) => {
            if (yearData.year && yearData.total > 0) {
                years.add(yearData.year.toString());
            }
        });
    });

    return Array.from(years).sort((a, b) => b.localeCompare(a));
};

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