// import { useQuery } from '@tanstack/react-query';
// import {
//     dashboardService,
//     getFinanceSummary,
//     processFinanceData,
//     calculateYearTotals,
//     processCompanyFinancialsByYear,
//     processCategoryTotalsForYear,
//     processExpenseCategoryTotalsForYear,
//     calculateZoneWiseFinancials,
// } from '@/services/sales/financeService';
// import { financeKeys } from '@/lib/queryKeys';
// import { getSessionCredentials } from '@/utils/sessionHelper';

// // ============================================
// // BASIC DATA FETCHING HOOKS
// // ============================================

// /**
//  * Get system information (branches, zones, etc.)
//  */
// export function useSystemInfo() {
//     // ✅ Automatically grab creds from Session Storage
//     // Note: ensure variable matches 'databaseName' from your helper
//     const { appCode, databaseName } = getSessionCredentials();

//     return useQuery({
//         // Key updates if session changes (forces refetch on login/db swap)
//         queryKey: financeKeys.systemInfo(appCode || 'session', databaseName || 'session'),
//         // 🚀 Service now handles creds internally, no args needed
//         queryFn: () => dashboardService.getSystemInfo(),
//         // ⛔️ BLOCK request if creds are missing
//         enabled: !!appCode && !!databaseName,
//     });
// }

// /**
//  * Get generic dashboard data
//  */
// export function useDashboardData(payload: string, enabled: boolean = true) {
//     const { appCode, databaseName } = getSessionCredentials();

//     return useQuery({
//         queryKey: financeKeys.dashboardData(payload, appCode || 'session', databaseName || 'session'),
//         queryFn: () => dashboardService.getDashboardData(payload),
//         enabled: enabled && !!payload && !!appCode && !!databaseName,
//     });
// }

// /**
//  * Get raw finance summary - Base query for other hooks
//  */
// export function useFinanceSummary() {
//     const { appCode, databaseName } = getSessionCredentials();

//     return useQuery({
//         queryKey: financeKeys.financeSummary(appCode || 'session', databaseName || 'session'),
//         queryFn: () => getFinanceSummary(),
//         enabled: !!appCode && !!databaseName,
//     });
// }

// // ============================================
// // PROCESSED DATA HOOKS
// // ============================================

// /**
//  * Get processed finance data with years, revenue, cost, profit arrays
//  */
// export function useProcessedFinanceData() {
//     const { appCode, databaseName } = getSessionCredentials();

//     return useQuery({
//         queryKey: financeKeys.processedData(appCode || 'session', databaseName || 'session'),
//         queryFn: async () => {
//             // Service handles creds internally
//             const summary = await getFinanceSummary();
//             return processFinanceData(summary.data.branches);
//         },
//         enabled: !!appCode && !!databaseName,
//     });
// }

// /**
//  * Get year totals: revenue, cost, profit, profitMargin
//  */
// export function useYearTotals(year: string) {
//     // We can just use the processed data hook, which handles the session internally
//     const { data: processedData } = useProcessedFinanceData();
//     // We fetch creds here just to keep the Query Key consistent
//     const { appCode, databaseName } = getSessionCredentials();

//     return useQuery({
//         queryKey: financeKeys.yearTotals(year, appCode || 'session', databaseName || 'session'),
//         queryFn: () => {
//             if (!processedData) throw new Error('Processed data not available');
//             return calculateYearTotals(processedData, year);
//         },
//         enabled: !!processedData && !!year,
//     });
// }

// // ============================================
// // CHART DATA HOOKS
// // ============================================

// /**
//  * Get company financials for pie chart
//  */
// export function useCompanyFinancials(year: string) {
//     const { data: summary } = useFinanceSummary();
//     const { appCode, databaseName } = getSessionCredentials();

//     return useQuery({
//         queryKey: financeKeys.companyFinancials(year, appCode || 'session', databaseName || 'session'),
//         queryFn: () => {
//             if (!summary) throw new Error('Summary data not available');
//             return processCompanyFinancialsByYear(summary.data.branches, year);
//         },
//         enabled: !!summary && !!year,
//     });
// }

// /**
//  * Get revenue by category
//  */
// export function useCategoryTotals(year: string) {
//     const { data: summary } = useFinanceSummary();
//     const { appCode, databaseName } = getSessionCredentials();

//     return useQuery({
//         queryKey: financeKeys.categoryTotals(year, appCode || 'session', databaseName || 'session'),
//         queryFn: () => {
//             if (!summary) throw new Error('Summary data not available');
//             return processCategoryTotalsForYear(summary.data.branches, year);
//         },
//         enabled: !!summary && !!year,
//     });
// }

// /**
//  * Get expenses by category
//  */
// export function useExpenseTotals(year: string) {
//     const { data: summary } = useFinanceSummary();
//     const { appCode, databaseName } = getSessionCredentials();

//     return useQuery({
//         queryKey: financeKeys.expenseTotals(year, appCode || 'session', databaseName || 'session'),
//         queryFn: () => {
//             if (!summary) throw new Error('Summary data not available');
//             return processExpenseCategoryTotalsForYear(summary.data.branches, year);
//         },
//         enabled: !!summary && !!year,
//     });
// }

// /**
//  * Get zone-wise financial breakdown
//  */
// export function useZoneFinancials(year: number) {
//     const { data: financeSummary } = useFinanceSummary();
//     const { data: systemInfo } = useSystemInfo();
//     const { appCode, databaseName } = getSessionCredentials();

//     return useQuery({
//         queryKey: financeKeys.zoneFinancials(year, appCode || 'session', databaseName || 'session'),
//         queryFn: () => {
//             if (!financeSummary || !systemInfo) {
//                 throw new Error('Required data not available');
//             }
//             return calculateZoneWiseFinancials(
//                 financeSummary.data.branches,
//                 systemInfo.data.branches,
//                 year
//             );
//         },
//         enabled: !!financeSummary && !!systemInfo && !!year,
//     });
// }

// // ============================================
// // UTILITY HOOKS
// // ============================================

// /**
//  * Quick hook to get available years
//  */
// export function useAvailableYears() {
//     const { data: processedData, isLoading, error } = useProcessedFinanceData();

//     return {
//         years: processedData?.years || [],
//         isLoading,
//         error,
//     };
// }