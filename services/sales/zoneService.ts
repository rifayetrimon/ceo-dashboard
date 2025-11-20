// // services/sales/zoneService.ts

// // ============================================================
// // IMPORTS (Leveraging core types and utilities from financeService)
// // ============================================================
// import {
//     Branch,
//     ProcessedFinanceData,
//     ChartSeriesData,
//     CategoryData,
//     calculateYearTotals, // Import to reuse for zone-year totals
//     formatCurrency, // Import for formatting consistency
//     formatLargeNumber, // Import for formatting consistency
//     getAvailableYears,
//     processFinanceData, // Import to reuse for zone-specific year filters
// } from '@/services/sales/financeService'; // Assuming this path structure

// // ============================================================
// // ZONE-SPECIFIC INTERFACES
// // ============================================================

// /** System Information tailored to a single zone. */
// export interface ZoneSystemInfo {
//     totalBranches: number;
//     totalSchools: number;
//     totalStudents: number;
//     totalStaff: number;
// }

// /** Processed financial data specifically for one zone. */
// export interface ProcessedZoneFinancialData {
//     zoneName: string;
//     years: string[];
//     // Financial data aggregated across ALL branches in this zone
//     revenueByYear: { [year: string]: number[] };
//     costByYear: { [year: string]: number[] };
//     profitByYear: { [year: string]: number[] };
//     // Raw branches belonging to this zone
//     zoneBranches: Branch[];
// }

// // ============================================================
// // 1. ZONE DATA PREPARATION
// // ============================================================

// /**
//  * Filters the raw system branches to calculate zone-specific system info.
//  * @param allSystemBranches - The raw array of all branches fetched from getSystemInfo.
//  * @param zoneName - The name of the zone to filter for.
//  * @returns ZoneSystemInfo object with aggregated counts.
//  */
// export const calculateZoneSystemInfo = (allSystemBranches: any[], zoneName: string): ZoneSystemInfo => {
//     // Filter branches where the zone name matches
//     const branchesInZone = allSystemBranches.filter((branch) => branch.zoneName?.toUpperCase() === zoneName.toUpperCase());

//     const totalSchools = branchesInZone.reduce((sum, branch) => sum + (branch.totalClient || 0), 0);
//     const totalStudents = branchesInZone.reduce((sum, branch) => sum + (branch.totalStudent || 0), 0);
//     const totalStaff = branchesInZone.reduce((sum, branch) => sum + (branch.totalStaff || 0), 0);

//     return {
//         totalBranches: branchesInZone.length,
//         totalSchools: totalSchools,
//         totalStudents: totalStudents,
//         totalStaff: totalStaff,
//     };
// };

// /**
//  * Processes financial data by aggregating the monthly revenue, cost, and profit
//  * only for the branches belonging to the specified zone.
//  * @param allFinanceBranches - The raw array of all finance branches fetched from getFinanceSummary.
//  * @param zoneName - The name of the zone to filter and process.
//  * @returns ProcessedZoneFinancialData object.
//  */
// export const processZoneFinancialData = (allFinanceBranches: Branch[], zoneName: string): ProcessedZoneFinancialData => {
//     // 1. Filter branches belonging to this zone
//     const zoneBranches = allFinanceBranches.filter((branch) => branch.zone?.toUpperCase() === zoneName.toUpperCase());

//     // 2. Reuse the core logic from financeService on the filtered list of branches.
//     // NOTE: This assumes processFinanceData is written to work on any array of Branch[].
//     const processed = (processFinanceData as (branches: Branch[]) => ProcessedFinanceData)(zoneBranches);

//     return {
//         zoneName,
//         years: processed.years,
//         revenueByYear: processed.revenueByYear,
//         costByYear: processed.costByYear,
//         profitByYear: processed.profitByYear,
//         zoneBranches,
//     };
// };

// // ============================================================
// // 2. ZONE CHART & METRIC GENERATION
// // ============================================================

// /**
//  * Calculates total Revenue, Cost, and Profit for a single year *within* the zone.
//  * This reuses the core logic but applies it to the zone's processed data structure.
//  */
// export const calculateZoneYearTotals = (processedZoneData: ProcessedZoneFinancialData, year: string) => {
//     const tempProcessedData: ProcessedFinanceData = {
//         years: processedZoneData.years,
//         branches: processedZoneData.zoneBranches,
//         revenueByYear: processedZoneData.revenueByYear,
//         costByYear: processedZoneData.costByYear,
//         profitByYear: processedZoneData.profitByYear,
//     };
//     return calculateYearTotals(tempProcessedData, year);
// };

// /**
//  * Gets chart series data (monthly Revenue/Cost/Profit) for a specific year in the zone.
//  * Used for the Zone Financial Overview (AreaChart).
//  */
// export const getZoneChartSeriesForYear = (processedZoneData: ProcessedZoneFinancialData, year: string): ChartSeriesData[] => {
//     // Convert the zone-specific structure back to the generic ProcessedFinanceData structure
//     // so we can reuse the generic chart generation logic.
//     const tempProcessedData: ProcessedFinanceData = {
//         years: processedZoneData.years,
//         branches: processedZoneData.zoneBranches,
//         revenueByYear: processedZoneData.revenueByYear,
//         costByYear: processedZoneData.costByYear,
//         profitByYear: processedZoneData.profitByYear,
//     };

//     // NOTE: We need the actual implementation of getChartSeriesForYear here,
//     // or we assume it's imported and reused by casting the data structure.
//     const series: ChartSeriesData[] = [];
//     if (tempProcessedData.revenueByYear[year]) {
//         series.push({ name: 'Revenue', data: tempProcessedData.revenueByYear[year] });
//     }
//     if (tempProcessedData.costByYear[year]) {
//         series.push({ name: 'Cost', data: tempProcessedData.costByYear[year] });
//     }

//     return series;
// };

// /**
//  * Aggregates all branch revenue data by category for a specific zone and year.
//  */
// export const processZoneCategoryTotalsForYear = (zoneBranches: Branch[], year: string): { labels: string[]; series: number[] } => {
//     const categoryTotals: Map<string, { name: string; total: number }> = new Map();

//     zoneBranches.forEach((branch) => {
//         const yearData = branch.monthly_revenue?.find((yr: any) => yr.year.toString() === year);

//         if (yearData) {
//             yearData.records?.forEach((record: any) => {
//                 record.categories?.forEach((category: CategoryData) => {
//                     const existing = categoryTotals.get(category.code);
//                     if (existing) {
//                         existing.total += category.total;
//                     } else {
//                         categoryTotals.set(category.code, {
//                             name: category.name,
//                             total: category.total,
//                         });
//                     }
//                 });
//             });
//         }
//     });

//     const sortedCategories = Array.from(categoryTotals.entries())
//         .map(([, data]) => ({ name: data.name, total: data.total }))
//         .filter((cat) => cat.total > 0)
//         .sort((a, b) => b.total - a.total);

//     return {
//         labels: sortedCategories.map((cat) => cat.name),
//         series: sortedCategories.map((cat) => cat.total),
//     };
// };

// /**
//  * Aggregates all branch cost data by category for a specific zone and year.
//  */
// export const processZoneExpenseCategoryTotalsForYear = (zoneBranches: Branch[], year: string): { labels: string[]; series: number[] } => {
//     const categoryTotals: Map<string, { name: string; total: number }> = new Map();

//     zoneBranches.forEach((branch) => {
//         const yearData = branch.monthly_cost?.find((yr: any) => yr.year.toString() === year);

//         if (yearData) {
//             yearData.records?.forEach((record: any) => {
//                 record.categories?.forEach((category: CategoryData) => {
//                     const existing = categoryTotals.get(category.code);
//                     if (existing) {
//                         existing.total += category.total;
//                     } else {
//                         categoryTotals.set(category.code, {
//                             name: category.name,
//                             total: category.total,
//                         });
//                     }
//                 });
//             });
//         }
//     });

//     const sortedCategories = Array.from(categoryTotals.entries())
//         .map(([, data]) => ({ name: data.name, total: data.total }))
//         .filter((cat) => cat.total > 0)
//         .sort((a, b) => b.total - a.total);

//     return {
//         labels: sortedCategories.map((cat) => cat.name),
//         series: sortedCategories.map((cat) => cat.total),
//     };
// };
