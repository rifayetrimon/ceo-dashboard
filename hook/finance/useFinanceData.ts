import { useQuery } from '@tanstack/react-query';
import {
    dashboardService,
    getFinanceSummary,
    processFinanceData,
    calculateYearTotals,
    processCompanyFinancialsByYear,
    processCategoryTotalsForYear,
    processExpenseCategoryTotalsForYear,
    calculateZoneWiseFinancials,
} from '@/services/sales/financeService';
import { financeKeys } from '@/lib/queryKeys';

// ============================================
// BASIC DATA FETCHING HOOKS
// ============================================

/**
 * Get system information (branches, zones, etc.)
 */
export function useSystemInfo(appCode: string | null = null, dbName: string = '') {
    return useQuery({
        queryKey: financeKeys.systemInfo(appCode, dbName),
        queryFn: () => dashboardService.getSystemInfo(appCode, dbName),
    });
}

/**
 * Get generic dashboard data
 */
export function useDashboardData(payload: string, appCode: string | null = null, dbName: string = '', enabled: boolean = true) {
    return useQuery({
        queryKey: financeKeys.dashboardData(payload, appCode, dbName),
        queryFn: () => dashboardService.getDashboardData(payload, appCode, dbName),
        enabled: enabled && !!payload,
    });
}

/**
 * 🔥 MOST IMPORTANT - Get raw finance summary
 * This is the base query that other hooks depend on
 */
export function useFinanceSummary(appCode: string | null = null, dbName: string = '') {
    return useQuery({
        queryKey: financeKeys.financeSummary(appCode, dbName),
        queryFn: () => getFinanceSummary(appCode, dbName),
    });
}

// ============================================
// PROCESSED DATA HOOKS
// ============================================

/**
 * Get processed finance data with years, revenue, cost, profit arrays
 * Returns: { years, branches, revenueByYear, costByYear, profitByYear }
 */
export function useProcessedFinanceData(appCode: string | null = null, dbName: string = '') {
    return useQuery({
        queryKey: financeKeys.processedData(appCode, dbName),
        queryFn: async () => {
            const summary = await getFinanceSummary(appCode, dbName);
            return processFinanceData(summary.data.branches);
        },
    });
}

/**
 * Get year totals: revenue, cost, profit, profitMargin
 */
export function useYearTotals(year: string, appCode: string | null = null, dbName: string = '') {
    const { data: processedData } = useProcessedFinanceData(appCode, dbName);

    return useQuery({
        queryKey: financeKeys.yearTotals(year, appCode, dbName),
        queryFn: () => {
            if (!processedData) throw new Error('Processed data not available');
            return calculateYearTotals(processedData, year);
        },
        enabled: !!processedData && !!year,
    });
}

// ============================================
// CHART DATA HOOKS
// ============================================

/**
 * Get company financials for pie chart
 * Returns: { totalProfit, labels: ['Income', 'Cost', 'Profit'], series: [num, num, num] }
 */
export function useCompanyFinancials(year: string, appCode: string | null = null, dbName: string = '') {
    const { data: summary } = useFinanceSummary(appCode, dbName);

    return useQuery({
        queryKey: financeKeys.companyFinancials(year, appCode, dbName),
        queryFn: () => {
            if (!summary) throw new Error('Summary data not available');
            return processCompanyFinancialsByYear(summary.data.branches, year);
        },
        enabled: !!summary && !!year,
    });
}

/**
 * Get revenue by category
 * Returns: { labels: string[], series: number[] }
 */
export function useCategoryTotals(year: string, appCode: string | null = null, dbName: string = '') {
    const { data: summary } = useFinanceSummary(appCode, dbName);

    return useQuery({
        queryKey: financeKeys.categoryTotals(year, appCode, dbName),
        queryFn: () => {
            if (!summary) throw new Error('Summary data not available');
            return processCategoryTotalsForYear(summary.data.branches, year);
        },
        enabled: !!summary && !!year,
    });
}

/**
 * Get expenses by category
 * Returns: { labels: string[], series: number[] }
 */
export function useExpenseTotals(year: string, appCode: string | null = null, dbName: string = '') {
    const { data: summary } = useFinanceSummary(appCode, dbName);

    return useQuery({
        queryKey: financeKeys.expenseTotals(year, appCode, dbName),
        queryFn: () => {
            if (!summary) throw new Error('Summary data not available');
            return processExpenseCategoryTotalsForYear(summary.data.branches, year);
        },
        enabled: !!summary && !!year,
    });
}

/**
 * Get zone-wise financial breakdown
 * Returns: ZoneFinancialSummary[]
 */
export function useZoneFinancials(year: number, appCode: string | null = null, dbName: string = '') {
    const { data: financeSummary } = useFinanceSummary(appCode, dbName);
    const { data: systemInfo } = useSystemInfo(appCode, dbName);

    return useQuery({
        queryKey: financeKeys.zoneFinancials(year, appCode, dbName),
        queryFn: () => {
            if (!financeSummary || !systemInfo) {
                throw new Error('Required data not available');
            }
            return calculateZoneWiseFinancials(financeSummary.data.branches, systemInfo.data.branches, year);
        },
        enabled: !!financeSummary && !!systemInfo && !!year,
    });
}

// ============================================
// UTILITY HOOKS
// ============================================

/**
 * Quick hook to get available years
 */
export function useAvailableYears(appCode: string | null = null, dbName: string = '') {
    const { data: processedData, isLoading, error } = useProcessedFinanceData(appCode, dbName);

    return {
        years: processedData?.years || [],
        isLoading,
        error,
    };
}
